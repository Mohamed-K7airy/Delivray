'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { ShoppingBag, User, Truck, Eye, EyeOff, ShieldCheck, Zap, ChevronDown } from 'lucide-react';
import { API_URL } from '@/config/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Input from '@/components/Input';
import Button from '@/components/Button';

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
        toast.success('Protocol Initialized! Awaiting Admin authorization.');
        router.push('/login');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#080808] flex flex-col items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(217,119,87,0.05),transparent_50%)] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl z-10"
      >
        <div className="text-center mb-10">
           <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-4 leading-none italic">New <span className="text-primary">Identity.</span></h1>
           <p className="text-gray-500 font-medium text-sm sm:text-base px-6">Select your operational role and join the Delivray logistics fleet.</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-3 gap-4 mb-8">
           {[
             { id: 'customer', label: 'Client', icon: <User size={20} /> },
             { id: 'merchant', label: 'Partner', icon: <ShoppingBag size={20} /> },
             { id: 'driver', label: 'Fleet', icon: <Truck size={20} /> }
           ].map((item) => (
             <button
               key={item.id}
               type="button"
               onClick={() => setRole(item.id as any)}
               className={`flex flex-col items-center justify-center p-5 sm:p-8 rounded-[2rem] transition-all border-2 gap-4
                 ${role === item.id 
                   ? 'border-primary bg-primary/5 text-primary shadow-2xl shadow-primary/10' 
                   : 'border-white/5 bg-white/[0.02] text-gray-500 hover:bg-white/[0.05] hover:border-white/10'}`}
             >
               {item.icon}
               <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
             </button>
           ))}
        </div>

        <div className="card-responsive !bg-[#111111] !p-8 sm:!p-12 border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
           
           <form onSubmit={handleRegister} className="space-y-8">
              <div className="space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                       <Input 
                          label="Legal Full Name"
                          name="name"
                          placeholder="Your Name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                       />
                    </div>
                    <div>
                       <Input 
                          label="Mobile Index"
                          name="phone"
                          type="tel"
                          placeholder="+20..."
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                       />
                    </div>
                    <div>
                       <Input 
                          label="Encrypted Email"
                          name="email"
                          type="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={handleInputChange}
                       />
                    </div>
                 </div>

                 <div className="relative">
                    <Input 
                       label="Access Protocol (Password)"
                       name="password"
                       type={showPassword ? 'text' : 'password'}
                       placeholder="••••••••"
                       required
                       value={formData.password}
                       onChange={handleInputChange}
                    />
                    <button 
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-5 bottom-4 text-gray-600 hover:text-white transition-colors p-2"
                    >
                       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                 </div>

                 <AnimatePresence mode='wait'>
                    {role === 'merchant' && (
                       <motion.div 
                          key="merchant-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-white/5"
                       >
                          <div>
                             <Input 
                                label="Store Registered Name"
                                name="store_name"
                                placeholder="Store Name"
                                required
                                value={formData.store_name}
                                onChange={handleInputChange}
                             />
                          </div>
                          <div>
                             <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Establishment Type</label>
                             <div className="relative">
                                <select
                                   name="store_type"
                                   value={formData.store_type}
                                   onChange={handleInputChange}
                                   className="w-full px-6 py-5 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-primary transition-all font-black uppercase text-xs tracking-widest appearance-none cursor-pointer"
                                   required
                                >
                                   <option value="" disabled className="bg-[#111]">Select...</option>
                                   <option value="Restaurant" className="bg-[#111]">Restaurant</option>
                                   <option value="Grocery" className="bg-[#111]">Grocery</option>
                                   <option value="Pharmacy" className="bg-[#111]">Pharmacy</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                             </div>
                          </div>
                       </motion.div>
                    )}

                    {role === 'driver' && (
                       <motion.div 
                          key="driver-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-6 border-t border-white/5"
                       >
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Fleet Vehicle Designation</label>
                          <div className="relative">
                             <select
                                name="vehicle_type"
                                value={formData.vehicle_type}
                                onChange={handleInputChange}
                                className="w-full px-6 py-5 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-primary transition-all font-black uppercase text-xs tracking-widest appearance-none cursor-pointer"
                                required
                             >
                                <option value="" disabled className="bg-[#111]">Select vehicle...</option>
                                <option value="Motorcycle" className="bg-[#111]">Motorcycle</option>
                                <option value="Car" className="bg-[#111]">Car</option>
                             </select>
                             <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                          </div>
                       </motion.div>
                    )}
                 </AnimatePresence>
              </div>

              <Button
                 type="submit"
                 disabled={loading}
                 className="w-full h-18 text-base bg-primary text-white shadow-2xl shadow-primary/20"
              >
                 {loading ? (
                    <div className="flex items-center gap-3">
                       <Zap size={20} className="animate-pulse" />
                       <span>Initializing...</span>
                    </div>
                 ) : (
                    <>
                       <ShieldCheck size={20} className="mr-3" />
                       <span>Create Registry</span>
                    </>
                 )}
              </Button>
           </form>

           <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-gray-500 text-sm font-medium">
                 Established operator?{' '}
                 <Link href="/login" className="text-primary font-black hover:underline underline-offset-8 transition-all">
                    Link Identity
                 </Link>
              </p>
           </div>
        </div>

        <div className="mt-12 text-center opacity-30 hover:opacity-100 transition-opacity">
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white italic">Delivray Protocol v4.2</p>
        </div>
      </motion.div>
    </div>
  );
}
