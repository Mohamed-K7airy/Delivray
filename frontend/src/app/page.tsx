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
    <div className="container-responsive section-spacing">
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
              className="relative mb-16 sm:mb-24 lg:mb-32 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0 pt-4"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] lg:w-[800px] h-[300px] sm:h-[600px] lg:h-[800px] bg-primary/10 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none z-0"></div>
              
              <div className="w-full lg:w-[55%] relative z-10">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full mb-6 lg:mb-8 border border-white/5 shadow-xl"
                >
                  <Sparkles size={16} className="text-primary" />
                  <span className="text-white font-black tracking-widest uppercase text-[10px] sm:text-xs">Lightning fast delivery</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="heading-responsive mb-6 sm:mb-8 leading-[0.9] !tracking-[-0.04em] lg:text-8xl"
                >
                  Craving <span className="text-primary italic">it.</span> <br/>
                  We deliver <span className="text-primary italic">it.</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-responsive mb-8 sm:mb-12 max-w-lg mx-auto lg:mx-0 lg:text-xl font-medium"
                >
                  Enjoy hot food, fresh groceries, and urgent medicine delivered directly to your door in minutes.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative max-w-xl mx-auto lg:mx-0 mb-10 sm:mb-12"
                >
                  <div className={`flex flex-col sm:flex-row items-center bg-white/5 p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border transition-all duration-300 w-full gap-2 ${searchFocused ? 'border-primary shadow-[0_0_30px_rgba(217,119,87,0.15)] bg-white/[0.08]' : 'border-white/5'}`}>
                    <div className="flex-1 flex items-center w-full">
                       <div className="pl-4 text-gray-500">
                         <MapPin size={18} />
                       </div>
                       <input 
                         type="text" 
                         onFocus={() => setSearchFocused(true)}
                         onBlur={() => setSearchFocused(false)}
                         placeholder="Enter delivery address..." 
                         className="w-full px-4 py-3 sm:py-4 outline-none text-white bg-transparent placeholder-gray-600 font-bold text-sm sm:text-base"
                       />
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-primary text-white w-full sm:w-auto px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 shrink-0 whitespace-nowrap"
                    >
                      Connect Now <ChevronRight size={18} className="inline ml-2" />
                    </motion.button>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center space-x-5 justify-center lg:justify-start"
                >
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#0a0a0a] overflow-hidden shadow-2xl">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <p className="text-white font-black text-xs sm:text-sm tracking-tight uppercase">50k+ Happy Diners</p>
                    <div className="flex text-primary mt-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} size={10} fill="currentColor" />)}
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div className="w-full lg:w-[40%] mt-12 lg:mt-0 flex justify-center relative z-10">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                  className="relative w-full max-w-md aspect-[4/5] sm:aspect-square lg:aspect-[4/5]"
                >
                    {/* Map Background Layer */}
                    <div className="absolute inset-0 rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center opacity-10 grayscale scale-125"></div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0a0a] via-transparent to-transparent"></div>
                      
                      {/* Map Points */}
                      <div className="absolute top-1/4 left-1/3 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_20px_rgba(217,119,87,1)] animate-pulse"></div>
                      <div className="absolute bottom-1/3 right-1/4 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,1)]"></div>
                    </div>

                    {/* Floating Live Tracking Card - Positioned better for mobile items */}
                    <motion.div 
                      animate={{ y: [0, -15, 0] }}
                      transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[85%] bg-[#121212]/90 backdrop-blur-3xl p-5 sm:p-7 rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-2xl z-20"
                    >
                      <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary">
                                <ShoppingBag size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Live Tracking</p>
                                <p className="text-white font-black text-sm uppercase">Order #4291</p>
                            </div>
                          </div>
                      </div>

                      {/* Progress Line */}
                      <div className="relative h-1 w-full bg-white/5 rounded-full mb-8">
                          <div className="absolute top-0 left-0 h-full w-2/3 bg-primary rounded-full shadow-[0_0_15px_rgba(217,119,87,0.6)]"></div>
                          <div className="absolute top-1/2 left-2/3 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 bg-primary border-4 border-[#121212] rounded-full shadow-lg"></div>
                      </div>

                      {/* Courier Info */}
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img src="https://i.pravatar.cc/100?img=11" alt="Courier" className="w-10 h-10 rounded-full border border-white/10" />
                            <div className="text-left">
                                <p className="text-white font-black text-xs">Marcus Chen</p>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-tighter">Courier Nearby</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-lg font-black text-white leading-none">08</p>
                             <p className="text-[8px] font-black text-gray-500 uppercase">Min</p>
                          </div>
                      </div>
                    </motion.div>

                    {/* Payment Verified Badge */}
                    <div className="absolute bottom-8 left-8 bg-[#1a1a1a]/95 backdrop-blur-xl px-4 py-2.5 rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl flex items-center space-x-2 z-30">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white">
                          <Sparkles size={10} fill="currentColor" />
                      </div>
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">Verified Security</span>
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
          className="mb-12 flex flex-col space-y-8 relative z-10"
        >
          <div className="flex items-end justify-between">
             <h2 className="heading-responsive !text-3xl sm:!text-4xl">Explore Categories</h2>
             <div className="hidden sm:block h-0.5 flex-1 bg-white/5 ml-8 rounded-full mb-4"></div>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((type, i) => (
              <motion.button
                key={type}
                onClick={() => setFilterType(type)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`whitespace-nowrap px-6 py-4 sm:px-10 sm:py-5 rounded-2xl sm:rounded-3xl font-black text-[10px] sm:text-xs tracking-[0.2em] uppercase transition-all shadow-xl ${
                  filterType === type 
                    ? 'bg-primary text-white shadow-primary/20 border border-transparent' 
                    : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/10 hover:text-white'
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
              <div key={i} className="animate-pulse card-responsive h-64 sm:h-80">
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
            className="text-center py-32 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/5 flex flex-col items-center justify-center max-w-5xl mx-auto shadow-2xl"
          >
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 text-gray-600 border border-white/5">
              <Search size={40} />
            </div>
            <p className="text-2xl text-white font-black mb-2 tracking-tight uppercase">No results found</p>
            <p className="text-gray-500 font-medium">Check back later or try another category</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-10"
          >
            {stores.map((store) => (
              <motion.div variants={itemVariants} key={store.id}>
                <Link href={`/store/${store.id}`} className="block group">
                  <div className="card-responsive !p-3 group-hover:-translate-y-2">
                    {/* Store Image with Rating Badge */}
                    <div className="relative h-48 sm:h-64 w-full rounded-xl sm:rounded-3xl overflow-hidden mb-5 sm:mb-7">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-110 transition-transform duration-1000"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      
                      <div className="absolute top-4 right-4 bg-[#0a0a0a]/60 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10 flex items-center shadow-2xl">
                        <Star size={12} className="text-primary fill-primary mr-2"/>
                        <span className="text-[10px] font-black text-white">4.8</span>
                      </div>
                    </div>

                    <div className="px-3 pb-3 text-left">
                       <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg sm:text-2xl font-black text-white group-hover:text-primary transition-colors line-clamp-1 truncate uppercase tracking-tight">
                            {store.name}
                          </h3>
                       </div>

                       <div className="flex items-center space-x-6">
                          <div className="flex items-center text-primary font-black text-[10px] uppercase tracking-widest">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                             Active
                          </div>
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            {store.type}
                          </span>
                       </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Marketing Sections */}
        <section id="services" className="section-spacing border-t border-white/5">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16 sm:mb-24"
          >
            <h2 className="heading-responsive mb-6">Our <span className="text-primary italic">Services.</span></h2>
            <p className="text-responsive max-w-2xl mx-auto">Premium delivery solutions for every need. Speed, quality, and care in every order.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {[
              { title: 'Rapid Delivery', desc: 'Hot meals at your doorstep in under 30 minutes.', icon: <Sparkles size={24} className="text-primary"/> },
              { title: 'Grocery Hub', desc: 'Fresh ingredients delivered directly from local markets.', icon: <ShoppingBag size={24} className="text-primary"/> },
              { title: 'Pharmacy Care', desc: 'Essential medical supplies delivered when you need them most.', icon: <MapPin size={24} className="text-primary"/> }
            ].map((service, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-white/5 border border-white/5 rounded-2xl sm:rounded-[3rem] p-8 sm:p-12 hover:border-primary/20 transition-all group text-left"
              >
                <div className="mb-8 w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-4 uppercase tracking-[0.1em]">{service.title}</h3>
                <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-medium">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="tracking" className="section-spacing border-t border-white/5">
          <div className="bg-gradient-to-br from-primary/10 to-transparent p-8 sm:p-20 rounded-[3rem] sm:rounded-[5rem] border border-primary/20 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 overflow-hidden relative">
            <div className="flex-1 z-10 text-center lg:text-left">
              <span className="bg-primary/20 text-primary px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 block w-fit mx-auto lg:mx-0">Real-time Evolution</span>
              <h2 className="heading-responsive mb-8 !text-4xl sm:!text-6xl">Elite <span className="text-primary italic">Tracking.</span></h2>
              <p className="text-responsive mb-12 max-w-md mx-auto lg:mx-0 lg:text-lg font-medium">Watch your order's every move with our high-fidelity, sub-second tracking technology.</p>
              <button 
                onClick={handleExperienceClick}
                className="button-responsive bg-primary text-white"
              >
                Experience Interaction
              </button>
            </div>
            <div className="flex-1 relative w-full aspect-video bg-[#0a0a0a] rounded-[2rem] sm:rounded-[3rem] border border-white/5 overflow-hidden flex items-center justify-center">
               <div className="animate-pulse flex flex-col items-center">
                 <div className="w-24 h-2 bg-primary/20 rounded-full mb-4"></div>
                 <div className="w-48 h-2 bg-white/5 rounded-full"></div>
               </div>
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            </div>
          </div>
        </section>

        <section id="pricing" className="section-spacing border-t border-white/5 text-center">
          <h2 className="heading-responsive mb-12 sm:mb-20">Simple <span className="text-primary italic">Pricing.</span></h2>
          <div className="max-w-4xl mx-auto card-responsive !bg-white/5 !p-8 sm:!p-20">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-center md:text-left">
                <div>
                   <h3 className="text-2xl sm:text-4xl font-black text-white mb-6 uppercase tracking-tight">Zero Hidden Costs</h3>
                   <p className="text-gray-500 font-medium leading-relaxed sm:text-lg">Transparent delivery costs based on distance and order volume. Always fair, always clear.</p>
                </div>
                <div className="flex flex-col justify-center items-center md:items-end">
                   <div className="text-7xl sm:text-9xl font-black text-primary leading-none tracking-tighter">$0<span className="text-3xl">.00</span></div>
                   <div className="text-[10px] font-black text-white uppercase tracking-[0.4em] mt-4">Standard Entry</div>
                </div>
             </div>
          </div>
        </section>

        <section id="partners" className="section-spacing border-t border-white/5">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="heading-responsive mb-6">Nexus <span className="text-primary italic">Partners.</span></h2>
            <p className="text-responsive">Join the global network and grow your business with our cutting-edge logistics platform.</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
             <button className="button-responsive bg-white text-black">Merchant Portal</button>
             <button className="button-responsive bg-white/5 text-white border border-white/10 hover:bg-white/10">Driver Ecosystem</button>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
