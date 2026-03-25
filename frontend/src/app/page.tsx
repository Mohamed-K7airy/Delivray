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
              className="relative mb-20 lg:mb-40 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24 pt-8"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] lg:w-[1000px] h-[300px] sm:h-[600px] lg:h-[1000px] bg-primary/5 blur-[120px] lg:blur-[180px] rounded-full pointer-events-none z-0"></div>
              
              <div className="w-full lg:w-[50%] relative z-10">
                <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.1 }}
                   className="inline-flex items-center space-x-3 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-full mb-8 border border-white/5 shadow-2xl"
                >
                  <Sparkles size={16} className="text-primary" />
                  <span className="text-white font-black tracking-[0.3em] uppercase text-[10px]">Evolving Logistics</span>
                </motion.div>
                
                <motion.h1 
                  className="heading-responsive mb-8 !tracking-[-0.05em] lg:!text-8xl"
                >
                  Craving <span className="text-primary italic">it.</span> <br/>
                  We deliver <span className="text-primary italic">it.</span>
                </motion.h1>
                
                <motion.p 
                  className="text-responsive mb-12 max-w-xl mx-auto lg:mx-0"
                >
                  Experience the next generation of delivery. Hot meals, fresh groceries, and essentials arriving with cinematic precision.
                </motion.p>
                
                <motion.div 
                  className="relative max-w-xl mx-auto lg:mx-0 mb-16"
                >
                  <div className={`flex flex-col sm:flex-row items-center bg-[#111111] p-2.5 rounded-2xl lg:rounded-3xl border transition-all duration-500 w-full gap-3 ${searchFocused ? 'border-primary shadow-[0_0_50px_rgba(217,119,87,0.1)]' : 'border-white/10'}`}>
                    <div className="flex-1 flex items-center w-full">
                       <div className="pl-5 text-gray-600">
                         <MapPin size={20} />
                       </div>
                       <input 
                         type="text" 
                         onFocus={() => setSearchFocused(true)}
                         onBlur={() => setSearchFocused(false)}
                         placeholder="Designate delivery terminal..." 
                         className="w-full px-5 py-4 outline-none text-white bg-transparent placeholder-gray-700 font-black text-sm uppercase tracking-wider"
                       />
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-primary text-white w-full sm:w-auto px-10 py-5 rounded-xl lg:rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 shrink-0"
                    >
                      Initialize <ChevronRight size={18} className="inline ml-2" />
                    </motion.button>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-center space-x-6 justify-center lg:justify-start"
                >
                  <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-[#0a0a0a] overflow-hidden shadow-2xl bg-[#111111]">
                        <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <p className="text-white font-black text-[10px] tracking-[0.3em] uppercase">Trusted by 50k+ Elite Users</p>
                    <div className="flex text-primary mt-1.5 space-x-1">
                      {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div className="w-full lg:w-[45%] mt-12 lg:mt-0 flex justify-center relative z-10">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                  className="relative w-full max-w-lg aspect-square"
                >
                    {/* Visual Layer */}
                    <div className="absolute inset-0 rounded-[3rem] overflow-hidden border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] bg-[#050505]">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center opacity-10 grayscale"></div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0a0a] via-transparent to-primary/5"></div>
                    </div>

                    {/* Dashboard Element */}
                    <motion.div 
                      animate={{ y: [0, -20, 0] }}
                      transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] bg-[#0f0f0f] p-8 rounded-[2.5rem] border border-white/10 shadow-2xl z-20"
                    >
                      <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group">
                                <ShoppingBag size={24} className="group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] leading-none mb-2">Network Status</p>
                                <p className="text-white font-black text-sm uppercase tracking-wider">Intercept #2901</p>
                            </div>
                          </div>
                      </div>

                      <div className="relative h-2 w-full bg-white/5 rounded-full mb-10">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '75%' }}
                            className="absolute h-full bg-primary rounded-full shadow-[0_0_25px_rgba(217,119,87,0.5)]"
                          />
                      </div>

                      <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full border-2 border-primary/20 p-1">
                               <img src="https://i.pravatar.cc/100?img=11" alt="Courier" className="w-full h-full rounded-full" />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-black text-xs uppercase tracking-tight">Active Courier</p>
                                <p className="text-primary text-[9px] font-black uppercase tracking-[0.2em] mt-1">Approaching Nexus</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-2xl font-black text-white leading-none tracking-tighter">04</p>
                             <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">Min</p>
                          </div>
                      </div>
                    </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div layout transition={{ duration: 0.5 }}>
        {/* Enhanced Filters */}
        <motion.div className="mb-16 space-y-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
             <h2 className="heading-responsive !text-4xl lg:!text-5xl">Ecosystem <span className="text-primary italic">Nodes.</span></h2>
             <div className="hidden lg:block h-px flex-1 bg-white/5 mx-12 mb-5"></div>
             <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Filtering Active</p>
          </div>
          
          <div className="flex flex-wrap gap-4 sm:gap-6 lg:justify-start">
            {categories.map((type) => (
              <motion.button
                key={type}
                onClick={() => setFilterType(type)}
                whileHover={{ y: -2 }}
                className={`px-8 py-5 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase transition-all shadow-2xl ${
                  filterType === type 
                    ? 'bg-primary text-white shadow-primary/30' 
                    : 'bg-[#111111] text-gray-500 border border-white/5 hover:border-white/20 hover:text-white'
                }`}
              >
                {type || 'Integrated Access'}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Store Grid (Optimized Density) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-8 xl:gap-12">
            {[1,2,3,4,5,6,7,8,9,10].map(i => (
              <div key={i} className="animate-pulse card-responsive h-80">
                <div className="bg-white/5 h-48 rounded-2xl mb-6"></div>
                <div className="h-6 bg-white/10 rounded-full w-3/4 mb-4"></div>
                <div className="h-3 bg-white/5 rounded-full w-1/2"></div>
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <motion.div 
            className="text-center py-40 bg-[#111111] rounded-[3rem] border border-white/5 flex flex-col items-center justify-center max-w-6xl mx-auto shadow-2xl"
          >
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-10 text-gray-700 border border-white/5">
              <Search size={44} />
            </div>
            <p className="text-3xl text-white font-black mb-4 tracking-tighter uppercase">Signal Lost</p>
            <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">No active nodes detected in this spectrum</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 xl:gap-10"
          >
            {stores.map((store) => (
              <motion.div variants={itemVariants} key={store.id}>
                <Link href={`/store/${store.id}`} className="block group">
                  <div className="card-responsive !p-3 group-hover:-translate-y-3 transition-all duration-500">
                    <div className="relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden mb-6">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-110 transition-transform duration-1000"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                      
                      <div className="absolute top-5 right-5 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 flex items-center shadow-2xl">
                        <Star size={12} className="text-primary fill-primary mr-2"/>
                        <span className="text-[10px] font-black text-white">4.8</span>
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                        <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tight mb-4">
                          {store.name}
                        </h3>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-primary font-black text-[10px] uppercase tracking-widest">
                             <div className="w-2 h-2 rounded-full bg-green-500 mr-2.5 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                             Active
                          </div>
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
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
