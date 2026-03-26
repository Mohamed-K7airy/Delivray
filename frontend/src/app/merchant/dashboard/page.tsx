'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Bell, 
  ChevronRight, 
  Clock, 
  DollarSign, 
  Percent, 
  Tag, 
  BarChart3, 
  Upload, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  PackageCheck,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import { useSocket } from '@/context/SocketContext';
import { apiClient } from '@/lib/apiClient';

export default function MerchantDashboard() {
  const { token, user } = useAuthStore();
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalOrdersToday: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState({ title: '', price: '', category: 'Main Courses' });

  useEffect(() => {
    if (!token || user?.role !== 'merchant') return router.push('/login');

    const fetchData = async () => {
      try {
        const [ordersData, statsData] = await Promise.all([
          apiClient('/orders/merchant'),
          apiClient('/orders/merchant/stats')
        ]);
        if (ordersData) setOrders(ordersData.slice(0, 3));
        if (statsData) setStats(statsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, user, router]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('new_order', (order) => {
      setOrders(prev => [order, ...prev.slice(0, 2)]);
      toast.success(`New Order Notification! 🍔`);
    });

    socket.on('order_status_updated', (updated) => {
      setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
    });

    return () => {
      socket.off('new_order');
      socket.off('order_status_updated');
    };
  }, [socket, isConnected]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const updated = await apiClient(`/orders/${orderId}/status`, {
        method: 'PATCH',
        data: { status }
      });
      if (updated) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        toast.success(`Order state updated to ${status.toUpperCase()}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient('/products', {
        method: 'POST',
        data: {
          name: productForm.title,
          price: parseFloat(productForm.price),
          category: productForm.category,
          store_id: user?.store_id // Assuming store_id is set in user object
        }
      });
      if (res) {
        toast.success('Product deployed to inventory! 🚀');
        setProductForm({ title: '', price: '', category: 'Main Courses' });
      }
    } catch (err) {
       toast.error("Failed to add product.");
    }
  };

  const getStatusDisplay = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': return { label: 'PENDING', color: 'bg-gray-100 text-[#888888] border-gray-200' };
      case 'accepted': return { label: 'ACCEPTED', color: 'bg-green-50 text-green-600 border-green-100' };
      case 'preparing': return { label: 'PREPARING', color: 'bg-[#fef3f2] text-[#d97757] border-[#fee2e2]' };
      case 'ready_for_pickup': return { label: 'READY', color: 'bg-blue-50 text-blue-600 border-blue-100' };
      case 'delivering': return { label: 'SHIPPING', color: 'bg-purple-50 text-purple-600 border-purple-100' };
      case 'completed': return { label: 'COMPLETED', color: 'bg-green-50 text-green-700 border-green-200' };
      default: return { label: status.toUpperCase(), color: 'bg-gray-100 text-gray-500' };
    }
  };

  return (
    <div className="space-y-10 lg:space-y-12 pb-24">
      
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <h1 className="text-4xl lg:text-5xl font-black text-[#111111] tracking-tighter mb-2">Merchant Portal</h1>
            <div className="flex items-center gap-4">
               <span className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Live Sync: Active
               </span>
               <span className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Real-time gateway connected</span>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <button className="h-14 px-8 bg-white text-[#111111] border border-gray-100 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all flex items-center gap-3 shadow-sm">
               <Upload size={16} />
               Export Reports
            </button>
            <button 
               onClick={() => router.push('/merchant/inventory')}
               className="h-14 px-8 bg-[#d97757] text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#c2654a] transition-all flex items-center gap-3 shadow-md"
            >
               <Plus size={18} />
               New Listing
            </button>
         </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-14 items-start">
         
         {/* Center Column: Live Orders Queue */}
         <div className="xl:col-span-8 space-y-10">
            <div className="bg-white rounded-2xl p-8 lg:p-10 border border-gray-100 shadow-md">
               <div className="flex items-center justify-between mb-10">
                  <div>
                     <h2 className="text-2xl font-black text-[#111111] tracking-tighter mb-1">Live Orders</h2>
                     <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest">Priority kitchen queue</p>
                  </div>
                  <button 
                    onClick={() => router.push('/merchant/orders')}
                    className="text-[10px] font-black text-[#d97757] uppercase tracking-widest hover:underline"
                  >
                    View All Queue
                  </button>
               </div>

               <div className="space-y-6">
                  {loading ? (
                    <div className="py-20 text-center text-gray-300 font-black uppercase tracking-widest text-xs animate-pulse">Syncing logistics stream...</div>
                  ) : orders.length > 0 ? orders.map((order, idx) => {
                    const statusInfo = getStatusDisplay(order.status);
                    const firstItem = order.order_items?.[0]?.products?.name || 'Bulk Order';
                    return (
                    <motion.div 
                       key={order.id}
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: idx * 0.1 }}
                      className="group bg-[#f9f9f9] hover:bg-white hover:shadow-lg rounded-2xl p-6 lg:p-8 flex items-center justify-between border border-transparent hover:border-gray-100 transition-all"
                    >
                       <div className="flex items-center gap-6 lg:gap-10">
                          <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-sm border border-white transition-transform group-hover:scale-110 duration-500 bg-white`}>
                             {idx === 0 ? '🍔' : idx === 1 ? '🍕' : '🥐'}
                          </div>
                          <div>
                             <div className="flex flex-wrap items-center gap-4 mb-2">
                                <span className="text-lg font-black text-[#111111] tracking-tight">{order.id.slice(0, 8).toUpperCase()} — {firstItem}</span>
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusInfo.color}`}>
                                   {statusInfo.label}
                                </span>
                             </div>
                             <p className="text-xs font-bold text-[#888888]">
                                Ordered by <span className="text-[#111111]">{order.customer?.name || 'Operational Node'}</span> • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </p>
                          </div>
                       </div>
                       <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-8">
                           <div className="text-right hidden sm:block">
                              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-[#888888]">Action Required</p>
                              <p className="text-xs font-bold text-[#555555] italic">#{order.id.slice(0,4)} Registry</p>
                           </div>
                           
                           <div className="flex items-center gap-3">
                             {order.status === 'pending' && (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'accepted'); }}
                                 className="h-10 px-6 bg-[#111111] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#333] transition-all"
                               >
                                 Accept
                               </button>
                             )}
                             {order.status === 'accepted' && (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'preparing'); }}
                                 className="h-10 px-6 bg-[#d97757] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#c2654a] transition-all"
                               >
                                 Prepare
                               </button>
                             )}
                             {order.status === 'preparing' && (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'ready_for_pickup'); }}
                                 className="h-10 px-6 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md"
                               >
                                 Mark Ready
                               </button>
                             )}
                             <button 
                               onClick={() => router.push('/merchant/orders')}
                               className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-gray-300 group-hover:text-[#d97757] group-hover:bg-[#d97757] group-hover:text-white border border-gray-100 transition-all active:scale-90"
                             >
                                <ChevronRight size={20} />
                             </button>
                           </div>
                        </div>
                    </motion.div>
                  )}) : (
                    <div className="py-20 flex flex-col items-center gap-6 grayscale opacity-20">
                      <ShoppingBag size={48} />
                      <p className="text-[10px] font-black uppercase tracking-[0.5em]">No active signals</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
               {[
                 { label: 'TOTAL SALES (TODAY)', value: `$${stats.todayRevenue.toFixed(2)}`, sub: '+Real-time calculation', icon: <DollarSign size={20} />, color: '#d97757' },
                 { label: 'COMPLETED ORDERS', value: stats.completedOrders, sub: 'Total History', icon: <TrendingUp size={20} />, color: '#111111' },
                 { label: 'PENDING TASKS', value: stats.pendingOrders, sub: 'ACTION NEEDED', icon: <Tag size={20} />, color: '#111111' },
               ].map((stat, idx) => (
                 <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="bg-white rounded-2xl p-8 lg:p-10 border border-gray-100 shadow-md text-center group hover:shadow-lg transition-all"
                  >
                    <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest mb-6">{stat.label}</p>
                    <h4 className="text-4xl font-black text-[#111111] tracking-tighter mb-4 leading-none">{stat.value}</h4>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${idx === 0 ? 'text-green-600' : idx === 2 ? 'text-[#d97757] cursor-pointer hover:underline' : 'text-[#888888]'}`}>
                       {idx === 0 && <TrendingUp size={12} className="inline mr-2" />}
                       {stat.sub}
                    </p>
                 </motion.div>
               ))}
            </div>

            {/* Pro Tips Banner */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-[#111111] rounded-2xl p-10 lg:p-14 relative overflow-hidden group border border-gray-800"
            >
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                  <div className="max-w-md">
                     <span className="bg-[#d97757] text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 inline-block">SYSTEM INSIGHT</span>
                     <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tighter leading-tight mb-6">Real-time driver assignment is active.</h3>
                     <p className="text-gray-400 text-sm font-bold leading-relaxed mb-10">Once you mark an order as "READY", our neural dispatch protocol instantly notifies the nearest elite courier.</p>
                     <button 
                       onClick={() => router.push('/merchant/live_map')}
                       className="bg-white text-[#111111] px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all flex items-center gap-3"
                     >
                        View Fleet Map
                     </button>
                  </div>
                  <div className="relative w-full md:w-auto flex items-center justify-center">
                     <div className="w-64 h-64 bg-white/5 rounded-full blur-3xl absolute animate-pulse" />
                     <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=400&auto=format&fit=crop" className="w-[400px] h-[250px] object-cover rounded-3xl opacity-50 transition-opacity group-hover:opacity-70 duration-700 shadow-2xl" alt="Neural Dispatch" />
                  </div>
               </div>
            </motion.div>
         </div>

         {/* Right Sidebar: Quick Add Product */}
         <aside className="xl:col-span-4 lg:sticky lg:top-8 space-y-10">
            <div className="bg-white rounded-2xl p-8 lg:p-10 border border-gray-100 shadow-md">
               <h3 className="text-2xl font-black text-[#111111] tracking-tighter mb-10">Quick Add Product</h3>
               
               <form onSubmit={handleSaveProduct} className="space-y-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-[#888888] uppercase tracking-widest">PRODUCT TITLE</label>
                     <input 
                        required
                        placeholder="e.g. Summer Harvest Salad" 
                        value={productForm.title}
                        onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                        className="w-full h-16 bg-[#f9f9f9] px-6 rounded-xl border border-gray-100 focus:border-[#d97757] outline-none font-bold text-[#111111] transition-all"
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-[#888888] uppercase tracking-widest">PRICE (USD)</label>
                     <div className="relative">
                        <DollarSign size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input 
                           required
                           type="number"
                           step="0.01"
                           placeholder="0.00" 
                           value={productForm.price}
                           onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                           className="w-full h-16 bg-[#f9f9f9] pl-14 pr-6 rounded-xl border border-gray-100 focus:border-[#d97757] outline-none font-bold text-[#111111] transition-all"
                        />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-[#888888] uppercase tracking-widest">CATEGORY</label>
                     <select 
                        value={productForm.category}
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        className="w-full h-16 bg-[#f9f9f9] px-6 rounded-xl border border-gray-100 focus:border-[#d97757] outline-none font-bold text-[#111111] transition-all appearance-none cursor-pointer"
                     >
                        <option>Main Courses</option>
                        <option>Appetizers</option>
                        <option>Desserts</option>
                        <option>Beverages</option>
                     </select>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-[#888888] uppercase tracking-widest">PRODUCT PHOTO</label>
                     <div className="w-full h-40 border-2 border-dashed border-gray-100 rounded-2xl bg-[#f9f9f9] flex flex-col items-center justify-center gap-3 cursor-pointer group hover:border-[#d97757]/30 hover:bg-[#d97757]/5 transition-all">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-300 group-hover:text-[#d97757] transition-all shadow-sm">
                           <Upload size={20} />
                        </div>
                        <p className="text-[10px] font-bold text-[#888888]">Drag & drop or <span className="text-[#d97757]">browse</span></p>
                     </div>
                  </div>

                  <button 
                     type="submit"
                     className="w-full h-20 bg-[#d97757] text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#c2654a] active:scale-95 transition-all shadow-md"
                  >
                     SAVE PRODUCT
                  </button>
               </form>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md flex items-center gap-6">
               <div className="w-16 h-16 bg-[#f9f9f9] rounded-xl flex items-center justify-center text-[#111111] shrink-0">
                  <BarChart3 size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest mb-1">DATA INSIGHTS</p>
                  <p className="text-xs font-black text-[#111111] leading-tight">Weekly report is ready for download.</p>
                  <button className="text-[9px] font-black text-[#d97757] uppercase tracking-widest mt-1 hover:underline">Download PDF</button>
               </div>
            </div>
         </aside>

      </div>
      
      {/* Footer Branding */}
      <footer className="pt-20 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40">
         <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest">© 2024 Delivray Merchant Services</p>
         <div className="flex items-center gap-8">
            <span className="text-[9px] font-black text-[#888888] uppercase tracking-widest cursor-pointer hover:text-[#111111]">Privacy</span>
            <span className="text-[9px] font-black text-[#888888] uppercase tracking-widest cursor-pointer hover:text-[#111111]">Merchant Agreement</span>
            <span className="text-[9px] font-black text-[#888888] uppercase tracking-widest cursor-pointer hover:text-[#111111]">Support</span>
         </div>
      </footer>
    </div>
  );
}
