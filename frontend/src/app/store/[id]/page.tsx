'use client';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Minus, Info, MapPin, Star, Clock, ChevronLeft, ShoppingBag, Search, Bell, ChevronRight } from 'lucide-react';
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
      <div className="container-responsive section-spacing py-20">
        <div className="animate-pulse bg-white/5 h-48 sm:h-64 lg:h-80 rounded-[2rem] sm:rounded-[3rem] w-full mb-12"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
          {[1,2,3,4,5,6].map(i => (
             <div key={i} className="animate-pulse bg-white/5 h-40 sm:h-52 rounded-[2rem] sm:rounded-[3rem]"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container-responsive py-32 flex flex-col items-center justify-center text-center">
        <h2 className="heading-responsive mb-8">Store <span className="text-primary italic">Not Found.</span></h2>
        <Button onClick={() => router.push('/')}>Return To Discovery</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Custom Storefront Navbar */}
      <nav className="h-20 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-3xl sticky top-0 z-50">
        <div className="container-responsive h-full flex items-center justify-between">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link href="/" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-primary hover:bg-white/10 transition-all border border-white/5">
              <ChevronLeft size={20} />
            </Link>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] leading-none mb-1">Delivering From</span>
              <div className="text-white font-black text-sm sm:text-lg tracking-tight uppercase italic">{store.name}</div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
             <span className="hover:text-white cursor-pointer transition-all">Menu</span>
             <span className="hover:text-white cursor-pointer transition-all">Reviews</span>
             <span className="text-primary border-b-2 border-primary pb-1">Storefront</span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-5">
             <Link href="/cart" className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-gray-400 hover:text-white relative bg-white/5 rounded-2xl border border-white/5 transition-all">
                <ShoppingBag size={20} />
                {items.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-[10px] font-black rounded-full flex items-center justify-center text-white border-2 border-[#0a0a0a]">
                    {items.length}
                  </span>
                )}
             </Link>
             <Link href="/profile" className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border border-white/5 p-0.5 hover:border-primary/50 transition-all overflow-hidden bg-white/5">
                <div className="w-full h-full flex items-center justify-center text-primary font-black uppercase text-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
             </Link>
          </div>
        </div>
      </nav>

      <div className="container-responsive py-8 sm:py-12 lg:py-16">
        {/* Store Header Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-[#111111] rounded-[2.5rem] sm:rounded-[4rem] p-6 sm:p-12 lg:p-20 mb-12 lg:mb-20 shadow-2xl overflow-hidden flex flex-col justify-end min-h-[400px] lg:min-h-[550px] border border-white/5"
        >
          {/* Hero Decoration */}
          <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/60 to-transparent z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2874&auto=format&fit=crop" 
              className="w-full h-full object-cover opacity-40 grayscale"
              alt={store.name}
            />
          </div>
          
          <div className="relative z-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <span className="bg-primary/20 text-primary px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-primary/10">
                {store.type}
              </span>
            </motion.div>
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
              <div className="max-w-4xl">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="heading-responsive mb-10 leading-[0.9] !tracking-tight lg:text-9xl"
                >
                  {store.name}
                </motion.h1>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap items-center gap-6 sm:gap-12"
                >
                  <div className="flex items-center bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                    <Star size={18} className="text-primary fill-primary mr-3 "/> 
                    <div>
                      <div className="text-lg font-black leading-none text-white">4.8</div>
                      <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">ratings</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-primary mr-4 border border-white/5">
                      <MapPin size={18} /> 
                    </div>
                    <div className="text-sm sm:text-lg font-black leading-none uppercase tracking-tight">1.2 miles away</div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-primary mr-4 border border-white/5">
                      <Clock size={18} /> 
                    </div>
                    <div className="text-sm sm:text-lg font-black leading-none uppercase tracking-tight">20-30 min</div>
                  </div>
                </motion.div>
              </div>

              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="button-responsive bg-white/5 text-white border border-white/5 !px-8 !py-5 self-start lg:self-end hover:bg-white/10"
              >
                <span>Store Details</span>
                <Info size={18} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Category Tabs Section */}
        <div className="flex items-center space-x-4 mb-12 sm:mb-16 overflow-x-auto pb-6 scrollbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-5 rounded-3xl text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap shadow-xl
                ${selectedCategory === cat 
                  ? 'bg-primary text-white shadow-primary/20 border border-transparent' 
                  : 'bg-white/5 text-gray-500 hover:text-white border border-white/5'}`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex flex-col space-y-12">
          <div className="flex items-center justify-between">
             <h2 className="heading-responsive !text-3xl sm:!text-4xl">{selectedCategory}</h2>
             <div className="h-0.5 flex-1 bg-white/5 ml-8 rounded-full"></div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10"
          >
            {store.products.length === 0 ? (
              <div className="col-span-full py-20 bg-white/5 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center text-center">
                <ShoppingBag size={48} className="text-gray-700 mb-6" />
                <p className="text-gray-500 text-xl font-bold uppercase tracking-tight">No products found in this category</p>
              </div>
            ) : (
              store.products.map(product => {
                const qty = getProductQuantity(product.id);
                return (
                  <motion.div 
                    variants={itemVariants} 
                    key={product.id} 
                    className="card-responsive !p-6 flex flex-col justify-between group h-full hover:-translate-y-2 border-transparent hover:border-primary/20"
                  >
                    <div className="flex items-start justify-between gap-6 mb-8">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                           <span className="text-[9px] font-black text-primary uppercase tracking-widest border border-primary/20 px-2 py-0.5 rounded">Menu Item</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-gray-500 text-xs mt-3 leading-relaxed line-clamp-2 font-medium">
                          {product.description || 'Premium local ingredients prepared daily for exceptional taste.'}
                        </p>
                      </div>
                      
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/5 rounded-3xl overflow-hidden relative border border-white/5 shrink-0 flex items-center justify-center p-2 shadow-inner">
                         <img 
                           src={product.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=150&auto=format&fit=crop'} 
                           className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                           alt={product.name}
                         />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">Price Point</span>
                          <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter">${Number(product.price).toFixed(2)}</span>
                       </div>
                       
                       <div className="flex items-center bg-white/5 rounded-2xl p-1.5 border border-white/5">
                         {qty > 0 ? (
                           <>
                             <button 
                               onClick={() => handleRemoveFromCart(product.id, getCartItemId(product.id))}
                               className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 text-white rounded-xl flex items-center justify-center hover:bg-white/10 transition-all font-black text-xl"
                             >
                                <Minus size={20} />
                             </button>
                             <div className="w-10 text-center font-black text-primary text-sm">{qty}</div>
                             <button 
                               onClick={() => handleAddToCart(product)}
                               className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
                             >
                                <Plus size={20} />
                             </button>
                           </>
                         ) : (
                           <button 
                             onClick={() => handleAddToCart(product)}
                             className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/80 transition-all shadow-lg shadow-primary/20"
                           >
                             <Plus size={24} />
                           </button>
                         )}
                       </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </div>
      </div>

      {/* Floating View Cart Button */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 right-4 sm:bottom-12 sm:right-12 z-[100]"
          >
            <Link 
              href="/cart"
              className="bg-primary text-white pl-6 pr-10 py-5 sm:pl-10 sm:pr-14 sm:py-6 rounded-3xl font-black uppercase tracking-[0.25em] shadow-[0_30px_60px_-15px_rgba(217,119,87,0.5)] flex items-center space-x-6 hover:scale-105 active:scale-95 transition-all group"
            >
               <div className="relative">
                 <ShoppingBag size={24} strokeWidth={2.5} className="text-white" />
                 <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-primary">{items.length}</span>
               </div>
               <span className="text-xs sm:text-sm">View Checkout</span>
               <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
