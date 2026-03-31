'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Star, Search, Sparkles, ChevronRight, Zap, Clock, Utensils, ShoppingCart, Croissant, IceCream, Coffee } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config/api';
import { apiClient } from '@/lib/apiClient';

interface Store {
  id: string;
  name: string;
  type: string;
  location_lat: number;
  location_lng: number;
  image?: string;
}

const categories = [
  { name: 'All Offers', icon: <Zap size={14} />, color: 'bg-[#0f172a]' },
  { name: 'Restaurant', icon: <Utensils size={14} />, color: 'bg-white' },
  { name: 'Grocery', icon: <ShoppingCart size={14} />, color: 'bg-white' },
  { name: 'Bakery', icon: <Croissant size={14} />, color: 'bg-white' },
  { name: 'Desserts', icon: <IceCream size={14} />, color: 'bg-white' },
  { name: 'Drinks', icon: <Coffee size={14} />, color: 'bg-white' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function Home() {
  const router = useRouter();
  const { token, _hasHydrated } = useAuthStore();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All Offers');

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const typeParam = filterType === 'All Offers' ? '' : `?type=${filterType}`;
        const data = await apiClient(`/stores${typeParam}`);
        if (data) setStores(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, [filterType]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#0f172a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="bg-white min-h-[calc(100vh-80px)] flex flex-col justify-center overflow-x-hidden">
        <div className="container-responsive py-16 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-20 lg:gap-12">
            {/* Left Content */}
            <div className="w-full lg:w-1/2 space-y-12 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-full border border-slate-100 shadow-sm"
              >
                <Zap size={14} className="text-slate-900" fill="currentColor" />
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-900 uppercase tracking-[0.2em]">Operational Excellence</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="text-[2.5rem] sm:text-[5.5rem] lg:text-[7.5rem] font-bold tracking-tight leading-[0.85] text-slate-900"
              >
                Gourmet <br />
                Logistics.
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="max-w-xl mx-auto lg:mx-0"
              >
                <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 flex items-center w-full group text-left px-2">
                    <MapPin className="text-slate-300 group-focus-within:text-slate-900 transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Specify logistics endpoint..."
                      className="w-full px-4 py-5 outline-none text-base font-bold text-slate-900 placeholder-slate-200 bg-transparent"
                    />
                  </div>
                  <button className="w-full sm:w-auto bg-slate-900 text-white px-12 py-5 rounded-xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]">
                    Initiate <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.2 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-16 pt-12"
              >
                <div className="text-left">
                  <p className="text-4xl font-bold text-slate-900 tracking-tighter">24/7</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 border-t border-slate-100 pt-2">Network Availability</p>
                </div>
                <div className="text-left">
                  <p className="text-4xl font-bold text-slate-900 tracking-tighter">99.9%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 border-t border-slate-100 pt-2">Fulfillment Rate</p>
                </div>
              </motion.div>
            </div>

            {/* Right Media */}
            <div className="w-full lg:w-[48%] relative">
               <motion.div
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.8 }}
                 className="relative aspect-square"
               >
                  <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100">
                     <img 
                       src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=3000&auto=format&fit=crop" 
                       className="w-full h-full object-cover" 
                       alt="Gourmet Logistics"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                  </div>

                  {/* Courier Badge */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="absolute -top-10 -right-4 bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 flex items-center gap-5 z-20 min-w-[240px]"
                  >
                     <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-sm">
                        <img src="https://i.pravatar.cc/150?img=12" className="w-full h-full object-cover" alt="Logistics Partner" />
                     </div>
                     <div className="text-left">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fleet Partner</p>
                        <p className="text-lg font-bold text-slate-900 tracking-tight leading-none">Marcus Verity</p>
                        <div className="flex items-center gap-1.5 mt-2 bg-slate-50 px-2 py-1 rounded w-fit">
                           <Star size={10} className="text-slate-900 fill-slate-900" />
                           <span className="text-[9px] font-bold text-slate-900">VERIFIED LOGISTICS</span>
                        </div>
                     </div>
                  </motion.div>

                  {/* Status Card */}
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-12 -left-8 bg-white/95 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 w-[90%] sm:w-[360px] z-20 text-left"
                  >
                     <div className="flex justify-between items-start mb-8">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <Zap size={28} />
                        </div>
                        <span className="bg-slate-50 text-slate-900 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-slate-100 shadow-sm">Flow Status: Active</span>
                     </div>
                     <h4 className="text-3xl font-bold text-slate-900 tracking-tight leading-none mb-3">Intercepting Request.</h4>
                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimated arrival in <span className="text-slate-900">12 minutes</span> from dispatch.</p>
                     
                     <div className="mt-10 flex gap-2 h-1.5">
                        <div className="flex-[2] bg-slate-900 rounded-full shadow-[0_0_12px_rgba(15,23,42,0.3)]"></div>
                        <div className="flex-1 bg-slate-200 rounded-full"></div>
                        <div className="flex-1 bg-slate-100 rounded-full"></div>
                        <div className="flex-1 bg-slate-50 rounded-full border border-slate-100"></div>
                     </div>
                  </motion.div>
               </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged In Home
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container-responsive py-16 lg:py-24 space-y-16">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-slate-900 rounded-full animate-pulse" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Network Online</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[0.9]">Select Your <br /> <span className="text-slate-300">Operational Hub.</span></h2>
          <p className="text-slate-400 font-medium max-w-2xl text-lg lg:text-xl uppercase tracking-tighter">Real-time marketplace sync. Quality-verified logistics partners available now.</p>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto no-scrollbar gap-3 pb-4">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setFilterType(cat.name)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] whitespace-nowrap transition-all border shrink-0 active:scale-95 ${
                filterType === cat.name 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xl' 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 shadow-sm'
              }`}
            >
              <span className={filterType === cat.name ? 'text-white' : 'text-slate-900'}>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Store Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14"
            >
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-[2.5rem] h-[520px] animate-pulse border border-slate-100" />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 xl:gap-12"
            >
              {stores.map((store) => (
                <motion.div key={store.id} variants={itemVariants} transition={{ duration: 0.2 }}>
                  <Link href={`/store/${store.id}`} className="group block h-full">
                    <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300 h-full flex flex-col relative">
                      {/* Image Frame */}
                      <div className="relative h-64 lg:h-72 overflow-hidden">
                        <img 
                          src={
                            store.image || 
                            `https://images.unsplash.com/photo-${store.type === 'Restaurant' ? '1504674900247-0877df9cc836' : '1542831371-29b0f74f9713'}?w=800&auto=format&fit=crop`
                          }
                          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" 
                          alt={store.name} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60" />
                        
                        {/* Status Badges */}
                        <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl border border-slate-100">
                          <Star size={12} className="text-slate-900 fill-slate-900" />
                          <span className="text-[12px] font-bold text-slate-900 tabular-nums tracking-tighter">4.8</span>
                        </div>

                        <div className="absolute bottom-6 left-6 flex gap-2">
                          <span className="bg-white/95 backdrop-blur-md text-slate-900 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl border border-slate-100">
                            {store.type}
                          </span>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-8 lg:p-10 flex flex-col flex-1 justify-between gap-10">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tighter leading-none">
                              {store.name}.
                            </h3>
                            <div className="w-12 h-12 bg-slate-50 group-hover:bg-slate-900 rounded-2xl flex items-center justify-center transition-all shrink-0 -mt-2 group-hover:rotate-12 shadow-sm">
                              <ChevronRight size={20} className="text-slate-300 group-hover:text-white transition-colors" />
                            </div>
                          </div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                            Verified quality selection from <span className="text-slate-900">{store.name}</span> terminal.
                          </p>
                        </div>

                        {/* Metadata Footer */}
                        <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-900 border border-slate-100">
                                  <Clock size={14} />
                               </div>
                               <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lead Time</p>
                                  <p className="text-[11px] font-bold text-slate-900 uppercase">20-30 MIN</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-900 border border-slate-100">
                                  <MapPin size={14} />
                               </div>
                               <div>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Base Fee</p>
                                  <p className="text-[11px] font-bold text-slate-900 uppercase">45 ج.م</p>
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
