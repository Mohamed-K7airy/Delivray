'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { ShoppingBag, User, Truck, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '@/config/api';

import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [role, setRole] = useState<'customer' | 'merchant' | 'driver'>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    store_name: '',
    store_type: '',
    vehicle_type: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        role,
        ...(role === 'merchant' && {
          location: { lat: 0, lng: 0 } // Dummy location for now
        })
      };

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.status === 'active') { // Customer
        const loginRes = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formData.phone, password: formData.password }),
        });
        const loginData = await loginRes.json();
        setToken(loginData.token);
        setUser({
          id: loginData.id,
          name: loginData.name,
          phone: loginData.phone,
          role: loginData.role,
          status: loginData.status
        });
        router.push('/');
      } else { // Merchant or Driver (Pending)
        alert('Registration successful! Please wait for admin approval.');
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center py-20 px-4 sm:px-6 relative overflow-hidden selection:bg-primary/30">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[600px] p-10 md:p-12 space-y-10 bg-[#0b0b0b] rounded-[2.5rem] border border-white/5 relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]"
      >
        <div className="text-center">
          <span className="bg-primary/10 text-primary px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-primary/10 mb-8 inline-block">
            Join the Fleet
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase">Create an Account</h1>
          <p className="text-gray-500 font-medium text-base">Join Delivray today</p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { id: 'customer', label: 'Customer', icon: <User size={24} /> },
            { id: 'merchant', label: 'Merchant', icon: <ShoppingBag size={24} /> },
            { id: 'driver', label: 'Driver', icon: <Truck size={24} /> }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setRole(item.id as any)}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all border-2 group
                ${role === item.id 
                  ? 'border-primary bg-primary/5 text-primary shadow-[0_10px_30px_-10px_rgba(217,119,87,0.3)]' 
                  : 'border-white/5 bg-white/[0.02] text-white hover:bg-white/[0.05] hover:border-white/10'}`}
            >
              <div className={`mb-3 p-3 rounded-full transition-colors ${role === item.id ? 'bg-primary/20 text-white' : 'bg-white/5 text-white'}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="p-4 text-xs font-black text-[#f08c6e] bg-[#f08c6e]/10 rounded-2xl border border-[#f08c6e]/20 tracking-wider uppercase text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleRegister} className="space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-8 py-5 text-white bg-white/[0.03] border border-white/5 rounded-2xl focus:bg-white/[0.05] focus:ring-0 focus:border-primary/40 outline-none transition-all font-medium placeholder:text-gray-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Your mobile number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-8 py-5 text-white bg-white/[0.03] border border-white/5 rounded-2xl focus:bg-white/[0.05] focus:ring-0 focus:border-primary/40 outline-none transition-all font-medium placeholder:text-gray-500"
                    required
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Email (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-8 py-5 text-white bg-white/[0.03] border border-white/5 rounded-2xl focus:bg-white/[0.05] focus:ring-0 focus:border-primary/40 outline-none transition-all font-medium placeholder:text-gray-500"
                  />
               </div>
            </div>

            <div className="relative">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-8 py-5 text-white bg-white/[0.03] border border-white/5 rounded-2xl focus:bg-white/[0.05] focus:ring-0 focus:border-primary/40 outline-none transition-all font-medium placeholder:text-gray-500 pr-16"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-[54px] text-gray-600 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>

            {/* Role Specific Fields */}
            {role === 'merchant' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Store Name</label>
                  <input
                    type="text"
                    name="store_name"
                    value={formData.store_name}
                    onChange={handleInputChange}
                    className="w-full px-8 py-5 text-white bg-white/[0.03] border border-white/5 rounded-2xl focus:bg-white/[0.05] focus:ring-0 focus:border-primary/40 outline-none transition-all font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Store Type</label>
                  <select
                    name="store_type"
                    value={formData.store_type}
                    onChange={handleInputChange}
                    className="w-full px-8 py-5 text-white bg-[#262624] border border-white/5 rounded-2xl focus:ring-0 focus:border-primary/40 outline-none transition-all font-medium appearance-none"
                    required
                  >
                    <option value="">Select type...</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Grocery">Grocery</option>
                    <option value="Pharmacy">Pharmacy</option>
                  </select>
                </div>
              </motion.div>
            )}

            {role === 'driver' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Vehicle Type</label>
                <select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleInputChange}
                  className="w-full px-8 py-5 text-white bg-[#262624] border border-white/5 rounded-2xl focus:ring-0 focus:border-primary/40 outline-none transition-all font-medium appearance-none"
                  required
                >
                  <option value="">Select vehicle...</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Car">Car</option>
                </select>
              </motion.div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-5 bg-primary text-black font-black uppercase tracking-[0.2em] rounded-xl hover:scale-[1.02] active:scale-98 transition-all shadow-[0_20px_40px_-10px_rgba(217,119,87,0.4)] disabled:opacity-50 text-base"
          >
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-500 font-medium">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-black hover:underline underline-offset-8">
            Sign in here
          </Link>
        </p>
      </motion.div>

      {/* Page Footer */}
      <div className="absolute bottom-10 left-0 w-full px-12 hidden md:flex items-center justify-between pointer-events-none opacity-40">
         <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Delivray</div>
         <div className="text-[10px] font-black uppercase tracking-widest text-[#666]">© 2024 DELIVRAY. ENGINEERED FOR SPEED.</div>
      </div>
    </div>
  );
}
