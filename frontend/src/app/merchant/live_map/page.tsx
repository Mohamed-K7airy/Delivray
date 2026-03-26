'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Navigation, 
  MessageSquare, 
  Plus, 
  Phone,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Zap,
  Battery,
  Bike,
  Car,
  Unplug as Scooter
} from 'lucide-react';
import { useSocket } from '@/context/SocketContext';

const activeFleet = [
  { id: 1, name: 'Alex Rivera', vehicle: 'ELECTRIC SCOOTER', status: 'Heading to Customer', eta: '8 Mins', battery: 85, icon: <Scooter size={18} /> },
  { id: 2, name: 'Sarah Jenkins', vehicle: 'TOYOTA PRIUS', status: 'Picking Up', eta: '12 Mins', battery: 60, icon: <Car size={18} /> },
  { id: 3, name: 'Jordan Smith', vehicle: 'BICYCLE', status: 'Heading to Restaurant', eta: '3 Mins', battery: 100, icon: <Bike size={18} /> },
];

const mapMarkers = [
  { id: 1, name: 'ALEX', eta: '8m', top: '25%', left: '60%' },
  { id: 2, name: 'SARAH', eta: '12m', top: '45%', left: '80%' },
  { id: 3, name: 'JORDAN', eta: '3m', top: '65%', left: '65%' },
];

