'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import {
  Navigation,
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
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import Button from '@/components/Button';
import { useSocket } from '@/context/SocketContext';
import { apiClient } from '@/lib/apiClient';

export default function DriverDashboard() {
  const { token, user } = useAuthStore();
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  const [availableOrder, setAvailableOrder] = useState<any | null>(null);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(24);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [stats, setStats] = useState({ earnings: 0, deliveries: 0, activeTime: '4h 22m' });

  useEffect(() => {
    if (!token || user?.role !== 'driver') return router.push('/login');

    const fetchStats = async () => {
      try {
        const data = await apiClient('/delivery/stats');
        if (data) {
          setStats({ earnings: data.earnings, deliveries: data.deliveries, activeTime: 'Active Now' });
        }
      } catch (err) {
        console.error('Error fetching driver stats:', err);
      }
    };
    fetchStats();

    const fetchActiveOrder = async () => {
      try {
        const data = await apiClient('/orders/driver');
        if (data && Array.isArray(data)) {
          const current = data.find((o: any) => o.status === 'delivering' || o.status === 'picked_up' || o.status === 'accepted');
          if (current) setActiveOrder(current);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveOrder();
  }, [token, user, router]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('order_ready_for_pickup', (order) => {
      setAvailableOrder(order);
      setCountdown(24);
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
      socket.off('order_ready_for_pickup');
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [socket, isConnected]);

  const acceptOrder = async (orderId: string) => {
    try {
      const data = await apiClient(`/delivery/accept-order/${orderId}`, { method: 'POST' });
      if (data) {
        setActiveOrder(data);
        setAvailableOrder(null);
        toast.success("Mission Accepted! Route initialized.");
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const completeOrder = async () => {
    if (!activeOrder) return;
    try {
      const data = await apiClient(`/delivery/complete-order/${activeOrder.id}`, { method: 'PATCH' });
      if (data) {
        toast.success('Nice work! Mission completed.');
        setActiveOrder(null);
      }
    } catch (err: any) {
       console.error(err);
    }
  };

  return (
    <div className="space-y-10 lg:space-y-12 pb-24">
      
      {/* Driver Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-[#111111] tracking-tighter mb-2">Navigator: <span className="text-[#d97757]">{user?.name?.split(' ')[0]}</span></h1>
          <p className="text-sm font-bold text-[#888888]">Your fleet status is active. High-priority orders will appear here instantly.</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-xl border border-gray-100 flex items-center space-x-4 shadow-sm whitespace-nowrap">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
          <span className="text-[10px] font-black text-[#111111] uppercase tracking-[0.3em]">Duty Status: Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Active Mission Display */}
        <div className="lg:col-span-8 flex flex-col space-y-10">
          {activeOrder ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 lg:p-12 relative overflow-hidden group shadow-md border border-gray-50"
            >
              <div className="relative z-10 space-y-12">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-8 border-b border-gray-50 pb-10">
                  <div className="text-center sm:text-left">
                    <span className="bg-[#d97757]/10 text-[#d97757] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] inline-block mb-4">ACTIVE MISSION</span>
                    <h2 className="text-3xl lg:text-4xl font-black text-[#111111] tracking-tighter uppercase leading-none">Order #{activeOrder.id.slice(0, 8).toUpperCase()}</h2>
                  </div>
                  <div className="flex bg-[#f9f9f9] px-8 py-5 rounded-xl border border-gray-100 items-center gap-4 shadow-sm">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-[#888888] uppercase tracking-widest leading-none mb-1">Guaranteed Payout</span>
                      <span className="text-3xl font-black text-[#111111] tracking-tighter">${Number(activeOrder.total_price).toFixed(2)}</span>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#d97757] shadow-sm">
                       <Wallet size={24} />
                    </div>
                  </div>
                </div>

                {/* Navigation Timeline */}
                  <div className="relative pl-20 lg:pl-24 space-y-16 py-4">
                    <div className="absolute left-10 lg:left-12 top-0 bottom-0 w-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ height: "0%" }}
                        animate={{ height: activeOrder.status === 'delivering' ? "100%" : "30%" }}
                        className="w-full bg-[#d97757] shadow-[0_0_15px_rgba(217,119,87,0.3)]"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute -left-16 lg:-left-[4.5rem] w-14 h-14 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-[#111111] shadow-md group-hover:scale-110 transition-transform">
                        <StoreIcon size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl lg:text-2xl font-black text-[#111111] tracking-tight">{activeOrder.stores?.name || 'Restaurant Terminal'}</h4>
                        <p className="text-[#888888] font-bold text-sm italic">Pickup Location • Order #{activeOrder.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-16 lg:-left-[4.5rem] w-14 h-14 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-300 shadow-md group-hover:scale-110 transition-transform">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl lg:text-2xl font-black text-[#111111] tracking-tight">Customer Destination</h4>
                        <p className="text-[#888888] font-bold text-sm italic">Sector 4 Transit Point</p>
                        <button className="h-14 px-10 bg-[#111111] text-white rounded-xl font-black uppercase tracking-widest text-[10px] mt-6 flex items-center gap-3 hover:bg-[#333] transition-all shadow-md">
                           <Navigation size={18} />
                           Load Telemetry
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={completeOrder}
                    className="w-full h-24 bg-[#d97757] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xl shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4"
                  >
                    <ShieldCheck size={32} />
                    Complete Mission & Exit
                  </button>
              </div>
            </motion.div>
          ) : (
            <div className="py-24 lg:py-32 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
               <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
               <div className="w-28 h-28 bg-gray-50 rounded-xl flex items-center justify-center mb-10 text-gray-200 group-hover:scale-110 group-hover:text-[#d97757]/20 transition-all duration-700">
                  <Truck size={56} />
               </div>
               <h3 className="text-3xl font-black text-[#111111] tracking-tighter uppercase mb-4">Fleet Staging Area <span className="text-[#d97757]">Idle.</span></h3>
               <p className="text-sm font-bold text-[#888888] max-w-sm mx-auto uppercase tracking-widest">Awaiting command from central dispatch protocol.</p>
            </div>
          )}
        </div>

        {/* Sidebar Performance */}
        <div className="lg:col-span-4 flex flex-col space-y-10">
          <div className="bg-[#111111] rounded-2xl p-10 text-white relative overflow-hidden group shadow-lg">
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d97757] mb-8">Performance Telemetry</p>
                <div className="space-y-10">
                   {[
                     { label: 'Signal Earnings', value: `$${stats.earnings.toFixed(2)}`, icon: <Wallet size={20} />, color: '#d97757' },
                     { label: 'Logistics Handled', value: stats.deliveries, icon: <Truck size={20} />, color: '#FFF' },
                     { label: 'Time on Grid', value: stats.activeTime, icon: <Clock size={20} />, color: '#FFF' }
                   ].map((item, idx) => (
                     <div key={idx} className="flex items-center justify-between group/item">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white group-hover/item:text-[#d97757] transition-colors border border-white/5">
                              {item.icon}
                           </div>
                           <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-[#888888] mb-1">{item.label}</p>
                              <p className="text-2xl font-black tracking-tighter leading-none" style={{ color: idx === 0 ? '#d97757' : '#FFF' }}>{item.value}</p>
                           </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-800" />
                     </div>
                   ))}
                </div>
             </div>
             <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#d97757]/10 rounded-full blur-[80px] pointer-events-none" />
          </div>


          {/* Quick Support Card */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md">
             <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-8 shadow-sm">
                <AlertCircle size={24} />
             </div>
             <h4 className="text-xl font-black text-[#111111] tracking-tighter mb-2">Fleet Support</h4>
             <p className="text-xs font-bold text-[#888888] mb-8 uppercase tracking-widest leading-loose">Need technical assistance or reporting an incident?</p>
             <button className="w-full h-14 bg-gray-50 text-[#111111] border border-gray-100 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all">
                Contact Dispatch
             </button>
          </div>
        </div>
      </div>

      {/* High-Fidelity Mission Request Modal (Exactly as Image 4) */}
      <AnimatePresence>
        {availableOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setAvailableOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="bg-white rounded-2xl p-8 lg:p-12 max-w-[480px] w-full relative z-10 shadow-2xl border border-gray-100"
            >
              <div className="flex flex-col items-center">
                {/* Icon Box */}
                <div className="w-24 h-24 bg-[#d97757] rounded-2xl flex items-center justify-center text-white mb-8 shadow-md">
                  <Truck size={40} className="fill-current" />
                </div>
                
                {/* Title */}
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d97757] mb-4">NEW DELIVERY REQUEST</span>
                
                {/* Amount */}
                <div className="flex flex-col items-center mb-10">
                  <h3 className="text-7xl font-black text-[#111111] tracking-tighter leading-none">${Number(availableOrder.total_price).toFixed(2)}</h3>
                  <p className="text-[10px] font-bold text-[#888888] mt-3 italic tracking-tight underline border-gray-200">Estimated payout incl. tip</p>
                </div>

                {/* Store Info Box */}
                <div className="w-full bg-[#f9f9f9] p-8 rounded-2xl mb-12 border border-gray-100">
                  <div className="flex flex-col items-center text-center">
                    <h4 className="text-2xl font-black text-[#111111] tracking-tight mb-2 uppercase">{availableOrder.stores?.name || 'THE NEON GRILL'}</h4>
                    <div className="flex items-center gap-2 text-[#888888]">
                      <MapPin size={16} />
                      <span className="text-sm font-bold tracking-tight">1.2 mi away • Downtown Core</span>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-6 w-full mb-10">
                  <button
                    onClick={() => setAvailableOrder(null)}
                    className="h-16 border-2 border-gray-100 text-[#d97757] rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-red-50 transition-all"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => acceptOrder(availableOrder.id)}
                    className="h-16 bg-[#d97757] text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-md hover:scale-[1.03] active:scale-[0.97] transition-all"
                  >
                    Accept
                  </button>
                </div>

                {/* Progress Bar & Countdown */}
                <div className="w-full space-y-4">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 24, ease: "linear" }}
                      className="h-full bg-gradient-to-r from-[#d97757] to-[#c2654a]"
                    />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#888888] text-center">
                    REQUEST EXPIRES IN <span className="text-[#d97757]">{countdown} SECONDS</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
