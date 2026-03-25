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
    <div className="container-responsive py-6 sm:py-10 space-y-12 lg:space-y-16">
       {/* Dashboard Hero */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
             <h1 className="heading-responsive !text-3xl sm:!text-5xl">Store <span className="text-primary italic">Overview.</span></h1>
             <p className="text-responsive mt-3 max-w-2xl font-medium">Welcome back, {user?.name?.split(' ')[0]}. Here is what's happening in your shop today.</p>
          </div>
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 flex items-center space-x-4 shadow-xl">
             <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(217,119,87,1)]"></div>
             <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] whitespace-nowrap">Status: High Velocity</span>
          </div>
       </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
          {statCards.map((stat, idx) => (
             <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card-responsive !p-6 flex flex-col justify-between group hover:-translate-y-2 border-transparent hover:border-primary/20"
             >
                <div className="flex justify-between items-start mb-10">
                   <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center ${stat.color === 'primary' ? 'text-primary' : 'text-gray-400 group-hover:text-white transition-colors'}`}>
                      {stat.icon}
                   </div>
                   <div className="flex items-center space-x-1.5 text-[10px] font-black text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-full">
                      <ArrowUpRight size={14} />
                      <span>{stat.change}</span>
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{stat.label}</p>
                   <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tighter truncate">{stat.value}</h3>
                </div>
             </motion.div>
          ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Revenue Graph Placeholder */}
          <div className="lg:col-span-8 card-responsive !p-8 sm:!p-12 border-transparent hover:border-white/5">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                <div className="flex items-center space-x-5">
                   <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <BarChart3 size={24} />
                   </div>
                   <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Revenue Dynamics</h3>
                </div>
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 w-full sm:w-auto">
                   {['7D', '1M', '1Y'].map(t => (
                      <button key={t} className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${t === '1M' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                         {t}
                      </button>
                   ))}
                </div>
             </div>
             
             {/* Abstract Graph Pattern */}
             <div className="h-48 sm:h-72 flex items-end justify-between space-x-3 sm:space-x-4 mb-8">
                {[40, 60, 35, 80, 55, 90, 70, 45, 85, 30].map((h, i) => (
                   <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.05, duration: 1, ease: 'circOut' }}
                      className={`w-full rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors relative overflow-hidden ${i === 5 ? 'bg-primary/20 !bg-primary' : ''}`}
                   >
                     {i === 5 && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>}
                   </motion.div>
                ))}
             </div>

             <div className="flex items-center justify-between text-[10px] font-black text-gray-700 uppercase tracking-[0.4em] pt-6 border-t border-white/5">
                <span>Phase A</span>
                <span>Phase B</span>
                <span>Phase C</span>
                <span>Phase D</span>
                <span>Phase E</span>
             </div>
          </div>

          {/* Activity Sidebar */}
          <div className="lg:col-span-4 flex flex-col space-y-10">
             <div className="card-responsive !p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-black uppercase tracking-tight mb-10 flex items-center space-x-4">
                   <Clock size={22} className="text-primary" />
                   <span>Live Stream</span>
                </h3>
                
                <div className="space-y-8 flex-1">
                   {loading ? (
                      <div className="flex flex-col space-y-6">
                         {[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 animate-pulse rounded-2xl"></div>)}
                      </div>
                   ) : activities.length > 0 ? activities.map((item, idx) => (
                      <div key={idx} className="flex space-x-5 items-start group/it cursor-pointer" onClick={() => router.push('/merchant/orders')}>
                         <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-gray-600 group-hover/it:text-primary group-hover/it:bg-primary/10 transition-all border border-white/5">
                            <Zap size={18} />
                         </div>
                         <div className="flex-1">
                            <p className="text-xs font-black uppercase tracking-tight text-white group-hover/it:text-primary transition-colors leading-none mb-1.5">
                               Order #{item.id.slice(-4)}
                            </p>
                            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.1em]">{item.status} / {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                         </div>
                      </div>
                   )) : (
                      <div className="text-center py-12 opacity-30">
                        <Activity size={32} className="mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Recent Signals</p>
                      </div>
                   )}
                </div>

                <button 
                  onClick={() => router.push('/merchant/orders')}
                  className="w-full mt-10 py-5 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all text-gray-400"
                >
                   Vew All Logistics
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
