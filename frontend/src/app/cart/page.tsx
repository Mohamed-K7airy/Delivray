'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ChevronLeft, Sparkles, Zap, Lock, MapPin, Ticket, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { toast } from 'sonner';
import Button from '@/components/Button';
import { API_URL } from '@/config/api';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const upsellItems = [
  { id: 'upsell-1', name: 'Truffle Fries', price: 4.50, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'upsell-2', name: 'Vanilla Bean', price: 3.50, image: 'https://images.unsplash.com/photo-1570197788417-0e9232ed4d15?q=80&w=200&h=200&auto=format&fit=crop' },
  { id: 'upsell-3', name: 'Coca Cola', price: 1.99, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200&h=200&auto=format&fit=crop' },
];

export default function CartPage() {
  const { token, user, _hasHydrated } = useAuthStore();
  const { items, total, loading, setCart, removeItem, updateItemQuantity, setLoading, addItem } = useCartStore();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return; // Wait for hydration before checking auth
    
    if (!token || user?.role !== 'customer') {
      router.push('/login');
      return;
    }

    const fetchCart = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setCart(data.cart_id, data.items, data.total);
      } catch (err: any) {
        toast.error('Failed to load your cart.');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token, user, router, setCart, setLoading]);

  const handleUpdateQuantity = async (itemId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty <= 0) return handleRemoveItem(itemId);

    try {
      const res = await fetch(`${API_URL}/cart/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ item_id: itemId, quantity: newQty })
      });
      if (!res.ok) throw new Error('Failed to update quantity');
      updateItemQuantity(itemId, newQty);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const res = await fetch(`${API_URL}/cart/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ item_id: itemId })
      });
      if (!res.ok) throw new Error('Failed to remove item');
      removeItem(itemId);
      toast.success('Item removed from cart');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddUpsell = async (upsell: typeof upsellItems[0]) => {
    try {
      const res = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: upsell.id, quantity: 1 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add item');
      
      // Since upsell items are mock, we simulate store update
      const mockProduct = { 
        id: upsell.id, 
        name: upsell.name, 
        price: upsell.price, 
        image: upsell.image,
        store_id: items[0]?.products?.store_id || 'mock-store' 
      };
      
      addItem({
        id: data.id || Math.random().toString(36).substr(2, 9),
        product_id: upsell.id,
        quantity: 1,
        products: mockProduct
      });
      
      toast.success(`${upsell.name} added to cart!`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleApplyPromo = () => {
    const code = promoCode.toUpperCase().trim();
    if (code === 'SAVE10') {
      const discountAmount = total * 0.1;
      setDiscount(discountAmount);
      setIsPromoApplied(true);
      toast.success('Promo applied: 10% discount! 🎉');
    } else if (code === 'DELIVRAY') {
      setDiscount(5);
      setIsPromoApplied(true);
      toast.success('Promo applied: $5 discount! 🚀');
    } else {
      toast.error('Invalid promo code');
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ delivery_lat: 34.0522, delivery_lng: -118.2437 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setCart(data.id, [], 0);
      toast.success('Order placed successfully! 🚀');
      router.push(`/order/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed.');
    }
  };

  if (loading) {
     return (
       <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-[#FF5A3C] border-t-transparent rounded-full animate-spin" />
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-24">
      {/* Mini Navbar Overlay Toggle? No, we have the global one. */}
      
      <div className="container-responsive py-10 lg:py-16">
        
        {/* Page Header */}
        <header className="mb-10 lg:mb-14">
           <h1 className="text-4xl lg:text-6xl font-black text-[#0A0A0A] tracking-tighter mb-2">Your Cart</h1>
           <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{items.length} ITEMS READY FOR DELIVERY</p>
        </header>

        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-32 flex flex-col items-center text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm"
            >
              <div className="w-24 h-24 bg-[#F8F8F8] rounded-full flex items-center justify-center mb-8 text-gray-300">
                <ShoppingBag size={40} />
              </div>
              <h2 className="text-2xl font-black text-[#0A0A0A] mb-8 tracking-tight">Your cart is empty.</h2>
              <button 
                onClick={() => router.push('/')}
                className="bg-[#FF5A3C] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#E84A2C] transition-all shadow-xl shadow-[#FF5A3C]/20"
              >
                Go Shopping
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              
              {/* Items Column */}
              <div className="lg:col-span-8 space-y-8">
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div 
                        key={item.id}
                        layout
                        variants={itemVariants}
                        exit={{ opacity: 0, x: -50 }}
                        className="bg-white rounded-[2rem] p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-6 lg:gap-10 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] group hover:border-gray-200 transition-all"
                      >
                         {/* Item Image */}
                         <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-3xl overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 border border-gray-50 p-2">
                            <img 
                              src={item.products?.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&h=300&auto=format&fit=crop'} 
                              alt={item.products.name}
                              className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500" 
                            />
                         </div>

                         {/* Details */}
                         <div className="flex-1 w-full text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 mb-8">
                               <div>
                                  <h3 className="text-2xl lg:text-3xl font-black text-[#0A0A0A] tracking-tighter leading-none mb-2">{item.products.name}</h3>
                                  <p className="text-gray-400 font-bold text-sm italic">Premium Selection</p>
                               </div>
                               <span className="text-3xl font-black text-[#0A0A0A] tracking-tighter">
                                 ${(Number(item.products.price) * item.quantity).toFixed(2)}
                               </span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                               <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                                  <button 
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all font-black text-[#0A0A0A]"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="w-12 text-center text-lg font-black text-[#0A0A0A]">{item.quantity}</span>
                                  <button 
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all font-black text-[#0A0A0A]"
                                  >
                                    <Plus size={16} />
                                  </button>
                               </div>
  
                               <button 
                                 onClick={() => handleRemoveItem(item.id)}
                                 className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors font-black uppercase tracking-widest text-[9px]"
                               >
                                 <Trash2 size={16} />
                                 <span>Remove</span>
                               </button>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Frequently ordered together */}
                <div className="pt-10">
                   <h4 className="text-2xl font-black text-[#0A0A0A] tracking-tighter mb-8">Frequently ordered together</h4>
                   <div className="flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-hide">
                      {upsellItems.map((item) => (
                        <div key={item.id} className="min-w-[200px] bg-white border border-gray-100 rounded-[2rem] p-4 group hover:shadow-xl hover:shadow-black/5 transition-all">
                           <div className="aspect-square rounded-[1.5rem] bg-gray-50 overflow-hidden mb-4 relative">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                               <button 
                                 onClick={() => handleAddUpsell(item)}
                                 className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-[#FF5A3C] shadow-sm hover:bg-[#FF5A3C] hover:text-white transition-all"
                               >
                                  <Plus size={20} />
                               </button>
                           </div>
                           <p className="text-sm font-black text-[#0A0A0A] tracking-tight">{item.name}</p>
                           <p className="text-xs text-gray-400 font-bold">${item.price.toFixed(2)}</p>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Summary Sidebar */}
              <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                 <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#F3F4F6]/50 rounded-[3rem] p-8 lg:p-10 border border-gray-100"
                  >
                    <h3 className="text-2xl lg:text-3xl font-black text-[#0A0A0A] mb-10 tracking-tighter">Order Summary</h3>
                    
                    <div className="space-y-5 mb-10">
                       <div className="flex justify-between items-center">
                          <span className="text-gray-500 font-bold text-sm">Subtotal</span>
                          <span className="text-[#0A0A0A] font-bold text-lg">${total.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-gray-500 font-bold text-sm">Delivery Fee</span>
                          <span className="text-[#0A0A0A] font-bold text-lg">$2.99</span>
                       </div>
                        <div className="flex justify-between items-center">
                           <span className="text-gray-500 font-bold text-sm">Service Tax (10%)</span>
                           <span className="text-[#0A0A0A] font-bold text-lg">${(total * 0.1).toFixed(2)}</span>
                        </div>
                        {isPromoApplied && (
                          <div className="flex justify-between items-center text-[#FF5A3C]">
                             <span className="font-bold text-sm">Promo Discount</span>
                             <span className="font-bold text-lg">-${discount.toFixed(2)}</span>
                          </div>
                        )}
                     </div>

                    <div className="pt-8 border-t border-gray-200 mb-10">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">TOTAL AMOUNT</p>
                        <p className="text-6xl font-black text-[#0A0A0A] tracking-tighter">
                           ${Math.max(0, (total + 2.99 + (total * 0.1) - discount)).toFixed(2)}
                        </p>
                    </div>

                    {/* Promo Code */}
                    <div className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-gray-100 mb-8 shadow-sm">
                       <Ticket size={20} className="text-[#FF5A3C]" />
                       <input 
                         placeholder="Promo code" 
                         className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder-gray-300"
                         value={promoCode}
                         onChange={(e) => setPromoCode(e.target.value)}
                       />
                        <button 
                          onClick={handleApplyPromo}
                          className="text-[#FF5A3C] text-sm font-black uppercase tracking-widest hover:underline"
                        >
                          Apply
                        </button>
                     </div>

                    <button 
                      onClick={handleCheckout}
                      disabled={loading}
                      className="w-full h-20 bg-[#FF5A3C] text-white text-base font-black uppercase tracking-widest rounded-[1.5rem] group shadow-2xl shadow-[#FF5A3C]/30 hover:bg-[#E84A2C] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      <span>Checkout</span>
                      <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
                    </button>

                    <div className="mt-8 flex items-center justify-center gap-3">
                       <ShieldCheck size={16} className="text-gray-400" />
                       <p className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed text-center">
                         Secure payment powered by Delivray Pay. 100% money-back guarantee.
                       </p>
                    </div>
                 </motion.div>

                 {/* Delivering to Card */}
                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex items-center gap-5"
                 >
                    <div className="w-12 h-12 bg-[#FFF9F8] rounded-2xl flex items-center justify-center text-[#FF5A3C] shrink-0">
                       <MapPin size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">DELIVERING TO</p>
                       <p className="text-xs font-black text-[#0A0A0A] truncate">245 Editorial Ave, San Francisco</p>
                       <button className="text-[9px] font-black text-[#FF5A3C] uppercase tracking-widest mt-1 hover:underline">Change Address</button>
                    </div>
                 </motion.div>
              </aside>

            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
