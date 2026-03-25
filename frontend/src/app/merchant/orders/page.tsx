'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCircle, Clock, Package, ChefHat, Activity, Store as StoreIcon, ChevronRight, MapPin, CreditCard, ChevronDown, MoreVertical, Check, X, Info, Zap, History as HistoryIcon, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';
import { API_URL } from '@/config/api';

export default function MerchantOrders() {
   const { token, user } = useAuthStore();
   const router = useRouter();
   const [orders, setOrders] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [viewMode, setViewMode] = useState<'live' | 'history'>('live');
   const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setActiveDropdown(null);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   useEffect(() => {
      if (!token || user?.role !== 'merchant') return router.push('/login');

      const fetchOrders = async () => {
         try {
            const res = await fetch(`${API_URL}/orders/merchant`, {
               headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setOrders(data);
         } catch (err) {
            console.error(err);
         } finally {
            setLoading(false);
         }
      };

      fetchOrders();

      const socket = io(API_URL, { withCredentials: true });
      socket.emit('join', { role: 'merchant', id: user.id });

      socket.on('new_order', (order) => {
         setOrders(prev => [order, ...prev]);
         toast('🔔 New Order!', {
            description: `Order #${order.id.slice(0, 8)} - $${order.total_price}`,
         });
      });

      socket.on('order_status_updated', (updatedOrder) => {
         setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
      });

      return () => { socket.disconnect(); };
   }, [token, user, router]);

   const updateStatus = async (orderId: string, status: string) => {
      try {
         const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status })
         });
         if (res.ok) {
            setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
            toast.success(`Success: order updated!`);
         }
      } catch (err: any) {
         toast.error(err.message);
      }
   };

   const getStatusBadge = (status: string) => {
      const styles: any = {
         pending: 'bg-primary/10 text-primary border-primary/20',
         accepted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
         preparing: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
         ready_for_pickup: 'bg-green-500/10 text-green-400 border-green-500/20',
         completed: 'bg-white/5 text-gray-500 border-white/5',
      };
      return (
         <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
            {status.replace(/_/g, ' ')}
         </span>
      );
   };

   const filteredOrders = orders.filter(o => 
      viewMode === 'live' ? o.status !== 'completed' && o.status !== 'delivered' : o.status === 'completed' || o.status === 'delivered'
   );

   return (
      <div className="container-responsive py-6 sm:py-10 space-y-12 sm:space-y-16">
         {/* Header */}
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div>
               <h1 className="heading-responsive !text-3xl sm:!text-5xl">Live <span className="text-primary italic">Logistics.</span></h1>
               <p className="text-responsive mt-3 max-w-2xl font-medium">Manage incoming signals and fulfill order protocols.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
               <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 shadow-xl w-full sm:w-auto">
                  <button 
                     onClick={() => setViewMode('live')}
                     className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'live' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
                  >
                     Active
                  </button>
                  <button 
                     onClick={() => setViewMode('history')}
                     className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'history' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                  >
                     Archive
                  </button>
               </div>

               <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 flex items-center space-x-4 shadow-xl whitespace-nowrap">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${viewMode === 'live' ? 'bg-primary shadow-[0_0_10px_rgba(217,119,87,1)]' : 'bg-gray-700'}`}></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{filteredOrders.length} Signals</span>
               </div>
            </div>
         </div>

         <div className="grid gap-8">
            <AnimatePresence mode='popLayout'>
               {loading ? (
                  <div className="py-32 flex flex-col items-center justify-center space-y-6 opacity-30">
                     <Activity size={48} className="animate-spin-slow text-primary" />
                     <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Stream</p>
                  </div>
               ) : filteredOrders.length === 0 ? (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="bg-white/5 p-12 sm:p-24 rounded-[3rem] border border-white/5 border-dashed flex flex-col items-center justify-center text-center group"
                  >
                     <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-10 text-gray-700 group-hover:scale-110 group-hover:text-primary transition-all duration-500 shadow-2xl">
                        {viewMode === 'live' ? <StoreIcon size={40} /> : <HistoryIcon size={40} />}
                     </div>
                     <h3 className="heading-responsive !text-2xl sm:!text-3xl mb-4 uppercase tracking-tighter">
                        {viewMode === 'live' ? 'No Active Streams' : 'Archive Empty'}
                     </h3>
                     <p className="text-gray-500 max-w-sm mx-auto text-sm sm:text-lg font-medium">
                        {viewMode === 'live' 
                           ? "Waiting for incoming order protocols from the network." 
                           : "Completed logistics will be archived here automatically."}
                     </p>
                  </motion.div>
               ) : (
                  filteredOrders.map((order, idx) => (
                     <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="card-responsive !p-6 sm:!p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 hover:-translate-y-1 hover:border-primary/20 transition-all group overflow-hidden"
                     >
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 w-full">
                           <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center text-gray-600 group-hover:bg-primary/5 group-hover:text-primary shrink-0 relative transition-all border border-white/5 shadow-inner">
                              <Package size={32} />
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black border-4 border-[#121212]">!</div>
                           </div>
                           
                           <div className="flex-1 w-full text-center sm:text-left">
                              <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 mb-6">
                                 <h4 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</h4>
                                 {getStatusBadge(order.status)}
                              </div>
                              
                              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-10 mb-8">
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest mb-1">Total Valuation</span>
                                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter">${Number(order.total_price).toFixed(2)}</span>
                                 </div>
                                 <div className="flex items-center space-x-3 text-gray-600 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                    <Clock size={16} />
                                    <span className="text-[11px] font-black uppercase mt-0.5 whitespace-nowrap">
                                       {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-white/5">
                                 {order.order_items?.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center gap-4 text-[11px] font-black uppercase tracking-tight text-gray-500 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                       <span className="text-primary">{item.quantity}x</span>
                                       <span className="truncate flex-1">{item.products?.name}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 pt-10 lg:pt-0 lg:pl-10 lg:border-l border-white/5 relative" ref={activeDropdown === order.id ? dropdownRef : null}>
                           {!['picked_up', 'delivered', 'completed'].includes(order.status) && (
                               <div className="relative w-full sm:w-auto">
                                  <button
                                     onClick={() => setActiveDropdown(activeDropdown === order.id ? null : order.id)}
                                     className={`w-full sm:w-auto h-16 sm:h-20 px-8 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-6 shadow-2xl ${
                                       order.status === 'pending' ? 'bg-primary text-white shadow-primary/20' :
                                       'bg-white/5 text-white hover:bg-white/10'
                                     }`}
                                  >
                                     <div className="flex items-center gap-3">
                                        {order.status === 'pending' && <Check size={18} className="stroke-[3]" />}
                                        {order.status === 'preparing' && <ChefHat size={18} />}
                                        {order.status === 'ready_for_pickup' && <CheckCircle size={18} />}
                                        <span>Update Status</span>
                                     </div>
                                     <ChevronDown size={18} className={`transition-transform duration-300 ${activeDropdown === order.id ? 'rotate-180' : ''}`} />
                                  </button>

                                  <AnimatePresence>
                                     {activeDropdown === order.id && (
                                        <motion.div
                                           initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                           animate={{ opacity: 1, y: 0, scale: 1 }}
                                           exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                           className="absolute left-0 sm:left-auto sm:right-0 bottom-full mb-6 w-full sm:w-72 bg-[#1a1a1a] border border-white/10 rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] p-4 z-50"
                                        >
                                           <div className="space-y-2">
                                              {[
                                                { label: 'Accept Protocol', value: 'accepted', icon: <Check size={18} />, color: 'text-blue-400' },
                                                { label: 'Start Prep', value: 'preparing', icon: <ChefHat size={18} />, color: 'text-orange-400' },
                                                { label: 'Ready for Handoff', value: 'ready_for_pickup', icon: <CheckCircle size={18} />, color: 'text-green-400' }
                                              ].map((opt) => (
                                                <button
                                                   key={opt.value}
                                                   onClick={() => { updateStatus(order.id, opt.value); setActiveDropdown(null); }}
                                                   className={`w-full flex items-center space-x-5 px-6 py-5 rounded-2xl hover:bg-white/5 transition-all font-black uppercase tracking-widest text-[10px] ${opt.color}`}
                                                >
                                                   {opt.icon}
                                                   <span>{opt.label}</span>
                                                </button>
                                              ))}
                                           </div>
                                        </motion.div>
                                     )}
                                  </AnimatePresence>
                               </div>
                           )}

                           {['picked_up', 'delivered', 'completed'].includes(order.status) && (
                              <div className="w-full sm:w-auto h-16 sm:h-20 px-8 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 flex items-center justify-center gap-4">
                                 <ShieldCheck size={18} />
                                 Logistics Finalized
                              </div>
                           )}

                           <button className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white/5 text-gray-700 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                              <MoreVertical size={20} />
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
