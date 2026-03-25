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
      router.push(`/order-tracking/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed.');
    }
  };

  if (loading) {
     return (
       <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container-responsive section-spacing">
        
        {/* Header Section */}
        <header className="mb-12 lg:mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6 sm:gap-10"
          >
            <h1 className="heading-responsive !text-4xl sm:!text-6xl lg:text-8xl">Your <span className="text-primary italic">Cart.</span></h1>
            <div className="bg-primary/20 text-primary px-5 py-2 rounded-2xl text-xl sm:text-3xl font-black border border-primary/20 shadow-xl shadow-primary/10">
               {items.length}
            </div>
          </motion.div>
          <p className="text-responsive mt-6 max-w-2xl">
            Review your selection and adjust quantities before the final dash to your doorstep.
          </p>
        </header>

        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-32 flex flex-col items-center text-center bg-white/5 rounded-[3rem] border border-white/5"
            >
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-10 text-gray-700">
                <ShoppingBag size={48} />
              </div>
              <h2 className="heading-responsive !text-2xl sm:!text-4xl mb-8">Vibe Check: <span className="text-primary italic">Empty.</span></h2>
              <Button onClick={() => router.push('/')} variant="outline" size="lg">Start Discovery</Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
              
              {/* Items Column */}
              <div className="lg:col-span-8 flex flex-col space-y-8">
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
                        className="card-responsive !p-4 sm:!p-6 flex flex-col sm:flex-row items-center gap-6 hover:border-primary/20 transition-all group overflow-hidden"
                      >
                         {/* Item Image */}
                         <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-white/5 border border-white/5 shrink-0 p-2 shadow-inner">
                            <img 
                              src={item.products?.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&h=300&auto=format&fit=crop'} 
                              alt={item.products.name}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
                            />
                         </div>

                         {/* Details */}
                         <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-2 mb-4">
                               <h3 className="text-xl sm:text-2xl font-black group-hover:text-primary transition-colors uppercase tracking-tight">{item.products.name}</h3>
                               <span className="text-2xl font-black text-white/90 tracking-tighter">
                                 ${(Number(item.products.price) * item.quantity).toFixed(2)}
                               </span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                               <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/5">
                                  <button 
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors font-black"
                                  >
                                    <Minus size={18} />
                                  </button>
                                  <span className="w-12 text-center text-lg font-black text-primary">{item.quantity}</span>
                                  <button 
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                    className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
                                  >
                                    <Plus size={18} />
                                  </button>
                               </div>
  
                               <button 
                                 onClick={() => handleRemoveItem(item.id)}
                                 className="text-gray-600 hover:text-red-500 transition-colors p-2"
                               >
                                 <Trash2 size={20} />
                               </button>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Upsell Banner */}
                <motion.div 
                   initial={{ opacity: 0 }}
                   whileInView={{ opacity: 1 }}
                   viewport={{ once: true }}
                   className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 rounded-[2.5rem] p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-8 group overflow-hidden relative"
                >
                   <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
                   
                   <div className="relative z-10 text-center sm:text-left">
                      <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] inline-flex items-center mb-6">
                         <Zap size={14} className="mr-2" /> Quick Add-on
                      </span>
                      <h4 className="text-3xl font-black uppercase leading-tight">Thirsty?<br/><span className="text-primary italic">Add a Soda</span></h4>
                   </div>

                   <button 
                     onClick={handleAddQuickSoda}
                     disabled={isAddingSoda}
                     className="relative z-10 bg-primary text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center gap-3 disabled:opacity-50"
                   >
                     {isAddingSoda ? "Injecting..." : "Add To Order"}
                     {!isAddingSoda && <Plus size={18} />}
                   </button>
                </motion.div>
              </div>

              {/* Summary Sidebar */}
              <aside className="lg:col-span-4 lg:sticky lg:top-24 w-full">
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-responsive !bg-[#111111] !p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-white/5"
                 >
                    <h3 className="text-3xl font-black mb-10 border-b border-white/5 pb-8 uppercase tracking-tight">Summary</h3>
                    
                    <div className="space-y-6 mb-10 pb-10 border-b border-white/5 font-bold">
                       <div className="flex justify-between text-gray-500">
                          <span className="uppercase text-[10px] tracking-widest">Subtotal</span>
                          <span className="text-white font-mono tracking-tighter text-lg">${total.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between text-gray-500">
                          <span className="uppercase text-[10px] tracking-widest">Delivery</span>
                          <span className="text-white font-mono tracking-tighter text-lg">$2.99</span>
                       </div>
                       <div className="flex justify-between items-center text-primary">
                          <span className="uppercase text-[10px] tracking-widest flex items-center"><Sparkles size={14} className="mr-2" /> Perks Applied</span>
                          <span className="font-mono tracking-tighter text-lg">-$0.00</span>
                       </div>
                    </div>

                    <div className="mb-12">
                       <p className="text-gray-600 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Total Due</p>
                       <div className="flex justify-between items-baseline">
                          <span className="text-6xl font-black text-white tracking-tighter">
                             ${(total + 2.99).toFixed(2)}
                          </span>
                       </div>
                    </div>

                    <button 
                      onClick={handleCheckout}
                      disabled={loading}
                      className="w-full h-20 bg-primary text-white text-base font-black uppercase tracking-[0.2em] rounded-2xl group shadow-2xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center disabled:opacity-50"
                    >
                      Process Order 
                      <ArrowRight size={24} className="ml-4 group-hover:translate-x-2 transition-transform duration-300" />
                    </button>

                    <div className="mt-12 flex justify-between px-2 opacity-50 grayscale">
                       <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                       <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
                       <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
                    </div>

                    <p className="text-center text-gray-600 font-bold text-[9px] mt-10 uppercase tracking-widest leading-relaxed">
                       Encrypted Transaction Secure Checkout v2.4
                    </p>
                 </motion.div>
              </aside>

            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
