'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Package, MapPin, CheckCircle, Navigation, LogOut, Filter, Box, Activity, Clock, ChevronRight, Bell, User as UserIcon, LifeBuoy, Camera, CreditCard, RotateCcw, Plus, Trash2, Star, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import ReviewModal from '@/components/ReviewModal';
import { apiClient } from '@/lib/apiClient';

export default function UserProfile() {
  const { token, user, setUser, setToken, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses'>('orders');
  const [addresses, setAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) return router.push('/login');

    // Load saved photo from localStorage
    const savedPhoto = localStorage.getItem(`user_photo_${user?.id}`);
    if (savedPhoto) setUserPhoto(savedPhoto);

    // Load saved addresses
    const savedAddresses = JSON.parse(localStorage.getItem(`user_addresses_${user?.id}`) || '[]');
    setAddresses(savedAddresses);

    const fetchProfileData = async () => {
      try {
        const userData = await apiClient('/auth/me');
        if (userData) setUser(userData);

        // Use apiClient for consistency and better error handling
        const data = await apiClient('/orders/me');
        if (data && Array.isArray(data)) {
          setOrders(data.map((o: any) => ({
            ...o,
            restaurant: o.stores?.name || 'Restaurant',
            date: new Date(o.created_at).toLocaleDateString(),
            price: o.total_price
          })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [token, router, setUser, user?.id]);

  const { addItem } = useCartStore();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5MB'); return; }
    
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const data = await apiClient('/upload/profile-image', {
        method: 'POST',
        data: formData
      });
      
      if (data && data.url && user) {
        // Update user in auth store and local state
        setUser({ ...user, image_url: data.url });
        toast.success('Profile photo updated!');
      }
    } catch (err: any) {
      // apiClient handles toasts
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddAddress = () => {
    if (!newAddress.trim()) return;
    const updated = [...addresses, newAddress.trim()];
    setAddresses(updated);
    localStorage.setItem(`user_addresses_${user?.id}`, JSON.stringify(updated));
    setNewAddress('');
    toast.success('Address saved!');
  };

  const handleRemoveAddress = (idx: number) => {
    const updated = addresses.filter((_, i) => i !== idx);
    setAddresses(updated);
    localStorage.setItem(`user_addresses_${user?.id}`, JSON.stringify(updated));
  };

  const handleOrderAgain = async (order: any) => {
    if (!window.confirm('Add all items from this order to your current cart?')) return;
    try {
      const data = await apiClient(`/orders/${order.id}`);
      if (!data) return;
      for (const item of (data.order_items || [])) {
        addItem({ id: Math.random().toString(36).substr(2, 9), product_id: item.product_id, quantity: item.quantity, products: item.products });
      }
      toast.success('Items added to cart!');
      router.push('/cart');
    } catch (err: any) {
      // apiClient handles toasts
    }
  };

  const handleLogout = () => { setToken(null); setUser(null); router.push('/login'); };

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase();
    if (['pending', 'accepted', 'preparing', 'ready_for_pickup'].includes(s)) return 'bg-slate-50 text-slate-900 border-slate-200';
    if (['delivering', 'picked_up'].includes(s)) return 'bg-slate-900 text-white border-slate-900 shadow-sm';
    if (['completed', 'delivered'].includes(s)) return 'bg-green-50 text-green-700 border-green-100';
    return 'bg-slate-50 text-slate-400 border-slate-100';
  };

  const isActive = (status: string) => {
    const s = status?.toLowerCase();
    return ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'delivering'].includes(s);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="container-responsive py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-900/5 rounded-full -mr-12 -mt-12" />

              {/* Avatar with upload */}
              <div className="relative inline-block mb-8 group/avatar">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-[2.5rem] border-8 border-slate-50 shadow-inner overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer relative transition-transform hover:scale-[1.02]"
                >
                  {user?.image_url ? (
                    <img src={user.image_url} alt="Profile" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all" />
                  ) : (
                    <span className="text-3xl font-bold text-slate-900">{initials}</span>
                  )}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity rounded-[2.5rem]">
                    {uploadingPhoto ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera size={24} className="text-white" />
                    )}
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-lg" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 tracking-tighter mb-1">{user?.name || 'User'}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{user?.phone || 'Auth: Verified'}</p>
              
              <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl">
                <ShieldCheck size={12} />
                <span>Tier: Enterprise</span>
              </div>

              <div className="space-y-3 mt-10">
                {[
                  { icon: <Package size={16} />, label: 'Protocol Logs', tab: 'orders' as const },
                  { icon: <MapPin size={16} />, label: 'Verified Hubs', tab: 'addresses' as const },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => setActiveTab(item.tab)}
                    className={`w-full h-14 rounded-2xl px-5 flex items-center justify-between transition-all border ${
                      activeTab === item.tab
                        ? 'bg-slate-50 border-slate-200 text-slate-900 shadow-inner'
                        : 'bg-white border-transparent hover:border-slate-100 text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {item.icon}
                      <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                    </div>
                    <ChevronRight size={14} className={activeTab === item.tab ? 'text-slate-900' : 'text-slate-200'} />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Help */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl group"
            >
              <div className="absolute bottom-0 right-0 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-700"><LifeBuoy size={120} /></div>
              <h4 className="text-xl font-bold tracking-tight mb-2 relative z-10 leading-none">Intelligence Hub.</h4>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8 relative z-10">Real-time system assistance</p>
              <button className="w-full h-12 bg-white text-slate-900 rounded-xl px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all relative z-10 shadow-lg">
                Initiate Support
              </button>
            </motion.div>

            <button
              onClick={handleLogout}
              className="w-full h-14 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-red-50 hover:text-red-500 transition-all rounded-2xl flex items-center justify-center gap-4 border border-transparent hover:border-red-100"
            >
              <LogOut size={16} /> Termination sequence
            </button>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">Account Telemetry</p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tighter">
                  {activeTab === 'orders' ? 'Protocol History.' : 'Verified Hubs.'}
                </h1>
              </div>
              {activeTab === 'orders' && (
                <button className="h-12 bg-white border border-slate-100 rounded-2xl px-6 flex items-center gap-3 text-slate-900 hover:bg-slate-50 transition-all shadow-sm text-[10px] font-bold uppercase tracking-[0.2em]">
                  <Filter size={14} /> Filter Logic
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'orders' ? (
                <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                  {orders.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-24 border border-slate-100 text-center shadow-sm">
                      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-slate-100 shadow-inner">
                        <Package size={32} className="text-slate-200" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Zero staging activity detected</p>
                      <button onClick={() => router.push('/')} className="mt-10 h-14 bg-slate-900 text-white rounded-2xl px-10 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl">
                        Marketplace Sync
                      </button>
                    </div>
                  ) : orders.map((order, idx) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.2 }}
                      className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all group overflow-hidden"
                    >
                      <div className="p-6 lg:p-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                        <div className="flex items-center gap-6 w-full flex-1">
                          {/* Status Icon or Badge */}
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center border border-slate-100 shadow-inner">
                            <Package size={28} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap mb-2">
                              <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight truncate">{order.restaurant}</h3>
                              <span className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] border shadow-sm whitespace-nowrap ${getStatusStyle(order.status)}`}>
                                {order.status?.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tabular-nums">
                                ID: {order.id.slice(0,12).toUpperCase()}
                               </p>
                               <div className="flex items-center gap-6">
                                <span className="text-[10px] font-bold text-slate-900 flex items-center gap-2 tabular-nums">
                                  <CreditCard size={12} className="text-slate-300" /> {Number(order.price).toFixed(2)} ج.م
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                                  <Clock size={12} className="text-slate-300" /> {order.date}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                          {isActive(order.status) ? (
                            <button
                              onClick={() => router.push(`/order/${order.id}`)}
                              className="w-full md:w-auto flex-1 h-14 px-8 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                            >
                              <Navigation size={14} fill="currentColor" /> Tracking
                            </button>
                          ) : (
                            <>
                              {order.status === 'completed' && (
                                <button
                                  onClick={() => setSelectedOrderForReview(order)}
                                  className="w-full md:w-auto flex-1 h-12 px-6 bg-slate-50 text-slate-900 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-slate-100 shadow-sm hover:bg-slate-100 transition-all active:scale-95"
                                >
                                  <Star size={12} className="fill-slate-900" /> Analyze
                                </button>
                              )}
                              <button
                                onClick={() => handleOrderAgain(order)}
                                className="w-full md:w-auto flex-1 h-12 px-6 bg-white hover:bg-slate-50 text-slate-900 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-slate-100 shadow-sm transition-all active:scale-95"
                              >
                                <RotateCcw size={12} /> Sync Base
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div key="addresses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-8">
                  {/* Add New */}
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-6">Authorize New Endpoint</p>
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                          value={newAddress}
                          onChange={e => setNewAddress(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddAddress()}
                          placeholder="GEOSPATIAL COORDINATES OR ADDRESS STRING..."
                          className="w-full h-16 bg-slate-50 pl-12 pr-4 rounded-2xl border border-transparent focus:border-slate-900 focus:bg-white outline-none text-xs font-bold text-slate-900 placeholder:text-slate-200 transition-all"
                        />
                      </div>
                      <button
                        onClick={handleAddAddress}
                        className="h-16 px-10 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center gap-3"
                      >
                        <Plus size={16} /> Authenticate
                      </button>
                    </div>
                  </div>

                  {/* Saved List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.length === 0 ? (
                      <div className="col-span-full bg-white rounded-[2.5rem] border border-slate-100 p-24 text-center shadow-sm">
                        <MapPin size={48} className="text-slate-100 mx-auto mb-6" />
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No authorized hubs detected</p>
                      </div>
                    ) : addresses.map((addr, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 flex items-center gap-8 group hover:border-slate-900 transition-all"
                      >
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 border border-slate-100 shadow-inner group-hover:bg-slate-900 group-hover:text-white transition-all">
                          <MapPin size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Authenticated Hub</p>
                           <p className="text-base font-bold text-slate-900 truncate tracking-tight">{addr}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveAddress(idx)}
                          className="w-12 h-12 flex items-center justify-center text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Review Modal */}
      {selectedOrderForReview && (
        <ReviewModal
          isOpen={!!selectedOrderForReview}
          orderId={selectedOrderForReview.id}
          storeName={selectedOrderForReview.restaurant}
          onClose={() => setSelectedOrderForReview(null)}
          onSuccess={() => {
            // Refresh orders to reflect reviewed status if needed
            apiClient('/orders/me').then(data => {
              if (data) setOrders(data.map((o: any) => ({
                ...o,
                restaurant: o.stores?.name || 'Restaurant',
                date: new Date(o.created_at).toLocaleDateString(),
                price: o.total_price
              })));
            });
          }}
        />
      )}
    </div>
  );
}
