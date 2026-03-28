'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from '@/context/SocketContext';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Truck, Store as StoreIcon, Clock, CheckCircle2, Package, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-50 animate-pulse flex items-center justify-center text-[10px] uppercase font-bold tracking-widest text-[#888888]">Initializing Fleet Map...</div>
});
import { toast } from 'sonner';

export default function DriverMapPage() {
  const { token, user } = useAuthStore();
  const { socket } = useSocket();
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!token || user?.role !== 'driver') return;
    
    const fetchActive = async () => {
      try {
        const data = await apiClient('/orders/driver');
        if (data && Array.isArray(data)) {
          const current = data.find((o: any) => o.status === 'delivering' || o.status === 'picked_up' || o.status === 'ready_for_pickup');
          if (current) {
            setActiveOrder(current);
            if (socket) socket.emit('join_order', current.id);
          }
        }
      } catch (err) {} finally {
        setLoading(false);
      }
    };

    fetchActive();
  }, [token, user, socket]);

  // Geolocation Watcher
  useEffect(() => {
    if (!activeOrder || !socket) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentPos([latitude, longitude]);

        // Throttle updates: every 5 seconds
        const now = Date.now();
        if (now - lastUpdateRef.current > 5000) {
          socket.emit('update_location', {
            lat: latitude,
            lng: longitude,
            orderId: activeOrder.id
          });
          lastUpdateRef.current = now;
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        // Fallback to default if needed
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [activeOrder, socket]);

  const markers: any[] = [];
  if (currentPos) markers.push({ position: currentPos, type: 'driver', label: 'You' });
  if (activeOrder?.stores) {
    markers.push({ 
      position: [activeOrder.stores.location_lat, activeOrder.stores.location_lng], 
      type: 'store', 
      label: activeOrder.stores.name 
    });
  }
  if (activeOrder?.delivery_lat) {
    markers.push({ 
      position: [activeOrder.delivery_lat, activeOrder.delivery_lng], 
      type: 'customer', 
      label: 'Customer' 
    });
  }

  // Simple straight line fallback, routing API would provide real polyline
  const polyline: any = (currentPos && activeOrder?.delivery_lat) 
    ? [currentPos, [activeOrder.delivery_lat, activeOrder.delivery_lng]] 
    : undefined;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#111111] tracking-tighter">Route Map</h1>
          <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mt-0.5">
            {activeOrder ? 'Active delivery in progress' : 'No active delivery'}
          </p>
        </div>
        {activeOrder && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Live Tracking Active
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 h-80 animate-pulse" />
      ) : activeOrder ? (
        <>
          {/* Map Section */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden relative h-[400px]">
            <MapView 
              center={currentPos || [activeOrder.stores?.location_lat || 0, activeOrder.stores?.location_lng || 0]}
              zoom={15}
              markers={markers}
              routingPoints={currentPos && activeOrder?.delivery_lat ? [currentPos, [activeOrder.delivery_lat, activeOrder.delivery_lng]] : undefined}
            />
            
            {/* Overlay Info */}
            <div className="absolute bottom-6 left-6 right-6 z-[400] flex gap-4 pointer-events-none">
                <div className="flex-1 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white/50 pointer-events-auto">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-[#fef3f2] rounded-lg flex items-center justify-center text-[#0f172a]">
                            <Navigation size={14} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Active Route</p>
                            <p className="text-xs font-bold text-[#111111] truncate">{activeOrder.delivery_address}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                           onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${activeOrder.delivery_lat},${activeOrder.delivery_lng}`, '_blank')}
                           className="flex-1 h-10 bg-[#111111] text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-black transition-all"
                        >
                            External Maps
                        </button>
                    </div>
                </div>
            </div>
          </div>

          {/* Quick info row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Network', value: 'Stable', icon: <Navigation size={14} />, color: '#0f172a', bg: '#fef3f2' },
              { label: 'Distance', value: '~1.5 km', icon: <Clock size={14} />, color: '#2563eb', bg: '#eff6ff' },
              { label: 'Earning', value: `$${Number(activeOrder.delivery_fee || 3).toFixed(2)}`, icon: <Package size={14} />, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Status', value: activeOrder.status.replace('_', ' '), icon: <CheckCircle2 size={14} />, color: '#9333ea', bg: '#f5f3ff' },
            ].map((item, i) => (
              <div key={item.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: item.bg, color: item.color }}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111111] whitespace-nowrap">{item.value}</p>
                  <p className="text-[9px] text-[#888888] font-bold uppercase tracking-wide">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* No active delivery */
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200">
              <MapPin size={48} />
            </div>
          </div>
          <h3 className="text-xl font-bold text-[#111111] tracking-tighter mb-2">GPS Idle.</h3>
          <p className="text-xs font-medium text-[#888888] max-w-xs leading-relaxed mb-6">
            Map systems are standby. Accept a delivery task to initialize real-time navigation.
          </p>
        </div>
      )}
    </div>
  );
}
