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
      case 'pending': return { icon: <Package size={28} className="stroke-[2.5]" />, label: 'Order Placed', desc: 'Waiting for restaurant/store to accept' };
      case 'accepted': return { icon: <CheckCircle size={28} className="stroke-[2.5]" />, label: 'Accepted', desc: 'The partner is reviewing your order' };
      case 'preparing': return { icon: <Package size={28} className="stroke-[2.5]" />, label: 'Preparing', desc: 'Your items are being packed' };
      case 'ready_for_pickup': return { icon: <Package size={28} className="stroke-[2.5]" />, label: 'Ready for Pickup', desc: 'Waiting for a nearby driver' };
      case 'delivering': 
      case 'picked_up': return { icon: <Car size={28} className="stroke-[2.5]" />, label: 'In Transit', desc: 'Your courier has picked up the order' };
      case 'completed': 
      case 'delivered': return { icon: <ShieldCheck size={28} className="stroke-[2.5]" />, label: 'Delivered', desc: 'Enjoy your delivery!' };
      default: return { icon: <Package size={28} className="stroke-[2.5]" />, label: 'Processing', desc: 'Updating status...' };
    }
  };

  const statusInfo = getStatusDetails(order?.status || 'pending');

  const stages = [
    { key: 'PICKUP', status: ['pending', 'accepted', 'preparing', 'ready_for_pickup'] },
    { key: 'TRANSIT', status: ['delivering', 'picked_up'] },
    { key: 'DELIVERED', status: ['completed', 'delivered'] }
  ];

  const currentStageIndex = stages.findIndex(s => s.status.includes(order?.status || ''));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center py-10 sm:py-20">
      <div className="container-responsive max-w-3xl">
        {/* Dynamic Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-primary/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none z-0" />

        {/* Main Tracking Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-responsive !bg-[#111111] !p-6 sm:!p-12 relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border-white/5"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 sm:mb-16">
            <div className="flex items-center gap-6">
               <button onClick={() => router.push('/')} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/5 hover:bg-white/10 transition-all">
                  <ChevronLeft size={20} />
               </button>
               <div>
                  <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Order Status</h1>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">ID: #{String(id).substring(0, 8).toUpperCase()}</p>
               </div>
            </div>
            <div className="bg-primary/20 px-6 py-3 rounded-2xl border border-primary/20 text-primary font-black text-xs uppercase tracking-[0.2em]">
               Real-time Connection
            </div>
          </div>

          {/* Status Display */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center mb-12 sm:mb-16">
             <div className="md:col-span-8">
                <div className="flex items-start gap-8">
                   <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 shrink-0">
                      {statusInfo.icon}
                   </div>
                   <div>
                      <h2 className="text-3xl sm:text-4xl font-black mb-3 leading-none uppercase tracking-tight">{statusInfo.label}</h2>
                      <p className="text-gray-500 text-sm sm:text-lg font-medium italic">{statusInfo.desc}</p>
                   </div>
                </div>
             </div>
             <div className="md:col-span-4 text-center md:text-right border-t md:border-t-0 md:border-l border-white/5 pt-8 md:pt-0 md:pl-10">
                <p className="text-gray-600 font-black uppercase tracking-[0.2em] text-[10px] mb-2">ETA Arrival</p>
                <p className="text-4xl sm:text-5xl font-black text-white tracking-tighter">14:45</p>
             </div>
          </div>

          {/* Progress Timeline */}
          <div className="mb-12 sm:mb-20">
             <div className="flex justify-between mb-4 px-2">
                {stages.map((stage, i) => (
                   <span key={stage.key} className={`text-[9px] font-black uppercase tracking-[0.3em] ${i <= currentStageIndex ? 'text-primary' : 'text-gray-700'}`}>
                      {stage.key}
                   </span>
                ))}
             </div>
             <div className="relative h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStageIndex + 0.8) * 33.33}%` }}
                  className="h-full bg-primary rounded-full relative shadow-[0_0_15px_rgba(217,119,87,0.5)]"
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </motion.div>
             </div>
          </div>

          {/* Driver Slot */}
          <div className="card-responsive !bg-white/5 !p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-white/[0.08] transition-colors">
             <div className="flex items-center gap-6">
                <div className="relative shrink-0">
                   <img src={order?.drivers?.user_id ? `https://i.pravatar.cc/150?u=${order.drivers.user_id}` : "https://i.pravatar.cc/150?img=12"} alt="Driver" className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl border-2 border-primary/20 shadow-2xl" />
                   <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${order?.drivers ? 'bg-green-500' : 'bg-gray-500'} border-4 border-[#111111] rounded-full shadow-lg`} />
                </div>
                <div className="text-center sm:text-left">
                   <h4 className="text-xl sm:text-2xl font-black tracking-tight">{order?.drivers?.users?.name || 'Assigning Courier...'}</h4>
                   <div className="flex items-center justify-center sm:justify-start gap-2 text-primary mt-1">
                      <Clock size={16} className="animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Active Search</span>
                   </div>
                </div>
             </div>
             <button className="button-responsive bg-primary text-white w-full sm:w-auto h-16 sm:h-20 !px-10">
                <MessageSquare size={20} fill="currentColor" />
                <span className="ml-3 uppercase tracking-widest text-[10px]">Contact</span>
             </button>
          </div>

          {/* Metrics Shelf */}
          <div className="grid grid-cols-2 gap-6 mt-12 sm:mt-16 pt-12 border-t border-white/5">
             <div className="text-center sm:text-left">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 mb-2">Safety Shield</p>
                <div className="flex items-center justify-center sm:justify-start gap-3">
                   <ShieldCheck size={20} className="text-green-500" />
                   <span className="text-xl sm:text-2xl font-black text-white">Active</span>
                </div>
             </div>
             <div className="text-center sm:text-right">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 mb-2">Climate Unit</p>
                <div className="flex items-center justify-center sm:justify-end gap-3">
                   <Snowflake size={20} className="text-blue-400 animate-pulse" />
                   <span className="text-xl sm:text-2xl font-black text-white">Cold</span>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Branding Footer */}
        <div className="mt-12 text-center">
           <div className="flex items-center justify-center gap-2 text-primary opacity-40 hover:opacity-100 transition-opacity cursor-default mb-6">
              <span className="text-2xl font-black uppercase italic tracking-tighter">Delivray</span>
           </div>
           <div className="flex items-center justify-center gap-10 text-[9px] font-black uppercase tracking-[0.4em] text-gray-800">
              <span className="hover:text-white transition-colors cursor-pointer">Support</span>
              <span className="hover:text-white transition-colors cursor-pointer">Legal</span>
           </div>
        </div>
      </div>
    </div>
  );
}
