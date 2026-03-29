'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  Search, 
  ArrowLeft,
  PackageCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/apiClient';

export default function DriverHistory() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiClient(`/delivery/history?page=${page}&limit=8`);
      if (res) {
        setOrders(res.orders);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || user?.role !== 'driver') {
      router.push('/login');
      return;
    }
    fetchHistory();
  }, [token, user, router]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="container-responsive h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/driver/dashboard')}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors text-[#111111]"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-[#111111] uppercase tracking-tighter">Mission Logs</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-full border border-green-100">
             <PackageCheck size={14} />
             <span className="text-[10px] font-bold uppercase tracking-widest">{pagination.total || 0} Deliveries Completed</span>
          </div>
        </div>
      </header>

      <main className="container-responsive py-10 space-y-8">
        {/* Search & Filter Mockup */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
           <Search size={18} className="text-gray-300 ml-2" />
           <input 
             placeholder="Search past missions..." 
             className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-gray-300"
           />
           <button className="h-10 px-6 bg-[#f8fafc] text-[#111111] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors">Filter</button>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : orders.length > 0 ? (
            <AnimatePresence>
              {orders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className="w-14 h-14 bg-[#fef3f2] rounded-2xl flex items-center justify-center text-[#0f172a] shrink-0 group-hover:scale-110 transition-transform">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-[#111111] uppercase tracking-tight text-lg">{order.stores?.name}</h3>
                          <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-md text-[8px] font-bold uppercase tracking-widest">#{order.id.slice(0,8)}</span>
                        </div>
                        <p className="text-sm font-medium text-[#888888] flex items-center gap-2">
                          <Calendar size={14} /> {new Date(order.updated_at).toLocaleDateString()}
                          <span className="mx-1">·</span>
                          <Clock size={14} /> {new Date(order.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 pt-4 md:pt-0">
                      <div className="text-center md:text-right">
                        <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mb-1">Fee Earned</p>
                        <p className="text-xl font-bold text-green-600 tracking-tighter">{Number(order.delivery_fee || 45.00).toFixed(2)} ج.م</p>
                      </div>
                      <div className="text-center md:text-right">
                        <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mb-1">Status</p>
                        <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full text-[9px] font-bold uppercase tracking-widest">Success</span>
                      </div>
                      <button 
                        onClick={() => router.push(`/order/${order.id}`)}
                        className="w-12 h-12 bg-gray-50 text-gray-300 rounded-xl flex items-center justify-center hover:bg-[#fef3f2] hover:text-[#0f172a] transition-all border border-gray-100"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="py-20 flex flex-col items-center gap-4 text-center opacity-40">
              <PackageCheck size={48} />
              <p className="text-sm font-bold uppercase tracking-widest">No Missions Recorded Yet.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-10">
            <button 
              disabled={pagination.page === 1}
              onClick={() => fetchHistory(pagination.page - 1)}
              className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#111111] hover:bg-gray-50 transition-all disabled:opacity-30 shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#111111]">
              Page {pagination.page} / {pagination.totalPages}
            </span>
            <button 
              disabled={pagination.page === pagination.totalPages}
              onClick={() => fetchHistory(pagination.page + 1)}
              className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#111111] hover:bg-gray-50 transition-all disabled:opacity-30 shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
