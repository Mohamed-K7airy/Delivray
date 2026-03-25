'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Navigation, MapPin, Search, Compass, Activity } from 'lucide-react';
import { API_URL } from '@/config/api';

export default function MerchantLiveMap() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({ activeDrivers: 0, pendingPickups: 0, dispatchCenter: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== 'merchant') {
      router.push('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/stores/map-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch map stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Poll for real-time feel (optional, but good for "Live" map)
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [token, user, router]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 h-screen overflow-hidden flex flex-col pb-10">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
          <div>
             <h1 className="text-6xl font-black uppercase tracking-tighter text-white leading-none">Live <span className="text-primary italic">Map</span></h1>
             <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Precision telemetry: distribution of orders and drivers.</p>
          </div>
          <div className="bg-[#1a1a1a] px-6 py-4 rounded-2xl border border-white/5 flex items-center space-x-6 shadow-2xl">
             <div className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_12px_rgba(217,119,87,1)]"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">GPS CORE ACTIVE</span>
             </div>
             <div className="h-4 w-px bg-white/10"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stats.activeDrivers + stats.pendingPickups} Logistical Units Tracking</span>
          </div>
       </div>

       {/* Map Content Container */}
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1 min-h-0">
          {/* Legend / Stats */}
          <div className="lg:col-span-4 h-full xl:col-span-3">
             <div className="bg-[#1a1a1a] p-10 h-full rounded-[3rem] border border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center space-x-4 mb-10 relative z-10">
                   <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:rotate-45 transition-transform duration-700">
                      <Compass size={20} className="stroke-[3]" />
                   </div>
                   <span className="font-geist">Telemetry <span className="text-primary">Legend</span></span>
                </h2>
                
                <div className="space-y-4 flex-1 relative z-10">
                   {loading ? (
                     [1, 2, 3].map(i => (
                       <div key={i} className="h-20 bg-white/[0.02] rounded-2xl border border-white/5 animate-pulse" />
                     ))
                   ) : (
                     [
                        { label: 'Active Drivers', count: stats.activeDrivers, color: 'bg-primary' },
                        { label: 'Pending Pickups', count: stats.pendingPickups, color: 'bg-blue-400' },
                        { label: 'Dispatch Center', count: stats.dispatchCenter, color: 'bg-white' },
                     ].map((item, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center justify-between p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 hover:bg-white/[0.05] transition-all group/item"
                        >
                           <div className="flex items-center space-x-4">
                              <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover/item:scale-125 transition-transform`}></div>
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover/item:text-white transition-colors">{item.label}</span>
                           </div>
                           <span className="text-2xl font-black tracking-tighter font-geist">{item.count}</span>
                        </motion.div>
                     ))
                   )}
                </div>

                <div className="pt-8 mt-auto border-t border-white/5 relative z-10">
                    <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 group-hover:bg-primary/10 transition-all">
                       <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] leading-relaxed">
                         Precision GPS telemetry ensures sub-meter accuracy and optimal logistics routing via Neural Dispatch protocol.
                       </p>
                    </div>
                </div>
             </div>
          </div>

          {/* Map Visual Representative */}
          <div className="lg:col-span-8 xl:col-span-9 bg-[#1a1a1a] h-full rounded-[4rem] border border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden group">
             {/* Abstract Grid Map */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
             <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ff8564 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
             <div className="absolute inset-0 bg-gradient-to-tr from-[#000] via-transparent to-transparent opacity-90"></div>
             
             {/* Map Branding */}
             <div className="absolute top-10 right-10 z-20 flex flex-col items-end">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] mb-2">NEURAL DISPATCH V4.2</p>
                <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     animate={{ x: ['-100%', '100%'] }}
                     transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                     className="w-1/2 h-full bg-primary/40 blur-[2px]"
                   />
                </div>
             </div>

             {/* HUD Centers */}
             <AnimatePresence>
                {/* Central Dispatch Hub */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center"
                >
                   <div className="relative">
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 bg-primary rounded-full blur-2xl"
                      />
                      <div className="relative p-12 bg-black/60 backdrop-blur-3xl rounded-[4rem] border border-white/10 shadow-2xl border-dashed">
                         <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mx-auto mb-8 shadow-[0_0_50px_rgba(217,119,87,0.2)]">
                            <Navigation size={48} className="stroke-[2.5]" />
                         </div>
                         <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 text-white font-geist leading-none">Scanning <br/><span className="text-primary italic">Nexus</span></h3>
                         <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] max-w-[200px] mx-auto leading-relaxed">Awaiting High-Resolution Map Provider Integration</p>
                         
                         <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                               <p className="text-[7px] text-gray-600 font-bold uppercase tracking-widest leading-none mb-2">Lat</p>
                               <p className="text-[10px] text-white font-mono">30.0444°N</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                               <p className="text-[7px] text-gray-600 font-bold uppercase tracking-widest leading-none mb-2">Lng</p>
                               <p className="text-[10px] text-white font-mono">31.2357°E</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </motion.div>
             </AnimatePresence>

             {/* Dynamic Satellites / Pings */}
             {[1, 2, 3, 4, 5].map(i => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.4, 0], scale: [1, 1.5, 1] }}
                  transition={{ duration: 5 + i, repeat: Infinity, delay: i * 2 }}
                  className="absolute w-2 h-2 bg-primary/20 rounded-full blur-[4px]"
                  style={{ top: `${15 * i + 5}%`, left: `${12 * i + 10}%` }}
                ></motion.div>
             ))}
             
             {/* Map Border Overlay */}
             <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none backdrop-blur-[1px]"></div>
          </div>
       </div>
    </div>
  );
}
