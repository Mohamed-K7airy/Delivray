'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import {
  Navigation, MapPin, Store as StoreIcon, Truck, Wallet,
  Clock, ShieldCheck, ChevronRight, Zap, AlertCircle,
  Package, TrendingUp, CheckCircle2, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSocket } from '@/context/SocketContext';
import { apiClient } from '@/lib/apiClient';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-50 animate-pulse flex items-center justify-center text-[10px] uppercase font-black tracking-widest text-[#888888]">Initializing Map Data...</div>
});

export default function DriverDashboard() {
  const { token, user } = useAuthStore();
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  const [availableOrder, setAvailableOrder] = useState<any | null>(null);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(24);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [stats, setStats] = useState({ earnings: 0, deliveries: 0, delivery_fee: 3.00 });
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const [isCentering, setIsCentering] = useState(true);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number; steps: any[] } | null>(null);

  useEffect(() => {
    if (!token || user?.role !== 'driver') return router.push('/login');

    apiClient('/delivery/stats').then(data => {
      if (data) setStats({ earnings: data.earnings, deliveries: data.deliveries, delivery_fee: data.delivery_fee || 3.00 });
    }).catch(() => {});

    apiClient('/orders/driver').then(data => {
      if (data && Array.isArray(data)) {
        const current = data.find((o: any) => o.status === 'delivering' || o.status === 'picked_up');
        if (current) setActiveOrder(current);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token, user, router]);

  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.on('order_ready_for_pickup', (order: any) => {
      setAvailableOrder(order);
      setCountdown(24);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(timerRef.current!); setAvailableOrder(null); return 0; }
          return prev - 1;
        });
      }, 1000);
    });
    return () => { socket.off('order_ready_for_pickup'); if (timerRef.current) clearInterval(timerRef.current); };
  }, [socket, isConnected]);
  
  // Real-time geolocation watcher for active delivery
  useEffect(() => {
    if (!activeOrder || !isConnected) return;
    
    console.log(`[Driver GPS] Tracking enabled for Order: ${activeOrder.id}`);
    
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentPos([latitude, longitude]);

        // Throttle GPS updates to 5 seconds
        const now = Date.now();
        if (now - lastUpdateRef.current > 5000) {
          if (socket && isConnected) {
            socket.emit('update_location', {
              lat: latitude,
              lng: longitude,
              orderId: activeOrder.id
            });
            lastUpdateRef.current = now;
          }
        }
      },
      (err) => console.error('GPS Error:', err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [activeOrder, socket, isConnected]);

  const acceptOrder = async (orderId: string) => {
    try {
      const data = await apiClient(`/delivery/accept-order/${orderId}`, { method: 'POST' });
      if (data) { setActiveOrder(data); setAvailableOrder(null); toast.success('Order accepted! En route to pickup.'); }
    } catch (err: any) { toast.error('Failed to accept order.'); }
  };

  const completeOrder = async () => {
    if (!activeOrder) return;
    try {
      const data = await apiClient(`/delivery/complete-order/${activeOrder.id}`, { method: 'PATCH' });
      if (data) {
        toast.success(`+$${stats.delivery_fee.toFixed(2)} added to your earnings!`);
        setActiveOrder(null);
        setStats(prev => ({ ...prev, earnings: prev.earnings + prev.delivery_fee, deliveries: prev.deliveries + 1 }));
      }
    } catch (err: any) { toast.error('Failed to complete delivery.'); }
  };

  return (
    <div className="space-y-6 pb-24">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#111111] tracking-tighter">
            Hey, <span className="text-[#d97757]">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mt-0.5">
            {isConnected ? '● Online · Ready for deliveries' : '○ Connecting to dispatch...'}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
          isConnected ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-200 text-gray-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          {isConnected ? 'On Duty' : 'Offline'}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Today's Earnings", value: `$${stats.earnings.toFixed(2)}`, icon: <Wallet size={18} />, accent: '#d97757', bg: '#fef3f2' },
          { label: 'Deliveries Done', value: stats.deliveries, icon: <Package size={18} />, accent: '#2563eb', bg: '#eff6ff' },
          { label: 'Fee per Delivery', value: `$${stats.delivery_fee.toFixed(2)}`, icon: <DollarSign size={18} />, accent: '#16a34a', bg: '#f0fdf4' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg, color: s.accent }}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-black text-[#111111] tracking-tighter leading-none">{s.value}</p>
              <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Active Delivery or Idle */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 animate-pulse flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-[#d97757] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeOrder ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Active order banner */}
              <div className="bg-[#d97757] px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Active Delivery</span>
                </div>
                <span className="text-[10px] font-black text-white/70 uppercase tracking-wider">#{activeOrder.id.slice(0, 8).toUpperCase()}</span>
              </div>

              <div className="p-8 space-y-8">
                {/* Payout */}
                <div className="flex items-center justify-between p-4 bg-[#f0fdf4] rounded-xl border border-green-100">
                  <div>
                    <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Your Delivery Payout</p>
                    <p className="text-3xl font-black text-green-700 tracking-tighter">${stats.delivery_fee.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                    <Wallet size={24} />
                  </div>
                </div>


                {/* Map Delivery Card UI */}
                <div className="relative group/map rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-64 bg-gray-50 mb-8">
                   <MapView 
                      center={currentPos || [activeOrder.stores?.location_lat || 0, activeOrder.stores?.location_lng || 0]}
                      zoom={15}
                      autoCenter={isCentering}
                      markers={[
                        ...(currentPos ? [{ position: currentPos as [number, number], type: 'driver' as const, label: 'You' }] : []),
                        ...(activeOrder.stores ? [{ position: [activeOrder.stores.location_lat, activeOrder.stores.location_lng] as [number, number], type: 'store' as const, label: activeOrder.stores.name }] : []),
                        ...(activeOrder.delivery_lat ? [{ position: [activeOrder.delivery_lat, activeOrder.delivery_lng] as [number, number], type: 'customer' as const, label: 'Customer' }] : [])
                      ]}
                      routingPoints={currentPos && activeOrder.stores ? [
                        currentPos,
                        [activeOrder.stores.location_lat, activeOrder.stores.location_lng],
                        [activeOrder.delivery_lat, activeOrder.delivery_lng]
                      ] : undefined}
                      onRouteUpdate={setRouteInfo}
                   />
                   
                   {/* Google Maps Style Directions Overlay */}
                   {routeInfo && routeInfo.steps && routeInfo.steps.length > 0 && (
                      <div className="absolute top-4 left-4 right-4 z-[450] pointer-events-none">
                         <motion.div 
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="bg-[#111111]/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4 pointer-events-auto"
                         >
                            <div className="w-12 h-12 bg-[#d97757] rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
                               <Navigation size={24} className={routeInfo.steps[0]?.maneuver?.modifier?.includes('left') ? '-rotate-90' : routeInfo.steps[0]?.maneuver?.modifier?.includes('right') ? 'rotate-90' : ''} />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-[10px] font-black text-[#d97757] uppercase tracking-[0.2em] mb-1">Next Step</p>
                               <p className="text-sm font-black text-white truncate">
                                  {routeInfo.steps[0]?.name || 'Continue straight'} 
                                  <span className="text-white/40 ml-2 font-bold uppercase tracking-widest text-[8px]">
                                     in {(routeInfo.steps[0]?.distance / 1000).toFixed(1)} km
                                  </span>
                               </p>
                            </div>
                         </motion.div>
                      </div>
                   )}

                   {/* Map Controls Overlay */}
                   <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 opacity-0 group-hover/map:opacity-100 transition-opacity">
                      <button 
                         onClick={() => setIsCentering(!isCentering)}
                         className={`w-10 h-10 rounded-xl shadow-lg border flex items-center justify-center transition-all ${
                            isCentering ? 'bg-[#d97757] border-[#d97757] text-white' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                         }`}
                         title={isCentering ? "Auto-centering On" : "Auto-centering Off"}
                      >
                         <Navigation size={18} className={isCentering ? "animate-pulse" : ""} />
                      </button>
                   </div>

                    {/* Routing Indicator Banner (Bottom) */}
                    <div className="absolute bottom-4 left-4 right-4 z-[400] pointer-events-none">
                       <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-white/50 flex items-center justify-between pointer-events-auto">
                          <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-[#111111]">OSRM Smart Path</p>
                                 <p className="text-[9px] font-bold text-[#888888]">{routeInfo ? 'Road-optimized route active' : 'Calculating path...'}</p>
                              </div>
                          </div>
                          <div className="text-right">
                             <p className="text-sm font-black text-[#d97757] tracking-tight">
                                {routeInfo ? (routeInfo.distance / 1000).toFixed(1) : '0.0'} km
                             </p>
                             <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest">
                                ~{routeInfo ? Math.round(routeInfo.duration / 60) : '0'} mins
                             </p>
                          </div>
                       </div>
                    </div>
                </div>

                {/* Status UI Detail */}
                <div className="rounded-2xl border border-gray-100 overflow-hidden bg-gray-50/50">
                   {/* Pickup row */}
                   <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 bg-white shadow-[0_4px_12px_-5px_rgba(0,0,0,0.05)] relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-[#fef3f2] border border-[#fee2e2] flex items-center justify-center shrink-0">
                      <StoreIcon size={18} className="text-[#d97757]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest mb-0.5">Pickup Restaurant</p>
                      <p className="text-sm font-black text-[#111111] truncate">{activeOrder.stores?.name || 'Restaurant'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded-full text-[8px] font-black uppercase tracking-wider">
                         Arrived at store
                       </span>
                    </div>
                  </div>
                  {/* Delivery row */}
                  <div className="flex items-center gap-4 px-6 py-5">
                    <div className="w-10 h-10 rounded-xl bg-[#eff6ff] border border-blue-100 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest mb-0.5">Deliver to Customer</p>
                      <p className="text-sm font-black text-[#111111] truncate">{activeOrder.delivery_address || 'Customer Address'}</p>
                    </div>
                    <button 
                       onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${activeOrder.delivery_lat},${activeOrder.delivery_lng}`, '_blank')}
                      className="h-9 px-4 bg-[#111111] text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-transform active:scale-95"
                    >
                      <Navigation size={12} /> External GPS
                    </button>
                  </div>
                </div>

                {/* Complete button */}
                <button onClick={completeOrder}
                  className="w-full h-14 bg-[#d97757] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-md hover:bg-[#c2654a] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <ShieldCheck size={20} /> Mark as Delivered
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-6">
                <Truck size={44} />
              </div>
              <h3 className="text-xl font-black text-[#111111] tracking-tighter mb-2">Waiting for Orders</h3>
              <p className="text-xs font-bold text-[#888888] max-w-xs leading-relaxed">
                You'll be notified the moment a nearby order is ready for pickup.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-wider">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Dispatch system active
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary Panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Earnings breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest">Earnings Breakdown</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#555555]">Delivery fees ×{stats.deliveries}</span>
                <span className="text-sm font-black text-[#d97757]">${stats.earnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#555555]">Fee per trip</span>
                <span className="text-sm font-black text-[#111111]">${stats.delivery_fee.toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-[#111111]">Total Earned</span>
                <span className="text-base font-black text-green-600">${stats.earnings.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={() => router.push('/driver/history')}
              className="w-full h-10 bg-[#f9f9f9] border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#888888] hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
              View Full History <ChevronRight size={14} />
            </button>
          </div>

          {/* Support */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                <AlertCircle size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-[#111111]">Need Help?</p>
                <p className="text-[10px] text-[#888888] font-medium">24/7 Driver Support</p>
              </div>
            </div>
            <button onClick={() => router.push('/driver/support')}
              className="w-full h-9 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#888888] hover:bg-gray-100 transition-all"
            >
              Contact Dispatch
            </button>
          </div>
        </div>
      </div>

      {/* New Delivery Modal */}
      <AnimatePresence>
        {availableOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setAvailableOrder(null)}
            />
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 40 }}
              className="bg-white rounded-2xl p-8 max-w-[400px] w-full relative z-10 shadow-2xl border border-gray-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-[#d97757] rounded-2xl flex items-center justify-center text-white mb-4 shadow-md">
                  <Truck size={26} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#d97757] mb-3">New Delivery Request</span>

                <div className="mb-5">
                  <p className="text-[10px] font-bold text-[#888888] mb-1 uppercase tracking-wide">Your Payout</p>
                  <h3 className="text-5xl font-black text-[#111111] tracking-tighter">${stats.delivery_fee.toFixed(2)}</h3>
                  <p className="text-[9px] text-[#888888] mt-1">Delivery fee · Order total goes to merchant</p>
                </div>

                <div className="w-full bg-[#f9f9f9] rounded-xl p-5 border border-gray-100 mb-6 text-center">
                  <h4 className="text-base font-black text-[#111111] tracking-tight uppercase mb-1">
                    {availableOrder.stores?.name || 'Restaurant'}
                  </h4>
                  <div className="flex flex-col items-center justify-center gap-1 text-[#888888]">
                    <div className="flex items-center gap-2">
                       <MapPin size={14} />
                       <span className="text-xs font-bold">{availableOrder.delivery_address || 'Deliver to Customer'}</span>
                    </div>
                    <span className="text-[10px] font-medium opacity-60">~1.2 km away</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full mb-6">
                  <button onClick={() => setAvailableOrder(null)}
                    className="h-14 border-2 border-gray-100 text-[#888888] rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                  >
                    Decline
                  </button>
                  <button onClick={() => acceptOrder(availableOrder.id)}
                    className="h-14 bg-[#d97757] text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-md hover:bg-[#c2654a] active:scale-[0.97] transition-all"
                  >
                    Accept
                  </button>
                </div>

                <div className="w-full space-y-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: 24, ease: 'linear' }}
                      className="h-full bg-[#d97757] rounded-full"
                    />
                  </div>
                  <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest">
                    Expires in <span className="text-[#d97757]">{countdown}s</span>
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
