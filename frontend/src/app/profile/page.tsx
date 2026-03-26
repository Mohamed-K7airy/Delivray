'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, MapPin, CheckCircle, Navigation, Info, LogOut, Phone, Mail, Search, Filter, Box, Truck, ChevronDown, User as UserIcon, ShieldCheck, Activity, Clock, ChevronRight, Bell, Settings, CreditCard, LifeBuoy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import Button from '@/components/Button';
import Logo from '@/components/Logo';

export default function UserProfile() {
  const { token, user, setUser, setToken, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_hasHydrated) return; // Wait for hydration before checking auth
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
           // Mock data for high-fidelity preview matching mockup
           setOrders([
             { id: 'DV-88219', status: 'In Progress', restaurant: 'The Burger Collective', date: 'Oct 24, 2023', eta: '15-20 mins', price: 42.50, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&h=300&auto=format&fit=crop' },
             { id: 'DV-88012', status: 'Completed', restaurant: 'Napoli Pizzeria', date: 'Oct 21, 2023', price: 28.90, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&h=300&auto=format&fit=crop' },
             { id: 'DV-87955', status: 'Completed', restaurant: 'Green Garden Salads', date: 'Oct 18, 2023', price: 19.20, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300&h=300&auto=format&fit=crop' }
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

  const { addItem } = useCartStore();

  const handleOrderAgain = async (order: any) => {
    try {
      if (order.id.startsWith('DV-')) {
        // Mock logic for demo/mock orders
        toast.info('Re-ordering from history...');
        addItem({
          id: Math.random().toString(36).substr(2, 9),
          product_id: 'mock-p1',
          quantity: 1,
          products: {
            id: 'mock-p1',
            name: 'Classic Burger (Re-ordered)',
            price: order.price || 15.00,
            image: order.image,
            store_id: 'mock-s1'
          }
        });
        toast.success('Items added to cart!');
        router.push('/cart');
        return;
      }

      // Real logic: Fetch order items and add to cart
      const res = await fetch(`${API_URL}/orders/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Order details not found');
      const data = await res.json();
      
      for (const item of data.order_items) {
        addItem({
          id: Math.random().toString(36).substr(2, 9),
          product_id: item.product_id,
          quantity: item.quantity,
          products: item.products
        });
      }
      toast.success('All items added to cart!');
      router.push('/cart');
    } catch (err: any) {
      toast.error(err.message || 'Failed to re-order');
    }
  };

  const handleViewReceipt = (orderId: string) => {
    toast.success(`Opening receipt for ${orderId}...`);
    // Simulated receipt view
    window.open(`${API_URL}/orders/${orderId}/receipt`, '_blank');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#FF5A3C] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-24">
      <div className="container-responsive py-10 lg:py-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Sidebar: User Card & Navigation */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-8">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm text-center relative overflow-hidden"
             >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF5A3C]/5 rounded-full -mr-12 -mt-12" />
                
                <div className="relative inline-block mb-8 group/avatar">
                   <div 
                      onClick={() => toast.info('Avatar upload coming soon!')}
                      className="w-32 h-32 rounded-full border-4 border-gray-50 shadow-xl overflow-hidden bg-gray-100 cursor-pointer relative"
                   >
                      <img 
                        src={`https://i.pravatar.cc/150?u=${user?.id || 'john'}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                         <UserIcon size={24} className="text-white" />
                      </div>
                   </div>
                   <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
                </div>

                <h2 className="text-3xl font-black text-[#0A0A0A] tracking-tighter mb-2">{user?.name || 'John Doe'}</h2>
                <p className="text-gray-400 font-bold text-xs mb-6">{user?.phone || '+1(555) 012-3456'}</p>
                
                <span className="inline-flex items-center bg-[#FFF9F8] text-[#FF5A3C] px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-[#FFE7E2] mb-10">
                   ● PREMIUM MEMBER
                </span>

                 <div className="space-y-3">
                   {[
                     { icon: <UserIcon size={18} />, label: 'Edit Profile', onClick: () => toast.info('Profile Settings coming soon!') },
                     { icon: <MapPin size={18} />, label: 'Saved Addresses', onClick: () => toast.info('Address Management coming soon!') },
                     { icon: <Bell size={18} />, label: 'Notifications', onClick: () => toast.info('No new notifications') },
                   ].map(item => (
                     <button 
                       key={item.label} 
                       onClick={item.onClick}
                       className="w-full h-16 bg-gray-50 hover:bg-gray-100 rounded-2xl p-5 flex items-center justify-between group transition-all border border-transparent hover:border-gray-200"
                     >
                        <div className="flex items-center gap-4 text-[#0A0A0A]">
                           <span className="text-gray-400 group-hover:text-[#FF5A3C] transition-colors">{item.icon}</span>
                           <span className="text-[11px] font-black uppercase tracking-widest leading-none">{item.label}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-[#0A0A0A] transition-colors" />
                     </button>
                   ))}
                </div>
             </motion.div>

             {/* Help CTA */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-[#1A1A1A] rounded-[3rem] p-10 text-white relative overflow-hidden group"
             >
                <div className="absolute bottom-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
                   <LifeBuoy size={120} />
                </div>
                <h4 className="text-2xl font-black tracking-tighter mb-4 relative z-10">Need help?</h4>
                <p className="text-gray-400 text-xs font-bold leading-relaxed mb-8 relative z-10">
                   Our 24/7 support team is always here to assist you with your orders.
                </p>
                <button className="h-14 bg-white text-[#0A0A0A] rounded-xl px-8 text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all relative z-10">
                   Contact Support
                </button>
             </motion.div>

             <button 
                onClick={handleLogout}
                className="w-full h-16 text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-50 transition-all rounded-2xl flex items-center justify-center gap-3"
             >
                <LogOut size={16} />
                <span>Sign Out</span>
             </button>
          </aside>

          {/* Right Column: Main Content */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-10">
             <header>
                <p className="text-[11px] font-black text-[#FF5A3C] uppercase tracking-[0.3em] mb-2 font-black italic">YOUR JOURNEY</p>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <h1 className="text-5xl lg:text-6xl font-black text-[#0A0A0A] tracking-tighter">Recent Orders</h1>
                   <button className="h-14 bg-white border border-gray-100 rounded-2xl px-6 flex items-center gap-4 text-[#0A0A0A] hover:bg-gray-50 transition-all shadow-sm">
                      <Filter size={18} />
                      <span className="text-[11px] font-black uppercase tracking-widest">Filter</span>
                   </button>
                </div>
             </header>

             <div className="space-y-6">
                <AnimatePresence>
                   {orders.map((order, idx) => (
                     <motion.div 
                       key={order.id}
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: idx * 0.1 }}
                       className="bg-white rounded-[2.5rem] p-6 lg:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 group hover:border-gray-200 transition-all"
                     >
                        {/* Order Image */}
                        <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-3xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                           <img 
                             src={order.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&h=300&auto=format&fit=crop'} 
                             alt="Restaurant" 
                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                           />
                        </div>

                        {/* Info */}
                        <div className="flex-1 w-full text-center md:text-left space-y-4">
                           <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                              <div>
                                 <h3 className="text-2xl font-black text-[#0A0A0A] tracking-tighter mb-1">{order.restaurant || 'The Burger Collective'}</h3>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Order #{order.id} • {order.date}
                                 </p>
                              </div>
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                order.status === 'In Progress' || order.status === 'DELIVERING' 
                                  ? 'bg-[#FFF9F8] text-[#FF5A3C] border-[#FFE7E2]' 
                                  : 'bg-gray-50 text-gray-400 border-gray-100'
                              }`}>
                                 ● {order.status}
                              </span>
                           </div>

                           <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                              <div className="flex items-center gap-2">
                                 <Clock size={14} className="text-gray-300" />
                                 <span>ETA: {order.eta || 'Completed'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <CreditCard size={14} className="text-gray-300" />
                                 <span className="text-[#0A0A0A]">${Number(order.price).toFixed(2)}</span>
                              </div>
                           </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                           {order.status === 'In Progress' || order.status === 'DELIVERING' || order.status === 'PENDING' ? (
                             <>
                               <button 
                                 onClick={() => router.push(`/order/${order.id}`)}
                                 className="flex-1 md:flex-none h-16 bg-[#FF5A3C] text-white rounded-2xl px-10 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-[#FF5A3C]/20 hover:bg-[#E84A2C] transition-all"
                               >
                                  <Navigation size={16} fill="currentColor" />
                                  Track Order
                               </button>
                               <button 
                                 onClick={() => toast.info('Sharing live location...')}
                                 className="h-16 w-16 bg-gray-50 text-gray-400 hover:text-[#0A0A0A] rounded-2xl flex items-center justify-center border border-gray-100 transition-all"
                               >
                                  <Activity size={20} />
                                </button>
                             </>
                           ) : (
                             <>
                               <button 
                                 onClick={() => handleOrderAgain(order)}
                                 className="flex-1 md:flex-none h-16 bg-gray-50 hover:bg-gray-100 text-[#0A0A0A] rounded-2xl px-10 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                               >
                                  <Box size={16} />
                                  Order Again
                               </button>
                               <button 
                                 onClick={() => handleViewReceipt(order.id)}
                                 className="h-16 bg-white border border-gray-100 hover:border-gray-200 text-[#0A0A0A] rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest transition-all"
                               >
                                  View Receipt
                               </button>
                             </>
                           )}
                        </div>
                     </motion.div>
                   ))}
                </AnimatePresence>
             </div>
          </main>
        </div>
      </div>
    </div>
  );
}
