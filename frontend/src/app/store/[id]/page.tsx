'use client';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Minus, Info, MapPin, Star, Clock, ChevronLeft, ShoppingBag, Search, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import Button from '@/components/Button';
import Logo from '@/components/Logo';
import { API_URL } from '@/config/api';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  store_id: string;
  availability: boolean;
}

interface Store {
  id: string;
  name: string;
  type: string;
  location_lat: number;
  location_lng: number;
  products: Product[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  show: { opacity: 1, scale: 1, y: 0 }
};

export default function StorePage() {
  const { id } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Featured');
  
  const categories = ['Featured', 'Snacks', 'Beverages', 'Dairy', 'Bakery', 'Pantry'];
  
  const { items, addItem, removeItem, updateItemQuantity } = useCartStore();
  const { token, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch(`${API_URL}/stores/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error fetching store');
        setStore(data);
      } catch (err: any) {
        toast.error(err.message || 'Store not found');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStore();
  }, [id]);

  const handleAddToCart = async (product: Product) => {
    if (!token || user?.role !== 'customer') {
      toast.error('Please log in as a customer to order');
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: product.id, quantity: 1 })
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.clear_cart_required) {
          toast.error(data.message, {
            action: {
              label: 'Go to Cart',
              onClick: () => router.push('/cart')
            }
          });
          return;
        }
        throw new Error(data.message);
      }
      
      addItem({
        id: data.id, 
        product_id: product.id,
        quantity: data.quantity || 1,
        products: product
      });
      
      toast.success(`Added ${product.name} to cart`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRemoveFromCart = (productId: string, cartItemId: string) => {
    try {
      // In a real app we'd call the API to update/remove the cart item.
      // Here we simulate the quantity down visually for frontend demo purposes.
      const qty = getProductQuantity(productId);
      if (qty > 1) {
        updateItemQuantity(cartItemId, qty - 1);
      } else {
        removeItem(cartItemId);
      }
    } catch (err: any) {
      toast.error('Failed to update cart');
    }
  };

  const getProductQuantity = (productId: string) => {
    const item = items.find(i => i.product_id === productId);
    return item ? item.quantity : 0;
  };
  
  const getCartItemId = (productId: string) => {
    return items.find(i => i.product_id === productId)?.id || '';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse bg-white/10 h-48 sm:h-64 rounded-2xl sm:rounded-[2rem] w-full mb-10"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
             <div key={i} className="animate-pulse bg-white h-32 sm:h-40 rounded-2xl sm:rounded-[2rem] p-4 sm:p-5 shadow-sm border border-transparent"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-white mb-4">Store not available</h2>
        <Button onClick={() => router.push('/')}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      {/* Custom Storefront Navbar (as per mockup) */}
      <nav className="h-16 border-b border-white/5 bg-[#262624]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <Link href="/" className="p-2 hover:bg-white/5 rounded-full text-primary transition-all">
            <ChevronLeft size={20} />
          </Link>
          <div className="text-primary font-black text-base sm:text-xl tracking-tight uppercase italic">Neon Nocturne</div>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
           <span className="hover:text-white cursor-pointer transition-all">Explore</span>
           <span className="hover:text-white cursor-pointer transition-all">Search</span>
           <span className="text-primary font-black border-b-2 border-primary pb-1">Storefront</span>
        </div>

        <div className="flex items-center space-x-4">
           <Link href="/cart" className="p-2 text-gray-400 hover:text-white relative bg-white/5 rounded-full border border-white/10">
              <ShoppingBag size={20} />
              {items.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[9px] font-black rounded-full flex items-center justify-center text-white border border-[#111111]">{items.length}</span>}
           </Link>
           <button className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full border border-white/10">
              <Bell size={20} />
           </button>
           <Link href="/profile" className="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5 hover:border-primary transition-all overflow-hidden">
              <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-black uppercase tracking-tighter text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
           </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
        {/* Store Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-[#262624] rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-14 mb-6 sm:mb-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-end min-h-[280px] sm:min-h-[450px]"
        >
          {/* Custom Image Mask/Effect */}
          <div className="absolute top-0 right-0 w-full h-[60%] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#262624]/80 to-[#262624]"></div>
            <img 
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2874&auto=format&fit=crop" 
              className="w-full h-full object-cover opacity-60 mix-blend-overlay"
              alt={store.name}
            />
          </div>
          
          <div className="relative z-20">
            <div className="mb-6">
              <span className="bg-[#d97757]/20 text-[#d97757] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-[#d97757]/10">
                {store.type}
              </span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-6 sm:mb-10 tracking-tight leading-none uppercase">
                  {store.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 sm:gap-10">
                  <div className="flex items-center group cursor-help">
                    <Star size={16} className="text-primary fill-primary mr-2 sm:mr-3 group-hover:scale-125 transition-transform"/> 
                    <div>
                      <div className="text-sm sm:text-lg font-black leading-none">4.8</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1 text-nowrap">(500+ ratings)</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center group">
                    <MapPin size={16} className="text-primary mr-2 sm:mr-3 group-hover:translate-y-[-2px] transition-transform"/> 
                    <div className="text-sm sm:text-lg font-black leading-none">1.2 miles away</div>
                  </div>

                  <div className="flex items-center group">
                    <Clock size={16} className="text-primary mr-2 sm:mr-3 group-hover:rotate-12 transition-transform"/> 
                    <div className="text-sm sm:text-lg font-black leading-none">20-30 min</div>
                  </div>
                </div>
              </div>

              <button className="bg-white/5 backdrop-blur-3xl px-5 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-[1.5rem] border border-white/5 flex items-center space-x-2 sm:space-x-3 hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[10px] sm:text-[11px] h-fit self-start md:self-end">
                <span>Store Info</span>
                <Info size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Category Tabs Section */}
        <div className="flex items-center space-x-3 sm:space-x-4 mb-8 sm:mb-12 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-3 sm:px-8 sm:py-4 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all whitespace-nowrap shadow-sm
                ${selectedCategory === cat 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                  : 'bg-[#262624] text-gray-500 hover:text-white border border-white/5'}`}
            >
              {cat}
            </button>
          ))}
        </div>

      {/* Products Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8"
      >
        {store.products.length === 0 ? (
          <p className="text-gray-400 col-span-full text-xl font-medium">No products available at this store right now.</p>
        ) : (
          store.products.map(product => {
            const qty = getProductQuantity(product.id);
            const cartItemId = getCartItemId(product.id);
            return (
              <motion.div 
                variants={itemVariants} 
                key={product.id} 
                className="bg-[#262624]/60 backdrop-blur-3xl p-4 sm:p-7 rounded-2xl sm:rounded-[3rem] border border-white/5 hover:border-primary/30 transition-all flex items-center justify-between group h-fit shadow-2xl shadow-black/40"
              >
                <div className="flex-1 pr-4">
                  <div className="mb-1">
                     <h3 className="text-lg sm:text-2xl font-extrabold text-white group-hover:text-primary transition-all duration-300">
                       {product.name} <span className="text-gray-500 font-bold text-sm ml-2">/ {product.name.includes(' ') ? 'صنف' : 'منتج'}</span>
                     </h3>
                  </div>
                  <p className="text-gray-500 text-[10px] sm:text-[11px] leading-relaxed mb-4 sm:mb-8 line-clamp-2 font-medium">{product.description || 'Delicious freshly made item prepared with premium ingredients.'}</p>
                  
                  <div className="flex items-end justify-between">
                     <div className="flex flex-col">
                        <span className="text-[#666] text-[10px] font-black uppercase tracking-widest mb-1.5">Qty: {qty}</span>
                        <span className="text-3xl font-black text-white tracking-tighter">${Number(product.price).toFixed(2)}</span>
                     </div>
                     <button 
                       onClick={() => handleAddToCart(product)}
                       className="w-14 h-14 bg-white/5 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-primary hover:text-white transition-all transform active:scale-90 border border-white/5 group-hover:bg-primary/20 group-hover:border-primary/20"
                     >
                       <Plus size={28} strokeWidth={2.5} />
                     </button>
                  </div>
                </div>
                
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-white/5 to-transparent rounded-2xl sm:rounded-[2.5rem] overflow-hidden relative border border-white/10 shrink-0 p-1.5 sm:p-2 shadow-inner">
                   <img 
                     src={product.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=150&auto=format&fit=crop'} 
                     className="w-full h-full object-contain group-hover:scale-125 transition-transform duration-700" 
                     alt={product.name}
                   />
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Floating View Cart Button (High Fidelity) */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            className="fixed bottom-6 right-4 sm:bottom-12 sm:right-12 z-[100]"
          >
            <Link 
              href="/cart"
              className="bg-[#f08c6e] text-white pl-5 pr-8 py-4 sm:pl-8 sm:pr-12 sm:py-6 rounded-full font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-[0_25px_60px_-15px_rgba(240,140,110,0.6)] flex items-center space-x-3 sm:space-x-6 hover:scale-105 active:scale-95 transition-all group"
            >
               <ShoppingBag size={18} strokeWidth={3} className="text-white" />
               <span className="text-xs">View Cart</span>
               <div className="text-white/80 font-black text-lg ml-2">
                 {items.length}
               </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
}
