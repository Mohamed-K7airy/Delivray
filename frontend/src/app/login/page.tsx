'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { API_URL } from '@/config/api';
import { Eye, EyeOff, LogIn, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Input from '@/components/Input';
import Button from '@/components/Button';

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
        body: JSON.stringify({ phone, password }),
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
    <div className="min-h-[100dvh] bg-[#080808] flex flex-col items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(217,119,87,0.05),transparent_50%)] pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-2xl border border-white/10 mb-6 shadow-2xl">
              <ShieldCheck size={32} className="text-primary" />
           </div>
           <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter mb-4 leading-none italic">Relink <span className="text-primary">Nexus.</span></h1>
           <p className="text-gray-500 font-medium text-sm sm:text-base px-6">Access your encrypted delivery portal and fulfill active missions.</p>
        </div>

        <div className="card-responsive !bg-[#111111] !p-8 sm:!p-12 border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
           
           <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-6">
                 <Input 
                    label="Operational Phone Index"
                    type="tel"
                    placeholder="+1234..."
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                 />

                 <div className="relative">
                    <Input 
                       label="Access Key"
                       type={showPassword ? 'text' : 'password'}
                       placeholder="••••••••"
                       required
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-5 bottom-4 text-gray-600 hover:text-white transition-colors p-2"
                    >
                       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                 </div>
              </div>

              <Button
                 type="submit"
                 disabled={loading}
                 className="w-full h-18 text-base bg-primary text-white shadow-2xl shadow-primary/20"
              >
                 {loading ? (
                    <div className="flex items-center gap-3">
                       <Zap size={20} className="animate-pulse" />
                       <span>Decrypting...</span>
                    </div>
                 ) : (
                    <>
                       <LogIn size={20} className="mr-3" />
                       <span>Synchronize</span>
                    </>
                 )}
              </Button>
           </form>

           <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-gray-500 text-sm font-medium">
                 New operator?{' '}
                 <Link href="/register" className="text-primary font-black hover:underline underline-offset-8 transition-all">
                    Initialize Registry
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
