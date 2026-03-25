'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import io from 'socket.io-client';
import { MapPin, Package, Navigation, CheckCircle, Car, Clock, MessageSquare, Snowflake, ShieldCheck, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/Button';
import { API_URL } from '@/config/api';

interface Order {
  id: string;
  status: string;
  total_price: number;
  drivers?: {
    user_id: string;
    users: { name: string };
  };
}

export default function OrderTracking() {
  const { id } = useParams();
  const { token, user } = useAuthStore();
  const router = useRouter();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (!token) return router.push('/login');

    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
      }
    };
    fetchOrder();

    const socket = io(API_URL, { withCredentials: true });
    socket.emit('join_order', id);
    socket.on('order_status_updated', (updatedOrder) => setOrder(updatedOrder));
    socket.on('driver_location_updated', (loc) => setDriverLocation(loc));

    return () => { socket.disconnect(); };
  }, [id, token, router]);

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'pending': return { icon: <Package size={28} className="stroke-[2.5]" />, label: 'Order Placed', desc: 'Waiting for restaurant to accept' };
      case 'accepted': return { icon: <CheckCircle size={28} className="stroke-[2.5]" />, label: 'Accepted', desc: 'The restaurant is reviewing your order' };
      case 'preparing': return { icon: <Package size={28} className="stroke-[2.5]" />, label: 'Preparing', desc: 'Your meal is being prepared' };
      case 'ready_for_pickup': return { icon: <Package size={28} className="stroke-[2.5]" />, label: 'Ready', desc: 'Waiting for a driver to arrive' };
      case 'delivering': 
      case 'picked_up': return { icon: <Car size={28} className="stroke-[2.5]" />, label: 'On the Way', desc: 'Parcel has left the sorting hub' };
      case 'completed': 
      case 'delivered': return { icon: <ShieldCheck size={28} className="stroke-[2.5]" />, label: 'Delivered', desc: 'Enjoy your meal!' };
      default: return { icon: <Package size={28} className="stroke-[2.5]" />, label: 'Processing', desc: 'Calculating metrics...' };
    }
  };

  const statusInfo = getStatusDetails(order?.status || 'pending');

  const stages = [
    { key: 'PICKUP', status: ['pending', 'accepted', 'preparing', 'ready_for_pickup'] },
    { key: 'IN TRANSIT', status: ['delivering', 'picked_up'] },
    { key: 'DELIVERY', status: ['completed', 'delivered'] }
  ];

  const currentStageIndex = stages.findIndex(s => s.status.includes(order?.status || ''));

  return (
    <div className="min-h-screen bg-[#070707] text-white selection:bg-[#ff8564]/30 relative overflow-hidden flex items-center justify-center py-10 sm:py-20 px-4">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Tracking Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-[#0b0b0b] rounded-2xl sm:rounded-[2.5rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden p-5 sm:p-10"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <div className="flex items-center gap-3 sm:gap-4">
             <button onClick={() => router.back()} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <ChevronLeft size={18} />
             </button>
             <h1 className="text-xl sm:text-3xl font-black italic tracking-tightest uppercase">Order Tracking</h1>
          </div>
          <div className="bg-[#1a1a1a] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-white/5 shadow-xl">
             <span className="text-[9px] sm:text-[11px] font-black tracking-widest text-[#ff8564]">#{String(id).substring(0, 7).toUpperCase()}</span>
          </div>
        </div>

        {/* Estimated Arrival Banner */}
        <div className="mb-6 sm:mb-10 text-center sm:text-left">
           <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-1">Estimated Arrival</p>
           <h2 className="text-2xl sm:text-4xl font-black tracking-tighter">14:45 PM</h2>
        </div>

        {/* Status Highlight Card */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/5 relative overflow-hidden mb-6 sm:mb-10 group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-10 -mt-10" />
           <div className="flex items-center gap-5 sm:gap-8 relative z-10">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-primary/20 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center text-primary shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                 {statusInfo.icon}
              </div>
              <div>
                 <h3 className="text-lg sm:text-2xl font-black tracking-tight mb-1">{statusInfo.label}</h3>
                 <p className="text-gray-500 font-medium leading-relaxed italic">{statusInfo.desc}</p>
              </div>
           </div>
        </div>

        {/* Driver Profile Section */}
        <div className="bg-[#121212] border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex items-center justify-between mb-6 sm:mb-10 hover:border-white/10 transition-all group">
           <div className="flex items-center gap-3 sm:gap-5">
              <div className="relative">
                 <img src={order?.drivers?.user_id ? `https://i.pravatar.cc/150?u=${order.drivers.user_id}` : "https://i.pravatar.cc/150?img=12"} alt="Driver" className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border-2 border-white/10 shadow-xl group-hover:scale-105 transition-transform" />
                 <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${order?.drivers ? 'bg-green-500' : 'bg-gray-500'} border-2 border-black rounded-full shadow-lg`} />
              </div>
              <div>
                 <h4 className="text-sm sm:text-xl font-black tracking-tight">{order?.drivers?.users?.name || 'Searching for Driver...'}</h4>
                 <div className="flex items-center gap-2 text-primary">
                    <Clock size={14} className="animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest leading-none mt-0.5">12 mins away</span>
                 </div>
              </div>
           </div>
           <button className="w-10 h-10 sm:w-14 sm:h-14 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center text-black shadow-xl shadow-primary/30 hover:scale-110 active:scale-95 transition-all">
              <MessageSquare size={18} fill="currentColor" />
           </button>
        </div>

        {/* Dynamic Timeline labels */}
        <div className="flex justify-between items-center mb-4 px-2">
           {stages.map((stage, i) => (
              <span key={stage.key} className={`text-[10px] font-black uppercase tracking-[0.2em] ${i === currentStageIndex ? 'text-white' : i < currentStageIndex ? 'text-primary' : 'text-gray-700'}`}>
                 {stage.key}
              </span>
           ))}
        </div>

        {/* Progress Bar Timeline */}
        <div className="relative h-2.5 bg-white/5 rounded-full mb-6 sm:mb-10 overflow-hidden shadow-inner p-0.5">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${(currentStageIndex + 0.8) * 33.33}%` }}
             className="h-full bg-gradient-to-r from-primary/30 via-primary to-primary rounded-full relative shadow-[0_0_15px_rgba(255,133,100,0.5)]"
           >
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
           </motion.div>
        </div>

        {/* Telemetry Detail Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-8 sm:mb-12">
           <div className="bg-[#121212] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/5 group hover:border-primary/20 transition-all">
              <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-600 mb-2">Weight</p>
              <p className="text-lg sm:text-2xl font-black tracking-tighter">2.4 kg</p>
           </div>
           <div className="bg-[#121212] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/5 group hover:border-blue-500/20 transition-all">
              <div className="flex items-baseline gap-2 mb-2">
                 <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Temp Control</p>
                 <Snowflake size={10} className="text-blue-400 animate-spin-slow" />
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_#60a5fa]" />
                 <p className="text-lg sm:text-2xl font-black tracking-tighter text-blue-400">Active</p>
              </div>
           </div>
        </div>

        {/* Nexus Branding Footer */}
        <div className="pt-8 border-t border-white/5 text-center space-y-4">
           <div className="flex items-center justify-center gap-2 text-primary opacity-60">
              <ShieldCheck size={20} />
              <span className="text-xl font-black uppercase italic tracking-tighter">Delivray</span>
           </div>
           <div className="flex items-center justify-center gap-8 text-[9px] font-black uppercase tracking-[0.3em] text-gray-700">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
