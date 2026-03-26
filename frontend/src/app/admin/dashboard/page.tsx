'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Users, ShoppingBag, DollarSign, Activity, ShieldAlert, ShieldCheck, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import Button from '@/components/Button';

interface Stats {
  totalOrders: number;
  totalUsers: number;
  totalStores: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const statsRes = await fetch(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const usersRes = await fetch(`${API_URL}/admin/pending-users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (statsRes.ok) setStats(await statsRes.json());
        if (usersRes.ok) setPendingUsers(await usersRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [token, user, router]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/approve-user/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPendingUsers(pendingUsers.filter(u => u.id !== id));
        toast.success('Core Authorization Granted.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Authorization Failed.');
    }
  };

  return (
    <div className="container-responsive py-6 sm:py-10 space-y-12 sm:space-y-16">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
           <h1 className="heading-responsive !text-3xl sm:!text-5xl">Admin <span className="text-[#d97757] italic">Portal.</span></h1>
           <p className="text-responsive mt-3 max-w-2xl font-medium text-[#888888]">Global infrastructure telemetry and security authorization console.</p>
        </div>
        <div className="bg-[#fef3f2] px-6 py-3 rounded-xl border border-[#fee2e2] flex items-center space-x-4 shadow-sm">
           <div className="w-2.5 h-2.5 bg-[#d97757] rounded-full animate-pulse shadow-[0_0_8px_rgba(217,119,87,0.5)]"></div>
           <span className="text-[10px] font-black text-[#d97757] uppercase tracking-[0.3em]">System Status: Operational</span>
        </div>
      </header>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
        {[
          { label: 'Network Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'text-[#d97757]', bg: 'bg-[#fef3f2]' },
          { label: 'Active Personnel', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Capital Throughput', value: `$${stats?.totalRevenue.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Partner Sockets', value: stats?.totalStores || 0, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((item, idx) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md group hover:-translate-y-1 transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
               <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
                  <item.icon size={24}/>
               </div>
               <div className="w-1.5 h-1.5 bg-gray-100 rounded-full"></div>
            </div>
            <div>
               <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest leading-none mb-3">{item.label}</p>
               <p className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tighter truncate">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pending Approvals */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
      >
        <div className="px-8 py-8 sm:px-12 sm:py-10 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6">
           <div className="text-center sm:text-left">
              <h2 className="text-2xl font-black text-[#111111] uppercase tracking-tight">Authorization Queue</h2>
              <p className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em] mt-2">Credentials awaiting system-wide verification</p>
           </div>
           <div className="px-6 py-2.5 bg-[#fef3f2] border border-[#fee2e2] rounded-full flex items-center gap-3">
              <Activity size={12} className="text-[#d97757] animate-pulse" />
              <span className="text-[10px] font-black text-[#d97757] uppercase tracking-widest">{pendingUsers.length} INCOMING</span>
           </div>
        </div>
        
        <div className="p-8 sm:p-12">
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center text-gray-300">
               <Activity size={48} className="animate-spin" />
               <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-6">Decoding Personnel Stream</p>
             </div>
          ) : pendingUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
               <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center mb-8 text-gray-200">
                  <ShieldCheck size={40} />
               </div>
               <h3 className="text-xl font-black uppercase tracking-tight text-[#888888]">Grid is <span className="text-[#111111]">Secure.</span></h3>
               <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest mt-3">No unauthorized entities detected in sub-sectors</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {pendingUsers.map(u => (
                <div key={u.id} className="p-6 sm:p-8 rounded-2xl bg-[#f9f9f9] border border-gray-100 flex flex-col md:flex-row justify-between items-center hover:bg-gray-100 transition-all group gap-8">
                  <div className="flex flex-col sm:flex-row items-center gap-8 w-full md:w-auto">
                    <div className="w-20 h-20 bg-[#fef3f2] border border-[#fee2e2] rounded-xl flex items-center justify-center text-[#d97757] font-black text-3xl italic group-hover:scale-105 transition-transform shadow-sm shrink-0">
                       {u.name?.[0].toUpperCase()}
                    </div>
                    <div className="text-center sm:text-left">
                       <h4 className="text-2xl font-black text-[#111111] uppercase tracking-tight mb-2">{u.name}</h4>
                       <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                          <span className="text-[10px] font-black text-[#888888] uppercase tracking-widest">{u.email || u.phone}</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full hidden sm:block" />
                          <span className="bg-[#fef3f2] text-[#d97757] px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">{u.role}</span>
                       </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleApprove(u.id)} 
                    className="w-full md:w-auto h-16 px-10 bg-[#111111] text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-md hover:bg-[#222] active:scale-95 transition-all flex items-center justify-center gap-4"
                  >
                    <Check size={18} className="stroke-[3]" />
                    <span>Authorize Access</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Admin Branding Footer */}
      <div className="pt-12 text-center opacity-30 hover:opacity-100 transition-opacity cursor-default">
         <div className="flex items-center justify-center gap-4 mb-6">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#111111]">Delivray <span className="text-[#d97757]">Core</span></h2>
         </div>
         <div className="flex items-center justify-center gap-10 text-[9px] font-black uppercase tracking-[0.5em] text-[#888888]">
            <span>Kernel Access</span>
            <span>Security Terminal</span>
            <span>Global Pulse</span>
         </div>
      </div>
    </div>
  );
}