export default function MerchantLiveMap() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!token || user?.role !== 'merchant') {
      router.push('/login');
      return;
    }
  }, [token, user?.role, router]);

  return (
    <div className="space-y-10 lg:space-y-12 pb-24 h-full flex flex-col">
      
      {/* Page Header & Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
         <div>
            <h1 className="text-4xl lg:text-5xl font-black text-[#111111] tracking-tighter mb-2">Live Delivery Monitoring</h1>
            <p className="text-sm font-bold text-[#888888]">Track your active fleet and optimize delivery times across the city in real-time.</p>
         </div>
         <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full lg:w-auto">
            {[
              { label: 'ACTIVE DRIVERS', value: '24', change: '+12%', icon: <Zap size={16} />, color: 'green' },
              { label: 'AVG. DELIVERY TIME', value: '18m', change: '-4m', icon: <Clock size={16} />, color: 'green' },
              { label: 'SUCCESS TODAY', value: '142', sub: '/150', icon: <CheckCircle2 size={16} />, color: 'orange' },
            ].map((stat, idx) => (
              <div key={stat.label} className="bg-white px-8 py-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center min-w-[200px]">
                 <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest mb-3">{stat.label}</p>
                 <div className="flex items-end gap-3">
                    <h3 className="text-3xl font-black text-[#111111] tracking-tighter leading-none">{stat.value}</h3>
                    {stat.sub && <span className="text-sm font-black text-gray-300 leading-none mb-1">{stat.sub}</span>}
                    {stat.change && (
                       <span className={`text-[9px] font-black flex items-center gap-1 mb-1 ${stat.color === 'green' ? 'text-green-500' : 'text-[#d97757]'}`}>
                          <TrendingUp size={12} className={stat.color === 'green' ? '' : 'rotate-180'} />
                          {stat.change}
                       </span>
                    )}
                 </div>
              </div>
            ))}
         </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 min-h-[700px]">
         
         {/* Left Sidebar: Active Fleet */}
         <div className="xl:col-span-4 bg-white rounded-3xl p-10 border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-10">
               <h2 className="text-2xl font-black text-[#111111] tracking-tighter">Active Fleet</h2>
               <button className="text-[10px] font-black text-[#d97757] uppercase tracking-widest hover:underline">View All</button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pr-2">
               {activeFleet.map((driver, idx) => (
                 <motion.div 
                    key={driver.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-[#f9f9f9] hover:bg-white hover:shadow-xl rounded-2xl p-6 lg:p-8 flex flex-col gap-6 border border-transparent hover:border-gray-100 transition-all cursor-pointer group"
                 >
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-white border border-gray-100 flex items-center justify-center relative overflow-hidden">
                             <img src={`https://i.pravatar.cc/150?u=${driver.id}`} className="w-full h-full object-cover" alt={driver.name} />
                             <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                          </div>
                          <div>
                             <h4 className="text-lg font-black text-[#111111] tracking-tight">{driver.name}</h4>
                             <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest flex items-center gap-2">
                                {driver.icon}
                                {driver.vehicle}
                             </p>
                          </div>
                       </div>
                       <button className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-300 hover:text-[#d97757] hover:bg-[#fef3f2] transition-all border border-gray-50">
                          <MessageSquare size={18} />
                       </button>
                    </div>

                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest mb-1 font-geist">Status</p>
                          <p className={`text-xs font-black uppercase tracking-tight ${driver.status === 'Heading to Restaurant' ? 'text-[#111111]' : 'text-[#d97757]'}`}>{driver.status}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest mb-1">ETA</p>
                          <p className="text-lg font-black text-[#111111] tracking-tighter">{driver.eta}</p>
                       </div>
                    </div>

                    <div className="flex gap-1.5 h-2">
                       {[33, 33, 33].map((val, i) => (
                          <div key={i} className={`flex-1 rounded-full ${i === 0 || (i === 1 && driver.battery > 33) || (i === 2 && driver.battery > 66) ? 'bg-[#d97757]' : 'bg-gray-200'}`} />
                       ))}
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>

         {/* Center/Right: Map View */}
         <div className="xl:col-span-8 flex flex-col gap-10">
            <div className="flex-1 bg-[#EEF2F5] rounded-3xl relative overflow-hidden group shadow-xl border-8 border-white">
               {/* Mock Map Background */}
               <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
               <div className="absolute inset-0 bg-gradient-to-br from-[#EEF2F5] to-[#E2E8F0]"></div>
               
               {/* Map Overlay HUD */}
               <div className="absolute top-10 left-10 z-20">
                  <div className="bg-white px-6 py-3 rounded-full border border-gray-100 flex items-center gap-3 shadow-xl">
                     <span className="w-2.5 h-2.5 bg-[#d97757] rounded-full animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111]">Live Fleet View</span>
                  </div>
               </div>

               {/* Simulated Map Markers */}
               {mapMarkers.map((marker, i) => (
                 <motion.div 
                    key={marker.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.2, type: 'spring' }}
                    className="absolute z-20"
                    style={{ top: marker.top, left: marker.left }}
                 >
                    <div className="flex flex-col items-center group/marker">
                       <div className="bg-[#d97757] text-white p-3 rounded-2xl shadow-xl mb-2 relative group-hover:scale-110 transition-transform cursor-pointer">
                          {activeFleet[i].icon}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#d97757] rotate-45 -z-10" />
                       </div>
                       <div className="bg-white px-4 py-1 rounded-lg shadow-xl whitespace-nowrap border border-gray-100 group-hover:translate-y-[-4px] transition-all">
                          <span className="text-[10px] font-black text-[#111111] uppercase tracking-widest">{marker.name} ({marker.eta})</span>
                       </div>
                    </div>
                 </motion.div>
               ))}

               {/* Bottom Order Tracking Card Overlay */}
               <div className="absolute bottom-10 left-10 right-10 z-30">
                  <motion.div 
                     initial={{ y: 50, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     className="bg-white rounded-3xl p-6 lg:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 border border-gray-100"
                  >
                     <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-[#f9f9f9] rounded-2xl flex items-center justify-center text-[#d97757] shadow-inner border border-gray-100">
                           <ShoppingBag size={32} />
                        </div>
                        <div>
                           <h4 className="text-2xl font-black text-[#111111] tracking-tighter mb-1">Order #DLR-8291</h4>
                           <p className="text-sm font-bold text-[#888888]">Awaiting pickup from Kitchen • 2.4 miles away</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-6 w-full md:w-auto">
                        <button className="flex-1 md:flex-none h-16 px-10 bg-white text-[#111111] border border-gray-100 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#f9f9f9] transition-all">
                           Order Details
                        </button>
                        <button className="flex-1 md:flex-none h-16 px-10 bg-[#d97757] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#c2654a] transition-all shadow-xl shadow-[#d97757]/30">
                           Prioritize Route
                        </button>
                     </div>
                  </motion.div>
               </div>
            </div>

            {/* Bottom Row Stats & Support */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 shrink-0">
               {/* Small Delivery Volume Viz */}
               <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-8">
                     <p className="text-xl font-black text-[#111111] tracking-tighter">Delivery Volume</p>
                     <p className="text-[9px] font-black text-[#888888] uppercase tracking-[0.3em]">LAST 6 HOURS</p>
                  </div>
                  <div className="flex items-end justify-between gap-3 h-32">
                     {[40, 60, 50, 90, 80, 55, 45].map((h, i) => (
                       <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          className={`flex-1 rounded-xl transition-all ${h > 70 ? 'bg-[#d97757]' : 'bg-[#f9f9f9] hover:bg-[#d97757]/20'}`}
                       />
                     ))}
                  </div>
               </div>

               {/* Fleet Support Card */}
               <div className="bg-[#fef3f2] rounded-3xl p-10 relative overflow-hidden group border border-[#fee2e2] shadow-sm">
                  <div className="relative z-10">
                     <h4 className="text-2xl font-black text-[#d97757] tracking-tighter mb-2">Fleet Support</h4>
                     <p className="text-[#888888] text-xs font-bold mb-10 max-w-[250px]">Need to dispatch a backup or report an issue?</p>
                     <div className="flex items-center gap-4">
                        <button className="flex-1 h-14 bg-[#d97757] text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-[#c2654a] transition-all flex items-center justify-center gap-3">
                           <AlertCircle size={16} />
                           Emergency Broadcast
                        </button>
                        <button className="flex-1 h-14 bg-white text-[#d97757] border border-[#fee2e2] rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-[#fef3f2] transition-all flex items-center justify-center gap-3">
                           Contact Support
                        </button>
                     </div>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#d97757]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#d97757]/10 transition-colors" />
               </div>
            </div>
         </div>

      </div>

      {/* Floating Action Button (Mock) */}
      <button className="fixed bottom-12 right-12 w-20 h-20 bg-[#d97757] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all z-50">
         <Plus size={32} className="stroke-[3]" />
      </button>

    </div>
  );
}

function TrendingUp({ size, className }: { size: number, className?: string }) {
   return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
         <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
         <polyline points="17 6 23 6 23 12" />
      </svg>
   );
}

function ShoppingBag({ size, className }: { size: number, className?: string }) {
   return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
         <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
         <path d="M3 6h18" />
         <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
   );
}
