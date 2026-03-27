'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ChevronLeft, Sparkles, Zap, Lock, MapPin, Ticket, ShieldCheck, ChevronRight, Navigation } from 'lucide-react';
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

    let isMounted = true; 

    const fetchCart = async () => {
      setLoading(true);
      try {
        const data = await apiClient('/cart');
        if (data && isMounted) {
          setCart(data.cart_id, data.items, data.total);

          // Fetch real additions if we have items
          if (data.items.length > 0) {
            const storeId = data.items[0].products.store_id;
            const storeData = await apiClient(`/stores/${storeId}`);
            if (storeData && isMounted) {
              const additions = storeData.products.filter((p: any) =>
                p.description?.includes('[Addition]')
              );
              setRealUpsellItems(additions);
            }
          }
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCart();

    return () => {
      isMounted = false;
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
          quantity: 1,
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

      // 1. Create the order first (in pending/unpaid state)
      const orderData = await apiClient('/orders', {
        method: 'POST',
        data: { 
          delivery_lat: selectedLocation[0], 
          delivery_lng: selectedLocation[1],
          delivery_address: address || savedAddress || 'Customer Address',
          promo_code: isPromoApplied ? promoCode.toUpperCase() : null
        }
      });

      if (orderData) {
        setCurrentOrderId(orderData.id);
        
        // 2. Create Payment Intent
        const paymentData = await apiClient('/payments/create-intent', {
            method: 'POST',
            data: { order_id: orderData.id }
        });

        if (paymentData && paymentData.clientSecret) {
            setClientSecret(paymentData.clientSecret);
            setShowStripeModal(true);
        }
      }
    } catch (err: any) {
      // apiClient handles toasts
    } finally {
        setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowStripeModal(false);
    setCart(currentOrderId, [], 0);
    router.push(`/order/${currentOrderId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#d97757] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] pb-24">
      {/* Mini Navbar Overlay Toggle? No, we have the global one. */}

      <div className="container-responsive py-10 lg:py-16">

        <header className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-black text-[#111111] tracking-tighter mb-1">Your Cart</h1>
          <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest">{items.length} item{items.length !== 1 ? 's' : ''} ready for delivery</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* Items Column */}
          <div className="lg:col-span-8 space-y-6">
            {items.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 flex flex-col items-center text-center border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-5 text-gray-200">
                  <ShoppingBag size={28} />
                </div>
                <h2 className="text-xl font-black text-[#111111] mb-2 tracking-tight">Your cart is empty</h2>
                <p className="text-sm text-[#888888] font-bold mb-6">Add items from your favourite restaurant to get started.</p>
                <button
                  onClick={() => router.push('/')}
                  className="h-11 bg-[#d97757] text-white px-8 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#c2654a] transition-all"
                >
                  Browse Restaurants
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50">
                  <h2 className="text-base font-black text-[#111111] tracking-tighter">Order Items</h2>
                </div>
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      exit={{ opacity: 0, x: -30, height: 0 }}
                      className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0 group"
                    >
                      {/* Image */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                        <img
                          src={item.products?.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=150&h=150&auto=format&fit=crop'}
                          alt={item.products.name}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=150&h=150&auto=format&fit=crop'; }}
                        />
                      </div>

                      {/* Name & Price */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-[#111111] tracking-tight truncate">{item.products.name}</p>
                        <p className="text-xs font-bold text-[#888888] mt-0.5">${Number(item.products.price).toFixed(2)} each</p>
                      </div>

                      {/* Qty */}
                      <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100 gap-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all font-black text-[#111111]"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-black text-[#111111]">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all font-black text-[#111111]"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Total */}
                      <span className="text-sm font-black text-[#111111] w-16 text-right shrink-0">
                        ${(Number(item.products.price) * item.quantity).toFixed(2)}
                      </span>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

          </div>

          {/* Summary Sidebar */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">

            {/* Address & Map Picker */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-50">
                <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest mb-3">Delivery Destination</p>
                
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d97757]" />
                    <input
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Street, Building, Apartment..."
                      className="w-full h-10 bg-[#f9f9f9] pl-8 pr-3 rounded-xl border border-transparent focus:border-[#d97757] outline-none text-xs font-bold text-[#111111] placeholder:text-gray-300 transition-all"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                   <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-black uppercase tracking-tight text-[#111111]">Pinpoint Accuracy</p>
                      <button 
                        onClick={() => setShowMap(!showMap)}
                        className="text-[10px] font-black text-[#d97757] uppercase tracking-widest hover:underline"
                      >
                        {showMap ? 'Hide Map' : 'Change Location'}
                      </button>
                   </div>
                   
                   {!selectedLocation && !showMap && (
                      <div className="py-4 text-center">
                         <p className="text-[10px] font-bold text-gray-400 mb-3 italic">No location pinned yet</p>
                         <Button 
                            variant="primary" 
                            size="sm" 
                            className="h-8 text-[9px]"
                            onClick={() => setShowMap(true)}
                         >
                            Set Location on Map
                         </Button>
                      </div>
                   )}
                </div>
              </div>

              {showMap && (
                <div className="h-64 relative">
                  <MapView 
                    center={selectedLocation || [30.0444, 31.2357]} // Default to Cairo center if no location
                    zoom={15}
                    markers={selectedLocation ? [{ position: selectedLocation, type: 'selected', label: 'Deliver Here' }] : []}
                    onMapClick={handleMapClick}
                    autoCenter={!selectedLocation}
                  />
                  <div className="absolute top-4 right-4 z-[500]">
                     <button
                       onClick={handleUseMyLocation}
                       className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-[#d97757] hover:bg-gray-50 transition-all border border-gray-100 pointer-events-auto"
                       title="Use My Current Location"
                     >
                       <Navigation size={18} />
                     </button>
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
                     <p className="bg-black/80 text-white px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md">
                        {isGeocoding ? 'Finding Address...' : 'Click to drop pin'}
                     </p>
                  </div>
                </div>
              )}
              
              {selectedLocation && (
                <div className="bg-green-50 px-6 py-3 flex items-center gap-2">
                   <ShieldCheck size={14} className="text-green-600" />
                   <p className="text-[9px] font-black text-green-700 uppercase tracking-widest">Precise Location Set</p>
                </div>
              )}
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <h3 className="text-lg font-black text-[#111111] mb-6 tracking-tighter">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#555555]">Subtotal</span>
                  <span className="text-sm font-black text-[#111111]">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#555555]">Delivery Fee</span>
                  <span className="text-sm font-black text-[#111111]">$3.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#555555]">Service Tax (10%)</span>
                  <span className="text-sm font-black text-[#111111]">${(total * 0.1).toFixed(2)}</span>
                </div>
                {isPromoApplied && (
                  <div className="flex justify-between items-center text-[#d97757]">
                    <span className="text-sm font-bold">Promo Discount</span>
                    <span className="text-sm font-black">-${discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="pt-5 border-t border-gray-100 mb-5">
                <div className="flex items-baseline justify-between">
                  <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest">Total</p>
                  <p className="text-3xl font-black text-[#111111] tracking-tighter">
                    ${Math.max(0, (total + 3.00 + (total * 0.1) - discount)).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Promo */}
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-100 mb-5">
                <Ticket size={16} className="text-[#d97757] shrink-0" />
                <input
                  placeholder="Promo code"
                  className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder-[#888888]"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button
                  onClick={handleApplyPromo}
                  className="text-[#d97757] text-xs font-black uppercase tracking-widest hover:underline"
                >
                  Apply
                </button>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || items.length === 0}
                className="w-full h-14 bg-[#d97757] text-white font-black uppercase tracking-widest text-[10px] rounded-xl group shadow-sm hover:bg-[#c2654a] transition-all flex items-center justify-center gap-3 disabled:opacity-40"
              >
                <span>Checkout</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-4 flex items-center justify-center gap-2">
                <ShieldCheck size={14} className="text-gray-300" />
                <p className="text-[9px] font-bold text-[#888888] text-center">
                  Secure checkout · 100% money-back guarantee
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
