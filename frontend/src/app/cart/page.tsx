'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ChevronLeft, Sparkles, Zap, Lock, MapPin, Ticket, ShieldCheck, ChevronRight, Navigation, DollarSign } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { toast } from 'sonner';
import Button from '@/components/Button';
import { API_URL } from '@/config/api';
import { apiClient } from '@/lib/apiClient';
import dynamic from 'next/dynamic';
import StripeCheckoutModal from '@/components/StripeCheckoutModal';

const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-50 animate-pulse flex items-center justify-center text-[10px] font-bold uppercase text-gray-400">Loading Map...</div>
});

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

// Mock upsell items removed as we will now fetch real ones from the store

export default function CartPage() {
  const { token, user, _hasHydrated } = useAuthStore();
  const { cartId, items, total, loading, setCart, removeItem, updateItemQuantity, setLoading, addItem } = useCartStore();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [realUpsellItems, setRealUpsellItems] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [savedAddress, setSavedAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');

  // Reverse geocoding function using Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';
      const resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
      const data = await resp.json();
      if (data && data.results && data.results[0]) {
        setAddress(data.results[0].formatted_address);
        toast.success('Address identified! 📍');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      toast.error('Could not fetch address, please enter manually.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation([lat, lng]);
    reverseGeocode(lat, lng);
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      setIsGeocoding(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setSelectedLocation([latitude, longitude]);
          reverseGeocode(latitude, longitude);
        },
        () => {
          toast.error('Geolocation denied or failed');
          setIsGeocoding(false);
        }
      );
    }
  };

  useEffect(() => {
    if (showMap && !selectedLocation) {
      handleUseMyLocation();
    }
  }, [showMap]);

  useEffect(() => {
    if (!_hasHydrated) return; // Wait for hydration before checking auth

    if (!token || user?.role !== 'customer') {
      router.push('/login');
      return;
    }

    // Load saved address
    const addr = localStorage.getItem(`user_address_${user?.id}`) || '';
    setSavedAddress(addr);
    setAddress(addr);

    const controller = new AbortController();
    let isMounted = true; 

    const fetchCart = async () => {
      setLoading(true);
      try {
        const data = await apiClient('/cart', { signal: controller.signal });
        if (data && isMounted) {
          setCart(data.cart_id, data.items, data.total);

          // Fetch real additions if we have items
          if (data.items.length > 0) {
            const storeId = data.items[0].products.store_id;
            const storeData = await apiClient(`/stores/${storeId}`, { signal: controller.signal });
            if (storeData && isMounted) {
              const additions = storeData.products.filter((p: any) =>
                p.description?.includes('[Addition]')
              );
              setRealUpsellItems(additions);
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCart();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [token, user, router, setCart, setLoading]);

  const handleUpdateQuantity = async (itemId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty <= 0) return handleRemoveItem(itemId);

    try {
      const data = await apiClient('/cart/update', {
        method: 'PATCH',
        data: { item_id: itemId, quantity: newQty }
      });
      if (data) {
        updateItemQuantity(itemId, newQty);
      }
    } catch (err: any) {
      // apiClient handles toasts
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const data = await apiClient('/cart/remove', {
        method: 'DELETE',
        data: { item_id: itemId }
      });
      if (data) {
        removeItem(itemId);
        toast.success('Item removed from cart');
      }
    } catch (err: any) {
      // apiClient handles toasts
    }
  };

  const handleAddUpsell = async (upsell: any) => {
    try {
      const data = await apiClient('/cart/add', {
        method: 'POST',
        data: { product_id: upsell.id, quantity: 1 }
      });
      
      if (data) {
        addItem({
          id: data.id,
          product_id: upsell.id,
          quantity: data.quantity, // Use the actual quantity from the response
          products: upsell
        });
        toast.success(`${upsell.name} added to cart!`);
      }
    } catch (err: any) {
      // apiClient handles toasts
    }
  };

  const handleApplyPromo = async () => {
    const code = promoCode.toUpperCase().trim();
    if (!code) return;

    try {
      const data = await apiClient('/promos/validate', {
        method: 'POST',
        data: { code, subtotal: total }
      });

      if (data) {
        setDiscount(data.discount);
        setIsPromoApplied(true);
        toast.success(`Promo applied: ${code}! 🎉`);
      }
    } catch (err: any) {
      // apiClient handles toasts
      setDiscount(0);
      setIsPromoApplied(false);
    }
  };

  const handleCheckout = async () => {
    try {
      if (!selectedLocation) {
        toast.error('Please select your delivery location on the map');
        setShowMap(true);
        return;
      }

      setLoading(true);

      // 1. Create the order first
      const orderData = await apiClient('/orders', {
        method: 'POST',
        data: { 
          delivery_lat: selectedLocation[0], 
          delivery_lng: selectedLocation[1],
          delivery_address: address || savedAddress || 'Customer Address',
          promo_code: isPromoApplied ? promoCode.toUpperCase() : null,
          payment_method: paymentMethod
        }
      });

      if (orderData) {
        setCurrentOrderId(orderData.id);
        
        if (paymentMethod === 'online') {
            // 2. Create Payment Intent
            const paymentData = await apiClient('/payments/create-intent', {
                method: 'POST',
                data: { order_id: orderData.id }
            });

            if (paymentData && paymentData.clientSecret) {
                setClientSecret(paymentData.clientSecret);
                setShowStripeModal(true);
            }
        } else {
            // Cash on Delivery - Success immediately
            handlePaymentSuccess(orderData.id);
        }
      }
    } catch (err: any) {
      // apiClient handles toasts
    } finally {
        setLoading(false);
    }
  };

  const handlePaymentSuccess = (orderId?: string) => {
    const finalId = orderId || currentOrderId;
    setShowStripeModal(false);
    setCart(cartId!, [], 0);
    router.push(`/order/${finalId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32">
      <div className="container-responsive py-12 lg:py-20">
        
        {/* Modern Minimal Header */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Checkout Ready</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tighter leading-none">
              Your <span className="text-slate-300">Cart.</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-slate-400 border-l border-slate-100 pl-6 h-12">
            <ShoppingBag size={20} />
            <p className="text-sm font-bold tracking-tight">{items.length} Item{items.length !== 1 ? 's' : ''} inside</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* Items Column */}
          <div className="lg:col-span-7">
            {items.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-16 lg:p-24 flex flex-col items-center text-center border border-slate-100 shadow-sm"
              >
                <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 text-slate-200 border border-slate-100 shadow-inner">
                  <ShoppingBag size={40} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Your cart is empty.</h2>
                <p className="text-slate-400 font-medium max-w-xs mx-auto mb-10 leading-relaxed">
                  Discover amazing products from our verified merchant network.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-slate-900 text-white px-14 py-4 rounded-xl font-bold uppercase tracking-[0.15em] text-[10px] hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                >
                  Explore Marketplace
                </button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-6 mb-4">
                  <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Cart Inventory</h2>
                  <button 
                    onClick={() => items.forEach(i => handleRemoveItem(i.id))}
                    className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                
                <AnimatePresence mode="popLayout">
                  {items.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="group bg-white rounded-3xl p-6 lg:p-8 flex items-center gap-6 lg:gap-10 border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all"
                    >
                      {/* Scaled Product Image */}
                      <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100 relative group/img">
                        <img
                          src={item.products?.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&h=300&auto=format&fit=crop'}
                          alt={item.products.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                          onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&h=300&auto=format&fit=crop'; }}
                        />
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 flex flex-col justify-between py-1 h-full">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">{item.products?.name}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Store Product</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-6 lg:mt-8">
                          <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100 gap-1">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                              className="w-9 h-9 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-900 shadow-sm hover:shadow"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center text-sm font-bold text-slate-900 tabular-nums">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                              className="w-9 h-9 flex items-center justify-center bg-white text-slate-900 rounded-lg transition-all shadow-sm hover:shadow"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xl font-bold text-slate-900 tracking-tighter tabular-nums">
                              {(Number(item.products.price) * item.quantity).toFixed(2)} ج.م
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{Number(item.products.price).toFixed(2)} ج.م each</p>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button (Float) */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="absolute top-4 right-4 text-slate-200 hover:text-red-500 transition-colors bg-white group-hover:bg-slate-50 p-2 rounded-xl opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Refined Summary Sidebar */}
          <aside className="lg:col-span-5 lg:sticky lg:top-12 space-y-10">

            {/* Logistics Configuration (Address/Map) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-100 shadow-xl overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                    <MapPin size={16} />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900 tracking-tight">Delivery Address</h3>
              </div>
              
              <div className="space-y-6">
                <div className="relative">
                  <input
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Enter delivery address..."
                    className="w-full h-14 bg-slate-50 px-6 rounded-2xl border border-slate-100 focus:border-slate-900 focus:bg-white outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300 transition-all shadow-inner"
                  />
                </div>

                <div className="flex items-center gap-4">
                   <button 
                     onClick={() => setShowMap(!showMap)}
                     className={`flex-1 h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${showMap ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-200 hover:border-slate-900'}`}
                   >
                     {showMap ? <Lock size={14} /> : <Navigation size={14} />}
                     {showMap ? 'Hide Map Picker' : 'Open Map Selection'}
                   </button>
                </div>
              </div>

              {showMap && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-8 space-y-4"
                >
                  <div className="h-64 rounded-3xl overflow-hidden border border-slate-100 relative shadow-inner">
                    <MapView 
                      center={selectedLocation || [30.0444, 31.2357]} 
                      zoom={15}
                      markers={selectedLocation ? [{ position: selectedLocation, type: 'customer', label: 'HUB' }] : []}
                      onLocationSelect={handleMapClick}
                      interactive={true}
                      autoCenter={!selectedLocation}
                    />
                    <button
                       onClick={handleUseMyLocation}
                       className="absolute top-4 right-4 w-10 h-10 bg-white rounded-xl shadow-xl flex items-center justify-center text-slate-900 hover:bg-slate-50 border border-slate-100 z-[500]"
                     >
                       <Navigation size={16} />
                     </button>
                  </div>
                  {isGeocoding && <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest text-center animate-pulse">Syncing coordinates...</p>}
                </motion.div>
              )}
            </motion.div>

            {/* Financial Protocol */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-8 tracking-tighter">Order Summary</h3>

              <div className="space-y-5 mb-10 pb-10 border-b border-slate-50">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Subtotal</span>
                  <span className="text-base font-bold text-slate-900 tabular-nums">{total.toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Delivery Fee</span>
                  <span className="text-base font-bold text-green-600 tabular-nums">45.00 ج.م</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Service Fee</span>
                  <span className="text-base font-bold text-slate-900 tabular-nums">{(total * 0.1).toFixed(2)} ج.م</span>
                </div>
                {isPromoApplied && (
                  <div className="flex justify-between items-center bg-blue-50 -mx-6 px-8 py-4 rounded-2xl border border-blue-100">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600">Promo Applied</span>
                    <span className="text-base font-bold text-blue-600 tabular-nums">-{discount.toFixed(2)} ج.م</span>
                  </div>
                )}
              </div>

              <div className="mb-10 px-2 flex justify-between items-center">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Total</p>
                <p className="text-5xl font-bold text-slate-900 tracking-tighter tabular-nums">
                  {Math.max(0, (total + 45.00 + (total * 0.1) - discount)).toFixed(2)} ج.م
                </p>
              </div>

              {/* Payment Methods - Simplified & Modern */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`h-16 rounded-2xl flex items-center justify-center gap-3 border transition-all ${
                    paymentMethod === 'cash' 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xl ring-4 ring-slate-900/10' 
                      : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <DollarSign size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Cash on Delivery</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('online')}
                  className={`h-16 rounded-2xl flex items-center justify-center gap-3 border transition-all ${
                    paymentMethod === 'online' 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xl ring-4 ring-slate-900/10' 
                      : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <Lock size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Credit Card</span>
                </button>
              </div>

              {/* Promo Enhanced */}
              <div className="flex items-center gap-4 mb-10 group">
                <div className="flex-1 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center px-6 gap-4 focus-within:border-slate-900 focus-within:bg-white transition-all shadow-inner">
                   <Ticket size={18} className="text-slate-300" />
                   <input
                    placeholder="PROMO CODE"
                    className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold text-slate-900 placeholder-slate-300 uppercase tracking-widest"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleApplyPromo}
                  className="bg-white text-slate-900 px-8 h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-slate-200 hover:border-slate-900 transition-all active:scale-95 shadow-sm"
                >
                  Apply
                </button>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || items.length === 0}
                className="w-full h-20 bg-slate-900 text-white font-bold uppercase tracking-[0.25em] text-xs rounded-3xl hover:bg-slate-800 transition-all flex items-center justify-center gap-4 disabled:opacity-20 active:scale-[0.98] shadow-2xl shadow-slate-900/20"
              >
                <span>Confirm Order</span>
                <ChevronRight size={20} className="text-slate-400" />
              </button>

              <div className="mt-8 flex items-center justify-center gap-3 text-slate-400">
                <ShieldCheck size={16} />
                <p className="text-[9px] font-bold uppercase tracking-widest">
                  100% Secure Checkout
                </p>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>

      <StripeCheckoutModal 
        isOpen={showStripeModal} 
        onClose={() => setShowStripeModal(false)}
        clientSecret={clientSecret}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
