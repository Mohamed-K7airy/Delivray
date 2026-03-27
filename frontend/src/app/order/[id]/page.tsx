'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Package, Navigation, CheckCircle, Car, Clock, ShieldCheck, ChevronLeft, Star, Phone, MessageCircle, MapPin, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useSocket } from '@/context/SocketContext';
import { API_URL } from '@/config/api';
import { apiClient } from '@/lib/apiClient';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div className="h-[450px] w-full bg-gray-50 animate-pulse flex items-center justify-center text-[10px] uppercase font-black tracking-widest text-[#888888]">Initializing Map Tracking...</div>
});

interface Order {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
  order_items?: {
    id: string;
    quantity: number;
    products: { name: string; price: number };
  }[];
  drivers?: {
    user_id: string;
    users: { name: string };
  };
  stores?: { name: string; location_lat: number; location_lng: number };
  delivery_lat: number;
  delivery_lng: number;
}

export default function OrderTracking() {
  const { id } = useParams();
  const { token, _hasHydrated } = useAuthStore();
  const { socket } = useSocket();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number; steps: any[] } | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) return router.push('/login');

    const fetchOrder = async () => {
      try {
        const data = await apiClient(`/orders/${id}`);
        if (data) setOrder(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrder();

    if (socket) {
      socket.emit('join_order', id);
      
      const handleUpdate = (updated: Order) => setOrder(updated);
      const handleLocation = (data: { lat: number; lng: number }) => {
        setDriverPos([data.lat, data.lng]);
      };

      socket.on('order_status_updated', handleUpdate);
      socket.on('driver_location', handleLocation);

      return () => { 
        socket.off('order_status_updated', handleUpdate); 
        socket.off('driver_location', handleLocation);
      };
    }
  }, [id, token, router, _hasHydrated, socket]);

  const handleCancelOrder = async () => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const data = await apiClient(`/orders/${id}/cancel`, {
        method: 'POST',
      });

      if (data) {
        setOrder(data);
        toast.success('Order cancelled successfully');
      }
    } catch (err: any) {
      // apiClient handles toasts
    }
  };

  const stages = [
    { label: 'Order Placed',  icon: <Package size={20} />,      statuses: ['pending', 'accepted'] },
    { label: 'Preparing',     icon: <Clock size={20} />,         statuses: ['preparing', 'ready_for_pickup'] },
    { label: 'On the Way',    icon: <Car size={20} />,           statuses: ['delivering', 'picked_up'] },
    { label: 'Delivered',     icon: <CheckCircle size={20} />,   statuses: ['completed', 'delivered'] },
  ];

  const currentStageIndex = stages.findIndex(s => s.statuses.includes(order?.status || ''));
  const isCancelled = order?.status === 'cancelled';
  const eta = isCancelled ? 'CANCELLED' : (order?.created_at ? new Date(new Date(order.created_at).getTime() + 35 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—');

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#d97757] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] pb-24">
      <div className="container-responsive py-10 lg:py-16 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 text-[10px] font-black text-[#888888] uppercase tracking-widest hover:text-[#111111] transition-colors mb-3"
            >
              <ChevronLeft size={14} /> Back to Orders
            </button>
            <h1 className="text-3xl lg:text-4xl font-black text-[#111111] tracking-tighter">
              Order <span className="text-[#d97757]">#{String(id).substring(0, 8).toUpperCase()}</span>
            </h1>
            <p className="text-xs font-bold text-[#888888] mt-1">{order.stores?.name || 'Restaurant'} · Placed {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div className="bg-[#fef3f2] border border-[#fee2e2] rounded-2xl px-6 py-4 text-right">
            <p className="text-[9px] font-black text-[#d97757] uppercase tracking-widest mb-1">Est. Arrival</p>
            <p className="text-2xl font-black text-[#111111] tracking-tighter">{eta}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Status Timeline + Order Items */}
          <div className="lg:col-span-8 space-y-6">
            
            {(order.status === 'delivering' || order.status === 'picked_up' || order.status === 'delivered' || order.status === 'completed') && (
               <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden relative h-[450px] mb-8">
                  <div className="h-full relative">
                    <MapView 
                      center={driverPos || [order.delivery_lat, order.delivery_lng]}
                      zoom={15}
                      markers={[
                        ...(driverPos ? [{ 
                          position: driverPos as [number, number], 
                          type: 'driver' as const, 
                          label: socket?.connected ? 'Live Courier' : 'Last Known Location' 
                        }] : []),
                        { 
                          position: [order.stores?.location_lat, order.stores?.location_lng] as [number, number], 
                          type: 'store' as const, 
                          label: order.stores?.name 
                        },
                        { 
                          position: [order.delivery_lat, order.delivery_lng] as [number, number], 
                          type: 'customer' as const, 
                          label: 'Your Doorstep' 
                        }
                      ]}
                      routingPoints={driverPos ? [
                        driverPos,
                        [order.stores?.location_lat ?? 0, order.stores?.location_lng ?? 0],
                        [order.delivery_lat, order.delivery_lng]
                      ] : undefined}
                      onRouteUpdate={setRouteInfo}
                    />
                    
                    {/* Map Overlay Info (Bottom) */}
                    <div className="absolute bottom-6 left-6 right-6 z-[400] pointer-events-none">
                       <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/50 flex items-center justify-between pointer-events-auto">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-[#d97757] rounded-xl flex items-center justify-center text-white shadow-lg">
                                <Navigation size={18} className="animate-pulse" />
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest leading-none mb-1">Live Courier Tracking</p>
                                <p className="text-sm font-black text-[#111111] tracking-tight">
                                   {routeInfo && routeInfo.steps && routeInfo.steps.length > 0 
                                     ? `En route: ${routeInfo.steps[0].name || 'Heading your way'}`
                                     : driverPos ? 'Calculating fastest route...' : 'Waiting for courier signal...'}
                                </p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-sm font-black text-[#d97757] tracking-tight">
                                {routeInfo ? (routeInfo.distance / 1000).toFixed(1) : '0.0'} km
                             </p>
                             <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest">
                                ~{routeInfo ? Math.round(routeInfo.duration / 60) : eta} mins
                             </p>
                          </div>
                       </div>
                    </div>

                    {/* Signal Status (Top) */}
                    <div className="absolute top-8 left-8 z-[400] bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/50 shadow-2xl flex items-center gap-3">
                       <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                       <span className="text-[11px] font-black text-[#111111] uppercase tracking-widest">Live Courier Signal</span>
                    </div>
                  </div>
               </div>
            )}

            {/* Progress Steps */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-[#111111] tracking-tighter">Delivery Status</h2>
                <span className="bg-[#fef3f2] text-[#d97757] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-[#fee2e2]">
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs font-bold text-[#888888] mb-8">
                {currentStageIndex >= 0 ? stages[currentStageIndex]?.label : 'Processing'} — updates in real time
              </p>

              {/* Steps */}
              <div className="relative">
                {/* Track line */}
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />
                <div
                  className="absolute left-5 top-5 w-0.5 bg-[#d97757] transition-all duration-1000"
                  style={{ height: `${Math.max(0, (currentStageIndex / (stages.length - 1)) * 100)}%` }}
                />

                <div className="space-y-6">
                  {stages.map((stage, idx) => {
                    const done = idx <= currentStageIndex;
                    const active = idx === currentStageIndex;
                    return (
                      <div key={stage.label} className="flex items-center gap-5 relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0 z-10 ${
                          done ? 'bg-[#d97757] border-[#d97757] text-white' : 'bg-white border-gray-200 text-gray-300'
                        } ${active ? 'ring-4 ring-[#d97757]/20' : ''}`}>
                          {stage.icon}
                        </div>
                        <div>
                          <p className={`text-sm font-black tracking-tight ${done ? 'text-[#111111]' : 'text-gray-300'}`}>{stage.label}</p>
                          {active && <p className="text-[10px] font-bold text-[#d97757] uppercase tracking-widest mt-0.5 animate-pulse">In Progress</p>}
                        </div>
                        {done && !active && (
                          <CheckCircle size={16} className="text-[#d97757] ml-auto" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Delivery address info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="w-11 h-11 bg-[#fef3f2] rounded-xl flex items-center justify-center text-[#d97757] shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest mb-1">Delivering To</p>
                <p className="text-sm font-black text-[#111111]">Your saved address</p>
                <p className="text-xs font-bold text-[#888888]">~1.2 miles from the restaurant</p>
              </div>
              <button onClick={() => router.push('/profile')} className="ml-auto text-[9px] font-black text-[#d97757] uppercase tracking-wider hover:underline flex items-center gap-1">
                <RotateCcw size={12} /> Re-order
              </button>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <h3 className="text-base font-black text-[#111111] tracking-tighter">Order Items</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {(order.order_items || []).map(item => (
                  <div key={item.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <span className="w-6 h-6 bg-[#fef3f2] text-[#d97757] rounded-lg flex items-center justify-center text-[11px] font-black">{item.quantity}</span>
                      <span className="text-sm font-bold text-[#111111]">{item.products.name}</span>
                    </div>
                    <span className="text-sm font-black text-[#111111]">${(item.quantity * item.products.price).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-6 py-5 bg-gray-50">
                  <span className="text-sm font-black text-[#111111] uppercase tracking-wider">Total</span>
                  <span className="text-lg font-black text-[#d97757]">${order.total_price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Driver Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
              {!order.drivers ? (
                <div className="py-4 space-y-5">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
                      <Car size={32} className="text-gray-200 animate-bounce" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-7 h-7 bg-white rounded-full border border-gray-100 flex items-center justify-center text-[#d97757] shadow-sm">
                      <Clock size={14} className="animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#111111] tracking-tighter mb-2">Finding Courier...</h3>
                    <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest leading-relaxed">
                      Matching with the <span className="text-[#d97757]">best driver</span> nearby
                    </p>
                  </div>
                  <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                      className="w-1/2 h-full bg-[#d97757] rounded-full"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative inline-block mb-5">
                    <div className="w-20 h-20 rounded-full bg-[#fef3f2] border-4 border-white shadow-lg flex items-center justify-center">
                      <span className="text-2xl font-black text-[#d97757]">{order.drivers.users.name.slice(0,2).toUpperCase()}</span>
                    </div>
                    <div className="absolute top-0 right-0 w-7 h-7 bg-white rounded-full border border-gray-100 flex items-center justify-center text-[#d97757] shadow-md">
                      <ShieldCheck size={14} fill="currentColor" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-[#111111] tracking-tighter mb-1">{order.drivers.users.name}</h3>
                  <div className="flex items-center justify-center gap-0.5 mb-6">
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} className="text-[#d97757]" fill="currentColor" />)}
                    <span className="text-[10px] font-black text-[#888888] ml-2">5.0 Rating</span>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full h-12 bg-[#d97757] text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-[#c2654a] transition-all shadow-sm">
                      <MessageCircle size={16} fill="currentColor" /> Message Driver
                    </button>
                    <button className="w-full h-12 bg-gray-50 text-[#111111] rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-gray-100 transition-all border border-gray-100">
                      <Phone size={16} fill="currentColor" /> Call Driver
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Support */}
            <div className="bg-[#111111] rounded-2xl p-6 text-white">
              <p className="text-[9px] font-black text-[#d97757] uppercase tracking-widest mb-2">Need Help?</p>
              <p className="text-sm font-black tracking-tight mb-4">Issue with your order?</p>
              <div className="space-y-3">
                <button className="w-full h-10 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                  Contact Support
                </button>
                {(order.status === 'pending') && (
                  <button
                    onClick={handleCancelOrder}
                    className="w-full h-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/20"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
