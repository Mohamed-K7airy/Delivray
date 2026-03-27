'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Package, MapPin, CheckCircle, Navigation, LogOut, Filter, Box, Activity, Clock, ChevronRight, Bell, User as UserIcon, LifeBuoy, Camera, CreditCard, RotateCcw, Plus, Trash2, Star } from 'lucide-react';
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5MB'); return; }
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setUserPhoto(base64);
      localStorage.setItem(`user_photo_${user?.id}`, base64);
      setUploadingPhoto(false);
      toast.success('Profile photo updated!');
    };
    reader.readAsDataURL(file);
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
    if (['pending', 'accepted', 'preparing', 'ready_for_pickup'].includes(s)) return 'bg-amber-50 text-amber-600 border-amber-200';
    if (['delivering', 'picked_up'].includes(s)) return 'bg-[#fef3f2] text-[#d97757] border-[#fee2e2]';
    return 'bg-gray-50 text-gray-500 border-gray-200';
  };

  const isActive = (status: string) => {
    const s = status?.toLowerCase();
    return ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'delivering'].includes(s);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#d97757] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="min-h-screen bg-[#f9f9f9] pb-24">
      <div className="container-responsive py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#d97757]/5 rounded-full -mr-10 -mt-10" />

              {/* Avatar with upload */}
              <div className="relative inline-block mb-6 group/avatar">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full border-4 border-gray-50 shadow-lg overflow-hidden bg-[#fef3f2] flex items-center justify-center cursor-pointer relative"
                >
                  {userPhoto ? (
                    <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-[#d97757]">{initials}</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                    {uploadingPhoto ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera size={20} className="text-white" />
                    )}
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full" />
              </div>

              <h2 className="text-xl font-black text-[#111111] tracking-tighter mb-1">{user?.name || 'User'}</h2>
              <p className="text-xs font-bold text-[#888888] mb-4">{user?.phone || ''}</p>
              <span className="inline-flex items-center bg-[#fef3f2] text-[#d97757] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-[#fee2e2]">
                ● Premium Member
              </span>

              <div className="space-y-2 mt-6">
                {[
                  { icon: <Package size={16} />, label: 'Orders', tab: 'orders' as const },
                  { icon: <MapPin size={16} />, label: 'Saved Addresses', tab: 'addresses' as const },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => setActiveTab(item.tab)}
                    className={`w-full h-12 rounded-xl px-4 flex items-center justify-between transition-all border ${
                      activeTab === item.tab
                        ? 'bg-[#fef3f2] border-[#fee2e2] text-[#d97757]'
                        : 'bg-[#f9f9f9] border-transparent hover:border-gray-200 text-[#888888] hover:text-[#111111]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="text-[11px] font-black uppercase tracking-wider">{item.label}</span>
                    </div>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Help */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111111] rounded-2xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute bottom-0 right-0 opacity-10"><LifeBuoy size={80} /></div>
              <h4 className="text-base font-black tracking-tighter mb-2 relative z-10">Need help?</h4>
              <p className="text-[#888888] text-xs font-bold mb-5 relative z-10">24/7 support team available.</p>
              <button className="h-10 bg-white text-[#111111] rounded-xl px-6 text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all relative z-10">
                Contact Support
              </button>
            </motion.div>

            <button
              onClick={handleLogout}
              className="w-full h-12 text-red-400 font-black uppercase tracking-widest text-[10px] hover:bg-red-50 transition-all rounded-2xl flex items-center justify-center gap-3"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-[#d97757] uppercase tracking-[0.3em] mb-1">Your Account</p>
                <h1 className="text-3xl lg:text-4xl font-black text-[#111111] tracking-tighter">
                  {activeTab === 'orders' ? 'Recent Orders' : 'Saved Addresses'}
                </h1>
              </div>
              {activeTab === 'orders' && (
                <button className="h-10 bg-white border border-gray-100 rounded-xl px-5 flex items-center gap-3 text-[#111111] hover:bg-gray-50 transition-all shadow-sm text-[10px] font-black uppercase tracking-wider">
                  <Filter size={14} /> Filter
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'orders' ? (
                <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center">
                      <Package size={40} className="text-gray-200 mx-auto mb-4" />
                      <p className="text-sm font-black text-[#888888] uppercase tracking-widest">No orders yet</p>
                      <button onClick={() => router.push('/')} className="mt-6 h-11 bg-[#d97757] text-white rounded-xl px-8 text-[10px] font-black uppercase tracking-widest hover:bg-[#c2654a] transition-all">
                        Start Ordering
                      </button>
                    </div>
                  ) : orders.map((order, idx) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-4 p-4 sm:p-5">
                        {/* Photo from first order item or placeholder */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#fef3f2] shrink-0 flex items-center justify-center">
                          {order.order_items?.[0]?.products ? (
                            <span className="text-2xl">🍔</span>
                          ) : (
                            <Package size={24} className="text-[#d97757]" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-sm font-black text-[#111111] tracking-tight truncate">{order.restaurant}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                              {order.status?.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-[#888888] truncate">
                            #{order.id.slice(0,8).toUpperCase()} · {order.date}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-[10px] font-bold text-[#888888] flex items-center gap-1">
                              <CreditCard size={10} /> ${Number(order.price).toFixed(2)}
                            </span>
                            <span className="text-[10px] font-bold text-[#888888] flex items-center gap-1">
                              <Clock size={10} /> {order.order_items?.length || 1} item(s)
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isActive(order.status) ? (
                            <button
                              onClick={() => router.push(`/order/${order.id}`)}
                              className="h-9 px-4 bg-[#d97757] text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#c2654a] transition-all"
                            >
                              <Navigation size={12} fill="currentColor" /> Track
                            </button>
                          ) : (
                            <>
                              {order.status === 'completed' && (
                                <button
                                  onClick={() => setSelectedOrderForReview(order)}
                                  className="h-9 px-4 bg-[#111111] text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#333] transition-all group-hover:scale-105"
                                >
                                  <Star size={12} /> Rate
                                </button>
                              )}
                              <button
                                onClick={() => handleOrderAgain(order)}
                                className="h-9 px-4 bg-[#f9f9f9] hover:bg-[#fef3f2] text-[#111111] hover:text-[#d97757] rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-2 border border-gray-100 hover:border-[#fee2e2] transition-all"
                              >
                                <RotateCcw size={12} /> Order Again
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div key="addresses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* Add New */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest mb-3">Add New Address</p>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d97757]" />
                        <input
                          value={newAddress}
                          onChange={e => setNewAddress(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddAddress()}
                          placeholder="e.g. 123 Main St, Cairo"
                          className="w-full h-11 bg-[#f9f9f9] pl-9 pr-4 rounded-xl border border-transparent focus:border-[#d97757] outline-none text-sm font-bold text-[#111111] placeholder:text-gray-300 transition-all"
                        />
                      </div>
                      <button
                        onClick={handleAddAddress}
                        className="h-11 px-5 bg-[#d97757] text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#c2654a] transition-all flex items-center gap-2"
                      >
                        <Plus size={14} /> Save
                      </button>
                    </div>
                  </div>

                  {/* Saved List */}
                  {addresses.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                      <MapPin size={32} className="text-gray-200 mx-auto mb-3" />
                      <p className="text-xs font-black text-[#888888] uppercase tracking-widest">No saved addresses yet</p>
                    </div>
                  ) : addresses.map((addr, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 bg-[#fef3f2] rounded-xl flex items-center justify-center text-[#d97757] shrink-0">
                        <MapPin size={18} />
                      </div>
                      <p className="flex-1 text-sm font-bold text-[#111111] truncate">{addr}</p>
                      <button
                        onClick={() => handleRemoveAddress(idx)}
                        className="text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
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
