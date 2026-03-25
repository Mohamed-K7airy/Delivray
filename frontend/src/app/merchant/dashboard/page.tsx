'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { TrendingUp, Users, DollarSign, Package, Zap, ListOrdered, Activity, Info, BarChart3, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';

export default function MerchantDashboard() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, products: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== 'merchant') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch Stats
        const statsRes = await fetch(`${API_URL}/stores/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (statsRes.ok) {
           const statsData = await statsRes.json();
           setStats(statsData);
        }

        // Fetch Recent Orders for Activity
        const ordersRes = await fetch(`${API_URL}/merchant/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (ordersRes.ok) {
           const ordersData = await ordersRes.json();
           setActivities(ordersData.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, router]);

  const statCards = [
    { label: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, change: '+12.5%', icon: <DollarSign size={20} />, color: 'primary' },
    { label: 'Active Orders', value: stats.orders.toString(), change: '+8.2%', icon: <ListOrdered size={20} />, color: 'white' },
    { label: 'Total Customers', value: stats.customers.toString(), change: '+5.4', icon: <Users size={20} />, color: 'white' },
    { label: 'Catalog Size', value: stats.products.toString(), change: '+2', icon: <Package size={20} />, color: 'white' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 sm:space-y-16">
       {/* Dashboard Hero */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
          <div>
             <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter">Overview</h1>
             <p className="text-gray-500 font-medium text-base mt-2">Welcome back. Here is what's happening in your shop today.</p>
          </div>
          <div className="bg-[#262624] px-6 py-3 rounded-full border border-white/5 flex items-center space-x-3">
             <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(217,119,87,1)]"></div>
             <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">System: High Velocity</span>
          </div>
       </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-8">
          {statCards.map((stat, idx) => (
             <motion.div 
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#262624] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/5 shadow-2xl group hover:border-primary/20 transition-all"
             >
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                   <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center ${stat.color === 'primary' ? 'text-primary' : 'text-white'}`}>
                      {stat.icon}
                   </div>
                   <div className="flex items-center space-x-1 text-[10px] font-black text-primary uppercase">
                      <ArrowUpRight size={14} />
                      <span>{stat.change}</span>
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                   <h3 className="text-xl sm:text-3xl font-black text-white tracking-tighter">{stat.value}</h3>
                </div>
             </motion.div>
          ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Revenue Graph Placeholder */}
          <div className="lg:col-span-8 bg-[#262624] p-5 sm:p-10 rounded-2xl sm:rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 relative z-10">
                <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <BarChart3 size={20} />
                   </div>
                   <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tighter">Revenue Distribution</h3>
                </div>
                <div className="flex space-x-2">
                   {['7D', '1M', '1Y'].map(t => (
                      <button key={t} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 ${t === '1M' ? 'bg-primary text-black' : 'bg-white/5 text-gray-500 hover:text-white transition-colors'}`}>
                         {t}
                      </button>
                   ))}
                </div>
             </div>
             
             {/* Abstract Graph Pattern */}
             <div className="h-40 sm:h-64 flex items-end justify-between space-x-2 sm:space-x-4 mb-6 sm:mb-8">
                {[40, 60, 35, 80, 55, 90, 70, 45, 85, 30].map((h, i) => (
                   <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.1, duration: 1 }}
                      className={`w-full rounded-xl sm:rounded-2xl ${i === 5 ? 'bg-primary shadow-[0_0_30px_rgba(217,119,87,0.3)]' : 'bg-white/5 group-hover:bg-white/10 transition-colors'}`}
                   ></motion.div>
                ))}
             </div>

             <div className="hidden sm:flex items-center justify-between text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">
                <span>Week 01</span>
                <span>Week 10</span>
                <span>Week 20</span>
                <span>Week 30</span>
                <span>Week 40</span>
             </div>
          </div>

          {/* Activity Sidebar */}
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-[#262624] p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-white/5 h-full relative group shadow-2xl">
                <h3 className="text-base sm:text-xl font-black uppercase tracking-tighter mb-6 sm:mb-8 flex items-center space-x-3">
                   <Clock size={18} className="text-primary" />
                   <span>Real-time Activity</span>
                </h3>
                
                <div className="space-y-6">
                   {loading ? (
                      <div className="text-[10px] font-black uppercase tracking-tighter text-gray-700 animate-pulse">Synchronizing Data...</div>
                   ) : activities.length > 0 ? activities.map((item, idx) => (
                      <div key={idx} className="flex space-x-4 items-start group/it cursor-pointer" onClick={() => router.push('/merchant/orders')}>
                         <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-600 group-hover/it:text-primary transition-colors">
                            <Zap size={16} />
                         </div>
                         <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-tighter text-white group-hover/it:text-primary transition-colors leading-tight">
                               Order #{item.id.slice(-4)} - {item.status}
                            </p>
                            <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.2em] mt-1">{new Date(item.created_at).toLocaleTimeString()}</p>
                         </div>
                      </div>
                   )) : (
                      <div className="text-[10px] font-black uppercase tracking-tighter text-gray-700">No recent activity detected.</div>
                   )}
                </div>

                <button 
                  onClick={() => router.push('/merchant/orders')}
                  className="w-full mt-10 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-gray-400 hover:text-white"
                >
                   View All Activity
                </button>
             </div>
          </div>
       </div>

       {/* Delivery Stream Tracker (Ported) */}
       <div className="bg-[#262624] p-5 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 relative z-10">
             <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Activity size={20} />
                </div>
                <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tighter">Global Logistics Flow</h3>
             </div>
             <div className="hidden sm:flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                   <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(217,119,87,1)]"></span>
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mt-0.5">Live Data Flow</span>
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mt-0.5 opacity-50">Terminal 01 / Sector 7</span>
             </div>
          </div>
          
          <div className="relative h-2 bg-white/5 rounded-full mb-6 overflow-hidden">
             <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '68%' }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute h-full bg-gradient-to-r from-primary/20 via-primary to-primary/40 rounded-full"
             ></motion.div>
          </div>

          <div className="flex justify-between text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-gray-700">
             <span className="text-primary shadow-[0_10px_10px_-5px_rgba(217,119,87,0.3)]">Nexus</span>
             <span className="text-primary">Dispatch</span>
             <span>In Orbit</span>
             <span>Fulfilled</span>
          </div>

          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -mr-40 -mb-40 opacity-40"></div>
       </div>
    </div>
  );
}
