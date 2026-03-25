'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Users, ShoppingBag, DollarSign, Activity, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '@/config/api';

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
        alert('User approved successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 h-full">
      <header className="mb-12">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-black text-white uppercase tracking-tighter"
        >
          Admin <span className="text-red-500 italic">Nexus</span>
        </motion.h1>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Real-time system telemetry and authorization control</p>
      </header>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
          { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          { label: 'Revenue Flow', value: `$${stats?.totalRevenue.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
          { label: 'Active Stores', value: stats?.totalStores || 0, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        ].map((item, idx) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-8 bg-[#1a1a1a] rounded-[2.5rem] border ${item.border} flex items-center group hover:bg-white/[0.04] transition-all shadow-2xl relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className={`p-5 ${item.bg} ${item.color} rounded-2xl mr-6 group-hover:scale-110 transition-transform`}>
              <item.icon size={24}/>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-2">{item.label}</p>
              <p className="text-3xl font-black text-white tracking-tighter">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pending Approvals */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1a1a] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl"
      >
        <div className="px-10 py-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
           <div>
              <h2 className="text-lg font-black text-white uppercase tracking-widest">Authorization Queue</h2>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Pending verification for merchants and drivers</p>
           </div>
           <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{pendingUsers.length} PENDING</span>
           </div>
        </div>
        <div className="p-8">
          {pendingUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-600">
               <ShieldAlert size={48} className="mb-4 opacity-20" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em]">All clear. No pending authorizations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map(u => (
                <div key={u.id} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row justify-between items-center hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-center space-x-6 mb-4 md:mb-0">
                    <div className="w-16 h-16 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-red-500 font-black text-2xl italic group-hover:scale-105 transition-transform">
                       {u.name?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-lg font-black text-white leading-none mb-2">{u.name}</p>
                      <div className="flex items-center space-x-3">
                         <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{u.email || u.phone}</p>
                         <span className="w-1 h-1 bg-white/20 rounded-full" />
                         <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em]">{u.role}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleApprove(u.id)} 
                    className="w-full md:w-auto bg-red-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_15px_30px_-10px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95 transition-all"
                  >
                    Authorize Access
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
