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
  const { items, total, loading, setCart, removeItem, updateItemQuantity, setLoading, addItem } = useCartStore();
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
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await resp.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
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
    setCart(finalId, [], 0);
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
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="container-responsive py-16 lg:py-24">
        <header className="mb-12 space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-slate-900 rounded-full animate-pulse" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Session Active</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tighter leading-none">Logistics <br /><span className="text-slate-300">Queue.</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{items.length} Asset{items.length !== 1 ? 's' : ''} staged for deployment</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Items Column */}
          <div className="lg:col-span-7 space-y-8">
            {items.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] p-20 flex flex-col items-center text-center border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 text-slate-200 border border-slate-100 shadow-inner">
                  <ShoppingBag size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Queue is empty.</h2>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-tight mb-8">Synchronize with marketplace to stage assets.</p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-slate-900 text-white px-12 py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
                >
                  Marketplace Sync
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 uppercase tracking-widest">Asset Registry</h2>
                  <span className="bg-slate-50 text-slate-900 px-4 py-1.5 rounded-lg text-[10px] font-bold border border-slate-100 shadow-sm">{items.length} Units</span>
                </div>
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      exit={{ opacity: 0, x: -30, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-8 px-10 py-8 border-b border-slate-50 last:border-0 group hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100 shadow-sm">
                        <img
                          src={item.products?.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=150&h=150&auto=format&fit=crop'}
                          alt={item.products.name}
                          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                          onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=150&h=150&auto=format&fit=crop'; }}
                        />
                      </div>

                      {/* Name & Price */}
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold text-slate-900 tracking-tight leading-none mb-2">{item.products.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit Price: ${Number(item.products.price).toFixed(2)} USD</p>
                      </div>

                      {/* Qty */}
                      <div className="flex items-center bg-white rounded-xl p-1.5 border border-slate-100 gap-1 shadow-sm">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-lg transition-all font-bold text-slate-900"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-slate-900 tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-lg transition-all font-bold text-slate-900"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Total */}
                      <div className="w-24 text-right shrink-0">
                        <p className="text-sm font-bold text-slate-900 tracking-tighter">${(Number(item.products.price) * item.quantity).toFixed(2)}</p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24 space-y-8">

            {/* Address & Map Picker */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-10 border-b border-slate-50">
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-1 h-6 bg-slate-900 rounded-full" />
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Logistics Endpoint</p>
                </div>
                
                <div className="space-y-6">
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Coordinates or Address String..."
                      className="w-full h-16 bg-slate-50 pl-12 pr-4 rounded-2xl border border-transparent focus:border-slate-900 focus:bg-white outline-none text-sm font-bold text-slate-900 placeholder:text-slate-200 transition-all"
                    />
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                     <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Pinpoint Accuracy</p>
                          <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase">Coordinate-based geofencing</p>
                        </div>
                        <button 
                          onClick={() => setShowMap(!showMap)}
                          className="bg-white text-slate-900 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-slate-100 shadow-sm hover:bg-slate-50 transition-all"
                        >
                          {showMap ? 'Lock Map' : 'Identify'}
                        </button>
                     </div>
                  </div>
                </div>
              </div>

              {showMap && (
                <div className="h-80 relative">
                  <MapView 
                    center={selectedLocation || [30.0444, 31.2357]} 
                    zoom={15}
                    markers={selectedLocation ? [{ position: selectedLocation, type: 'selected', label: 'DEPLOYMENT HUB' }] : []}
                    onMapClick={handleMapClick}
                    autoCenter={!selectedLocation}
                  />
                  <div className="absolute top-6 right-6 z-[500]">
                     <button
                       onClick={handleUseMyLocation}
                       className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-900 hover:bg-slate-50 transition-all border border-slate-100 pointer-events-auto active:scale-95"
                       title="Identify Origin"
                     >
                       <Navigation size={20} />
                     </button>
                  </div>
                  <div className="absolute inset-x-0 bottom-6 flex justify-center z-[500] pointer-events-none">
                     <p className="bg-slate-900/90 text-white px-6 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md shadow-2xl border border-white/10">
                        {isGeocoding ? 'Analyzing Stream...' : 'Calibrate Position'}
                     </p>
                  </div>
                </div>
              )}
              
              {selectedLocation && (
                <div className="bg-slate-900 px-10 py-5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                    <ShieldCheck size={18} className="text-white" />
                    <p className="text-[10px] font-bold text-white uppercase tracking-[0.25em]">Lock Authenticated</p>
                   </div>
                   <span className="text-[10px] font-bold text-slate-400 tabular-nums">LAT: {selectedLocation[0].toFixed(4)}</span>
                </div>
              )}
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-10 tracking-tight">Financial Summary</h3>

              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-widest">Fulfillment Base</span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-widest">Logistics Fee</span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">$3.00</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-widest">Service Levy (10%)</span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">${(total * 0.1).toFixed(2)}</span>
                </div>
                {isPromoApplied && (
                  <div className="flex justify-between items-center text-slate-900 bg-slate-50 -mx-4 px-4 py-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-widest">Protocol discount</span>
                    <span className="text-sm font-bold tabular-nums">-${discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-slate-100 mb-10">
                <div className="flex items-baseline justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Total Terminal</p>
                  <p className="text-5xl font-bold text-slate-900 tracking-tighter tabular-nums">
                    ${Math.max(0, (total + 3.00 + (total * 0.1) - discount)).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-4 mb-8">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Protocol Authorization</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`h-16 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all active:scale-95 ${
                      paymentMethod === 'cash' 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xl' 
                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <DollarSign size={18} />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Liquid</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('online')}
                    className={`h-16 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all active:scale-95 ${
                      paymentMethod === 'online' 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xl' 
                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <Lock size={18} />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Registry</span>
                  </button>
                </div>
              </div>

              {/* Promo */}
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100 mb-10 focus-within:bg-white focus-within:border-slate-900 transition-all">
                <Ticket size={18} className="text-slate-300 shrink-0" />
                <input
                  placeholder="PROTOCOL CODE"
                  className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-slate-900 placeholder-slate-200 uppercase tracking-widest"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button
                  onClick={handleApplyPromo}
                  className="bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-slate-100 shadow-sm hover:bg-slate-900 hover:text-white transition-all"
                >
                  Sync
                </button>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || items.length === 0}
                className="w-full h-20 bg-slate-900 text-white font-bold uppercase tracking-[0.3em] text-[11px] rounded-[2rem] group shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-5 disabled:opacity-20 active:scale-[0.98] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent skew-x-[-20deg] group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10">Initiate Deployment</span>
                <ChevronRight size={20} className="relative z-10 group-hover:translate-x-2 transition-transform" />
              </button>

              <div className="mt-8 flex items-center justify-center gap-3 py-4 border-t border-slate-50">
                <ShieldCheck size={16} className="text-slate-200" />
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                  End-to-End Encryption · Verified Logistics
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
