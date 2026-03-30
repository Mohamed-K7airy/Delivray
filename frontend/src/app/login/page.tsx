'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { API_URL } from '@/config/api';
import { apiClient } from '@/lib/apiClient';
import { Eye, EyeOff, LogIn, ShieldCheck, Zap, ArrowRight, Lock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiClient('/auth/login', {
        method: 'POST',
        data: { phone: phone.trim(), password },
      });

      if (!data) return;

      setToken(data.token);
      setUser({
        id: data.id,
        name: data.name,
        phone: data.phone,
        role: data.role,
        status: data.status
      });

      toast.success(`Welcome back, ${data.name.split(' ')[0]}!`);

      if (data.role === 'customer') router.push('/');
      else if (data.role === 'merchant') router.push('/merchant/dashboard');
      else if (data.role === 'driver') router.push('/driver/dashboard');
      else if (data.role === 'admin') router.push('/admin/dashboard');

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
         <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-slate-200/20 rounded-full blur-[100px]"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center text-center mb-16 space-y-8">
           <Logo className="scale-150 grayscale opacity-80" />
           <div className="space-y-3">
              <h1 className="text-6xl font-bold text-slate-900 tracking-tighter leading-none">User <br /><span className="text-slate-300">Login.</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Welcome Back</p>
           </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-12 lg:p-16 border border-slate-100 shadow-2xl relative">
           <form onSubmit={handleLogin} className="space-y-10">
              <div className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                    <input 
                       type="tel"
                       placeholder="e.g. 01012345678"
                       required
                       value={phone}
                       onChange={(e) => setPhone(e.target.value)}
                       className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-transparent text-slate-900 font-bold text-base placeholder:text-slate-200 focus:outline-none focus:border-slate-900 focus:bg-white transition-all shadow-inner"
                    />
                 </div>

                 <div className="space-y-3 relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
                    <input 
                       type={showPassword ? 'text' : 'password'}
                       placeholder="••••••••"
                       required
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-transparent text-slate-900 font-bold text-base placeholder:text-slate-200 focus:outline-none focus:border-slate-900 focus:bg-white transition-all shadow-inner"
                    />
                    <button 
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-5 bottom-4 text-slate-300 hover:text-slate-900 transition-colors p-2"
                    >
                       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                 </div>
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
                       <span>Authenticating...</span>
                    </div>
                 ) : (
                    <>
                       <span className="relative z-10">Sign In</span>
                       <ChevronRight size={18} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                    </>
                 )}
              </button>
           </form>

           <div className="mt-12 pt-10 border-t border-slate-50 text-center">
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                 Don't have an account?{' '}
                 <Link href="/register" className="text-slate-900 hover:underline underline-offset-8 transition-all">
                    Sign Up
                 </Link>
              </p>
           </div>
        </div>

        <div className="mt-16 flex items-center justify-center gap-4 opacity-20">
           <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] text-slate-900">
              <Lock size={14} fill="currentColor" />
              Secure Login
           </div>
        </div>
      </motion.div>
    </div>
  );
}
