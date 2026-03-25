'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  Clock, 
  Package, 
  ChefHat, 
  Activity, 
  Store as StoreIcon, 
  ChevronDown, 
  MoreVertical, 
  Check, 
  History as HistoryIcon, 
  ShieldCheck 
} from 'lucide-react';
import { useRef } from 'react';
import { API_URL } from '@/config/api';

import { useSocket } from '@/context/SocketContext';
import { apiClient } from '@/lib/apiClient';

export default function MerchantOrders() {
   const { token, user } = useAuthStore();
   const { socket, isConnected } = useSocket();
   const router = useRouter();
   const [orders, setOrders] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [viewMode, setViewMode] = useState<'live' | 'history'>('live');
   const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      // 1. Initial Auth Check
      if (!token || user?.role !== 'merchant') {
         router.push('/login');
         return;
      }

      // 2. Fetch Orders using Hardened Client
      const fetchOrders = async () => {
         try {
            const data = await apiClient('/orders/merchant');
            if (data) setOrders(data);
         } catch (err) {
            console.error('[MerchantOrders] Load failed:', err);
         } finally {
            setLoading(false);
         }
      };

      fetchOrders();
   }, [token, user?.role, router]);

   useEffect(() => {
      if (!socket || !isConnected) return;

      // Listen for socket events (Room joining is handled in SocketProvider on connect)
      socket.on('new_order', (order) => {
         setOrders(prev => {
            // Avoid duplicates
            if (prev.find(o => o.id === order.id)) return prev;
            return [order, ...prev];
         });
         toast('🔔 New Order Received', {
            description: `Order #${order.id.slice(0, 8)} - $${order.total_price}`,
         });
      });

      socket.on('order_status_updated', (updatedOrder) => {
         setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
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
            toast.success(`Protocol updated to ${status.replace(/_/g, ' ')}`);
         }
      } catch (err: any) {
         // Error is already toasted by apiClient
         console.error('[Status Update Error]', err);
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
               <h1 className="heading-responsive !text-3xl sm:!text-5xl uppercase">Live <span className="text-white italic">Logistics.</span></h1>
               <p className="text-responsive mt-3 max-w-2xl font-medium text-gray-400">Manage incoming signals and fulfill order protocols.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
               <div className="flex bg-[#1a1a1a] p-1.5 rounded-2xl border border-white/5 shadow-xl w-full sm:w-auto">
                  <button 
                     onClick={() => setViewMode('live')}
                     className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'live' ? 'bg-[#d97757] text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
                  >
                     Active
                  </button>
                  <button 
                     onClick={() => setViewMode('history')}
                     className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'history' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                  >
                     Archive
                  </button>
               </div>

               <div className="bg-[#1a1a1a] px-6 py-3 rounded-2xl border border-white/5 flex items-center space-x-4 shadow-xl whitespace-nowrap">
                  <div className={`w-1.5 h-1.5 rounded-full ${viewMode === 'live' ? 'bg-primary animate-pulse shadow-[0_0_10px_rgba(217,119,87,1)]' : 'bg-gray-700'}`}></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                     {filteredOrders.length} Signals
                  </span>
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
                        className="bg-[#151515] border border-white/5 !p-6 sm:!p-10 rounded-[2.5rem] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 hover:border-white/10 transition-all group overflow-hidden"
                     >
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 w-full">
                           <div className="w-24 h-24 bg-[#1a1a1a] rounded-[2rem] flex items-center justify-center text-gray-500 group-hover:text-primary transition-all border border-white/5 shadow-inner shrink-0 relative">
                              <Package size={32} />
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#d97757] text-white rounded-full flex items-center justify-center text-[10px] font-black border-4 border-[#151515]">1</div>
                           </div>
                           
                           <div className="flex-1 w-full text-center sm:text-left">
                              <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 mb-6">
                                 <h4 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">#{order.id.slice(0, 8).toUpperCase()}</h4>
                                 <div className="bg-[#1a1a1a] px-4 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                                     <span className="text-[9px] font-black text-[#d97757] uppercase tracking-widest">{order.status.replace(/_/g, ' ')}</span>
                                 </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-12 mb-8">
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Valuation</span>
                                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none">${Number(order.total_price).toFixed(2)}</span>
                                 </div>
                                 <div className="flex items-center space-x-3 text-gray-500 bg-[#1a1a1a] px-5 py-3 rounded-2xl border border-white/5 shadow-xl">
                                    <Clock size={16} className="text-gray-600" />
                                    <span className="text-[11px] font-black uppercase whitespace-nowrap">
                                       {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                 </div>
                              </div>

                              <div className="flex flex-wrap gap-4 pt-8 border-t border-white/5">
                                 {order.order_items?.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-tight text-gray-500 bg-[#1a1a1a] px-4 py-2.5 rounded-xl border border-white/5">
                                       <span className="text-[#d97757]">{item.quantity}x</span>
                                       <span className="max-w-[150px] truncate">{item.products?.name}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4 pt-10 lg:pt-0 lg:pl-10 lg:border-l border-white/5 relative" ref={activeDropdown === order.id ? dropdownRef : null}>
                           {!['picked_up', 'delivered', 'completed'].includes(order.status) && (
                               <div className="flex flex-col gap-4 w-full sm:w-auto">
                                  {/* Current Status Indicator - Dynamic Mapping */}
                                  {(() => {
                                     const config: any = {
                                        pending: { label: 'Signal Received', icon: <Activity size={18} />, color: 'text-primary' },
                                        accepted: { label: 'Protocol Accepted', icon: <Check size={18} />, color: 'text-blue-400' },
                                        preparing: { label: 'In Preparation', icon: <ChefHat size={18} />, color: 'text-orange-400' },
                                        ready_for_pickup: { label: 'Ready for Handoff', icon: <CheckCircle size={18} />, color: 'text-green-400' },
                                     };
                                     const current = config[order.status] || config.pending;
                                     return (
                                        <div className={`bg-[#1a1a1a] border border-white/5 rounded-[1.5rem] p-5 flex items-center justify-center gap-4 ${current.color}`}>
                                           {current.icon}
                                           <span className="text-[10px] font-black uppercase tracking-[0.2em]">{current.label}</span>
                                        </div>
                                     );
                                  })()}

                                  <div className="relative w-full sm:w-auto">
                                     <button
                                        onClick={() => setActiveDropdown(activeDropdown === order.id ? null : order.id)}
                                        className="w-full sm:w-auto h-16 sm:h-20 px-8 rounded-[1.5rem] bg-[#d97757] text-white font-black uppercase tracking-[0.15em] text-[10px] transition-all flex items-center justify-between gap-6 shadow-[0_20px_40px_-10px_rgba(217,119,87,0.3)] group/btn"
                                     >
                                        <div className="flex items-center gap-4">
                                           <Check size={18} className="stroke-[3]" />
                                           <span>Update Status</span>
                                        </div>
                                        <div className="flex flex-col -space-y-1 opacity-60">
                                            <ChevronDown size={14} className="rotate-180" />
                                            <ChevronDown size={14} />
                                        </div>
                                     </button>

                                     <AnimatePresence>
                                        {activeDropdown === order.id && (
                                           <motion.div
                                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                              animate={{ opacity: 1, y: 0, scale: 1 }}
                                              exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                              className="absolute left-0 sm:left-auto sm:right-0 bottom-full mb-6 w-full sm:w-72 bg-[#1a1a1a] border border-white/10 rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] p-4 z-50 overflow-hidden"
                                           >
                                              <div className="space-y-2 relative z-10">
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
                                              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                                           </motion.div>
                                        )}
                                     </AnimatePresence>
                                  </div>
                               </div>
                           )}

                           {['picked_up', 'delivered', 'completed'].includes(order.status) && (
                               <div className="w-full sm:w-auto h-16 sm:h-20 px-8 bg-[#1a1a1a] border border-white/5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 flex items-center justify-center gap-4">
                                  <ShieldCheck size={18} />
                                  Logistics Finalized
                               </div>
                           )}

                           <button className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-[#1a1a1a] text-gray-700 hover:text-white hover:bg-[#222] rounded-[1.5rem] transition-all border border-white/5 shrink-0">
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
