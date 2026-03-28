'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, Libraries } from '@react-google-maps/api';

const libraries: Libraries = ['places', 'geometry', 'drawing'];

export interface MapMarker {
  position: [number, number];
  type: 'driver' | 'store' | 'customer';
  label?: string;
}

export interface RouteUpdateData {
  distance: number; // in meters
  duration: number; // in seconds
  steps: any[];
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  autoCenter?: boolean;
  routingPoints?: [number, number][]; // [start, store, end]
  onRouteUpdate?: (data: RouteUpdateData) => void;
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = { lat: 24.7136, lng: 46.6753 }; // Riyadh

const MapView: React.FC<MapViewProps> = ({
  center,
  zoom = 13,
  markers = [],
  autoCenter = true,
  routingPoints,
  onRouteUpdate,
  interactive = false,
  onLocationSelect
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
    libraries
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  
  const mapCenter = center ? { lat: center[0], lng: center[1] } : defaultCenter;

  const onLoad = useCallback((m: google.maps.Map) => {
    setMap(m);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle Routing Logic
  useEffect(() => {
    if (!isLoaded || !routingPoints || routingPoints.length < 2) {
      setDirections(null);
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    
    // Convert first and last points
    const origin = { lat: routingPoints[0][0], lng: routingPoints[0][1] };
    const destination = { lat: routingPoints[routingPoints.length - 1][0], lng: routingPoints[routingPoints.length - 1][1] };
    
    // Middle points (waypoints)
    const waypoints = routingPoints.slice(1, -1).map(p => ({
      location: new google.maps.LatLng(p[0], p[1]),
      stopover: true
    }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          
          if (onRouteUpdate) {
            const leg = result.routes[0].legs[0];
            onRouteUpdate({
              distance: leg.distance?.value || 0,
              duration: leg.duration?.value || 0,
              steps: leg.steps || []
            });
          }
        } else {
          console.error(`Directions request failed: ${status}`);
        }
      }
    );
  }, [isLoaded, routingPoints, onRouteUpdate]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (interactive && onLocationSelect && e.latLng) {
      onLocationSelect(e.latLng.lat(), e.latLng.lng());
    }
  };

  const getMarkerIcon = (type: string) => {
    if (!isLoaded) return undefined;
    const icons = {
      driver: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      store: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
      customer: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
    };
    return icons[type as keyof typeof icons];
  };

  if (loadError) return <div className="h-full flex items-center justify-center bg-red-50 text-red-500 font-bold p-10 text-center">Protocol Error: Map Network Unreachable.</div>;
  if (!isLoaded) return <div className="h-full w-full bg-slate-50 animate-pulse flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-300">Synchronizing Map Data...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      options={{
        disableDefaultUI: true,
        styles: [
          {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }]
          }
        ]
      }}
    >
      {/* Markers */}
      {markers.map((marker, idx) => (
        <Marker 
          key={idx}
          position={{ lat: marker.position[0], lng: marker.position[1] }}
          icon={getMarkerIcon(marker.type)}
          label={marker.label ? { text: marker.label, color: '#0f172a', fontWeight: 'bold', fontSize: '10px' } : undefined}
        />
      ))}

      {/* Routing Line */}
      {directions && (
        <DirectionsRenderer 
          directions={directions} 
          options={{ 
            suppressMarkers: true,
            polylineOptions: { strokeColor: '#0f172a', strokeWeight: 5, strokeOpacity: 0.8 }
          }} 
        />
      )}
    </GoogleMap>
  );
};

export default MapView;
