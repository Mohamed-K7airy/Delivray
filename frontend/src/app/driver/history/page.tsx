'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { 
  History as HistoryIcon, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  DollarSign,
  ChevronRight,
  TrendingUp,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '@/config/api';

export default function HistoryPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== 'driver') return router.push('/login');

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/driver`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Map historical data: only show 'completed' orders in the main list
          if (Array.isArray(data)) {
            setOrders(data.filter((o: any) => o.status === 'completed' || o.status === 'delivered'));
          }
        }
      } catch (err) {
        console.error('Error fetching driver history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token, user, router]);

  const totalEarnings = orders.reduce((acc, o) => acc + Number(o.total_price || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
         <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter uppercase italic">Mission Logs</h1>
            <p className="text-gray-500 font-bold text-base uppercase tracking-widest opacity-60">Archive of completed deliveries</p>
         </div>
         <div className="bg-[#1a1a1a] px-8 py-5 rounded-[2rem] border border-white/5 flex items-center space-x-6 shadow-2xl">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
               <TrendingUp size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Lifetime Payout</p>
               <p className="text-3xl font-black tracking-tighter text-white">${totalEarnings.toFixed(2)}</p>
            </div>
         </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
             <div className="text-center py-20 text-gray-500 font-black uppercase tracking-[0.2em] text-xs animate-pulse">Accessing Archive Data...</div>
          ) : orders.length === 0 ? (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-[#1a1a1a] p-20 rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-6"
             >
                <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center text-gray-700">
                   <HistoryIcon size={48} />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black tracking-tight uppercase">Empty Logs</h3>
                   <p className="text-gray-500 max-w-xs font-medium">Complete your first delivery to see it here in the mission logs.</p>
                </div>
             </motion.div>
          ) : (
            orders.map((order, idx) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-white/5 hover:border-primary/20 transition-all group flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/30 group-hover:bg-primary transition-all rounded-full" />
                
                <div className="flex items-center gap-8 w-full md:w-auto">
                   <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-gray-600 transition-all group-hover:bg-primary/5 group-hover:text-primary">
                      <Package size={28} />
                   </div>
                   <div className="space-y-2">
                      <div className="flex items-center gap-4">
                         <h4 className="text-2xl font-black tracking-tighter">Order #{order.id.substring(0,8).toUpperCase()}</h4>
                         <span className="bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-green-500/20 flex items-center gap-2">
                            <CheckCircle2 size={12} /> Complete
                         </span>
                      </div>
                      <div className="flex items-center gap-6 text-gray-500">
                         <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                            <Clock size={14} className="opacity-50" />
                            {new Date(order.created_at).toLocaleDateString()}
                         </div>
                         <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                            <MapPin size={14} className="opacity-50" />
                            Sector {order.id.substring(0,2).toUpperCase()}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-12">
                   <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#ff8564] mb-1">Earning Payout</p>
                      <p className="text-3xl font-black tracking-tighter text-white">${Number(order.total_price).toFixed(2)}</p>
                   </div>
                   <button className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-600 group-hover:text-white group-hover:bg-primary/20 transition-all active:scale-95 shadow-lg">
                      <ChevronRight size={24} />
                   </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
