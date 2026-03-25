'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, MapPin, CheckCircle, Navigation, Info, LogOut, Phone, Mail, Search, Filter, Box, Truck, ChevronDown, User as UserIcon, ShieldCheck, Activity, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '@/config/api';
import Button from '@/components/Button';

export default function UserProfile() {
  const { token, user, setUser, setToken } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return router.push('/login');

    const fetchProfileData = async () => {
      try {
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (meRes.ok) setUser(await meRes.json());

        const ordersRes = await fetch(`${API_URL}/orders/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (ordersRes.ok) {
           const data = await ordersRes.json();
           setOrders(data);
        } else {
           // Mock data for high-fidelity preview
           setOrders([
             { id: 'ORD-7742', status: 'COMPLETED', created_at: '2023-11-12', total_price: 154.20, location: 'New Cairo, Sector 4', type: 'grocery' },
             { id: 'ORD-9102', status: 'DELIVERING', created_at: '2023-11-25', total_price: 42.50, location: 'Maadi, Rd 9', type: 'food' },
             { id: 'ORD-1244', status: 'COMPLETED', created_at: '2023-10-21', total_price: 210.00, location: 'Zamalek, Cairo', type: 'grocery' }
           ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [token, router, setUser]);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white/50 font-black uppercase tracking-[0.3em] animate-pulse">Initializing Profile...</div>;

  return (
    <div className="container-responsive py-6 sm:py-10 space-y-12 sm:space-y-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        
        {/* Sidebar Profile Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 2xl:col-span-3 lg:sticky lg:top-8"
        >
          <div className="card-responsive !bg-[#111111] !p-8 sm:!p-10 border-white/5 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
             
             {/* Avatar Section */}
             <div className="flex flex-col items-center text-center pb-10 border-b border-white/5">
                <div className="relative mb-8">
                   <div className="w-28 h-28 sm:w-32 sm:h-32 bg-primary text-white rounded-full flex items-center justify-center text-5xl font-black shadow-2xl shadow-primary/20 border-4 border-[#111111] group-hover:scale-105 transition-transform duration-500">
                     {user?.name?.charAt(0).toUpperCase() || 'M'}
                   </div>
                   <div className="absolute bottom-1 right-1 w-8 h-8 bg-black border-2 border-white/5 rounded-full flex items-center justify-center">
                     <ShieldCheck size={16} className="text-primary" />
                   </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">{user?.name}</h2>
                <div className="flex items-center gap-3 mt-4">
                   <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/10">
                     {user?.role || 'CLIENT'}
                   </span>
                   <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest hidden sm:block">ELITE TIER</span>
                </div>
             </div>

             {/* Personal Details */}
             <div className="py-10 space-y-6">
                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-gray-600">
                      <Phone size={14} className="text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Phone Link</span>
                   </div>
                   <p className="text-sm font-bold text-white pl-7 tracking-wider">{user?.phone || 'UNLINKED'}</p>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-gray-600">
                      <Mail size={14} className="text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Protocol Email</span>
                   </div>
                   <p className="text-sm font-bold text-white pl-7 tracking-wider truncate">{(user?.email || 'unlinked@delivray.net').toLowerCase()}</p>
                </div>
             </div>

             <Button 
               onClick={handleLogout}
               className="w-full !bg-white/5 !text-gray-500 !h-16 hover:!bg-red-500/10 hover:!text-red-500 hover:!border-red-500/20"
             >
               <LogOut size={18} className="mr-3" />
               <span>Deauthorize</span>
             </Button>
          </div>
        </motion.div>

        {/* Operational Records */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 2xl:col-span-9 space-y-12"
        >
          {/* Main Title Section */}
          <div>
             <h1 className="heading-responsive !text-3xl sm:!text-6xl uppercase tracking-tighter leading-none mb-6">Master <span className="text-primary italic">Profile.</span></h1>
             <p className="text-responsive max-w-2xl font-medium">Control your logistic preferences and audit your secure transaction history across the Delivray network.</p>
          </div>

          {/* Activity Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
              <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                 <Activity size={20} className="text-primary" />
                 <span>Operational History</span>
              </h2>
              <div className="flex items-center gap-4">
                 <button className="w-12 h-12 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-all">
                    <Filter size={18} />
                 </button>
              </div>
            </div>

            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="py-32 text-center bg-white/5 border border-white/5 rounded-[3rem] opacity-30">
                  <Box size={48} className="mx-auto mb-6" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No Logged Transactions</p>
                  <Link href="/" className="mt-8 inline-block text-primary text-[10px] font-black uppercase tracking-widest hover:underline underline-offset-8">
                    Initialize First Protocol
                  </Link>
                </div>
              ) : (
                orders.map((order, idx) => (
                  <motion.div 
                    key={order.id} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="card-responsive !p-6 sm:!p-8 !bg-white/5 border-transparent hover:border-white/5 hover:!bg-white/[0.08] transition-all flex flex-col md:flex-row items-center justify-between gap-8 group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-6 sm:gap-10 w-full md:w-auto">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black/40 rounded-2xl flex items-center justify-center text-gray-600 group-hover:text-primary group-hover:scale-105 transition-all shadow-inner border border-white/5">
                        {order.status === 'PENDING' || order.status === 'DELIVERING' ? <Truck size={24} className="animate-pulse" /> : <Package size={24} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-4 mb-2">
                          <p className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">#{order.id.slice(-8).toUpperCase()}</p>
                          <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg border ${
                            order.status === 'COMPLETED' 
                              ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                              : 'bg-primary/10 text-primary border-primary/20'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-600">
                           <div className="flex items-center gap-2">
                              <Clock size={12} />
                              <span>{new Date(order.created_at).toLocaleDateString()}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <MapPin size={12} />
                              <span className="truncate max-w-[150px]">{order.location || 'Encrypted Loc'}</span>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full md:w-auto md:gap-12 pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
                       <div className="text-left md:text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-700 mb-1">Valuation</p>
                          <p className="text-2xl sm:text-3xl font-black text-white tracking-tighter">${Number(order.total_price).toFixed(2)}</p>
                       </div>
                       
                       <Link 
                         href={`/order/${order.id}`}
                         className={`h-14 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 ${
                           order.status === 'COMPLETED'
                             ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                             : 'bg-primary text-white shadow-2xl shadow-primary/20 hover:scale-105'
                         }`}
                       >
                         {order.status === 'COMPLETED' ? 'Review' : 'Live Track'}
                         <ChevronRight size={14} />
                       </Link>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <button className="w-full py-10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-800 hover:text-white transition-colors flex items-center justify-center gap-4 group">
               <span className="group-hover:translate-y-1 transition-transform">Audit Complete History</span>
               <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
