'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { MapPin, Package, Navigation, CheckCircle, Car, Clock, MessageSquare, Snowflake, ShieldCheck, ChevronLeft, Zap, Star, Phone, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/context/SocketContext';
import Button from '@/components/Button';
import { API_URL } from '@/config/api';
import Logo from '@/components/Logo';

interface Order {
  id: string;
  status: string;
  total_price: number;
  order_items?: {
    id: string;
    quantity: number;
    products: { name: string, price: number };
  }[];
  drivers?: {
    user_id: string;
    users: { name: string };
  };
  stores?: {
    name: string;
  };
}

export default function OrderTracking() {
  const { id } = useParams();
  const { token, user, _hasHydrated } = useAuthStore();
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;
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

    if (socket) {
       socket.emit('join_order', id);
       
       const handleUpdate = (updatedOrder: Order) => {
          setOrder(updatedOrder);
       };

       socket.on('order_status_updated', handleUpdate);
       
       return () => {
          socket.off('order_status_updated', handleUpdate);
       };
    }
  }, [id, token, router, _hasHydrated, socket]);

  const stages = [
    { label: 'PICKUP', status: ['pending', 'accepted', 'preparing', 'ready_for_pickup'] },
    { label: 'IN TRANSIT', status: ['delivering', 'picked_up'] },
    { label: 'DELIVERY', status: ['completed', 'delivered'] }
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
    <div className="min-h-screen bg-[#F8F8F8] pb-24">
      <div className="container-responsive py-10 lg:py-16">
        
        {/* Back Link & Order ID */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
           <div className="space-y-4">
              <button 
                onClick={() => router.push('/profile')}
                className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#0A0A0A] transition-colors"
              >
                 <ChevronLeft size={16} />
                 BACK TO MY ORDERS
              </button>
              <h1 className="text-4xl lg:text-5xl font-black text-[#0A0A0A] tracking-tighter">Order #DV-{String(id).substring(0, 4).toUpperCase()}</h1>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ESTIMATED ARRIVAL</p>
              <p className="text-4xl lg:text-5xl font-black text-[#FF5A3C] tracking-tighter italic">12:45 PM</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
           
           {/* Left Column: Map & Status Overlay */}
           <div className="lg:col-span-8 space-y-10">
              <div className="relative aspect-[16/10] bg-[#E5E7EB] rounded-[3rem] overflow-hidden group border border-gray-100 shadow-sm">
                 {/* Mock Map Background */}
                 <div className="absolute inset-0 bg-[#D1D5DB] flex items-center justify-center">
                    <div className="relative">
                       <div className="w-32 h-32 bg-[#FF5A3C]/20 rounded-full animate-ping absolute -inset-0" />
                       <div className="w-24 h-24 bg-[#FF5A3C] rounded-full flex items-center justify-center shadow-2xl shadow-[#FF5A3C]/30 relative z-10">
                          <MapPin size={48} className="text-white fill-white" />
                       </div>
                    </div>
                 </div>

                 {/* Location Badges Overlay */}
                 <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-md rounded-[2rem] p-6 lg:p-8 flex items-center justify-between border border-white/20 shadow-2xl">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 bg-[#FF5A3C]/10 rounded-2xl flex items-center justify-center text-[#FF5A3C]">
                          {order.drivers ? <Car size={24} /> : <Package size={24} />}
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                             {order.drivers ? 'CURRENT LOCATION' : 'STATUS'}
                          </p>
                          <p className="text-sm font-black text-[#0A0A0A]">
                             {order.drivers ? 'Mission District, 18th St' : `Preparing at ${order.stores?.name || 'Restaurant'}`}
                          </p>
                       </div>
                    </div>
                    {order.drivers && (
                       <>
                         <div className="h-full w-px bg-gray-100 hidden md:block" />
                         <div className="hidden md:block text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">DISTANCE</p>
                            <p className="text-sm font-black text-[#0A0A0A]">1.2 miles away</p>
                         </div>
                       </>
                    )}
                 </div>
              </div>

              {/* Delivery Status Timeline */}
              <div className="bg-white rounded-[3rem] p-10 lg:p-14 border border-gray-100 shadow-sm">
                 <div className="flex items-center justify-between mb-16">
                    <h2 className="text-2xl font-black text-[#0A0A0A] tracking-tighter">Delivery Status</h2>
                    <span className="bg-[#FFF9F8] text-[#FF5A3C] px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#FFE7E2]">
                       {order.status.replace('_', ' ')}
                    </span>
                 </div>

                 <div className="relative flex items-center justify-between px-4 lg:px-10">
                    <div className="absolute left-[5%] right-[5%] h-1 bg-gray-100 top-1/2 -translate-y-1/2 -z-0" />
                    <div 
                      className="absolute left-[5%] h-1 bg-[#FF5A3C] top-1/2 -translate-y-1/2 -z-0 transition-all duration-1000" 
                      style={{ width: `${currentStageIndex === 0 ? '0%' : currentStageIndex === 1 ? '45%' : '90%'}` }}
                    />

                    {stages.map((stage, idx) => (
                       <div key={stage.label} className="relative z-10 flex flex-col items-center gap-4">
                          <div className={`w-14 h-14 lg:w-20 lg:h-20 rounded-full flex items-center justify-center border-4 border-white shadow-xl transition-all duration-500 ${
                            idx <= currentStageIndex ? 'bg-[#FF5A3C] text-white' : 'bg-[#E5E7EB] text-gray-400'
                          }`}>
                             {idx === 0 ? <Package size={idx <= currentStageIndex ? 32 : 28} /> : 
                              idx === 1 ? <Car size={idx <= currentStageIndex ? 32 : 28} /> : 
                              <CheckCircle size={idx <= currentStageIndex ? 32 : 28} />}
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${idx <= currentStageIndex ? 'text-[#FF5A3C]' : 'text-gray-300'}`}>
                             {stage.label}
                          </span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Right Column: Driver & Details */}
           <div className="lg:col-span-4 space-y-10">
              {/* Driver Card */}
              <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm text-center">
                 {!order.drivers ? (
                   <div className="py-6 space-y-6">
                      <div className="relative inline-block">
                         <div className="w-28 h-28 rounded-full bg-gray-50 flex items-center justify-center border-4 border-dashed border-gray-100 group">
                            <Car size={40} className="text-gray-200 animate-bounce" />
                         </div>
                         <div className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full border border-gray-100 flex items-center justify-center text-[#FF5A3C] shadow-sm">
                            <Clock size={16} className="animate-pulse" />
                         </div>
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-[#0A0A0A] tracking-tighter mb-2 italic">Finding courier...</h3>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed px-4">
                            We're matching your order with the <span className="text-[#FF5A3C]">best driver</span> nearby.
                         </p>
                      </div>
                      <div className="pt-4">
                         <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                            <motion.div 
                               initial={{ x: '-100%' }}
                               animate={{ x: '100%' }}
                               transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                               className="w-1/2 h-full bg-[#FF5A3C] rounded-full" 
                            />
                         </div>
                      </div>
                   </div>
                 ) : (
                   <>
                     <div className="relative inline-block mb-6">
                        <img 
                          src={`https://i.pravatar.cc/150?u=${order.drivers.user_id}`} 
                          alt="Driver"
                          className="w-28 h-28 rounded-full border-4 border-gray-50 shadow-lg object-cover"
                        />
                        <div className="absolute top-1 right-1 w-8 h-8 bg-white rounded-full border border-gray-100 flex items-center justify-center text-[#FF5A3C] shadow-md">
                           <ShieldCheck size={16} fill="currentColor" />
                        </div>
                     </div>
                     
                     <h3 className="text-2xl font-black text-[#0A0A0A] tracking-tighter mb-2">{order.drivers.users.name}</h3>
                     <div className="flex items-center justify-center gap-1 mb-10">
                        {[1,2,3,4,5].map(s => <Star key={s} size={14} className="text-[#FF5A3C]" fill="currentColor" />)}
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">5.0 Rating</span>
                     </div>
    
                     <div className="space-y-4">
                        <button className="w-full h-16 bg-[#FF5A3C] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-[#E84A2C] transition-all shadow-xl shadow-[#FF5A3C]/20">
                           <MessageCircle size={18} fill="currentColor" />
                           Message {order.drivers.users.name.split(' ')[0]}
                        </button>
                        <button className="w-full h-16 bg-gray-50 text-[#0A0A0A] rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-gray-100 transition-all border border-gray-100">
                           <Phone size={18} fill="currentColor" />
                           Call Driver
                        </button>
                     </div>
                   </>
                 )}
              </div>

              {/* Order Details Bill */}
              <div className="bg-[#F3F4F6]/50 rounded-[3rem] p-10 border border-gray-100">
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-10">ORDER DETAILS</h3>
                 
                 <div className="space-y-8 mb-12">
                    {order.order_items?.map(item => (
                       <div key={item.id} className="flex justify-between items-start">
                          <div className="flex gap-4">
                             <span className="text-[#FF5A3C] font-black text-lg">{item.quantity}x</span>
                             <span className="text-[#0A0A0A] font-bold text-sm leading-tight max-w-[140px]">{item.products.name}</span>
                          </div>
                          <span className="text-[#0A0A0A] font-black text-sm">${(item.quantity * item.products.price).toFixed(2)}</span>
                       </div>
                    )) || (
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                           <span className="text-[#FF5A3C] font-black text-lg">1x</span>
                           <span className="text-[#0A0A0A] font-bold text-sm leading-tight max-w-[140px]">Organic Quinoa Bowl</span>
                        </div>
                        <span className="text-[#0A0A0A] font-black text-sm">$18.50</span>
                      </div>
                    )}
                 </div>

                 <div className="pt-8 border-t border-gray-200 flex justify-between items-baseline">
                    <span className="text-xl font-black text-[#0A0A0A] tracking-tighter uppercase">Total</span>
                    <span className="text-3xl font-black text-[#0A0A0A] tracking-tighter">${order.total_price.toFixed(2)}</span>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
