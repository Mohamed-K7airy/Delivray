'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { API_URL } from '@/config/api';
import { Eye, EyeOff, LogIn, ShieldCheck, Zap, ArrowRight, Lock } from 'lucide-react';
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
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

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
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
         <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-[#d97757]/5 rounded-full blur-[120px]"></div>
         <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-[#d97757]/5 rounded-full blur-[100px]"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center text-center mb-12">
           <Logo className="mb-10 scale-125" />
           <h1 className="text-4xl lg:text-5xl font-black text-[#111111] tracking-tighter leading-none mb-4">Welcome <span className="text-[#d97757]">back.</span></h1>
           <p className="text-[#555555] font-bold max-w-[280px]">Access your account to manage orders and explore new tastes.</p>
        </div>

        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-100 shadow-md relative">
           <form onSubmit={handleLogin} className="space-y-10">
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-[#888888] uppercase tracking-widest mb-3 block ml-1">Phone Number</label>
                    <input 
                       type="tel"
                       placeholder="+1..."
                       required
                       value={phone}
                       onChange={(e) => setPhone(e.target.value)}
                       className="w-full h-16 px-6 rounded-xl bg-gray-50 border border-gray-100 text-[#111111] font-bold text-lg placeholder-gray-300 focus:outline-none focus:border-[#d97757] transition-all"
                    />
                 </div>

                 <div className="relative">
                    <label className="text-[10px] font-black text-[#888888] uppercase tracking-widest mb-3 block ml-1">Security Key</label>
                    <input 
                       type={showPassword ? 'text' : 'password'}
                       placeholder="••••••••"
                       required
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="w-full h-16 px-6 rounded-xl bg-gray-50 border border-gray-100 text-[#111111] font-bold text-lg placeholder-gray-300 focus:outline-none focus:border-[#d97757] transition-all"
                    />
                    <button 
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-5 bottom-4 text-gray-300 hover:text-[#d97757] transition-colors p-2"
                    >
                       {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                 </div>
              </div>

              <button
                 type="submit"
                 disabled={loading}
                 className="w-full h-20 bg-[#d97757] text-white rounded-xl font-black uppercase tracking-widest shadow-md hover:bg-[#c2654a] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 group"
              >
                 {loading ? (
                    <div className="flex items-center gap-3">
                       <Zap size={20} className="animate-pulse" />
                       <span>Authenticating...</span>
                    </div>
                 ) : (
                    <>
                       <span>Log In</span>
                       <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                 )}
              </button>
           </form>

           <div className="mt-12 pt-8 border-t border-gray-50 text-center">
              <p className="text-[#555555] font-bold text-sm">
                 New to Delivray?{' '}
                 <Link href="/register" className="text-[#d97757] hover:underline underline-offset-8 transition-all">
                    Create Account
                 </Link>
              </p>
           </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-4 opacity-40">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#111111]">
              <Lock size={12} fill="currentColor" />
              Secure Authentication
           </div>
        </div>
      </motion.div>
    </div>
  );
}
