'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Star, Search, Sparkles, ChevronRight, Zap, Clock, Utensils, ShoppingCart, Croissant, IceCream, Coffee } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config/api';

interface Store {
  id: string;
  name: string;
  type: string;
  location_lat: number;
  location_lng: number;
}

const categories = [
  { name: 'All Offers', icon: <Zap size={14} />, color: 'bg-[#FF5A3C]' },
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
        const res = await fetch(`${API_URL}/stores${typeParam}`);
        const data = await res.json();
        setStores(data);
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FF5A3C] border-t-transparent rounded-full animate-spin" />
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
                className="inline-flex items-center gap-2 bg-[#FFF9F8] px-4 py-2 rounded-full border border-[#FFE7E2]"
              >
                <Zap size={14} className="text-[#FF5A3C]" fill="currentColor" />
                <span className="text-[10px] sm:text-[11px] font-black text-[#FF5A3C] uppercase tracking-widest text-[#FF5A3C]">Lightning Fast Delivery</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-[3.5rem] sm:text-[5.5rem] lg:text-[7.5rem] font-black tracking-tight leading-[0.9] text-[#0A0A0A]"
              >
                Craving <span className="text-[#FF5A3C]">it.</span> <br />
                We deliver <span className="text-[#FF5A3C]">it.</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-xl mx-auto lg:mx-0 relative"
              >
                <div className="bg-white rounded-3xl p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 flex items-center w-full group">
                    <MapPin className="ml-4 text-gray-300 group-focus-within:text-[#FF5A3C] transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Enter delivery address..."
                      className="w-full px-4 py-4 md:py-5 outline-none text-sm md:text-base font-bold text-[#0A0A0A] placeholder-gray-300 bg-transparent focus:ring-0"
                    />
                  </div>
                  <button className="w-full sm:w-auto bg-[#FF5A3C] text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-[#FF5A3C]/30 hover:bg-[#E84A2C] transition-all flex items-center justify-center gap-2">
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
                <div className="text-left border-l-4 border-gray-100 pl-6">
                  <p className="text-3xl font-black text-[#0A0A0A]">15k+</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Active Riders</p>
                </div>
                <div className="text-left border-l-4 border-gray-100 pl-6">
                  <p className="text-3xl font-black text-[#0A0A0A]">4.9/5</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">User Rating</p>
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
                  <div className="w-full h-full rounded-[3.5rem] sm:rounded-[4.5rem] overflow-hidden rotate-[-2deg] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)]">
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
                    className="absolute -top-8 -right-4 sm:-right-8 bg-white/90 backdrop-blur-xl p-3 sm:p-5 rounded-3xl shadow-2xl border border-white/50 flex items-center gap-4 z-20"
                  >
                     <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-[#FF5A3C]/20 shadow-sm">
                        <img src="https://i.pravatar.cc/150?img=12" className="w-full h-full object-cover" alt="Courier" />
                     </div>
                     <div className="text-left pr-4">
                        <p className="text-sm font-black text-[#0A0A0A] tracking-tight">Marco R.</p>
                        <div className="flex items-center gap-1 mt-0.5">
                           <Star size={10} className="text-[#FFDA3C] fill-[#FFDA3C]" />
                           <span className="text-[10px] font-bold text-gray-400">5.0 Courier</span>
                        </div>
                     </div>
                  </motion.div>

                  {/* Badge: Delivery Status */}
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-10 sm:-bottom-12 -left-4 sm:-left-12 bg-white/90 backdrop-blur-3xl p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl border border-white/50 w-[85%] sm:w-[320px] z-20 text-left"
                  >
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFF5F3] rounded-2xl flex items-center justify-center text-[#FF5A3C]">
                            <Zap size={24} />
                        </div>
                        <span className="bg-[#FFF9F8] text-[#FF5A3C] px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-[#FFE7E2]">In Transit</span>
                     </div>
                     <h4 className="text-lg sm:text-2xl font-black text-[#0A0A0A] tracking-tight leading-none">Your order is arriving</h4>
                     <p className="text-[10px] sm:text-xs font-bold text-gray-400 mt-2">Estimated arrival in <span className="text-[#0A0A0A]">12 mins</span></p>
                     
                     <div className="mt-8 flex gap-1.5 h-1.5">
                        <div className="flex-1 bg-[#FF5A3C] rounded-full shadow-[0_0_10px_rgba(255,90,60,0.3)]"></div>
                        <div className="flex-1 bg-[#FF5A3C] rounded-full"></div>
                        <div className="flex-1 bg-[#FF5A3C] rounded-full opacity-40"></div>
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
    <div className="bg-[#F8F8F8] min-h-screen">
      <div className="container-responsive py-12 lg:py-20 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <h2 className="text-5xl lg:text-7xl font-black text-[#0A0A0A] tracking-tighter">What's on the <span className="text-[#FF5A3C] italic">menu?</span></h2>
          <p className="text-gray-400 font-bold max-w-xl text-lg lg:text-xl">Discover the best local restaurants and groceries delivered straight to your doorstep with lightning speed.</p>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setFilterType(cat.name)}
              className={`flex items-center gap-3 px-6 py-4 rounded-3xl font-black text-[13px] whitespace-nowrap transition-all border shrink-0 ${
                filterType === cat.name 
                  ? 'bg-[#FF5A3C] text-white border-[#FF5A3C] shadow-xl shadow-[#FF5A3C]/20' 
                  : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${filterType === cat.name ? 'bg-white/20' : 'bg-gray-50'}`}>
                 {cat.icon}
              </div>
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
                  <Link href={`/store/${store.id}`} className="group block h-full">
                    <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] group-hover:-translate-y-2 transition-all duration-500 relative h-full flex flex-col">
                      <div className="relative h-64 overflow-hidden">
                        <img 
                          src={`https://images.unsplash.com/photo-${store.type === 'Restaurant' ? '1504674900247-0877df9cc836' : '1542831371-29b0f74f9713'}?w=800&auto=format&fit=crop`} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                          alt={store.name} 
                        />
                        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 flex items-center gap-1.5 shadow-sm">
                           <Star size={12} className="text-[#FFDA3C] fill-[#FFDA3C]" />
                           <span className="text-[11px] font-black text-[#0A0A0A]">4.8</span>
                        </div>
                      </div>

                      <div className="p-8 space-y-6 flex-1 flex flex-col">
                        <div>
                           <h3 className="text-2xl font-black text-[#0A0A0A] tracking-tight group-hover:text-[#FF5A3C] transition-colors line-clamp-1">{store.name}</h3>
                           <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-wider">
                                 <Clock size={14} className="text-[#FF5A3C]" />
                                 <span>20-30 min</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-wider">
                                 <ShoppingCart size={14} className="text-[#FF5A3C]" />
                                 <span>$2.99 Fee</span>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                           <span className="text-[10px] font-black text-[#FF5A3C] uppercase tracking-[0.2em]">{filterType === 'All Offers' ? 'Signature Merchant' : store.type}</span>
                           <div className="w-12 h-12 bg-gray-50 group-hover:bg-[#FF5A3C] rounded-full flex items-center justify-center transition-all">
                              <ChevronRight size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                           </div>
                        </div>
                      </div>

                      {store.name === 'Lumina Fine Dining' && (
                        <div className="absolute bottom-40 right-10 w-12 h-12 bg-[#FF5A3C] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#FF5A3C]/40 z-30">
                           <ShoppingCart size={20} />
                        </div>
                      )}
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
