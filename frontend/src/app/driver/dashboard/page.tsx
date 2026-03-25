'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import {
   Navigation,
   CheckCircle,
   Package,
   MapPin,
   Store as StoreIcon,
   Activity,
   Truck,
   Timer,
   Wallet,
   Check,
   X,
   Clock,
   ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';

export default function DriverDashboard() {
   const { token, user } = useAuthStore();
   const router = useRouter();
   const [availableOrder, setAvailableOrder] = useState<any | null>(null);
   const [activeOrder, setActiveOrder] = useState<any | null>(null);
   const [loading, setLoading] = useState(true);
   const [countdown, setCountdown] = useState(30);
   const timerRef = useRef<NodeJS.Timeout | null>(null);

   const [stats, setStats] = useState({ earnings: 0, deliveries: 0, activeTime: '0h 0m' });

   useEffect(() => {
      if (!token || user?.role !== 'driver') return router.push('/login');

      const fetchStats = async () => {
         try {
            const res = await fetch(`${API_URL}/delivery/stats`, {
               headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
               const data = await res.json();
               setStats({ earnings: data.earnings, deliveries: data.deliveries, activeTime: 'Calculating...' });
            }
         } catch (err) {
            console.error('Error fetching driver stats:', err);
         }
      };
      fetchStats();

      const fetchActiveOrder = async () => {
         try {
            const res = await fetch(`${API_URL}/orders/driver`, {
               headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
               console.error("Failed to fetch driver orders:", res.status);
               return;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
               // Drivers have active orders where status is 'delivering'
               const current = data.find((o: any) => o.status === 'delivering');
               if (current) setActiveOrder(current);
            }
         } catch (err) {
            console.error(err);
         } finally {
            setLoading(false);
         }
      };
      fetchActiveOrder();

      const socket = io(API_URL, { withCredentials: true });
      socket.emit('join', { role: 'driver', id: user.id });

      socket.on('order_ready_for_pickup', (order) => {
         // Show high-fidelity popup for new order
         setAvailableOrder(order);
         setCountdown(30);
         if (timerRef.current) clearInterval(timerRef.current);
         timerRef.current = setInterval(() => {
            setCountdown(prev => {
               if (prev <= 1) {
                  clearInterval(timerRef.current!);
                  setAvailableOrder(null);
                  return 0;
               }
               return prev - 1;
            });
         }, 1000);
      });

      const locationInterval = setInterval(() => {
         if (activeOrder) {
            // Mock location updates for tracking
            const lat = 30.0444 + Math.random() * 0.002;
            const lng = 31.2357 + Math.random() * 0.002;
            fetch(`${API_URL}/delivery/location`, {
               method: 'PATCH',
               headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
               body: JSON.stringify({ lat, lng })
            }).catch(err => console.error(err));
         }
      }, 15000);

      return () => {
         socket.disconnect();
         clearInterval(locationInterval);
         if (timerRef.current) clearInterval(timerRef.current);
      };
   }, [token, user, router, activeOrder]);

   const acceptOrder = async (orderId: string) => {
      try {
         const res = await fetch(`${API_URL}/delivery/accept-order/${orderId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
         });
         if (res.ok) {
            const data = await res.json();
            setActiveOrder(data);
            setAvailableOrder(null);
            toast.success("Order Accepted! Head to restaurant.");
         }
      } catch (err: any) {
         toast.error(err.message);
      }
   };

   const completeOrder = async () => {
      if (!activeOrder) return;
      try {
         const res = await fetch(`${API_URL}/delivery/complete-order/${activeOrder.id}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` }
         });
         if (res.ok) {
            toast.success('Nice work! Delivery completed.');
            setActiveOrder(null);
         }
      } catch (err: any) {
         toast.error(err.message);
      }
   };

   return (
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
         {/* Greetings */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
            <div className="space-y-2">
               <h1 className="text-5xl font-black tracking-tighter">Hello, {user?.name?.toUpperCase() || 'TEST'}</h1>
               <p className="text-gray-500 font-bold text-base">Ready for your next milestone?</p>
            </div>
            <div className="bg-[#1a1a1a] px-6 py-3 rounded-xl border border-white/5 flex items-center space-x-4 shadow-xl">
               <div className="flex items-center space-x-3">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></span>
                  <span className="text-sm font-black uppercase tracking-widest text-green-500">Online</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Active Task Main Card */}
            <div className="lg:col-span-8 space-y-12">
               {activeOrder ? (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="bg-[#1a1a1a] rounded-[2rem] p-8 md:p-10 border border-white/5 relative overflow-hidden group shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]"
                  >
                     {/* Subtle Map Background */}
                     <div className="absolute inset-x-0 top-0 h-48 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-luminosity grayscale group-hover:scale-110 transition-transform duration-1000" />

                     <div className="relative z-10 space-y-12">
                        <div className="text-center">
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff8564] mb-2 block">Active Delivery</span>
                           <h2 className="text-4xl font-black tracking-tighter">Order #{activeOrder.id.substring(0, 8).toUpperCase()}</h2>
                        </div>

                        {/* Timeline */}
                        <div className="max-w-md mx-auto relative pl-16 space-y-16">
                           {/* Timeline Connector */}
                           <div className="absolute left-6 top-8 w-1 h-32 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                 initial={{ height: "0%" }}
                                 animate={{ height: "60%" }}
                                 className="w-full bg-[#ff8564]"
                              />
                           </div>

                           {/* Step 1: Pickup */}
                           <div className="relative group/step">
                              <div className="absolute -left-[3.25rem] w-12 h-12 bg-[#ff8564]/10 border border-[#ff8564]/30 rounded-2xl flex items-center justify-center text-[#ff8564] shadow-[0_0_20px_rgba(255,133,100,0.1)] group-hover/step:scale-110 transition-transform">
                                 <StoreIcon size={20} />
                              </div>
                              <div>
                                 <h4 className="text-lg font-black uppercase tracking-tight">Pickup: {activeOrder.stores?.name || 'Restaurant'}</h4>
                                 <p className="text-gray-500 font-bold text-sm mt-1">Wait for order to be handed to you</p>
                                 <div className="mt-4 inline-flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-xl text-[#ff8564] text-[10px] font-black uppercase tracking-widest border border-white/5">
                                    <Timer size={14} />
                                    <span>Ready in 4 mins</span>
                                 </div>
                              </div>
                           </div>

                           {/* Step 2: Dropoff */}
                           <div className="relative group/step">
                              <div className="absolute -left-[3.25rem] w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-400 group-hover/step:scale-110 transition-transform">
                                 <MapPin size={20} />
                              </div>
                              <div>
                                 <h4 className="text-lg font-black uppercase tracking-tight">Dropoff: Customer Location</h4>
                                 <p className="text-gray-500 font-bold text-sm mt-1">Navigate to customer address</p>
                                 <button className="mt-4 flex items-center space-x-3 text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
                                    <ExternalLink size={14} />
                                    <span>Open Maps</span>
                                 </button>
                              </div>
                           </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-4">
                           <div className="flex justify-between text-[9px] font-black uppercase tracking-widest border-white/5">
                              <span className="text-gray-500">Route Progress</span>
                              <span className="text-[#ff8564]">Estimated: 12 Mins</span>
                           </div>
                           <div className="h-3 bg-black/40 rounded-full overflow-hidden p-1 shadow-inner">
                              <motion.div
                                 initial={{ width: "0%" }}
                                 animate={{ width: "68%" }}
                                 className="h-full bg-gradient-to-r from-[#ff8564] to-[#ff5c30] rounded-full shadow-[0_0_15px_rgba(255,133,100,0.4)]"
                              />
                           </div>
                        </div>

                        <button
                           onClick={completeOrder}
                           className="w-full bg-[#ff8564] hover:bg-[#ff5c30] py-6 rounded-[1.5rem] text-black text-xl font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-[0_20px_40px_-10px_rgba(255,133,100,0.4)] group"
                        >
                           <CheckCircle size={28} className="group-hover:scale-110 transition-transform" />
                           Complete Delivery
                        </button>
                     </div>
                  </motion.div>
               ) : (
                  <div className="h-full min-h-[400px] flex items-center justify-center">
                     <div className="text-center space-y-6">
                        <div className="w-40 h-40 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-center mx-auto group">
                           <Truck size={56} className="text-gray-700 group-hover:text-[#ff8564] group-hover:scale-110 transition-all duration-500" />
                        </div>
                        <div className="space-y-3">
                           <h3 className="text-3xl font-black tracking-tighter">Looking for Active Tasks</h3>
                           <p className="text-gray-500 max-w-sm mx-auto font-medium">New delivery requests will appear here instantly. Keep your status Online.</p>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Sidebar Stats & Activity */}
            <div className="lg:col-span-4 space-y-12 h-fit">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 px-6">Fleet Telemetry</h3>

               <div className="grid grid-cols-1 gap-6">
                  <div className="bg-[#1a1a1a] p-8 rounded-[2rem] border border-white/5 group hover:border-[#ff8564]/30 transition-all shadow-xl">
                     <p className="text-[10px] font-black uppercase tracking-widest text-[#ff8564] mb-2">Today's Earnings</p>
                     <p className="text-4xl font-black tracking-tighter text-white group-hover:scale-105 transition-transform">${stats.earnings.toFixed(2)}</p>
                  </div>
                  <div className="bg-[#1a1a1a] p-8 rounded-[2rem] border border-white/5 group hover:border-[#ff8564]/30 transition-all shadow-xl">
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Total Deliveries</p>
                     <p className="text-4xl font-black tracking-tighter text-white group-hover:scale-105 transition-transform">{stats.deliveries}</p>
                  </div>
                  <div className="bg-[#1a1a1a] p-8 rounded-[2rem] border border-white/5 group hover:border-[#ff8564]/30 transition-all shadow-xl">
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Active Time</p>
                     <p className="text-4xl font-black tracking-tighter text-white group-hover:scale-105 transition-transform">{stats.activeTime}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* High-Fidelity Delivery Request Popup */}
         <AnimatePresence>
            {availableOrder && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 overflow-hidden">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="absolute inset-0 bg-black/60 backdrop-blur-2xl"
                     onClick={() => setAvailableOrder(null)}
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.8, y: 50 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.8, y: 50 }}
                     className="w-full max-w-lg bg-[#111111] rounded-[2.5rem] p-10 border border-white/10 shadow-[0_50px_150px_-30px_rgba(0,0,0,1)] relative z-10 text-center space-y-8 overflow-hidden"
                  >
                     {/* Decorative Glow */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#ff8564]/20 blur-[80px] -z-1" />

                     <div className="space-y-6">
                        <div className="w-20 h-20 bg-[#ff8564]/10 rounded-[2rem] flex items-center justify-center mx-auto text-[#ff8564] shadow-[0_0_20px_rgba(255,133,100,0.1)] border border-[#ff8564]/20 transition-all hover:scale-110">
                           <Truck size={36} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff8564] drop-shadow-md">New Delivery Request</span>
                     </div>

                     <div className="space-y-1">
                        <h2 className="text-6xl font-black tracking-tighter text-white">${Number(availableOrder.total_price).toFixed(2)}</h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">Estimated payout incl. tip</p>
                     </div>

                     <div className="bg-[#1a1a1a] p-6 rounded-[1.5rem] border border-white/5 space-y-3">
                        <div className="flex items-center justify-center space-x-3 text-white">
                           <StoreIcon size={18} className="text-[#ff8564]" />
                           <span className="text-xl font-black tracking-tight">{availableOrder.stores?.name || 'Restaurant'}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-3 text-gray-500 text-[11px] font-bold">
                           <MapPin size={14} />
                           <span>1.2 mi away • Downtown Core</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 pt-2">
                        <button
                           onClick={() => setAvailableOrder(null)}
                           className="py-5 bg-white/5 hover:bg-white/10 rounded-xl text-white font-black uppercase tracking-widest text-[9px] border border-white/10 transition-all active:scale-95"
                        >
                           Decline
                        </button>
                        <button
                           onClick={() => acceptOrder(availableOrder.id)}
                           className="py-5 bg-[#ff8564] hover:bg-[#ff5c30] rounded-xl text-black font-black uppercase tracking-widest text-[9px] shadow-[0_15px_30px_-5px_rgba(255,133,100,0.4)] transition-all active:scale-95"
                        >
                           Accept
                        </button>
                     </div>

                     {/* Expiration Timer Bar */}
                     <div className="space-y-4">
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden w-4/5 mx-auto">
                           <motion.div
                              initial={{ width: "100%" }}
                              animate={{ width: "0%" }}
                              transition={{ duration: 30, ease: "linear" }}
                              className="h-full bg-[#ff8564]"
                           />
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600">Request expires in {countdown} seconds</p>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
