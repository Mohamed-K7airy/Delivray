'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { ShoppingBag, User, Truck, Eye, EyeOff, ShieldCheck, Zap, ChevronDown, CheckCircle2, Lock } from 'lucide-react';
import { API_URL } from '@/config/api';
import { apiClient } from '@/lib/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div className="h-48 w-full bg-slate-50 animate-pulse flex items-center justify-center text-[8px] font-bold uppercase tracking-widest text-slate-300">Syncing Map...</div>
});

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
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
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
          location: selectedLocation ? { lat: selectedLocation[0], lng: selectedLocation[1] } : { lat: 0, lng: 0 }
        })
      };

      const data = await apiClient('/auth/register', {
        method: 'POST',
        data: payload,
      });

      if (!data) return;

      if (data.status === 'active') { // Customer
        const loginData = await apiClient('/auth/login', {
          method: 'POST',
          data: { phone: formData.phone, password: formData.password },
        });

        if (!loginData) return;

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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 lg:p-16 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-slate-200/20 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-slate-200/20 rounded-full blur-[100px]"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl z-10"
      >
        <div className="flex flex-col items-center text-center mb-16 space-y-8">
           <Logo className="scale-150 grayscale opacity-80" />
           <div className="space-y-3">
              <h1 className="text-6xl font-bold text-slate-900 tracking-tighter leading-none">Create <br /><span className="text-slate-300">Account.</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Join the Delivray platform</p>
           </div>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-3 gap-6 mb-12">
           {[
             { id: 'customer', label: 'User', icon: <User size={20} /> },
             { id: 'merchant', label: 'Vendor', icon: <ShoppingBag size={20} /> },
             { id: 'driver', label: 'Operator', icon: <Truck size={20} /> }
           ].map((item) => (
             <button
               key={item.id}
               type="button"
               onClick={() => setRole(item.id as any)}
               className={`flex flex-col items-center justify-center p-6 rounded-[2rem] transition-all border shrink-0 gap-4 group/item
                 ${role === item.id 
                   ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-105' 
                   : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-900 shadow-sm'}`}
             >
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${role === item.id ? 'bg-white/10' : 'bg-slate-50'}`}>
                  {item.icon}
               </div>
               <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{item.label}</span>
             </button>
           ))}
        </div>

        <div className="bg-white rounded-[2.5rem] p-12 lg:p-16 border border-slate-100 shadow-2xl relative">
           <form onSubmit={handleRegister} className="space-y-12">
              <div className="space-y-10">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <div className="sm:col-span-2 space-y-3">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                       <input 
                          name="name"
                          placeholder="John Doe"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-transparent text-slate-900 font-bold text-base placeholder:text-slate-200 focus:outline-none focus:border-slate-900 focus:bg-white transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                       <input 
                          name="phone"
                          type="tel"
                          placeholder="e.g. 01012345678"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-transparent text-slate-900 font-bold text-base placeholder:text-slate-200 focus:outline-none focus:border-slate-900 focus:bg-white transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                       <input 
                          name="email"
                          type="email"
                          placeholder="name@domain.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-transparent text-slate-900 font-bold text-base placeholder:text-slate-200 focus:outline-none focus:border-slate-900 focus:bg-white transition-all shadow-inner"
                       />
                    </div>
                 </div>

                 <div className="space-y-3 relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
                    <input 
                       name="password"
                       type={showPassword ? 'text' : 'password'}
                       placeholder="••••••••"
                       required
                       value={formData.password}
                       onChange={handleInputChange}
                       className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-transparent text-slate-900 font-bold text-base placeholder:text-slate-200 focus:outline-none focus:border-slate-900 focus:bg-white transition-all shadow-inner"
                    />
                    <button 
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-5 bottom-4 text-slate-200 hover:text-slate-900 transition-colors p-2"
                    >
                       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                 </div>

                 <AnimatePresence mode='wait'>
                    {role === 'merchant' && (
                       <motion.div 
                          key="merchant-fields"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-10 border-t border-slate-50"
                       >
                          <div className="space-y-3">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Store Name</label>
                             <input 
                                name="store_name"
                                placeholder="My Super Store"
                                required
                                value={formData.store_name}
                                onChange={handleInputChange}
                                className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-transparent text-slate-900 font-bold text-base placeholder:text-slate-200 focus:outline-none focus:border-slate-900 focus:bg-white transition-all shadow-inner"
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Store Category</label>
                             <div className="relative">
                                <select
                                   name="store_type"
                                   value={formData.store_type}
                                   onChange={handleInputChange}
                                   className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-transparent text-slate-900 font-bold text-[10px] uppercase tracking-[0.2em] outline-none focus:border-slate-900 focus:bg-white transition-all appearance-none cursor-pointer shadow-inner"
                                   required
                                >
                                   <option value="" disabled>Select Category...</option>
                                   <option value="Restaurant">Restaurant</option>
                                   <option value="Grocery">Grocery Store</option>
                                   <option value="Pharmacy">Pharmacy</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300" />
                             </div>
                          </div>
                          <div className="sm:col-span-2 space-y-4">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Location on Map</label>
                             <div className="h-64 rounded-3xl overflow-hidden border border-slate-100 relative shadow-inner">
                                <MapView 
                                   center={[24.7136, 46.6753]} 
                                   zoom={12} 
                                   interactive={true}
                                   onLocationSelect={(lat, lng) => setSelectedLocation([lat, lng])}
                                   markers={selectedLocation ? [{ position: selectedLocation, type: 'store', label: 'HUB' }] : []}
                                />
                                {!selectedLocation && (
                                   <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
                                      <span className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[8px] font-bold uppercase tracking-[0.2em] shadow-xl">Tap on map to select store location</span>
                                   </div>
                                )}
                             </div>
                          </div>
                       </motion.div>
                    )}

                    {role === 'driver' && (
                       <motion.div 
                          key="driver-fields"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pt-10 border-t border-slate-50 space-y-3"
                       >
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Vehicle Type</label>
                          <div className="relative">
                             <select
                                name="vehicle_type"
                                value={formData.vehicle_type}
                                onChange={handleInputChange}
                                className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-transparent text-slate-900 font-bold text-[10px] uppercase tracking-[0.2em] outline-none focus:border-slate-900 focus:bg-white transition-all appearance-none cursor-pointer shadow-inner"
                                required
                             >
                                <option value="" disabled>Select Vehicle Type...</option>
                                <option value="Motorcycle">Motorcycle</option>
                                <option value="Car">Car</option>
                                <option value="Bicycle">Bicycle</option>
                             </select>
                             <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300" />
                          </div>
                       </motion.div>
                    )}
                 </AnimatePresence>
              </div>

              <button
                 type="submit"
                 disabled={loading}
                 className="w-full h-20 bg-slate-900 text-white rounded-[2rem] font-bold uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-5 disabled:opacity-20 group relative overflow-hidden"
              >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent skew-x-[-20deg] group-hover:translate-x-full transition-transform duration-1000" />
                 {loading ? (
                    <div className="flex items-center gap-4 relative z-10">
                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                       <span>Initializing...</span>
                    </div>
                 ) : (
                    <>
                       <span className="relative z-10">Create Account</span>
                    </>
                 )}
              </button>
           </form>

           <div className="mt-12 pt-10 border-t border-slate-50 text-center">
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                 Already have an account?{' '}
                 <Link href="/login" className="text-slate-900 hover:underline underline-offset-8 transition-all">
                    Log In
                 </Link>
              </p>
           </div>
        </div>

        <div className="mt-16 flex items-center justify-center gap-4 opacity-20">
           <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-slate-900">
              <Lock size={14} fill="currentColor" />
              Secure Registration
           </div>
        </div>
      </motion.div>
    </div>
  );
}
