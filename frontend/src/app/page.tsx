'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Star, ShoppingBag, Search, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';

interface Store {
  id: string;
  name: string;
  type: string;
  location_lat: number;
  location_lng: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

export default function Home() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const handleExperienceClick = () => {
    if (!token) {
      toast.error('Please log in to track your orders');
      router.push('/login');
    } else {
      router.push('/profile');
    }
  };

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const url = filterType 
          ? `${API_URL}/stores?type=${filterType}`
          : `${API_URL}/stores`;
        const res = await fetch(url);
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

  const categories = ['', 'Restaurant', 'Grocery', 'Pharmacy', 'Cafe'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-16">
      <AnimatePresence mode="wait">
        {!token && (
          <motion.div 
            key="hero"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.5, ease: 'circOut' }}
            className="overflow-hidden"
          >
            {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mb-10 md:mb-28 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 pt-4"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
              
              <div className="w-full md:w-[55%] relative z-10">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full mb-5 sm:mb-8 border border-white/10 shadow-lg"
                >
                  <Sparkles size={16} className="text-primary" />
                  <span className="text-white font-bold tracking-wide uppercase text-xs sm:text-sm">Lightning fast delivery</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-4 sm:mb-6 leading-[0.95] tracking-tighter"
                >
                  Craving <span className="text-primary italic">it.</span> <br/>
                  We deliver <span className="text-primary italic">it.</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-400 text-sm sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-lg leading-relaxed font-medium mx-auto md:mx-0"
                >
                  Enjoy hot food, fresh groceries, and urgent medicine delivered directly to your door in minutes.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative max-w-xl mx-auto md:mx-0 mb-8 sm:mb-10"
                >
                  <div className={`flex items-center bg-[#262624] p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border transition-all duration-300 w-full ${searchFocused ? 'border-primary ring-4 ring-primary/10' : 'border-white/5'}`}>
                    <div className="pl-3 sm:pl-4 text-gray-500">
                      <MapPin size={16} />
                    </div>
                    <input 
                      type="text" 
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      placeholder="Enter your delivery address..." 
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 outline-none text-white bg-transparent placeholder-gray-500 font-bold text-sm sm:text-base"
                    />
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-primary text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm shadow-lg shadow-primary/20 shrink-0 whitespace-nowrap"
                    >
                      Order Now <ChevronRight size={16} className="inline ml-1" />
                    </motion.button>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center space-x-4 justify-center md:justify-start"
                >
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1a1a1a] overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">50k+ Happy Diners</p>
                    <div className="flex text-primary">
                      {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div className="hidden lg:flex lg:w-[45%] mt-16 lg:mt-0 justify-center relative z-10 w-full">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="relative w-full max-w-lg aspect-square"
                >
                    {/* Map Background Layer */}
                    <div className="absolute inset-0 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale scale-125"></div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#1a1a1a] via-transparent to-transparent"></div>
                      
                      {/* Map Points */}
                      <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(217,119,87,0.8)] animate-pulse"></div>
                      <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div>
                    </div>

                    {/* Floating Live Tracking Card */}
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] bg-[#262624]/90 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl z-20"
                    >
                      <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                                <ShoppingBag size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Live Tracking</p>
                                <p className="text-white font-black text-sm">Order #4291</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-white">12</p>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mins</p>
                          </div>
                      </div>

                      {/* Progress Line */}
                      <div className="relative h-1 w-full bg-white/5 rounded-full mb-8">
                          <div className="absolute top-0 left-0 h-full w-2/3 bg-primary rounded-full shadow-[0_0_10px_rgba(217,119,87,0.5)]"></div>
                          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-3 bg-white border-2 border-primary rounded-full"></div>
                          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-3 h-3 bg-white border-2 border-primary rounded-full"></div>
                          <div className="absolute top-1/2 left-2/3 -translate-y-1/2 w-5 h-5 bg-primary border-4 border-white rounded-full shadow-lg"></div>
                      </div>

                      {/* Courier Info */}
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img src="https://i.pravatar.cc/100?img=11" alt="Courier" className="w-10 h-10 rounded-full border border-white/10" />
                            <div>
                                <p className="text-white font-black text-xs">Marcus Chen</p>
                                <p className="text-gray-500 text-[10px] font-medium">Your Courier is nearby</p>
                            </div>
                          </div>
                          <button className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all">
                            <ChevronRight size={16} />
                          </button>
                      </div>
                    </motion.div>

                    {/* Payment Verified Badge */}
                    <div className="absolute bottom-10 left-10 bg-[#262624]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-xl flex items-center space-x-2 z-30">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white">
                          <Sparkles size={10} fill="currentColor" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">Payment Verified</span>
                    </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div layout transition={{ duration: 0.5, ease: 'circOut' }}>
        {/* Filters Showcase */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col space-y-6 relative z-10"
        >
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tighter">Explore Categories</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((type, i) => (
              <motion.button
                key={type}
                onClick={() => setFilterType(type)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`whitespace-nowrap px-5 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm tracking-widest uppercase transition-all shadow-lg ${
                  filterType === type 
                    ? 'bg-primary text-white shadow-primary/20 border border-transparent' 
                    : 'bg-[#262624] text-gray-400 border border-white/5 hover:border-white/10 hover:text-white'
                }`}
              >
                {type || 'All Offers'}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Store Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="animate-pulse bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-[2rem] p-4 sm:p-5 shadow-sm h-64 sm:h-80 border border-white/5">
                <div className="bg-white/5 h-32 sm:h-40 rounded-xl sm:rounded-[1.5rem] mb-4 sm:mb-6"></div>
                <div className="h-6 bg-white/10 rounded-full w-3/4 mb-4"></div>
                <div className="h-4 bg-white/5 rounded-full w-1/2"></div>
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 bg-[#2d2d2b]/20 backdrop-blur-3xl rounded-[3rem] border border-white/5 flex flex-col items-center justify-center max-w-5xl mx-auto shadow-2xl"
          >
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 text-gray-600 shadow-inner border border-white/5">
              <Search size={40} />
            </div>
            <p className="text-2xl text-white font-black mb-2 tracking-tight">No active offers for this category yet</p>
            <p className="text-gray-500 text-lg font-medium">Check back later or try another category</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {stores.map((store) => (
              <motion.div variants={itemVariants} key={store.id}>
                <Link href={`/store/${store.id}`} className="block group">
                  <div className="bg-[#262624]/40 backdrop-blur-md rounded-2xl sm:rounded-[2.5rem] p-3 sm:p-4 border border-white/5 hover:border-white/10 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] group-hover:-translate-y-2">
                    {/* Store Image with Rating Badge */}
                    <div className="relative h-40 sm:h-60 w-full rounded-xl sm:rounded-[2rem] overflow-hidden mb-4 sm:mb-6">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-110 transition-transform duration-1000"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/40 backdrop-blur-xl px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/10 flex items-center shadow-2xl">
                        <Star size={14} className="text-primary fill-primary mr-1.5"/>
                        <span className="text-xs font-black text-white">4.8</span>
                      </div>
                    </div>

                    <div className="px-2 pb-2">
                       <div className="flex justify-between items-start mb-4">
                          <h3 className="text-base sm:text-xl font-black text-white group-hover:text-primary transition-colors line-clamp-1">
                            {store.name}
                          </h3>
                          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                            {store.type}
                          </span>
                       </div>

                       <div className="flex items-center space-x-4">
                          <div className="flex items-center text-gray-400 font-bold text-[11px] uppercase tracking-wider">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                             15-25 min
                          </div>
                          <div className="flex items-center text-gray-500 font-bold text-[11px] uppercase tracking-wider">
                             <ShoppingBag size={12} className="mr-1.5 opacity-50"/>
                             $2.99 Fee
                          </div>
                       </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Marketing Sections for Navbar Links */}
        <section id="services" className="py-24 border-t border-white/5">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6 uppercase tracking-tight">Our <span className="text-primary italic">Services.</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto font-medium">Premium delivery solutions for every need. Speed, quality, and care in every order.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
            {[
              { title: 'Rapid Delivery', desc: 'Hot meals at your doorstep in under 30 minutes.', icon: <Sparkles className="text-primary"/> },
              { title: 'Grocery Hub', desc: 'Fresh ingredients delivered directly from local markets.', icon: <ShoppingBag className="text-primary"/> },
              { title: 'Pharmacy Care', desc: 'Essential medical supplies delivered when you need them most.', icon: <MapPin className="text-primary"/> }
            ].map((service, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-[#262624]/40 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-white/5 hover:border-primary/20 transition-all group"
              >
                <div className="mb-4 sm:mb-6 w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mb-3 sm:mb-4 uppercase tracking-wider">{service.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="tracking" className="py-24 border-t border-white/5">
          <div className="bg-gradient-to-br from-primary/10 to-transparent p-6 sm:p-12 md:p-20 rounded-2xl sm:rounded-[4rem] border border-primary/20 flex flex-col md:flex-row items-center gap-8 sm:gap-12 overflow-hidden relative">
            <div className="flex-1 z-10">
              <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 block w-fit">Real-time Data</span>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-6 sm:mb-8 leading-tight">Elite <span className="text-primary italic">Tracking.</span></h2>
              <p className="text-gray-400 text-base sm:text-lg mb-8 sm:mb-10 max-w-md font-medium">Watch your order's every move with our high-fidelity, sub-second tracking technology.</p>
              <button 
                onClick={handleExperienceClick}
                className="bg-primary text-white px-8 py-4 sm:px-10 sm:py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20"
              >
                Experience It Now
              </button>
            </div>
            <div className="flex-1 relative w-full h-52 sm:h-80 bg-gray-900/50 rounded-2xl sm:rounded-[3rem] border border-white/5 overflow-hidden flex items-center justify-center">
               <div className="animate-pulse flex flex-col items-center">
                 <div className="w-20 h-2 bg-primary/20 rounded-full mb-4"></div>
                 <div className="w-40 h-2 bg-white/5 rounded-full"></div>
               </div>
               {/* Visual hint of a map/line */}
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24 border-t border-white/5 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-8 sm:mb-12 uppercase tracking-tight">Simple <span className="text-primary italic">Pricing.</span></h2>
          <div className="max-w-4xl mx-auto bg-[#262624]/40 backdrop-blur-xl p-6 sm:p-10 md:p-16 rounded-2xl sm:rounded-[4rem] border border-white/5">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                <div>
                   <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-[0.1em]">No Hidden Fees</h3>
                   <p className="text-gray-500 font-medium leading-relaxed">Transparent delivery costs based on distance and order volume. Always fair, always clear.</p>
                </div>
                <div className="flex flex-col justify-center">
                   <div className="text-6xl font-black text-primary leading-none">$0.00</div>
                   <div className="text-sm font-black text-white uppercase tracking-[0.3em] mt-2">Starting Delivery</div>
                </div>
             </div>
          </div>
        </section>

        <section id="partners" className="py-24 border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6 uppercase tracking-tight">Become a <span className="text-primary italic">Partner.</span></h2>
            <p className="text-gray-400 font-medium">Join the network and grow your business with our cutting-edge logistics platform.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
             <button className="bg-white text-black px-8 py-4 sm:px-12 sm:py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all">Merchant Portal</button>
             <button className="bg-[#262624] text-white px-8 py-4 sm:px-12 sm:py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] border border-white/10 hover:bg-white/5 transition-all">Driver App</button>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
