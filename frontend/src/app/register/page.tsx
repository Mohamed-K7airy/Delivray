'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { ShoppingBag, User, Truck, Eye, EyeOff, ShieldCheck, Zap, ChevronDown, CheckCircle2, Lock } from 'lucide-react';
import { API_URL } from '@/config/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Logo from '@/components/Logo';

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
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        role,
        ...(role === 'merchant' && {
          location: { lat: 0, lng: 0 }
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
        toast.success(`Welcome to Delivray, ${loginData.name}!`);
        router.push('/');
      } else { // Merchant or Driver (Pending)
        toast.success('Registration successful! Awaiting admin approval.');
        router.push('/login');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-50">
         <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#FF5A3C]/5 rounded-full blur-[100px]"></div>
         <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-[#FF5A3C]/5 rounded-full blur-[120px]"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl z-10"
      >
        <div className="flex flex-col items-center text-center mb-12">
           <Logo className="mb-10 scale-125" />
           <h1 className="text-4xl lg:text-5xl font-black text-[#0A0A0A] tracking-tighter leading-none mb-4">Start your <span className="text-[#FF5A3C] italic">journey.</span></h1>
           <p className="text-gray-400 font-bold max-w-sm">Select your role and become part of the fastest delivery network in the city.</p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-3 gap-4 mb-10">
           {[
             { id: 'customer', label: 'Customer', icon: <User size={20} /> },
             { id: 'merchant', label: 'Merchant', icon: <ShoppingBag size={20} /> },
             { id: 'driver', label: 'Courier', icon: <Truck size={20} /> }
           ].map((item) => (
             <button
               key={item.id}
               type="button"
               onClick={() => setRole(item.id as any)}
               className={`flex flex-col items-center justify-center p-4 sm:p-8 rounded-[2rem] transition-all border shrink-0 gap-4
                 ${role === item.id 
                   ? 'bg-white border-[#FF5A3C] text-[#FF5A3C] shadow-xl shadow-[#FF5A3C]/10 ring-2 ring-[#FF5A3C]/5' 
                   : 'bg-white/50 border-gray-100 text-gray-400 hover:bg-white hover:border-gray-200 hover:text-[#0A0A0A]'}`}
             >
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${role === item.id ? 'bg-[#FFF9F8]' : 'bg-gray-50'}`}>
                  {item.icon}
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
             </button>
           ))}
        </div>

        <div className="bg-white rounded-[3rem] p-8 sm:p-12 border border-gray-100 shadow-[0_40px_100px_rgba(0,0,0,0.04)] relative">
           <form onSubmit={handleRegister} className="space-y-10">
              <div className="space-y-8">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="sm:col-span-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Full Name</label>
                       <input 
                          name="name"
                          placeholder="John Doe"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full h-16 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-[#0A0A0A] font-bold text-lg focus:outline-none focus:border-[#FF5A3C] transition-all"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Phone Number</label>
                       <input 
                          name="phone"
                          type="tel"
                          placeholder="+1..."
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full h-16 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-[#0A0A0A] font-bold text-lg focus:outline-none focus:border-[#FF5A3C] transition-all"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Email Address</label>
                       <input 
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full h-16 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-[#0A0A0A] font-bold text-lg focus:outline-none focus:border-[#FF5A3C] transition-all"
                       />
                    </div>
                 </div>

                 <div className="relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Choose a Password</label>
                    <input 
                       name="password"
                       type={showPassword ? 'text' : 'password'}
                       placeholder="••••••••"
                       required
                       value={formData.password}
                       onChange={handleInputChange}
                       className="w-full h-16 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-[#0A0A0A] font-bold text-lg focus:outline-none focus:border-[#FF5A3C] transition-all"
                    />
                    <button 
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-5 bottom-4 text-gray-300 hover:text-[#FF5A3C] transition-colors p-2"
                    >
                       {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                 </div>

                 <AnimatePresence mode='wait'>
                    {role === 'merchant' && (
                       <motion.div 
                          key="merchant-fields"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-gray-50"
                       >
                          <div>
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Store Name</label>
                             <input 
                                name="store_name"
                                placeholder="The Burger Joint"
                                required
                                value={formData.store_name}
                                onChange={handleInputChange}
                                className="w-full h-16 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-[#0A0A0A] font-bold text-lg focus:outline-none focus:border-[#FF5A3C] transition-all"
                             />
                          </div>
                          <div>
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Business Category</label>
                             <div className="relative">
                                <select
                                   name="store_type"
                                   value={formData.store_type}
                                   onChange={handleInputChange}
                                   className="w-full h-16 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-[#0A0A0A] font-black text-xs uppercase tracking-[0.2em] outline-none focus:border-[#FF5A3C] transition-all appearance-none cursor-pointer"
                                   required
                                >
                                   <option value="" disabled>Select...</option>
                                   <option value="Restaurant">Restaurant</option>
                                   <option value="Grocery">Grocery</option>
                                   <option value="Pharmacy">Pharmacy</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                             </div>
                          </div>
                       </motion.div>
                    )}

                    {role === 'driver' && (
                       <motion.div 
                          key="driver-fields"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="pt-8 border-t border-gray-50"
                       >
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Transportation Type</label>
                          <div className="relative">
                             <select
                                name="vehicle_type"
                                value={formData.vehicle_type}
                                onChange={handleInputChange}
                                className="w-full h-16 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-[#0A0A0A] font-black text-xs uppercase tracking-[0.2em] outline-none focus:border-[#FF5A3C] transition-all appearance-none cursor-pointer"
                                required
                             >
                                <option value="" disabled>Select vehicle...</option>
                                <option value="Motorcycle">Motorcycle</option>
                                <option value="Car">Car</option>
                                <option value="Bicycle">Bicycle</option>
                             </select>
                             <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                          </div>
                       </motion.div>
                    )}
                 </AnimatePresence>
              </div>

              <button
                 type="submit"
                 disabled={loading}
                 className="w-full h-20 bg-[#FF5A3C] text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-[#FF5A3C]/30 hover:bg-[#E84A2C] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 group"
              >
                 {loading ? (
                    <div className="flex items-center gap-3">
                       <Zap size={20} className="animate-pulse" />
                       <span>Initializing...</span>
                    </div>
                 ) : (
                    <>
                       <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
                       <span>Create Account</span>
                    </>
                 )}
              </button>
           </form>

           <div className="mt-12 pt-8 border-t border-gray-50 text-center">
              <p className="text-gray-400 font-bold text-sm">
                 Already registered?{' '}
                 <Link href="/login" className="text-[#FF5A3C] hover:underline underline-offset-8 transition-all">
                    Log In Here
                 </Link>
              </p>
           </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-4 opacity-40">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#0A0A0A]">
              <Lock size={12} fill="currentColor" />
              Secure Data Protocol
           </div>
        </div>
      </motion.div>
    </div>
  );
}
