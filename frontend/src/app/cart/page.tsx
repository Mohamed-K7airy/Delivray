'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ChevronLeft, Sparkles, Zap, Lock } from 'lucide-react';
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

export default function CartPage() {
  const { token, user } = useAuthStore();
  const { items, total, loading, setCart, removeItem, updateItemQuantity, setLoading } = useCartStore();
  const router = useRouter();
  const [isAddingSoda, setIsAddingSoda] = useState(false);

  useEffect(() => {
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

  const handleAddQuickSoda = async () => {
     if (items.length === 0) {
        toast.error("Add something to your cart first!");
        return;
     }
     
     setIsAddingSoda(true);
     setTimeout(() => {
        toast.success("Ice-cold Soda added to your order! 🥤");
        setIsAddingSoda(false);
     }, 800);
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ delivery_lat: 30.0, delivery_lng: 31.0 })
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
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="container-responsive py-12 lg:py-20">
        
        {/* Header Section */}
        <header className="mb-12 lg:mb-20 space-y-4">
           <div className="flex items-center gap-6">
              <h1 className="text-5xl lg:text-8xl font-black text-[#0A0A0A] tracking-tighter">Your <span className="text-[#FF5A3C] italic">cart.</span></h1>
              <div className="bg-[#FFF9F8] text-[#FF5A3C] px-6 py-3 rounded-2xl text-2xl font-black border border-[#FFE7E2] shadow-sm">
                 {items.length}
              </div>
           </div>
           <p className="text-gray-400 font-bold text-lg max-w-xl">
              One last look before the dash! Fine-tune your selection and prepare for lightning delivery.
           </p>
        </header>

        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-32 flex flex-col items-center text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm"
            >
              <div className="w-24 h-24 bg-[#F8F8F8] rounded-full flex items-center justify-center mb-10 text-gray-300">
                <ShoppingBag size={48} />
              </div>
              <h2 className="text-3xl font-black text-[#0A0A0A] mb-8 tracking-tight">Your cart is <span className="text-[#FF5A3C] italic">empty.</span></h2>
              <button 
                onClick={() => router.push('/')}
                className="bg-[#FF5A3C] text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#E84A2C] transition-all shadow-xl shadow-[#FF5A3C]/20"
              >
                Start Discovery
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
              
              {/* Items Column */}
              <div className="lg:col-span-8 space-y-12">
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-6"
                >
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div 
                        key={item.id}
                        layout
                        variants={itemVariants}
                        exit={{ opacity: 0, x: -50 }}
                        className="bg-white rounded-[2.5rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all group overflow-hidden"
                      >
                         {/* Item Image */}
                         <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 p-4">
                            <img 
                              src={item.products?.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&h=300&auto=format&fit=crop'} 
                              alt={item.products.name}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
                            />
                         </div>

                         {/* Details */}
                         <div className="flex-1 w-full sm:w-auto">
                            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-2 mb-6 text-center sm:text-left">
                               <div>
                                  <h3 className="text-2xl font-black text-[#0A0A0A] group-hover:text-[#FF5A3C] transition-colors tracking-tight line-clamp-1">{item.products.name}</h3>
                                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Gourmet Selection</p>
                               </div>
                               <span className="text-3xl font-black text-[#0A0A0A] tracking-tighter">
                                 ${(Number(item.products.price) * item.quantity).toFixed(2)}
                               </span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                               <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-100">
                                  <button 
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all font-black text-[#0A0A0A]"
                                  >
                                    <Minus size={18} />
                                  </button>
                                  <span className="w-12 text-center text-lg font-black text-[#FF5A3C]">{item.quantity}</span>
                                  <button 
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                    className="w-10 h-10 bg-[#FF5A3C] text-white rounded-xl flex items-center justify-center hover:bg-[#E84A2C] transition-all shadow-lg shadow-[#FF5A3C]/20"
                                  >
                                    <Plus size={18} />
                                  </button>
                               </div>
  
                               <button 
                                 onClick={() => handleRemoveItem(item.id)}
                                 className="text-gray-300 hover:text-red-500 transition-colors p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-red-100"
                               >
                                 <Trash2 size={20} />
                               </button>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Upsell Banner (Refined) */}
                <motion.div 
                   initial={{ opacity: 0 }}
                   whileInView={{ opacity: 1 }}
                   viewport={{ once: true }}
                   className="bg-white border border-gray-100 rounded-[3rem] p-10 sm:p-14 flex flex-col lg:flex-row items-center justify-between gap-10 group relative overflow-hidden shadow-sm"
                >
                   <div className="relative z-10 text-center lg:text-left space-y-4">
                      <span className="bg-[#FFF9F8] text-[#FF5A3C] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] inline-flex items-center border border-[#FFE7E2]">
                         <Zap size={14} className="mr-2" /> Flash Deal
                      </span>
                      <h4 className="text-4xl lg:text-5xl font-black text-[#0A0A0A] leading-[0.9] tracking-tighter">Thirsty? Add an <br/><span className="text-[#FF5A3C] italic">Ice-Cold Soda</span></h4>
                      <p className="text-gray-400 font-bold">The perfect companion for your premium meal.</p>
                   </div>

                   <button 
                     onClick={handleAddQuickSoda}
                     disabled={isAddingSoda}
                     className="relative z-10 bg-[#FF5A3C] text-white px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#E84A2C] active:scale-95 transition-all shadow-xl shadow-[#FF5A3C]/20 flex items-center gap-3 disabled:opacity-50"
                   >
                     {isAddingSoda ? "Adding..." : "Add (+ $1.99)"}
                     {!isAddingSoda && <Plus size={20} />}
                   </button>
                </motion.div>
              </div>

              {/* Summary Sidebar (Refined) */}
              <aside className="lg:col-span-4 lg:sticky lg:top-24 w-full">
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[3rem] p-10 lg:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-gray-100"
                 >
                    <h3 className="text-3xl font-black text-[#0A0A0A] mb-10 pb-8 border-b border-gray-50 tracking-tight">Order Summary</h3>
                    
                    <div className="space-y-6 mb-12 pb-10 border-b border-gray-50">
                       <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                          <span className="text-[#0A0A0A] font-black text-xl tracking-tight">${total.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Delivery Fee</span>
                          <span className="text-[#0A0A0A] font-black text-xl tracking-tight">$2.99</span>
                       </div>
                       <div className="flex justify-between items-center text-[#FF5A3C] bg-[#FFF9F8] px-4 py-3 rounded-xl border border-[#FFE7E2]">
                          <span className="uppercase text-[10px] font-black tracking-widest flex items-center"><Sparkles size={14} className="mr-2" /> Rewards</span>
                          <span className="font-black text-xl tracking-tight">-$1.50</span>
                       </div>
                    </div>

                    <div className="mb-12">
                       <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Grand Total</p>
                       <div className="flex justify-between items-baseline">
                          <span className="text-7xl font-black text-[#0A0A0A] tracking-tighter">
                             ${(total + 2.99 - 1.50).toFixed(2)}
                          </span>
                       </div>
                    </div>

                    <button 
                      onClick={handleCheckout}
                      disabled={loading}
                      className="w-full h-24 bg-[#FF5A3C] text-white text-base font-black uppercase tracking-[0.2em] rounded-2xl group shadow-2xl shadow-[#FF5A3C]/30 hover:bg-[#E84A2C] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      Complete Checkout 
                      <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
                    </button>

                    <div className="mt-12 flex flex-col items-center gap-6">
                       <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                          <Lock size={12} className="text-green-500" /> Secure SSL Checkout
                       </div>
                       <div className="flex justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
                       </div>
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
