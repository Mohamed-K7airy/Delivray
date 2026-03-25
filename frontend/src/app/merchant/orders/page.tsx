'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCircle, Clock, Package, ChefHat, Activity, Store as StoreIcon, ChevronRight, MapPin, CreditCard, ChevronDown, MoreVertical, Check, X, Info, Zap, History as HistoryIcon } from 'lucide-react';
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
         toast('🔔 New Order Received!', {
            description: `Order #${order.id.substring(0, 8)} for $${order.total_price}`,
            action: { label: 'View', onClick: () => { } }
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
            toast.success(`Order #${orderId.substring(0, 8)}: status updated!`);
         }
      } catch (err: any) {
         toast.error(err.message);
      }
   };

   const getStatusBadge = (status: string) => {
      const styles: any = {
         pending: 'bg-[#4a342e]/30 text-[#d97757] border-[#d97757]/20',
         accepted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
         preparing: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
         ready_for_pickup: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
         completed: 'bg-green-500/10 text-green-400 border-green-500/20',
      };
      return (
         <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${styles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
            {status.replace(/_/g, ' ')}
         </span>
      );
   };

   return (
      <div className="max-w-7xl mx-auto space-y-12">
         {/* Header */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <h1 className="text-5xl font-black uppercase tracking-tighter">Live Orders</h1>
               <p className="text-gray-500 font-medium mt-2">Manage incoming logistics and order fulfillment.</p>
            </div>
         <div className="flex bg-[#1a1a1a] p-1.5 rounded-2xl border border-white/5 shadow-xl">
               <button 
                  onClick={() => setViewMode('live')}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'live' ? 'bg-primary text-black shadow-[0_10px_20px_-5px_rgba(217,119,87,0.4)]' : 'text-gray-500 hover:text-white'}`}
               >
                  Live Orders
               </button>
               <button 
                  onClick={() => setViewMode('history')}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'history' ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500 hover:text-white'}`}
               >
                  Order History
               </button>
            </div>

         <div className="bg-[#262624] px-5 py-2.5 rounded-xl border border-white/5 flex items-center space-x-4 shadow-xl">
               <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${viewMode === 'live' ? 'bg-primary shadow-[0_0_10px_rgba(217,119,87,1)]' : 'bg-gray-600'}`}></span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${viewMode === 'live' ? 'text-primary' : 'text-gray-600'}`}>
                     {viewMode === 'live' ? 'Live Connection' : 'Archive Mode'}
                  </span>
               </div>
               <div className="h-4 w-px bg-white/10"></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-white">
                  {viewMode === 'live' ? orders.filter(o => o.status !== 'completed').length : orders.filter(o => o.status === 'completed').length} {viewMode === 'live' ? 'Active' : 'Closed'}
               </span>
            </div>
         </div>

         <div className="grid gap-8">
            <AnimatePresence mode='popLayout'>
               {loading ? (
                  <div className="text-center py-20 text-gray-500 font-black uppercase tracking-[0.2em] text-xs animate-pulse">Synchronizing Orders...</div>
               ) : (viewMode === 'live' ? orders.filter(o => o.status !== 'completed') : orders.filter(o => o.status === 'completed')).length === 0 ? (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="bg-[#262624] p-16 rounded-[2rem] border border-white/5 border-dashed flex flex-col items-center justify-center text-center group"
                  >
                     <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-gray-700 group-hover:scale-110 group-hover:text-primary transition-all duration-500">
                        {viewMode === 'live' ? <StoreIcon size={40} /> : <HistoryIcon size={40} />}
                     </div>
                     <h3 className="text-xl font-black uppercase tracking-tighter mb-2">
                        {viewMode === 'live' ? 'No Active Streams' : 'History Archive Empty'}
                     </h3>
                     <p className="text-gray-500 max-w-xs mx-auto text-sm">
                        {viewMode === 'live' 
                           ? "Orders will appear here instantly as soon as customers place them." 
                           : "Completed orders will be archived here for your records."}
                     </p>
                  </motion.div>
               ) : (
                  (viewMode === 'live' ? orders.filter(o => o.status !== 'completed') : orders.filter(o => o.status === 'completed')).map((order, idx) => (
                     <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-[#262624] p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-2xl hover:border-primary/20 transition-all group flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8"
                     >
                        <div className="flex items-start gap-6">
                           <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-gray-600 transition-all group-hover:bg-primary/5 group-hover:text-primary shrink-0 relative">
                              <Package size={28} />
                              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary text-black rounded-full flex items-center justify-center text-[9px] font-black">!</div>
                           </div>
                           <div className="space-y-4">
                              <div className="flex flex-wrap items-center gap-4">
                                 <h4 className="text-3xl font-black uppercase tracking-tighter">Order #{order.id.substring(0, 8).toUpperCase()}</h4>
                                 {getStatusBadge(order.status)}
                              </div>
                              <div className="flex flex-wrap items-center gap-8">
                                 <div className="flex items-center space-x-3 text-white">
                                    <span className="text-4xl font-black tracking-tighter">${Number(order.total_price).toFixed(2)}</span>
                                 </div>
                                 <div className="flex items-center space-x-2 text-gray-600">
                                    <Clock size={14} />
                                    <span className="text-[11px] font-medium leading-none mt-0.5 opacity-80">
                                       {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                 </div>
                              </div>

                              {/* Order Items Detail */}
                              <div className="pt-4 space-y-2 border-t border-white/5">
                                 {order.order_items?.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-gray-500">
                                       <div className="flex items-center gap-2">
                                          <span className="text-primary">{item.quantity}x</span>
                                          <span>{item.products?.name}</span>
                                       </div>
                                       <span className="opacity-40">${Number(item.price_at_time * item.quantity).toFixed(2)}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        <div className="w-full lg:w-auto flex items-center gap-4 pt-6 lg:pt-0 border-t lg:border-t-0 border-white/5 relative" ref={activeDropdown === order.id ? dropdownRef : null}>
                           {/* Only show status controls for non-picked-up and non-completed orders */}
                           {!['picked_up', 'delivered', 'completed'].includes(order.status) && (
                              <>
                                 <div className="relative flex-1 lg:flex-none">
                                    <button
                                       onClick={() => setActiveDropdown(activeDropdown === order.id ? null : order.id)}
                                       className={`w-full lg:w-auto px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center justify-between gap-6 ${order.status === 'pending' ? 'bg-primary text-black' :
                                             order.status === 'accepted' ? 'bg-blue-500 text-white shadow-[0_15px_30px_-5px_rgba(59,130,246,0.3)]' :
                                                order.status === 'preparing' ? 'bg-orange-500 text-black shadow-[0_15px_30px_-5px_rgba(249,115,22,0.3)]' :
                                                   'bg-[#262624] text-gray-400'
                                          }`}
                                    >
                                       <div className="flex items-center gap-3">
                                          {order.status === 'pending' && <Check size={16} className="stroke-[4]" />}
                                          {order.status === 'accepted' && <Activity size={16} />}
                                          {order.status === 'preparing' && <ChefHat size={16} />}
                                          {order.status === 'ready_for_pickup' && <CheckCircle size={16} />}
                                          <span>
                                             {order.status === 'pending' ? 'Accept Order' :
                                                order.status === 'accepted' ? 'Order Accepted' :
                                                   order.status === 'preparing' ? 'Preparing...' :
                                                      'Ready for Pickup'}
                                          </span>
                                       </div>
                                       <ChevronDown size={16} className={`transition-transform duration-300 ${activeDropdown === order.id ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                       {activeDropdown === order.id && (
                                          <motion.div
                                             initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                             animate={{ opacity: 1, y: 0, scale: 1 }}
                                             exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                             className="absolute right-0 bottom-full mb-4 w-64 bg-[#1a1a1a] border border-white/5 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] p-3 z-50 overflow-hidden"
                                          >
                                             <div className="p-3 mb-2 border-b border-white/5">
                                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600">Update Order Status</p>
                                             </div>
                                             <div className="space-y-1">
                                                <button
                                                   onClick={() => { updateStatus(order.id, 'accepted'); setActiveDropdown(null); }}
                                                   className="w-full flex items-center space-x-4 px-6 py-4 rounded-xl hover:bg-primary/10 transition-all text-primary font-black uppercase tracking-widest text-[10px] group/item"
                                                >
                                                   <Check size={16} className="group-hover/item:scale-110 transition-transform" />
                                                   <span>Accept</span>
                                                </button>
                                                <button
                                                   onClick={() => { updateStatus(order.id, 'preparing'); setActiveDropdown(null); }}
                                                   className="w-full flex items-center space-x-4 px-6 py-4 rounded-xl hover:bg-orange-500/10 transition-all text-orange-400 font-black uppercase tracking-widest text-[10px] group/item"
                                                >
                                                   <ChefHat size={16} className="group-hover/item:scale-110 transition-transform" />
                                                   <span>Prepare</span>
                                                </button>
                                                <button
                                                   onClick={() => { updateStatus(order.id, 'ready_for_pickup'); setActiveDropdown(null); }}
                                                   className="w-full flex items-center space-x-4 px-6 py-4 rounded-xl hover:bg-green-500/10 transition-all text-green-400 font-black uppercase tracking-widest text-[10px] group/item"
                                                >
                                                   <CheckCircle size={16} className="group-hover/item:scale-110 transition-transform" />
                                                   <span>Ready to Pickup</span>
                                                </button>
                                             </div>
                                          </motion.div>
                                       )}
                                    </AnimatePresence>
                                 </div>

                                 {order.status === 'ready_for_pickup' && (
                                    <div className="hidden lg:flex px-6 py-3 bg-[#1a1a1a] border border-white/5 text-gray-600 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] items-center gap-4">
                                       <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-pulse"></div>
                                       Searching for Driver...
                                    </div>
                                 )}
                              </>
                           )}

                           {/* Status message for hand-off orders */}
                           {['picked_up', 'delivered', 'completed'].includes(order.status) && (
                              <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-3">
                                 <Package size={14} className="text-gray-600" />
                                 <span>Hand-off Complete</span>
                              </div>
                           )}

                           <button className="w-10 h-10 flex items-center justify-center bg-white/5 text-gray-600 hover:text-white hover:bg-white/10 rounded-xl transition-all active:scale-95">
                              <MoreVertical size={18} />
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
