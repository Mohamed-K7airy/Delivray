'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import io from 'socket.io-client';
import { MapPin, Package, Navigation, CheckCircle, Car, Clock, MessageSquare, Snowflake, ShieldCheck, ChevronLeft, Zap, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/Button';
import { API_URL } from '@/config/api';
import Logo from '@/components/Logo';

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
      case 'pending': return { icon: <Package size={28} />, label: 'Order Placed', desc: 'Partner is confirming your selection' };
      case 'accepted': return { icon: <CheckCircle size={28} />, label: 'Accepted', desc: 'Your order is now in the queue' };
      case 'preparing': return { icon: <Zap size={28} />, label: 'Preparing', desc: 'Crafting your meal with care' };
      case 'ready_for_pickup': return { icon: <Package size={28} />, label: 'Ready!', desc: 'Waiting for your dedicated courier' };
      case 'delivering': 
      case 'picked_up': return { icon: <Car size={28} />, label: 'On The Way', desc: 'Zipping through traffic to you' };
      case 'completed': 
      case 'delivered': return { icon: <ShieldCheck size={28} />, label: 'Arrived', desc: 'Enjoy your delicious delivery!' };
      default: return { icon: <Package size={28} />, label: 'Processing', desc: 'Syncing real-time updates...' };
    }
  };

  const statusInfo = getStatusDetails(order?.status || 'pending');

  const stages = [
    { key: 'CONFIRM', status: ['pending', 'accepted', 'preparing', 'ready_for_pickup'] },
    { key: 'TRANSIT', status: ['delivering', 'picked_up'] },
    { key: 'ARRIVE', status: ['completed', 'delivered'] }
  ];

  const currentStageIndex = stages.findIndex(s => s.status.includes(order?.status || ''));

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FF5A3C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-12 lg:pt-20 px-6">
      <div className="container-responsive max-w-3xl">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF5A3C]/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        <header className="mb-10 lg:mb-16 flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => router.push('/')}
                className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#0A0A0A] hover:bg-gray-50 transition-all shadow-sm"
              >
                 <ChevronLeft size={20} />
              </button>
              <div>
                 <h1 className="text-3xl lg:text-4xl font-black text-[#0A0A0A] tracking-tighter">Live <span className="text-[#FF5A3C] italic">track.</span></h1>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Order Index: #{String(id).substring(0, 8).toUpperCase()}</p>
              </div>
           </div>
           <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-[#0A0A0A] uppercase tracking-widest">Active Connection</span>
           </div>
        </header>

        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white rounded-[3rem] p-8 lg:p-14 border border-gray-100 shadow-[0_40px_100px_rgba(0,0,0,0.04)] relative overflow-hidden"
        >
           {/* Summary Header */}
           <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center mb-16 pb-16 border-b border-gray-50">
              <div className="md:col-span-8 flex items-center gap-10">
                 <div className="w-24 h-24 lg:w-32 lg:h-32 bg-[#FF5A3C] text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-[#FF5A3C]/20 shrink-0">
                    {statusInfo.icon}
                 </div>
                 <div>
                    <h2 className="text-4xl lg:text-6xl font-black text-[#0A0A0A] tracking-tighter leading-none mb-4">{statusInfo.label}</h2>
                    <p className="text-gray-400 font-bold text-lg italic">{statusInfo.desc}</p>
                 </div>
              </div>
              <div className="md:col-span-4 text-center md:text-right md:border-l border-gray-50 md:pl-10">
                 <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-2">ETA Arrival</p>
                 <p className="text-5xl lg:text-6xl font-black text-[#0A0A0A] tracking-tighter">14:45</p>
              </div>
           </div>

           {/* Progress Line */}
           <div className="mb-20">
              <div className="flex justify-between mb-6 px-2">
                 {stages.map((stage, i) => (
                    <span key={stage.key} className={`text-[10px] font-black uppercase tracking-[0.2em] ${i <= currentStageIndex ? 'text-[#FF5A3C]' : 'text-gray-200'}`}>
                       {stage.key}
                    </span>
                 ))}
              </div>
              <div className="relative h-4 bg-gray-50 rounded-full overflow-hidden p-1 border border-gray-100 shadow-inner">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${(currentStageIndex + 0.8) * 33.33}%` }}
                   className="h-full bg-[#FF5A3C] rounded-full relative shadow-lg shadow-[#FF5A3C]/20"
                 >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                 </motion.div>
              </div>
           </div>

           {/* Courier Section */}
           <div className="bg-gray-50 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 group hover:bg-[#FFF9F8] transition-all border border-transparent hover:border-[#FFE7E2]">
              <div className="flex items-center gap-6">
                 <div className="relative shrink-0">
                    <img 
                      src={order?.drivers?.user_id ? `https://i.pravatar.cc/150?u=${order.drivers.user_id}` : "https://i.pravatar.cc/150?img=12"} 
                      alt="Courier" 
                      className="w-20 h-20 rounded-3xl border-2 border-white shadow-xl" 
                    />
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${order?.drivers ? 'bg-green-500' : 'bg-gray-300'} border-4 border-white rounded-full`} />
                 </div>
                 <div className="text-center md:text-left">
                    <h4 className="text-2xl font-black text-[#0A0A0A] tracking-tight">{order?.drivers?.users?.name || 'Assigned Courier...'}</h4>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-[#FF5A3C] mt-2">
                       <Star size={16} fill="currentColor" />
                       <span className="text-[10px] font-black uppercase tracking-widest">4.9 Rated Master</span>
                    </div>
                 </div>
              </div>
              <button className="bg-[#0A0A0A] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[#1A1A1A] transition-all shadow-xl shadow-black/10">
                 <MessageSquare size={20} fill="currentColor" />
                 <span>Contact</span>
              </button>
           </div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-2 gap-8 mt-12 pt-12 border-t border-gray-50">
              <div className="text-center md:text-left">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2">Safety Token</p>
                 <div className="flex items-center justify-center md:justify-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                       <ShieldCheck size={20} />
                    </div>
                    <span className="text-2xl font-black text-[#0A0A0A]">Encrypted</span>
                 </div>
              </div>
              <div className="text-center md:text-right">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2">Climate Unit</p>
                 <div className="flex items-center justify-center md:justify-end gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-400">
                       <Snowflake size={20} className="animate-pulse" />
                    </div>
                    <span className="text-2xl font-black text-[#0A0A0A]">Constant</span>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* Footer Branding */}
        <div className="mt-16 text-center space-y-8 pb-10">
           <Logo className="opacity-20 hover:opacity-100 transition-opacity" />
           <div className="flex items-center justify-center gap-10">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#FF5A3C] cursor-pointer transition-colors">Order Support</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#FF5A3C] cursor-pointer transition-colors">Privacy Policy</span>
           </div>
        </div>
      </div>
    </div>
  );
}
