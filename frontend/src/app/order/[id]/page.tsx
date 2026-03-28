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
import { RouteUpdateData } from '@/components/MapView';

const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div className="h-[450px] w-full bg-gray-50 animate-pulse flex items-center justify-center text-[10px] uppercase font-black tracking-widest text-[#888888]">Initializing Map Tracking...</div>
});

import RatingModal from '@/components/RatingModal';
import { AnimatePresence } from 'framer-motion';

interface Order {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
  driver_id?: string;
  store_id?: string;
  order_items?: {
    id: string;
    quantity: number;
    products: { name: string; price: number };
  }[];
  drivers?: {
    user_id: string;
    users: { name: string };
  };
  stores?: { 
    id: string;
    name: string; 
    location_lat: number; 
    location_lng: number;
  };
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
  const [routeInfo, setRouteInfo] = useState<RouteUpdateData | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) return router.push('/login');

    const fetchOrder = async () => {
      try {
        const data = await apiClient(`/orders/${id}`);
        if (data) {
          setOrder(data);
          if (data.status === 'delivered' && !hasRated) {
            setShowRating(true);
          }
        }
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
  const eta = isCancelled ? 'CANCELLED' : (order?.created_at ? new Date(new Date(order.created_at).getTime() + 35 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—');  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="container-responsive py-16 lg:py-24 space-y-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
          <div className="space-y-4">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors"
            >
              <ChevronLeft size={14} /> Protocol History
            </button>
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tighter leading-none">
              Deployment <span className="text-slate-300">#{String(id).substring(0, 8).toUpperCase()}</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">
              Origin: {order.stores?.name || 'Authorized Hub'} · Authenticated {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl px-10 py-6 text-right shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Estimated Fulfillment</p>
            <p className="text-3xl font-bold text-slate-900 tracking-tighter tabular-nums">{eta}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left: Status Timeline + Order Items */}
          <div className="lg:col-span-8 space-y-10">
            
            {(order.status === 'delivering' || order.status === 'picked_up' || order.status === 'delivered' || order.status === 'completed') && (
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative h-[500px]">
                  <div className="h-full relative">
                    <MapView 
                      center={driverPos || [order.delivery_lat, order.delivery_lng]}
                      zoom={15}
                      markers={[
                        ...(driverPos ? [{ 
                          position: driverPos as [number, number], 
                          type: 'driver' as const, 
                          label: socket?.connected ? 'UNIT: ALPHA' : 'LAST SIGNAL' 
                        }] : []),
                        { 
                          position: [order.stores?.location_lat, order.stores?.location_lng] as [number, number], 
                          type: 'store' as const, 
                          label: 'HUB ORI' 
                        },
                        { 
                          position: [order.delivery_lat, order.delivery_lng] as [number, number], 
                          type: 'customer' as const, 
                          label: 'ENDPOINT' 
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
                    <div className="absolute inset-x-6 bottom-6 z-[400] pointer-events-none">
                       <div className="bg-slate-900/95 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/10 flex items-center justify-between pointer-events-auto text-white">
                          <div className="flex items-center gap-5">
                             <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/5 shadow-inner">
                                <Navigation size={24} className="animate-pulse" />
                             </div>
                             <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">Telemetry Stream</p>
                                <p className="text-base font-bold tracking-tight">
                                   {routeInfo && routeInfo.steps && routeInfo.steps.length > 0 
                                     ? `Transit: ${routeInfo.steps[0].name || 'Maintaining Vector'}`
                                     : driverPos ? 'Calculating Kinematics...' : 'Awaiting Encryption...'}
                                </p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xl font-bold tracking-tighter tabular-nums">
                                {routeInfo ? (routeInfo.distance / 1000).toFixed(1) : '0.0'} KM
                             </p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                DELTA: {routeInfo ? Math.round(routeInfo.duration / 60) : eta} MIN
                             </p>
                          </div>
                       </div>
                    </div>

                    {/* Signal Status (Top) */}
                    <div className="absolute top-8 left-8 z-[400] bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-100 shadow-xl flex items-center gap-4">
                       <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
                       <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.3em]">Telemetry: Online</span>
                    </div>
                  </div>
               </div>
            )}

            {/* Progress Steps */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-12">
              <div className="flex items-center justify-between gap-6 border-b border-slate-50 pb-8">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Operational Logic.</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time state verification</p>
                </div>
                <div className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
                  {order.status.replace(/_/g, ' ')}
                </div>
              </div>

              {/* Steps */}
              <div className="relative pt-4">
                {/* Track line */}
                <div className="absolute left-[24px] top-6 bottom-6 w-1 bg-slate-50 rounded-full" />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(0, (currentStageIndex / (stages.length - 1)) * 100)}%` }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute left-[24px] top-6 w-1 bg-slate-900 rounded-full shadow-[0_0_8px_rgba(15,23,42,0.2)]"
                />

                <div className="space-y-10">
                  {stages.map((stage, idx) => {
                    const done = idx <= currentStageIndex;
                    const active = idx === currentStageIndex;
                    return (
                      <div key={stage.label} className="flex items-center gap-8 relative">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shrink-0 z-10 shadow-sm ${
                          done ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-200'
                        } ${active ? 'ring-8 ring-slate-50' : ''}`}>
                          {stage.icon}
                        </div>
                        <div className="flex-1">
                          <p className={`text-lg font-bold tracking-tight uppercase ${done ? 'text-slate-900' : 'text-slate-200'}`}>{stage.label}</p>
                          {active && (
                            <div className="flex items-center gap-2 mt-1">
                               <div className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-ping" />
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Processing</p>
                            </div>
                          )}
                        </div>
                        {done && !active && (
                          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 shadow-inner">
                             <CheckCircle size={14} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Delivery address info */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm flex items-center gap-8">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 shrink-0 shadow-inner">
                <MapPin size={28} />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Endpoint Destination</p>
                <p className="text-xl font-bold text-slate-900 tracking-tight">{order.delivery_address || 'Authorized Secure Location'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Logistics Radius: 1.2 MI</p>
              </div>
              <button 
                onClick={() => router.push('/')} 
                className="bg-slate-50 text-slate-900 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-slate-100 shadow-sm hover:bg-slate-900 hover:text-white transition-all active:scale-95"
              >
                New Protocol
              </button>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-50">
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-widest">Inventory List</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {(order.order_items || []).map(item => (
                  <div key={item.id} className="flex items-center justify-between px-10 py-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-6">
                      <span className="w-10 h-10 bg-slate-50 border border-slate-100 text-slate-900 rounded-xl flex items-center justify-center text-xs font-bold tabular-nums shadow-inner">{item.quantity}</span>
                      <span className="text-base font-bold text-slate-900 tracking-tight">{item.products.name}</span>
                    </div>
                    <span className="text-base font-bold text-slate-900 tabular-nums">${(item.quantity * item.products.price).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-10 py-10 bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Total Valuation</span>
                  <span className="text-4xl font-bold text-slate-900 tracking-tighter tabular-nums">${order.total_price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Driver Card */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm text-center space-y-10">
              {!order.drivers ? (
                <div className="py-10 space-y-8">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200 shadow-inner">
                      <Car size={40} className="text-slate-200 animate-pulse" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-900 shadow-xl">
                      <Clock size={20} className="animate-spin" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tighter mb-2">Syncing Courier...</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                      IDENTIFYING HIGHEST RANKED <span className="text-slate-900">OPERATOR</span>
                    </p>
                  </div>
                  <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      className="w-1/2 h-full bg-slate-900 rounded-full shadow-[0_0_8px_rgba(15,23,42,0.3)]"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-8">
                    <div className="relative inline-block">
                      <div className="w-28 h-28 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-xl p-1 overflow-hidden">
                        <div className="w-full h-full rounded-[2rem] bg-slate-900 flex items-center justify-center text-white text-3xl font-bold">
                           {order.drivers.users.name.slice(0,2).toUpperCase()}
                        </div>
                      </div>
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-900 shadow-2xl">
                        <ShieldCheck size={20} fill="rgba(15,23,42,0.1)" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-slate-900 tracking-tighter mb-1">{order.drivers.users.name}.</h3>
                      <div className="flex items-center justify-center gap-1.5 mb-4">
                        <div className="flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                          <Star size={12} className="text-slate-900 fill-slate-900" />
                          <span className="text-[10px] font-bold text-slate-900 tabular-nums">5.0</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">RANK: GLOBAL ALPHA</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 pt-4">
                    <button className="h-16 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-xl active:scale-95 group">
                      <MessageCircle size={18} className="group-hover:rotate-12 transition-transform" /> ENCRYPTED CHANNEL
                    </button>
                    <button className="h-16 bg-white text-slate-900 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 hover:bg-slate-50 transition-all border border-slate-100 shadow-sm active:scale-95 group">
                      <Phone size={18} className="group-hover:rotate-12 transition-transform" /> VOICE LINK
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Support */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10 space-y-8">
                 <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-3">Protocol Defense</p>
                  <p className="text-2xl font-bold tracking-tight leading-none mb-1">Issue Detected?</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Global support network active.</p>
                 </div>
                 <div className="space-y-4">
                  <button className="w-full h-14 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all border border-white/5 active:scale-95">
                    INITIATE SUPPORT
                  </button>
                  {(order.status === 'pending') && (
                    <button
                      onClick={handleCancelOrder}
                      className="w-full h-14 bg-transparent hover:bg-red-500/10 text-red-400 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all border border-red-500/20 active:scale-95"
                    >
                      ABORT DEPLOYMENT
                    </button>
                  )}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <RatingModal 
        isOpen={showRating} 
        onClose={() => {
          setShowRating(false);
          setHasRated(true);
        }}
        orderId={id as string}
        driverId={order?.driver_id}
        storeId={order?.store_id}
        driverName={order?.drivers?.users?.name}
        storeName={order?.stores?.name}
      />
    </div>
  );
}
