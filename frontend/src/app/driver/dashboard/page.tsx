'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import {
  Navigation, MapPin, Store as StoreIcon, Truck, Wallet,
  Clock, ShieldCheck, ChevronRight, Zap, AlertCircle,
  Package, TrendingUp, CheckCircle2, DollarSign, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSocket } from '@/context/SocketContext';
import { apiClient } from '@/lib/apiClient';
import dynamic from 'next/dynamic';
import { RouteUpdateData } from '@/components/MapView';

const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-50 animate-pulse flex items-center justify-center text-[10px] uppercase font-bold tracking-widest text-[#888888]">Initializing Map Data...</div>
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
  const [stats, setStats] = useState({ earnings: 0, deliveries: 0, delivery_fee: 45.00 });
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const [isCentering, setIsCentering] = useState(true);
  const [routeInfo, setRouteInfo] = useState<RouteUpdateData | null>(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isSendingSignal, setIsSendingSignal] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== 'driver') return router.push('/login');

    apiClient('/delivery/stats').then(data => {
      if (data) setStats({ earnings: data.earnings, deliveries: data.deliveries, delivery_fee: data.delivery_fee || 45.00 });
    }).catch(() => {});

    apiClient('/orders/driver').then(data => {
      if (data && Array.isArray(data)) {
        const current = data.find((o: any) => o.status === 'delivering' || o.status === 'picked_up');
        if (current) setActiveOrder(current);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token, user?.id, user?.role, router]);

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

  const sendSignal = async (signal: string) => {
    if (!activeOrder) return;
    setIsSendingSignal(true);
    try {
      const data = await apiClient(`/delivery/signal/${activeOrder.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ signal })
      });
      if (data) {
        toast.success('Signal transmitted to buyer.');
        setActiveOrder({ ...activeOrder, driver_signal: signal });
      }
    } catch (err) {
      toast.error('Failed to send signal.');
    } finally {
      setIsSendingSignal(false);
    }
  };

  const completeOrder = async () => {
    if (!activeOrder) return;
    if (!confirmationCode || confirmationCode.length !== 2) {
      toast.error('Please enter the 2-digit confirmation code from the buyer.');
      return;
    }

    try {
      const data = await apiClient(`/delivery/complete-order/${activeOrder.id}`, { 
        method: 'PATCH',
        body: JSON.stringify({ code: confirmationCode })
      });
      if (data) {
        toast.success(`+${stats.delivery_fee.toFixed(2)} ج.م added to your earnings!`);
        setActiveOrder(null);
        setConfirmationCode('');
        setShowCodeInput(false);
        setStats(prev => ({ ...prev, earnings: prev.earnings + prev.delivery_fee, deliveries: prev.deliveries + 1 }));
      }
    } catch (err: any) { 
      // apiClient handles toasts, but we handle specific logic if needed
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container-responsive py-8 sm:py-12 space-y-10 sm:space-y-14">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center gap-1.5 bg-white text-slate-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-slate-100 shadow-sm">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
                Live Network
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              Operational Terminal.
            </h1>
            <p className="text-slate-400 mt-2 font-medium text-sm">Active session for {user?.name?.split(' ')[0]} Registry.</p>
          </div>
          <div className={`px-5 py-2.5 rounded-xl border flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
            isConnected ? 'bg-white border-slate-100 text-slate-900 shadow-sm' : 'bg-slate-50 border-transparent text-slate-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-200'}`} />
            <span>{isConnected ? 'Connection Stable' : 'Signal Lost'}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
          {[
            { label: "Today's Yield", value: `${stats.earnings.toFixed(2)} ج.م`, icon: <Wallet size={18} /> },
            { label: 'Completed Logistics', value: stats.deliveries, icon: <Package size={18} /> },
            { label: 'Target Rate', value: `${stats.delivery_fee.toFixed(2)} ج.م`, icon: <DollarSign size={18} /> },
          ].map((s, i) => (
            <motion.div 
              key={s.label} 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-50 text-slate-900 flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all">
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{s.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* Active Delivery or Idle */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="bg-white rounded-xl p-12 border border-slate-100 flex items-center justify-center h-80 shadow-sm">
                <div className="flex flex-col items-center gap-4">
                  <Activity size={32} className="animate-spin text-slate-100" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Synchronizing Signals</p>
                </div>
              </div>
            ) : activeOrder ? (
              <motion.div 
                initial={{ opacity: 0, y: 16 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* Active order banner */}
                <div className="bg-slate-900 px-8 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Live Logistics Deployment</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signal #{activeOrder.id.slice(0, 8)}</span>
                </div>

                <div className="p-8 space-y-10">
                  {/* Payout */}
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Registry Credit</p>
                      <p className="text-4xl font-bold text-slate-900 tracking-tight">{stats.delivery_fee.toFixed(2)} ج.م</p>
                    </div>
                    <div className="w-14 h-14 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-900 shadow-sm">
                      <Wallet size={24} />
                    </div>
                  </div>

                  {/* Map Delivery Card UI */}
                  <div className="relative group/map rounded-xl overflow-hidden border border-slate-100 shadow-sm h-[400px] bg-slate-50">
                     <MapView 
                        center={currentPos || [activeOrder.stores?.location_lat || 0, activeOrder.stores?.location_lng || 0]}
                        zoom={15}
                        autoCenter={isCentering}
                        markers={[
                          ...(currentPos ? [{ position: currentPos as [number, number], type: 'driver' as const, label: 'YOU' }] : []),
                          ...(activeOrder.stores ? [{ position: [activeOrder.stores.location_lat, activeOrder.stores.location_lng] as [number, number], type: 'store' as const, label: activeOrder.stores.name.toUpperCase() }] : []),
                          ...(activeOrder.delivery_lat ? [{ position: [activeOrder.delivery_lat, activeOrder.delivery_lng] as [number, number], type: 'customer' as const, label: 'DESTINATION' }] : [])
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
                        <div className="absolute top-6 left-6 right-6 z-[450] pointer-events-none">
                           <motion.div 
                             initial={{ opacity: 0, y: -10 }}
                             animate={{ opacity: 1, y: 0 }}
                             className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-5 pointer-events-auto max-w-lg mx-auto"
                           >
                              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
                                 <Navigation size={24} className={routeInfo.steps[0]?.maneuver?.modifier?.includes('left') ? '-rotate-90' : routeInfo.steps[0]?.maneuver?.modifier?.includes('right') ? 'rotate-90' : ''} />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Path Guidance</p>
                                 <p className="text-base font-bold text-slate-900 truncate tracking-tight">
                                    {routeInfo.steps[0]?.name || 'Follow current trajectory'} 
                                    <span className="text-slate-400 ml-3 font-bold uppercase tracking-widest text-[9px]">
                                       in {(routeInfo.steps[0]?.distance / 1000).toFixed(1)} km
                                    </span>
                                 </p>
                              </div>
                           </motion.div>
                        </div>
                     )}

                     {/* Map Controls Overlay */}
                     <div className="absolute top-6 right-6 z-[400] flex flex-col gap-2 opacity-0 group-hover/map:opacity-100 transition-opacity">
                        <button 
                           onClick={() => setIsCentering(!isCentering)}
                           className={`w-10 h-10 rounded-lg shadow-lg border flex items-center justify-center transition-all ${
                              isCentering ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                           }`}
                        >
                           <Navigation size={18} className={isCentering ? "animate-pulse" : ""} />
                        </button>
                     </div>

                      {/* Routing Indicator Banner (Bottom) */}
                      <div className="absolute bottom-6 left-6 right-6 z-[400] pointer-events-none">
                         <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-xl shadow-xl border border-slate-100 flex items-center justify-between pointer-events-auto max-w-xl mx-auto">
                            <div className="flex items-center gap-4">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 animate-pulse shadow-[0_0_10px_rgba(15,23,42,0.3)]" />
                                <div>
                                   <p className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Neural Network Optimization</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{routeInfo ? 'Trajectory finalized' : 'Calculating vector...'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                               <p className="text-xl font-bold text-slate-900 tracking-tight">
                                  {routeInfo ? (routeInfo.distance / 1000).toFixed(1) : '0.0'} km
                               </p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                  EST: {routeInfo ? Math.round(routeInfo.duration / 60) : '0'} MIN
                               </p>
                            </div>
                         </div>
                      </div>
                  </div>

                  {/* Status UI Detail */}
                  <div className="rounded-xl border border-slate-100 overflow-hidden bg-slate-50/30">
                     {/* Pickup row */}
                     <div className="flex items-center gap-5 px-8 py-6 border-b border-slate-100 bg-white shadow-sm relative z-10">
                      <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <StoreIcon size={20} className="text-slate-900" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Logistics Source</p>
                        <p className="text-base font-bold text-slate-900 truncate tracking-tight">{activeOrder.stores?.name || 'Authorized Merchant'}</p>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-md text-[9px] font-bold uppercase tracking-widest shadow-sm">
                           SIGNAL ACTIVE
                         </span>
                      </div>
                    </div>
                    {/* Delivery row */}
                    <div className="flex items-center gap-5 px-8 py-6">
                      <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <MapPin size={20} className="text-slate-900" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Endpoint</p>
                        <p className="text-base font-bold text-slate-900 truncate tracking-tight">{activeOrder.delivery_address || 'Unspecified Corridor'}</p>
                      </div>
                      <button 
                         onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${activeOrder.delivery_lat},${activeOrder.delivery_lng}`, '_blank')}
                         className="h-10 px-5 bg-white border border-slate-100 text-slate-900 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                      >
                        <Navigation size={14} /> EXT MAPS
                      </button>
                    </div>
                  </div>


                  {/* Driver Signals */}
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => sendSignal("أنا قريب من موقعك")}
                      disabled={isSendingSignal}
                      className="h-12 bg-white border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Navigation size={14} className="text-slate-400" /> أنا قريب
                    </button>
                    <button 
                      onClick={() => sendSignal("أنا وصلت")}
                      disabled={isSendingSignal}
                      className="h-12 bg-white border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} className="text-green-500" /> أنا وصلت
                    </button>
                  </div>

                  {activeOrder.driver_signal && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Signal</p>
                      <p className="text-sm font-bold text-slate-900">"{activeOrder.driver_signal}"</p>
                    </div>
                  )}

                  {/* Complete button and Code Input */}
                  <div className="space-y-4">
                    {showCodeInput ? (
                      <div className="bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-800 space-y-6">
                        <div className="text-center space-y-2">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Authorization</p>
                           <h4 className="text-white text-lg font-bold">Buyer Confirmation Code</h4>
                        </div>
                        <input 
                          type="text" 
                          maxLength={2}
                          value={confirmationCode}
                          onChange={(e) => setConfirmationCode(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="00"
                          className="w-full h-20 bg-white/5 border border-white/10 rounded-xl text-center text-5xl font-black text-white tracking-[0.2em] focus:outline-none focus:border-white/30 transition-all placeholder:text-white/5"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => setShowCodeInput(false)}
                            className="h-12 border border-white/10 text-white/50 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={completeOrder}
                            disabled={confirmationCode.length !== 2}
                            className="h-12 bg-white text-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-slate-100 transition-all disabled:opacity-30"
                          >
                            Verify & Complete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowCodeInput(true)}
                        className="w-full h-16 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-slate-800 active:scale-[0.99] transition-all flex items-center justify-center gap-4 transition-all"
                      >
                        <ShieldCheck size={20} /> Terminate Logistics Cycle
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-32 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-100 mb-8 border border-slate-50 shadow-inner">
                  <Truck size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">Idle State Detected.</h3>
                <p className="text-[10px] font-bold text-slate-400 max-w-xs leading-relaxed uppercase tracking-[0.2em] px-6">
                  Maintaining network connection. Global dispatch will sequence nearby logistics requests to your terminal.
                </p>
                <div className="mt-10 flex items-center gap-3 text-[10px] font-bold text-green-500 uppercase tracking-[0.3em] bg-green-50/50 px-4 py-1.5 rounded-full border border-green-100 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                  Scanner Active
                </div>
              </div>
            )}
          </div>

          {/* Right: Summary Panel */}
          <div className="lg:col-span-4 space-y-6">
            {/* Earnings breakdown */}
            <div className="bg-white rounded-xl p-8 border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Yield Distribution</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trip Total (×{stats.deliveries})</span>
                  <span className="text-sm font-bold text-slate-900">{stats.earnings.toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Standard Rate</span>
                  <span className="text-sm font-bold text-slate-900">{stats.delivery_fee.toFixed(2)} ج.م</span>
                </div>
                <div className="h-px bg-slate-50" />
                <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-lg border border-slate-50">
                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Cumulative</span>
                  <span className="text-xl font-bold text-slate-900 tracking-tight">{stats.earnings.toFixed(2)} ج.م</span>
                </div>
              </div>
              <button onClick={() => router.push('/driver/history')}
                className="w-full h-11 bg-white border border-slate-100 rounded-lg text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all flex items-center justify-center gap-2"
              >
                Log Archive <ChevronRight size={14} />
              </button>
            </div>

            {/* Support */}
            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-900 flex items-center justify-center border border-slate-100">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Registry Support</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Signal: Encrypted</p>
                </div>
              </div>
              <button onClick={() => router.push('/driver/support')}
                className="w-full h-10 bg-slate-900 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-slate-800 shadow-md transition-all active:scale-[0.98]"
              >
                Open Terminal
              </button>
            </div>
          </div>
        </div>

        {/* New Delivery Modal */}
        <AnimatePresence>
          {availableOrder && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-8">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setAvailableOrder(null)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-t-[2.5rem] sm:rounded-2xl p-8 sm:p-10 max-w-md w-full relative z-10 shadow-2xl border border-slate-100 overflow-hidden"
              >
                <div className="flex flex-col items-center text-center space-y-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 shadow-sm border border-slate-50 group">
                    <Truck size={32} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Logistics Protocol Pending</p>
                    <h3 className="text-4xl font-bold text-slate-900 tracking-tight">Inbound Flow.</h3>
                  </div>

                  <div className="w-full space-y-1">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Estimated Payout</p>
                    <h3 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-none">{stats.delivery_fee.toFixed(2)} ج.م</h3>
                  </div>

                  <div className="w-full bg-slate-50 rounded-xl p-6 border border-slate-100 text-center space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Authorized Source</p>
                      <h4 className="text-lg font-bold text-slate-900 tracking-tight uppercase">
                        {availableOrder.stores?.name || 'GENERIC HUB'}
                      </h4>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                       <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm">
                          <MapPin size={16} className="text-slate-900" />
                          <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{availableOrder.delivery_address || 'UNDISCLOSED ENDPOINT'}</span>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full">
                    <button onClick={() => setAvailableOrder(null)}
                      className="h-14 border border-slate-100 text-slate-300 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:text-red-500 hover:border-red-100 transition-all hover:bg-slate-50"
                    >
                      Dismiss
                    </button>
                    <button onClick={() => acceptOrder(availableOrder.id)}
                      className="h-14 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all"
                    >
                      Authorize
                    </button>
                  </div>

                  <div className="w-full space-y-3">
                    <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/10 shadow-inner">
                      <motion.div 
                        initial={{ width: '100%' }} 
                        animate={{ width: '0%' }} 
                        transition={{ duration: 24, ease: 'linear' }}
                        className="h-full bg-slate-900 rounded-full shadow-[0_0_8px_rgba(15,23,42,0.4)]"
                      />
                    </div>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                      Signal Degradation in <span className="text-slate-900">{countdown}S</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
