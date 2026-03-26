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
  Search,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '@/config/api';
import { apiClient } from '@/lib/apiClient';

export default function HistoryPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== 'driver') return router.push('/login');

    const fetchHistory = async () => {
      try {
        const data = await apiClient('/orders/driver');
        if (data && Array.isArray(data)) {
          setOrders(data.filter((o: any) => o.status === 'completed' || o.status === 'delivered'));
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
    <div className="space-y-12 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
         <div>
            <h1 className="text-4xl lg:text-5xl font-black text-[#111111] tracking-tighter mb-2">Mission Logs</h1>
            <p className="text-sm font-bold text-[#888888]">Complete archive of your delivered logistics and network operations.</p>
         </div>
         <div className="bg-white px-8 py-6 rounded-2xl border border-gray-100 flex items-center space-x-6 shadow-md">
            <div className="w-14 h-14 bg-[#fef3f2] rounded-xl flex items-center justify-center text-[#d97757] border border-[#fee2e2]">
               <TrendingUp size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-[#888888] mb-1">Lifetime Payout</p>
               <p className="text-3xl font-black tracking-tighter text-[#111111]">${totalEarnings.toFixed(2)}</p>
            </div>
         </div>
      </div>

      <div className="grid gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
             <div className="text-center py-20 flex flex-col items-center gap-6">
                <div className="w-12 h-12 border-4 border-[#d97757] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#888888]">Synchronizing Archive...</p>
             </div>
          ) : orders.length === 0 ? (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white p-16 lg:p-24 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center space-y-8 shadow-md"
             >
                <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center text-gray-200">
                   <HistoryIcon size={48} />
                </div>
                <div className="space-y-3">
                   <h3 className="text-3xl font-black text-[#111111] tracking-tighter uppercase">No Records Found</h3>
                   <p className="text-sm font-bold text-[#888888] max-w-sm mx-auto uppercase tracking-widest">Complete your first mission to generate operational logs.</p>
                </div>
             </motion.div>
          ) : (
            orders.map((order, idx) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-6 lg:p-8 rounded-2xl border border-gray-100 hover:border-[#d97757]/30 hover:shadow-lg transition-all group flex flex-col md:flex-row justify-between items-center gap-8 shadow-md relative overflow-hidden"
              >
                <div className="flex items-center gap-8 w-full md:w-auto">
                   <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 group-hover:bg-[#fef3f2] group-hover:text-[#d97757] transition-all border border-transparent group-hover:border-[#fee2e2]">
                      <Package size={28} />
                   </div>
                   <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-4">
                         <h4 className="text-xl lg:text-2xl font-black text-[#111111] tracking-tighter">Order #{order.id.substring(0,8).toUpperCase()}</h4>
                         <span className="bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-green-100 flex items-center gap-2">
                            <CheckCircle2 size={12} className="stroke-[3]" /> Highly Optimized
                         </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-8 text-[#888888]">
                         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <Calendar size={14} className="text-gray-300" />
                            {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <Clock size={14} className="text-gray-300" />
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </div>
                         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <MapPin size={14} className="text-gray-300" />
                            Fleet Section {order.id.substring(0,2).toUpperCase()}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-12 pt-6 md:pt-0 border-t md:border-t-0 border-gray-50">
                   <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#d97757] mb-1">Earning Payout</p>
                      <p className="text-3xl font-black tracking-tighter text-[#111111]">${Number(order.total_price).toFixed(2)}</p>
                   </div>
                   <button className="w-14 h-14 bg-[#f9f9f9] border border-gray-100 rounded-xl flex items-center justify-center text-gray-300 group-hover:text-[#111111] group-hover:bg-gray-100 transition-all active:scale-95 shadow-sm">
                      <ChevronRight size={20} />
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
