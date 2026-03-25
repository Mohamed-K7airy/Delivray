'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { API_URL } from '@/config/api';

import { Eye, EyeOff, LogIn } from 'lucide-react';

import { motion } from 'framer-motion';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setToken(data.token);
      setUser({
        id: data.id,
        name: data.name,
        phone: data.phone,
        role: data.role,
        status: data.status
      });

      if (data.role === 'customer') router.push('/');
      else if (data.role === 'merchant') router.push('/merchant/dashboard');
      else if (data.role === 'driver') router.push('/driver/panel');
      else if (data.role === 'admin') router.push('/admin/dashboard');

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
        className="w-full max-w-[500px] p-6 sm:p-10 md:p-12 space-y-6 sm:space-y-10 bg-[#0b0b0b] rounded-2xl sm:rounded-[2rem] border border-white/5 relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]"
      >
        <div className="text-center">
          <span className="bg-primary/10 text-primary px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-primary/10 mb-8 inline-block">
            Welcome Back
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter mb-3 uppercase">Sign In</h1>
          <p className="text-gray-500 font-medium text-sm sm:text-base">Access your Delivray account</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="p-4 text-xs font-black text-[#f08c6e] bg-[#f08c6e]/10 rounded-2xl border border-[#f08c6e]/20 tracking-wider uppercase text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-5 py-3.5 sm:px-8 sm:py-5 text-sm sm:text-base text-white bg-white/[0.03] border border-white/5 rounded-xl sm:rounded-2xl focus:bg-white/[0.05] focus:ring-0 focus:border-primary/40 outline-none transition-all font-medium placeholder:text-gray-500"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 sm:px-8 sm:py-5 text-sm sm:text-base text-white bg-white/[0.03] border border-white/5 rounded-xl sm:rounded-2xl focus:bg-white/[0.05] focus:ring-0 focus:border-primary/40 outline-none transition-all font-medium placeholder:text-gray-500 pr-14 sm:pr-16"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 sm:right-6 top-[44px] sm:top-[54px] text-gray-600 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3.5 sm:px-8 sm:py-5 bg-primary text-black font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] rounded-xl hover:scale-[1.02] active:scale-98 transition-all shadow-[0_20px_40px_-10px_rgba(217,119,87,0.4)] disabled:opacity-50 text-sm sm:text-base flex items-center justify-center space-x-3"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <LogIn size={20} strokeWidth={3} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 font-medium">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary font-black hover:underline underline-offset-8">
            Register here
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
