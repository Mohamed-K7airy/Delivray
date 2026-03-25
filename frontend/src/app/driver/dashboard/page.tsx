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
   ExternalLink,
   ShieldCheck,
   ChevronRight,
   Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import Button from '@/components/Button';

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
               setStats({ earnings: data.earnings, deliveries: data.deliveries, activeTime: 'Active Now' });
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
            if (res.ok) {
               const data = await res.json();
               if (Array.isArray(data)) {
                  const current = data.find((o: any) => o.status === 'delivering' || o.status === 'picked_up');
                  if (current) setActiveOrder(current);
               }
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

      return () => {
         socket.disconnect();
         if (timerRef.current) clearInterval(timerRef.current);
      };
   }, [token, user, router]);

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
            toast.success("Mission Accepted! Route initialized.");
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
            toast.success('Nice work! Mission completed.');
            setActiveOrder(null);
         }
      } catch (err: any) {
         toast.error(err.message);
      }
   };

   return (
      <div className="container-responsive py-6 sm:py-10 space-y-12">
         {/* Driver Header */}
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div>
               <h1 className="heading-responsive !text-3xl sm:!text-5xl uppercase italic tracking-tighter">Navigator: <span className="text-primary">{user?.name?.split(' ')[0]}</span></h1>
               <p className="text-responsive mt-3 max-w-2xl font-medium">Grid synchronized. Awaiting mission protocols.</p>
            </div>
            <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 flex items-center space-x-4 shadow-xl whitespace-nowrap">
               <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
               <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Duty Status: Active</span>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Active Mission Display */}
            <div className="lg:col-span-8 flex flex-col space-y-10">
               {activeOrder ? (
                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="card-responsive !bg-[#111111] !p-6 sm:!p-12 relative overflow-hidden group shadow-2xl border-white/5"
                  >
                     <div className="absolute top-0 right-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000')] bg-cover opacity-5 mix-blend-overlay grayscale pointer-events-none" />

                     <div className="relative z-10 space-y-12">
                        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-6 border-b border-white/5 pb-10">
                           <div className="text-center sm:text-left">
                              <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] inline-block mb-4">In-Flight Protocol</span>
                              <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase leading-none">Order #{activeOrder.id.slice(0, 8).toUpperCase()}</h2>
                           </div>
                           <div className="flex bg-white/5 px-6 py-4 rounded-2xl border border-white/5 items-center gap-4">
                              <div className="flex flex-col items-end">
                                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Estimated Payout</span>
                                 <span className="text-2xl font-black text-white">$12.50</span>
                              </div>
                              <Wallet className="text-primary" size={24} />
                           </div>
                        </div>

                        {/* Navigation Timeline */}
                        <div className="relative pl-16 sm:pl-20 space-y-16">
                           <div className="absolute left-6 sm:left-8 top-8 bottom-8 w-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                 initial={{ height: "0%" }}
                                 animate={{ height: activeOrder.status === 'delivering' ? "50%" : "20%" }}
                                 className="w-full bg-primary shadow-[0_0_10px_rgba(217,119,87,0.5)]"
                              />
                           </div>

                           <div className="relative group/step">
                              <div className="absolute -left-14 sm:-left-16 w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 border border-primary/20 rounded-2xl sm:rounded-3xl flex items-center justify-center text-primary shadow-2xl transition-transform hover:scale-110">
                                 <StoreIcon size={24} />
                              </div>
                              <div>
                                 <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tight">{activeOrder.stores?.name || 'Restaurant Hub'}</h4>
                                 <p className="text-gray-500 font-medium text-sm sm:text-base italic">Pick up required at terminal location</p>
                              </div>
                           </div>

                           <div className="relative group/step">
                              <div className="absolute -left-14 sm:-left-16 w-12 h-12 sm:w-16 sm:h-16 bg-white/5 border border-white/5 rounded-2xl sm:rounded-3xl flex items-center justify-center text-gray-600 transition-transform hover:scale-110">
                                 <MapPin size={24} />
                              </div>
                              <div>
                                 <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Vantage Point: Final Hub</h4>
                                 <p className="text-gray-500 font-medium text-sm sm:text-base italic">Ensure encrypted delivery handoff</p>
                                 <button className="button-responsive !bg-white/5 !text-white !h-14 !px-8 mt-6">
                                    <ExternalLink size={18} />
                                    <span className="ml-3 uppercase tracking-widest text-[10px]">Initialize Maps</span>
                                 </button>
                              </div>
                           </div>
                        </div>

                        <Button
                           onClick={completeOrder}
                           className="w-full h-20 sm:h-24 !bg-primary !text-white !text-xl sm:!text-2xl shadow-2xl shadow-primary/30"
                        >
                           <ShieldCheck size={28} className="mr-4" />
                           <span>Complete Mission</span>
                        </Button>
                     </div>
                  </motion.div>
               ) : (
                  <div className="py-24 sm:py-32 flex items-center justify-center text-center bg-white/5 rounded-[3rem] border border-white/5">
                     <div className="space-y-8 max-w-sm px-6">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto text-gray-700 transition-all hover:scale-110 hover:text-primary">
                           <Truck size={48} />
                        </div>
                        <div>
                           <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Staging Area <span className="text-primary italic">Empty.</span></h3>
                           <p className="text-responsive mt-4">Maintaining active connection to the dispatch grid. New missions will materialize instantly.</p>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Sidebar Performance */}
            <div className="lg:col-span-4 flex flex-col space-y-6 sm:space-y-10">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 ml-4">Fleet Telemetry</span>

               <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
                  {[
                    { label: 'Signal Earnings', value: `$${stats.earnings.toFixed(2)}`, icon: <Wallet size={20} />, color: 'primary' },
                    { label: 'Total Logistics', value: stats.deliveries, icon: <Truck size={20} />, color: 'text-white' },
                    { label: 'Operational Time', value: '4h 22m', icon: <Clock size={20} />, color: 'text-white' }
                  ].map((stat, idx) => (
                    <div key={idx} className="card-responsive !p-6 sm:!p-8 group hover:-translate-y-1 border-transparent hover:border-white/5 transition-all">
                       <p className={`text-[9px] font-black uppercase tracking-widest ${idx === 0 ? 'text-primary' : 'text-gray-500'} mb-3`}>{stat.label}</p>
                       <div className="flex items-center justify-between">
                          <span className="text-2xl sm:text-4xl font-black text-white tracking-tighter">{stat.value}</span>
                          <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${idx === 0 ? 'text-primary' : 'text-gray-600'}`}>
                             {stat.icon}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Mission Request Overlay */}
         <AnimatePresence>
            {availableOrder && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="absolute inset-0 bg-black/80 backdrop-blur-3xl"
                     onClick={() => setAvailableOrder(null)}
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.9, y: 50 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9, y: 50 }}
                     className="card-responsive !bg-[#111111] !p-10 sm:!p-16 max-w-xl w-full text-center relative z-10 border-white/10 shadow-[0_50px_150px_-30px_rgba(0,0,0,1)]"
                  >
                     <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
                     
                     <div className="relative z-20 space-y-12">
                        <div className="w-20 h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center mx-auto text-primary animate-bounce shadow-2xl shadow-primary/20">
                           <Zap size={32} />
                        </div>
                        
                        <div>
                           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">New Protocol Detected</span>
                           <h3 className="text-6xl font-black text-white tracking-tighter mt-4">${Number(availableOrder.total_price).toFixed(2)}</h3>
                           <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-2">Guaranteed Operational Payout</p>
                        </div>

                        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 text-left">
                           <div className="flex items-center gap-5 mb-4">
                              <StoreIcon size={20} className="text-primary" />
                              <span className="text-2xl font-black text-white uppercase tracking-tight">{availableOrder.stores?.name || 'Partner Hub'}</span>
                           </div>
                           <div className="flex items-center gap-5 text-gray-500">
                              <MapPin size={18} />
                              <span className="text-xs font-black uppercase tracking-widest">1.2km • Sector 5 Dispatch</span>
                           </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6">
                           <button
                              onClick={() => setAvailableOrder(null)}
                              className="flex-1 h-20 bg-white/5 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border border-white/5"
                           >
                              Decline
                           </button>
                           <button
                              onClick={() => acceptOrder(availableOrder.id)}
                              className="flex-1 h-20 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                           >
                              Accept Mission
                           </button>
                        </div>

                        <div className="space-y-4">
                           <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                 initial={{ width: "100%" }}
                                 animate={{ width: "0%" }}
                                 transition={{ duration: 30, ease: "linear" }}
                                 className="h-full bg-primary"
                              />
                           </div>
                           <p className="text-[8px] font-black uppercase tracking-widest text-gray-600">Signal expiring in {countdown}s</p>
                        </div>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
