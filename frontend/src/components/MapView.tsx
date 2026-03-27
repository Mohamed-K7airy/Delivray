'use client';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for default marker icons in Leaflet for Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Custom Icons for better UX
const createCustomIcon = (color: string) => L.divIcon({
  html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.2);"></div>`,
  className: 'custom-marker-icon',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const driverIcon = createCustomIcon('#d97757');
const storeIcon = createCustomIcon('#111111');
const customerIcon = createCustomIcon('#2563eb');

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    id?: string;
    position: [number, number];
    label?: string;
    type?: 'driver' | 'store' | 'customer' | 'default';
  }>;
  polyline?: [number, number][];
  autoCenter?: boolean;
  className?: string;
}

// Internal component to handle view changes
function ChangeView({ center, zoom, autoCenter }: { center: [number, number]; zoom: number; autoCenter: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (autoCenter) {
      map.setView(center, zoom, { animate: true, duration: 1 });
    }
  }, [center, zoom, map, autoCenter]);
  return null;
}

export default function MapView({ 
  center, 
  zoom = 13, 
  markers = [], 
  polyline, 
  autoCenter = true,
  className = 'h-full w-full' 
}: MapViewProps) {
  
  const getIcon = (type?: string) => {
    switch(type) {
      case 'driver': return driverIcon;
      case 'store': return storeIcon;
      case 'customer': return customerIcon;
      default: return DefaultIcon;
    }
  };

  return (
    <div className={`${className} bg-slate-50 relative overflow-hidden flex items-center justify-center`}>
      {/* Fallback for invalid coordinates */}
      {!center[0] || !center[1] ? (
        <div className="flex flex-col items-center gap-3 opacity-40">
           <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-400 animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest">Waiting for GPS Signal</p>
        </div>
      ) : (
        <MapContainer 
          center={center} 
          zoom={zoom} 
          scrollWheelZoom={false} 
          className="h-full w-full z-10"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <ChangeView center={center} zoom={zoom} autoCenter={autoCenter} />
          
          <AnimatePresence>
            {markers.map((marker, idx) => (
              <Marker 
                key={marker.id || idx} 
                position={marker.position} 
                icon={getIcon(marker.type)}
              >
                {marker.label && (
                   <Popup className="premium-popup">
                     <div className="p-1 font-black uppercase tracking-widest text-[8px]">{marker.label}</div>
                   </Popup>
                )}
              </Marker>
            ))}
          </AnimatePresence>

          {polyline && (
            <Polyline 
              positions={polyline} 
              color="#d97757" 
              weight={4} 
              opacity={0.6} 
              dashArray="8, 12"
              className="line-animation"
            />
          )}

          {/* Simple custom zoom controls */}
          <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
            <button 
              onClick={() => {}} // Controlled by leaflet naturally if we use default zoom, but custom is nicer
              className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center font-black text-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >+</button>
            <button 
              onClick={() => {}}
              className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center font-black text-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >-</button>
          </div>
        </MapContainer>
      )}

      {/* CSS for custom line animations & popups */}
      <style jsx global>{`
        .line-animation {
          stroke-dashoffset: 20;
          animation: dash 10s linear infinite;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
        .premium-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          border: none;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          padding: 0;
        }
        .premium-popup .leaflet-popup-content {
          margin: 12px;
        }
        .leaflet-container {
          background: #f9f9f9 !important;
        }
      `}</style>
    </div>
  );
}
