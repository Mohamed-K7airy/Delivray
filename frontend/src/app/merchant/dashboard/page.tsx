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
        const statsRes = await fetch(`${API_URL}/stores/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (statsRes.ok) {
           const statsData = await statsRes.json();
           setStats(statsData);
        }

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
    <div className="container-responsive py-8 lg:py-16 space-y-10 lg:space-y-20">
       {/* Dashboard Hero */}
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div>
             <h1 className="heading-responsive !text-3xl lg:!text-6xl">Store <span className="text-primary italic">Dynamics.</span></h1>
             <p className="text-responsive mt-4 max-w-3xl">Command center status: Optimal. Analyzing cross-node trajectory for {user?.name?.split(' ')[0]}.</p>
          </div>
          <div className="bg-[#111111] px-8 py-4 rounded-2xl border border-white/10 flex items-center space-x-5 shadow-2xl">
             <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(217,119,87,1)]"></div>
             <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">Node: Live / Sync Priority</span>
          </div>
       </div>

       {/* Stats Grid - High Density */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
          {statCards.map((stat, idx) => (
             <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-responsive !p-6 lg:!p-8 group"
             >
                <div className="flex justify-between items-start mb-12">
                   <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 ${stat.color === 'primary' ? 'text-primary' : 'text-gray-500 group-hover:text-white transition-all'}`}>
                      {stat.icon}
                   </div>
                   <div className="flex items-center space-x-2 text-[9px] font-black text-primary uppercase bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                      <ArrowUpRight size={14} />
                      <span>{stat.change}</span>
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3">{stat.label}</p>
                   <h3 className="text-3xl lg:text-5xl font-black text-white tracking-tighter truncate leading-none">{stat.value}</h3>
                </div>
             </motion.div>
          ))}
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-16">
          {/* Revenue Graph Optimized */}
          <div className="xl:col-span-8 card-responsive !p-10 lg:!p-16">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                <div className="flex items-center space-x-6">
                   <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-xl">
                      <BarChart3 size={28} />
                   </div>
                   <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-tight">Financial Trajectory</h3>
                </div>
                <div className="flex bg-[#0a0a0a] p-1.5 rounded-2xl border border-white/10 w-full md:w-auto">
                   {['7D', '1M', '1Y', 'ALL'].map(t => (
                      <button key={t} className={`flex-1 md:flex-none px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${t === '1M' ? 'bg-primary text-white shadow-2xl' : 'text-gray-600 hover:text-white'}`}>
                         {t}
                      </button>
                   ))}
                </div>
             </div>
             
             {/* Abstract Graph - More Dense */}
             <div className="h-64 lg:h-80 flex items-end justify-between space-x-2 sm:space-x-4 mb-10">
                {[45, 65, 40, 85, 60, 95, 75, 50, 90, 35, 70, 55, 80, 45, 90].map((h, i) => (
                   <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.03, duration: 1.2, ease: 'circOut' }}
                      className={`flex-1 rounded-2xl bg-white/5 hover:bg-white/10 transition-all relative overflow-hidden group/bar ${h >= 80 ? 'bg-primary/20 !bg-primary/40' : ''}`}
                   >
                      {h >= 80 && <div className="absolute inset-0 bg-primary opacity-30 shadow-[0_0_20px_rgba(217,119,87,1)]"></div>}
                   </motion.div>
                ))}
             </div>

             <div className="flex items-center justify-between text-[9px] font-black text-gray-700 uppercase tracking-[0.6em] pt-8 border-t border-white/5">
                <span>TX-ALPHA</span>
                <span>TX-BETA</span>
                <span>TX-GAMMA</span>
                <span>TX-DELTA</span>
                <span>TX-NEXUS</span>
             </div>
          </div>

          {/* Activity Sidebar Optimized */}
          <div className="xl:col-span-4 flex flex-col space-y-12">
             <div className="card-responsive !p-10 flex-1 flex flex-col">
                <h3 className="text-xl font-black uppercase tracking-tight mb-12 flex items-center justify-between">
                   <div className="flex items-center space-x-4">
                      <Clock size={24} className="text-primary" />
                      <span>Live Stream</span>
                   </div>
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                </h3>
                
                <div className="space-y-6 flex-1">
                   {loading ? (
                      <div className="flex flex-col space-y-6">
                         {[1,2,3,4].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl"></div>)}
                      </div>
                   ) : activities.length > 0 ? activities.map((item, idx) => (
                      <div key={idx} className="flex space-x-6 items-center group/it cursor-pointer p-4 rounded-2xl hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5" onClick={() => router.push('/merchant/orders')}>
                         <div className="w-12 h-12 rounded-2xl bg-[#0a0a0a] flex items-center justify-center text-gray-500 group-hover/it:text-primary group-hover/it:bg-primary/10 transition-all border border-white/10">
                            <Zap size={20} />
                         </div>
                         <div className="flex-1">
                            <p className="text-sm font-black uppercase tracking-wide text-white group-hover/it:text-primary transition-colors leading-none mb-2">
                               Order #{item.id.slice(-4)}
                            </p>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.25em]">{item.status}</p>
                         </div>
                         <div className="text-[10px] font-black text-gray-700 uppercase italic">
                            {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </div>
                      </div>
                   )) : (
                      <div className="text-center py-20 opacity-20">
                        <Activity size={40} className="mx-auto mb-6" />
                        <p className="text-[11px] font-black uppercase tracking-[0.5em]">Radio Silence</p>
                      </div>
                   )}
                </div>

                <button 
                  onClick={() => router.push('/merchant/orders')}
                  className="w-full mt-12 py-5 bg-[#0a0a0a] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all text-gray-500 shadow-xl"
                >
                   All Communications
                </button>
             </div>
          </div>
       </div>

       {/* Global Analytics Flow */}
       <div className="card-responsive !p-10 border-transparent relative overflow-hidden group">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 relative z-10">
             <div className="flex items-center space-x-5">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Activity size={24} />
                </div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Ecosystem Intelligence</h3>
             </div>
             <div className="hidden sm:flex items-center space-x-10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
                <div className="flex items-center space-x-3">
                   <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(217,119,87,1)]"></span>
                   <span>Sync Active</span>
                </div>
                <span className="opacity-50">Node v42.0.1</span>
             </div>
          </div>
          
          <div className="relative h-3 bg-white/5 rounded-full mb-10 overflow-hidden shadow-inner">
             <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '68%' }}
                transition={{ duration: 2, ease: 'circOut' }}
                className="absolute h-full bg-gradient-to-r from-primary via-primary to-primary shadow-[0_0_20px_rgba(217,119,87,0.4)] rounded-full"
             ></motion.div>
          </div>

          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.5em] text-gray-700">
             <span className="text-primary">Source</span>
             <span className="text-primary">Node</span>
             <span>Relay</span>
             <span>Nexus</span>
          </div>

          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
       </div>
    </div>
  );
}
