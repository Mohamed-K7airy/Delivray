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
}

const categories = [
  { name: 'All Offers', icon: <Zap size={14} />, color: 'bg-[#d97757]' },
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
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#d97757] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="bg-white min-h-[calc(100vh-80px)] flex flex-col justify-center overflow-hidden">
        <div className="container-responsive py-12 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8">
            {/* Left Content */}
            <div className="w-full lg:w-1/2 space-y-10 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-[#fef3f2] px-4 py-2 rounded-full border border-[#fee2e2]"
              >
                <Zap size={14} className="text-[#d97757]" fill="currentColor" />
                <span className="text-[10px] sm:text-[11px] font-black text-[#d97757] uppercase tracking-widest">Lightning Fast Delivery</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-[3.5rem] sm:text-[5.5rem] lg:text-[7.5rem] font-black tracking-tight leading-[0.9] text-[#111111]"
              >
                Craving <span className="text-[#d97757]">it.</span> <br />
                We deliver <span className="text-[#d97757]">it.</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-xl mx-auto lg:mx-0 relative"
              >
                <div className="bg-white rounded-2xl p-3 shadow-md border border-gray-100 flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 flex items-center w-full group">
                    <MapPin className="ml-4 text-gray-400 group-focus-within:text-[#d97757] transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Enter delivery address..."
                      className="w-full px-4 py-4 md:py-5 outline-none text-sm md:text-base font-bold text-[#111111] placeholder-gray-300 bg-transparent focus:ring-0"
                    />
                  </div>
                  <button className="w-full sm:w-auto bg-[#d97757] text-white px-10 py-5 rounded-xl font-bold text-sm uppercase tracking-wider shadow-md hover:bg-[#c2654a] transition-all flex items-center justify-center gap-2">
                    Order Now <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-12 pt-8"
              >
                <div className="text-left border-l-4 border-[#fef3f2] pl-6">
                  <p className="text-3xl font-black text-[#111111]">15k+</p>
                  <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mt-1">Active Riders</p>
                </div>
                <div className="text-left border-l-4 border-[#fef3f2] pl-6">
                  <p className="text-3xl font-black text-[#111111]">4.9/5</p>
                  <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mt-1">User Rating</p>
                </div>
              </motion.div>
            </div>

            {/* Right Media */}
            <div className="w-full lg:w-[45%] relative">
               <motion.div
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                 className="relative aspect-[4/5] sm:aspect-square"
               >
                  <div className="w-full h-full rounded-2xl sm:rounded-[4rem] overflow-hidden rotate-[-2deg] shadow-xl border border-gray-100">
                     <img 
                       src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=3000&auto=format&fit=crop" 
                       className="w-full h-full object-cover" 
                       alt="Gourmet Burger"
                     />
                  </div>

                  {/* Badge: Courier */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute -top-8 -right-4 sm:-right-8 bg-white p-3 sm:p-5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 z-20"
                  >
                     <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 border-[#d97757]/20 shadow-sm">
                        <img src="https://i.pravatar.cc/150?img=12" className="w-full h-full object-cover" alt="Courier" />
                     </div>
                     <div className="text-left pr-4">
                        <p className="text-sm font-black text-[#111111] tracking-tight">Marco R.</p>
                        <div className="flex items-center gap-1 mt-0.5">
                           <Star size={10} className="text-[#FFDA3C] fill-[#FFDA3C]" />
                           <span className="text-[10px] font-bold text-[#888888]">5.0 Courier</span>
                        </div>
                     </div>
                  </motion.div>

                  {/* Badge: Delivery Status */}
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-10 sm:-bottom-12 -left-4 sm:-left-12 bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100 w-[85%] sm:w-[320px] z-20 text-left"
                  >
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#fef3f2] rounded-xl flex items-center justify-center text-[#d97757] border border-[#fee2e2] shadow-inner">
                            <Zap size={24} />
                        </div>
                        <span className="bg-[#fef3f2] text-[#d97757] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-[#fee2e2]">In Transit</span>
                     </div>
                     <h4 className="text-lg sm:text-2xl font-black text-[#111111] tracking-tight leading-none">Your order is arriving</h4>
                     <p className="text-[10px] sm:text-xs font-bold text-[#888888] mt-2">Estimated arrival in <span className="text-[#111111]">12 mins</span></p>
                     
                     <div className="mt-8 flex gap-1.5 h-1.5">
                        <div className="flex-1 bg-[#d97757] rounded-full shadow-[0_0_8px_rgba(217,119,87,0.4)]"></div>
                        <div className="flex-1 bg-[#d97757] rounded-full"></div>
                        <div className="flex-1 bg-[#d97757] rounded-full opacity-40"></div>
                        <div className="flex-1 bg-gray-100 rounded-full"></div>
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
    <div className="bg-[#f9f9f9] min-h-screen">
      <div className="container-responsive py-12 lg:py-20 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <h2 className="text-5xl lg:text-6xl font-black text-[#111111] tracking-tight">What's on the <span className="text-[#d97757]">menu?</span></h2>
          <p className="text-[#555555] font-medium max-w-xl text-lg lg:text-xl">Discover the best local restaurants and groceries delivered straight to your doorstep.</p>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setFilterType(cat.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-wider whitespace-nowrap transition-all border shrink-0 ${
                filterType === cat.name 
                  ? 'bg-[#d97757] text-white border-[#d97757] shadow-sm' 
                  : 'bg-white text-[#888888] border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className={filterType === cat.name ? 'text-white' : 'text-[#d97757]'}>{cat.icon}</span>
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-[2.5rem] h-[450px] animate-pulse border border-gray-100" />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12"
            >
              {stores.map((store) => (
                <motion.div key={store.id} variants={itemVariants}>
                  <Link href={`/store/${store.id}`} className="group block">
                    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-md transition-all duration-300">
                      {/* Image */}
                      <div className="relative h-40 overflow-hidden">
                        <img 
                          src={
                            store.name === 'FreshMart' ? 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop' :
                            store.name === 'Daily Bread' ? 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop' :
                            store.name === 'Sweet Tooth' ? 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop' :
                            store.name === 'Bean & Brew' ? 'https://images.unsplash.com/photo-1501339818198-5ac8388f63ac?w=600&auto=format&fit=crop' :
                            store.name === 'La Bella Italia' ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop' :
                            store.name === 'Sushi Zen' ? 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop' :
                            `https://images.unsplash.com/photo-${store.type === 'Restaurant' ? '1504674900247-0877df9cc836' : '1542831371-29b0f74f9713'}?w=600&auto=format&fit=crop`
                          }
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          alt={store.name} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        {/* Rating */}
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                          <Star size={11} className="text-[#d97757] fill-[#d97757]" />
                          <span className="text-[11px] font-black text-[#111111]">4.8</span>
                        </div>
                        {/* Type badge */}
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-white/90 backdrop-blur-md text-[#d97757] px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">{store.type}</span>
                        </div>
                      </div>

                      {/* Info Row */}
                      <div className="px-4 py-3 flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-black text-[#111111] tracking-tight group-hover:text-[#d97757] transition-colors line-clamp-1">{store.name}</h3>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-[#888888] font-bold text-[10px]">
                              <Clock size={10} className="text-[#d97757]" /> 20-30 min
                            </span>
                            <span className="text-gray-200">·</span>
                            <span className="text-[10px] font-bold text-[#888888]">$2.99 delivery</span>
                          </div>
                        </div>
                        <div className="w-8 h-8 bg-gray-50 group-hover:bg-[#d97757] rounded-full flex items-center justify-center transition-all shrink-0 ml-3">
                          <ChevronRight size={14} className="text-gray-400 group-hover:text-white transition-colors" />
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
