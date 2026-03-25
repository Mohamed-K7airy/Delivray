'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, MapPin, CheckCircle, Navigation, Info, LogOut, Phone, Mail, Search, Filter, Box, Truck, ChevronDown } from 'lucide-react';

import { motion } from 'framer-motion';
import { API_URL } from '@/config/api';

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
           // Mock data if no real orders yet to show off the UI
           setOrders([
             { id: '098f3783', status: 'COMPLETED', created_at: '2023-10-24', total_price: 142.50, location: 'New Cairo, Egypt', type: 'grocery' },
             { id: '098f9122', status: 'PENDING', created_at: '2023-10-27', total_price: 89.90, location: 'Arriving in 12 mins', type: 'food' },
             { id: '098f1244', status: 'COMPLETED', created_at: '2023-10-21', total_price: 210.00, location: 'Maadi, Cairo', type: 'grocery' }
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

  if (loading) return <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white/50 font-black uppercase tracking-[0.3em]">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-[#111111] text-white selection:bg-primary/30 py-12 px-6 lg:px-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-40"></div>
      
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        
        {/* Sidebar / Left Profile Card */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 lg:sticky lg:top-12 h-fit"
        >
          <div className="bg-[#262624] p-10 rounded-[3rem] border border-white/5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center text-center">
               <div className="relative mb-8">
                  <div className="w-32 h-32 bg-[#f08c6e] text-white rounded-full flex items-center justify-center text-5xl font-black shadow-[0_20px_40px_-10px_rgba(240,140,110,0.5)]">
                    {user?.name?.charAt(0).toUpperCase() || 'M'}
                  </div>
                  <div className="absolute bottom-1 right-1 w-8 h-8 bg-[#262624] border-4 border-[#262624] rounded-full flex items-center justify-center">
                    <CheckCircle size={14} className="text-primary fill-primary/20" />
                  </div>
               </div>

               <h2 className="text-3xl font-black text-white mb-2 leading-tight uppercase tracking-tighter">{user?.name}</h2>
               <div className="flex items-center space-x-2 mb-10">
                  <span className="bg-[#f08c6e]/10 text-[#f08c6e] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-[#f08c6e]/10">
                    {user?.role || 'CUSTOMER'}
                  </span>
                  <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Elite Member</span>
               </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 mb-10">
               <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 group hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center space-x-3 text-primary mb-2">
                     <Phone size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Phone Number</span>
                  </div>
                  <p className="text-sm font-bold text-white pl-7 tracking-wider">{user?.phone || '+20 100 234 5678'}</p>
               </div>

               <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 group hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center space-x-3 text-primary mb-2">
                     <Mail size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email Address</span>
                  </div>
                  <p className="text-sm font-bold text-white pl-7 tracking-wider truncate">{(user?.email || 'mo.khairy@kinetic.vip').toLowerCase()}</p>
               </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full py-5 bg-white/[0.02] hover:bg-primary/[0.05] hover:text-primary transition-all rounded-2xl border border-white/5 flex items-center justify-center space-x-3 group"
            >
              <LogOut size={18} className="text-gray-500 group-hover:text-primary transition-colors" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-primary transition-all">Log Out</span>
            </button>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-9"
        >
          {/* Header */}
          <div className="mb-16">
             <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter uppercase leading-[0.8]">
                My <span className="text-[#f08c6e] drop-shadow-[0_10px_30px_rgba(240,140,110,0.3)]">Account</span>
             </h1>
             <p className="text-gray-500 text-lg md:text-xl font-medium mt-10 max-w-2xl leading-relaxed">
               Manage your elite delivery preferences and monitor your premium logistics history with state-of-the-art tracking.
             </p>
          </div>

          {/* Activity Section */}
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Recent Activity & Orders</h2>
            <div className="flex items-center space-x-4">
               <button className="w-12 h-12 bg-[#262624] border border-white/5 rounded-2xl flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                  <Filter size={20} />
               </button>
               <button className="w-12 h-12 bg-[#262624] border border-white/5 rounded-2xl flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                  <Search size={20} />
               </button>
            </div>
          </div>

          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-[#262624] p-20 rounded-[3rem] border border-white/5 text-center shadow-2xl">
                <Box size={60} className="mx-auto text-white/5 mb-8" />
                <p className="text-gray-500 font-bold text-xl uppercase tracking-widest">No order history found yet.</p>
                <Link href="/" className="mt-8 inline-block bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform">
                  Start Exploring
                </Link>
              </div>
            ) : (
              orders.map((order, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={order.id} 
                  className="bg-[#262624]/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center justify-between hover:bg-[#262624]/80 transition-all group"
                >
                  <div className="flex items-center space-x-8 w-full md:w-auto mb-6 md:mb-0">
                    <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center text-white/40 group-hover:text-primary transition-colors">
                      {order.status === 'PENDING' ? <Truck size={28} /> : <Box size={28} />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-4 mb-2">
                        <p className="font-black text-2xl text-white tracking-widest uppercase">#{order.id.includes('-') ? order.id.substring(0,8) : order.id}</p>
                        <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg border ${
                          order.status === 'COMPLETED' 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                            : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-[10px] font-black uppercase tracking-widest text-gray-500">
                         <div className="flex items-center space-x-2">
                            <Package size={12} className="text-gray-700" />
                            <span>{order.created_at || 'Oct 24, 2023'}</span>
                         </div>
                         <div className="flex items-center space-x-2">
                            <MapPin size={12} className="text-gray-700" />
                            <span>{order.location || 'New Cairo, Egypt'}</span>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto md:space-x-12">
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Total Amount</p>
                        <p className="text-3xl font-black text-white tracking-tighter">${Number(order.total_price).toFixed(2)}</p>
                     </div>
                     
                     <Link 
                       href={`/order/${order.id}`}
                       className={`px-8 py-4 rounded-xl font-black uppercase tracking-[0.1em] text-[10px] transition-all transform active:scale-95 ${
                         order.status === 'PENDING'
                           ? 'bg-primary text-white shadow-[0_10px_20px_-5px_rgba(217,119,87,0.4)] hover:shadow-primary/30'
                           : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                       }`}
                     >
                       Track Order
                     </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <button className="w-full mt-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors flex items-center justify-center space-x-4">
             <span>View All History</span>
             <ChevronDown size={14} />
          </button>
        </motion.div>
      </div>

      {/* System Velocity Badge */}
      <div className="fixed right-0 top-1/2 -rotate-90 origin-right translate-x-[calc(50%-10px)] flex items-center space-x-4 pointer-events-none mix-blend-difference">
         <div className="w-20 h-[1px] bg-white/20"></div>
         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
           System Velocity: <span className="text-primary">98%</span>
         </span>
         <div className="w-4 h-4 rounded-full border border-primary p-1">
            <div className="w-full h-full bg-primary rounded-full animate-pulse"></div>
         </div>
      </div>
    </div>
  );
}
