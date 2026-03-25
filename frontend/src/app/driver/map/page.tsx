'use client';
import { MapIcon } from 'lucide-react';

export default function DriverMapPage() {
  return (
    <div className="h-full min-h-[700px] bg-[#1a1a1a] rounded-[3.5rem] border border-white/5 relative overflow-hidden group shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
       <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000')] bg-cover bg-center opacity-20 mix-blend-luminosity grayscale group-hover:scale-110 transition-transform duration-1000" />
       
       <div className="relative z-10 w-full h-full flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="text-center space-y-8">
             <div className="w-48 h-48 bg-white/5 rounded-[4rem] border border-white/10 flex items-center justify-center mx-auto group-hover:border-[#ff8564]/30 transition-all duration-700">
                <MapIcon size={80} className="text-gray-700 group-hover:text-[#ff8564] group-hover:scale-110 transition-all duration-700" />
             </div>
             <div className="space-y-4">
                <h2 className="text-5xl font-black tracking-tighter uppercase italic">Live Navigation Map</h2>
                <p className="text-gray-500 font-bold max-w-md mx-auto">Real-time GPS routing, traffic analysis, and turn-by-turn guidance for your active deliveries.</p>
             </div>
          </div>
       </div>
    </div>
  );
}
