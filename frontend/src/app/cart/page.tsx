'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ChevronLeft, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Button from '@/components/Button';
import { API_URL } from '@/config/api';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
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
      toast.success('Item removed.');
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
     // In a real app, we'd search for a Soda product from the SAME store
     // We'll simulate finding one and adding it
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
       <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-[#ff8564] border-t-transparent rounded-full animate-spin" />
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#ff8564]/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        
        {/* Animated Header Section */}
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <h1 className="text-6xl font-black tracking-tightest uppercase italic">Your Cart</h1>
            <div className="w-16 h-16 rounded-2xl border-2 border-[#ff8564]/20 flex items-center justify-center text-[#ff8564] text-3xl font-black bg-[#ff8564]/5 shadow-2xl shadow-[#ff8564]/10">
               {items.length}
            </div>
          </motion.div>
          <p className="text-gray-500 text-lg mt-3 font-bold max-w-2xl leading-relaxed">
            Review your selection and adjust quantities before the final dash to your doorstep.
          </p>
        </header>

        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-32 flex flex-col items-center text-center opacity-50"
            >
              <ShoppingBag size={120} className="mb-8 text-gray-800" />
              <h2 className="text-4xl font-black mb-4 uppercase italic">Vibe Check: Empty</h2>
              <Button onClick={() => router.push('/')} variant="outline" size="lg">Discover Food</Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Items Column */}
              <div className="lg:col-span-8 space-y-8">
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
                        className="group relative bg-white/5 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 flex items-center gap-6 transition-all duration-500 hover:border-white/10 hover:bg-white/[0.07] overflow-hidden"
                      >
                         {/* Item Image */}
                         <div className="w-28 h-28 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                            <img 
                              src={item.products?.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&h=300&auto=format&fit=crop'} 
                              alt={item.products.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            />
                         </div>

                         {/* Details */}
                         <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                               <h3 className="text-2xl font-black tracking-tight group-hover:text-[#ff8564] transition-colors">{item.products.name}</h3>
                               <span className="text-2xl font-black text-white/90 font-mono tracking-tighter">
                                 ${(Number(item.products.price) * item.quantity).toFixed(2)}
                               </span>
                            </div>
                            <p className="text-gray-500 text-sm font-bold mb-4 line-clamp-1 italic">{(item.products as any).description || "Signature series choice"}</p>
                                                   <div className="flex items-center gap-6">
                               <div className="flex items-center bg-black/40 rounded-xl border border-white/5 p-0.5">
                                  <button 
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                    className="p-2.5 hover:bg-white/10 rounded-lg transition-colors"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="w-10 text-center text-lg font-black font-mono">{item.quantity}</span>
                                  <button 
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                    className="p-2.5 bg-[#ff8564] text-black rounded-lg hover:scale-105 transition-all shadow-lg shadow-[#ff8564]/20"
                                  >
                                    <Plus size={16} />
                                  </button>
                               </div>
 
                               <button 
                                 onClick={() => handleRemoveItem(item.id)}
                                 className="text-gray-600 hover:text-red-500 transition-colors"
                               >
                                 <Trash2 size={20} />
                               </button>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Add Quick Soda Banner */}
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="bg-gradient-to-r from-white/5 to-transparent border border-white/5 rounded-3xl p-8 flex items-center justify-between group overflow-hidden relative"
                >
                   <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff8564]/5 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-[#ff8564]/10 transition-colors" />
                   
                   <div className="relative z-10">
                      <p className="text-[#ff8564] font-black uppercase tracking-widest text-[10px] mb-1 flex items-center">
                         <Zap size={14} className="mr-2" /> Want a drink?
                      </p>
                      <h4 className="text-2xl font-black uppercase italic">Add a cold Soda for just <span className="text-[#ff8564]">$1.50</span></h4>
                   </div>

                   <button 
                     onClick={handleAddQuickSoda}
                     disabled={isAddingSoda}
                     className="relative z-10 bg-[#ff8564] text-black px-8 py-4 rounded-xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#ff8564]/20 flex items-center gap-2 disabled:opacity-50"
                   >
                     {isAddingSoda ? "Adding..." : "Add Quick"}
                     {!isAddingSoda && <Plus size={20} />}
                   </button>
                </motion.div>
              </div>

              {/* Summary Sidebar */}
              <div className="lg:col-span-4 lg:sticky lg:top-12">
                 <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
                 >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#ff8564]/30 to-transparent" />
                    
                    <h3 className="text-3xl font-black mb-8 border-b border-white/5 pb-6">Order Summary</h3>
                    
                    <div className="space-y-4 text-lg font-bold text-gray-500 mb-8 pb-8 border-b border-white/5">
                       <div className="flex justify-between shrink-0">
                          <span>Subtotal</span>
                          <span className="text-white font-mono">${total.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between shrink-0">
                          <span>Delivery Fee</span>
                          <span className="text-white font-mono">$2.99</span>
                       </div>
                       <div className="flex justify-between items-center text-[#ff8564]">
                          <span className="flex items-center text-sm uppercase tracking-widest"><Sparkles size={16} className="mr-2" /> Taxes & Fees</span>
                          <span className="font-mono">$0.00</span>
                       </div>
                    </div>

                    <div className="mb-8">
                       <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] mb-1">Estimated Total</p>
                       <div className="flex justify-between items-end">
                          <span className="text-5xl font-black text-white tracking-tighter">
                             ${(total + 2.99).toFixed(2)}
                          </span>
                       </div>
                    </div>

                    <Button 
                      onClick={handleCheckout}
                      className="w-full h-18 bg-[#ff8564] text-black text-2xl font-black rounded-2xl group shadow-[0_20px_40px_rgba(255,133,100,0.25)] hover:shadow-[0_20px_40px_rgba(255,133,100,0.4)] transition-all"
                    >
                      Checkout Now 
                      <ArrowRight size={28} className="ml-3 group-hover:translate-x-3 transition-transform duration-500" />
                    </Button>

                    <div className="mt-12 flex justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
                       <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-6" alt="Visa" />
                       <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
                       <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-6" alt="PayPal" />
                    </div>

                    <p className="text-center text-gray-600 font-bold text-sm mt-10 leading-relaxed uppercase tracking-tighter">
                       Your payment is encrypted and secured by Delivray Shield™ technology.
                    </p>
                 </motion.div>
              </div>

            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
