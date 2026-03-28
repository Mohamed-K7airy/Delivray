'use client';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
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

const driverIcon = createCustomIcon('#0f172a');
const storeIcon = createCustomIcon('#111111');
const customerIcon = createCustomIcon('#2563eb');

export interface RouteUpdateData {
  distance: number;
  duration: number;
  steps: any[];
}

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    id?: string;
    position: [number, number];
    label?: string;
    type?: 'driver' | 'store' | 'customer' | 'selected' | 'default';
  }>;
  polyline?: [number, number][];
  routingPoints?: [number, number][]; // [lat, lng][]
  autoCenter?: boolean;
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
  showZoomControls?: boolean;
  onRouteUpdate?: (data: RouteUpdateData) => void;
}

// Internal component to handle map events
function MapEvents({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Internal component to handle zoom
function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
      <button 
        onClick={() => map.zoomIn()}
        className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center font-bold text-lg border border-gray-100 hover:bg-gray-50 transition-colors"
      >+</button>
      <button 
        onClick={() => map.zoomOut()}
        className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center font-bold text-lg border border-gray-100 hover:bg-gray-50 transition-colors"
      >-</button>
    </div>
  );
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
  routingPoints,
  autoCenter = true,
  className = 'h-full w-full',
  onMapClick,
  showZoomControls = true,
  onRouteUpdate
}: MapViewProps) {
  const [routingPath, setRoutingPath] = useState<[number, number][] | null>(null);

  // Fetch OSRM route when routingPoints change
  const prevPointsRef = useRef<string>('');

  useEffect(() => {
    if (!routingPoints || routingPoints.length < 2) {
      setRoutingPath(null);
      prevPointsRef.current = '';
      return;
    }

    const currentPointsStr = JSON.stringify(routingPoints);
    if (currentPointsStr === prevPointsRef.current) return;

    prevPointsRef.current = currentPointsStr;
    const coords = routingPoints.map(p => `${p[1]},${p[0]}`).join(';');
    
    fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true`)
      .then(r => r.json())
      .then(data => {
        if (data.routes && data.routes[0]) {
          const firstRoute = data.routes[0];
          const path = firstRoute.geometry.coordinates.map((c: any) => [c[1], c[0]]);
          setRoutingPath(path);
          
          if (onRouteUpdate) {
             onRouteUpdate({
                distance: firstRoute.distance,
                duration: firstRoute.duration,
                steps: firstRoute.legs[0].steps || []
             });
          }
        }
      })
      .catch(err => console.error('OSRM Error:', err));
  }, [routingPoints, onRouteUpdate]);

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
           <p className="text-[10px] font-bold uppercase tracking-widest">Waiting for GPS Signal</p>
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
          <MapEvents onMapClick={onMapClick} />
          {showZoomControls && <ZoomControls />}
          <ChangeView center={center} zoom={zoom} autoCenter={autoCenter} />
          
          <AnimatePresence>
            {markers.map((marker, idx) => {
              if (!marker.position || marker.position[0] === null || marker.position[1] === null || isNaN(marker.position[0])) return null;
              return (
                <Marker 
                  key={marker.id || idx} 
                  position={marker.position} 
                  icon={getIcon(marker.type)}
                >
                  {marker.label && (
                     <Popup className="premium-popup">
                       <div className="p-1 font-bold uppercase tracking-widest text-[8px]">{marker.label}</div>
                     </Popup>
                  )}
                </Marker>
              );
            })}
          </AnimatePresence>

          {/* OSRM Road Path (Primary) */}
          {routingPath && (
            <Polyline 
              positions={routingPath} 
              color="#0f172a" 
              weight={5} 
              opacity={0.8} 
              className="line-animation"
            />
          )}

          {/* Fallback Polyline (Secondary/Straight) */}
          {polyline && !routingPath && (
            <Polyline 
              positions={polyline} 
              color="#0f172a" 
              weight={4} 
              opacity={0.4} 
              dashArray="8, 12"
            />
          )}

          {/* Zoom controls handled by ZoomControls component */}
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
          background: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}
