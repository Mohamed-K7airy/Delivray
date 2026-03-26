'use client';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Minus, Info, MapPin, Star, Clock, ChevronLeft, ShoppingBag, Search, Bell, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

export default function StorePage() {
  const { id } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Items');

  const categories = ['All Items', 'Meals', 'Sides', 'Drinks', 'Desserts', 'Additions'];

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

      toast.success(`${product.name} added to cart!`);
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
      <div className="bg-[#F8F8F8] min-h-screen pt-12">
        <div className="container-responsive space-y-8">
          <div className="h-64 sm:h-80 bg-white rounded-[3rem] animate-pulse border border-gray-100 shadow-sm" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-white rounded-[2rem] animate-pulse border border-gray-100 shadow-sm" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container-responsive py-32 flex flex-col items-center justify-center text-center">
        <h2 className="text-4xl font-black text-[#111111] mb-8 tracking-tight">Store <span className="text-[#d97757]">not found.</span></h2>
        <button
          onClick={() => router.push('/')}
          className="bg-[#d97757] text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-[#c2654a] transition-all"
        >
          Back to Discovery
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      {/* Premium Store Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-responsive py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
            {/* Store Banner */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full lg:w-[45%] aspect-[4/3] rounded-2xl overflow-hidden shadow-md relative group"
            >
              <img
                src={
                  store.name === 'FreshMart' ? 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop' :
                  store.name === 'Daily Bread' ? 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop' :
                  store.name === 'Sweet Tooth' ? 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1200&auto=format&fit=crop' :
                  store.name === 'Bean & Brew' ? 'https://images.unsplash.com/photo-1501339818198-5ac8388f63ac?w=1200&auto=format&fit=crop' :
                  store.name === 'La Bella Italia' ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop' :
                  store.name === 'Sushi Zen' ? 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&auto=format&fit=crop' :
                  `https://images.unsplash.com/photo-${store.type === 'Restaurant' ? '1504674900247-0877df9cc836' : '1542831371-29b0f74f9713'}?w=1200&auto=format&fit=crop`
                }
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                alt={store.name}
              />
              <div className="absolute top-8 left-8 bg-[#d97757] text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md">
                {store.type}
              </div>
            </motion.div>

            {/* Store Information */}
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                  <div className="flex items-center gap-1.5 bg-[#f9f9f9] px-4 py-2 rounded-xl border border-gray-100">
                    <Star size={14} className="text-[#d97757] fill-[#d97757]" />
                    <span className="text-[11px] font-bold text-[#d97757] uppercase tracking-widest">4.8 (500+ Reviews)</span>
                  </div>
                </div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl lg:text-7xl font-black text-[#111111] tracking-tight leading-none"
                >
                  {store.name}
                </motion.h1>
                <p className="text-[#555555] font-medium text-lg max-w-xl mx-auto lg:mx-0">
                  Experience the finest craft flavors from {store.name}, delivered fresh and fast right to your doorstep.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-4">
                <div className="flex items-center gap-4 group">
                  <div className="w-14 h-14 bg-[#f9f9f9] rounded-xl flex items-center justify-center text-[#d97757] group-hover:bg-[#d97757] group-hover:text-white transition-all">
                    <Clock size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-[#111111] uppercase tracking-tight">Delivery</p>
                    <p className="text-xs font-bold text-[#888888]">20 - 30 mins</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-14 h-14 bg-[#f9f9f9] rounded-xl flex items-center justify-center text-[#d97757] group-hover:bg-[#d97757] group-hover:text-white transition-all">
                    <MapPin size={24} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-[#111111] uppercase tracking-tight">Proximity</p>
                    <p className="text-xs font-bold text-[#888888]">1.2 miles away</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-12 lg:py-20 space-y-16">
        {/* Menu Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-gray-100 pb-8">
          <h2 className="text-4xl font-black text-[#111111] tracking-tight">Explore the <span className="text-[#d97757]">menu</span></h2>
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all whitespace-nowrap shrink-0 border
                    ${selectedCategory === cat
                    ? 'bg-[#d97757] text-white border-[#d97757] shadow-md'
                    : 'bg-white text-[#888888] border-gray-100 hover:border-gray-200 hover:text-[#111111]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12"
          >
            {store.products.filter(p => {
              if (selectedCategory === 'All Items') return true;
              if (selectedCategory === 'Additions') return p.description?.includes('[Addition]');
              // Fallback: if no explicit category, everything else is 'Meals' for now
              return selectedCategory === 'Meals';
            }).length === 0 ? (
              <div className="col-span-full py-20 bg-white rounded-[3rem] border border-gray-100 flex flex-col items-center justify-center text-center">
                <ShoppingBag size={48} className="text-gray-100 mb-6" />
                <p className="text-gray-400 text-lg font-bold">No products available in this selection.</p>
              </div>
            ) : (
              store.products.filter(p => {
                if (selectedCategory === 'All Items') return true;
                if (selectedCategory === 'Additions') return p.description?.includes('[Addition]');
                return selectedCategory === 'Meals'; // Simplified for now
              }).map((product) => {
                const qty = getProductQuantity(product.id);
                const cartItemId = getCartItemId(product.id);
                return (
                  <motion.div
                    variants={itemVariants}
                    key={product.id}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-lg transition-all duration-500 flex flex-col group h-full"
                  >
                    <div className="h-56 relative overflow-hidden bg-gray-50 flex items-center justify-center p-8">
                      <img
                        src={product.image || `https://images.unsplash.com/photo-${store.type === 'Restaurant' ? '1504674900247-0877df9cc836' : '1542831371-29b0f74f9713'}?w=400&auto=format&fit=crop`}
                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-700"
                        alt={product.name}
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white font-black text-[13px] text-[#111111] shadow-sm">
                        ${Number(product.price).toFixed(2)}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col space-y-4">
                      <div>
                        <h3 className="text-xl font-black text-[#111111] tracking-tight group-hover:text-[#d97757] transition-colors line-clamp-1">{product.name}</h3>
                        <p className="text-[#555555] text-sm font-medium mt-2 line-clamp-2 leading-relaxed">
                          {product.description || 'Premium ingredients sourced locally for the best taste experience.'}
                        </p>
                      </div>

                      <div className="pt-6 border-t border-gray-50 mt-auto flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#888888] uppercase tracking-widest">Available Now</span>

                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                          {qty > 0 ? (
                            <>
                              <button
                                onClick={() => handleRemoveFromCart(product.id, cartItemId)}
                                className="w-10 h-10 bg-white text-[#111111] rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all border border-gray-100"
                              >
                                <Minus size={18} />
                              </button>
                              <span className="w-8 text-center font-black text-sm text-[#d97757]">{qty}</span>
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="w-10 h-10 bg-[#d97757] text-white rounded-lg flex items-center justify-center hover:bg-[#c2654a] transition-all shadow-md"
                              >
                                <Plus size={18} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="w-12 h-12 bg-[#d97757] text-white rounded-lg flex items-center justify-center hover:bg-[#c2654a] transition-all shadow-md"
                            >
                              <Plus size={20} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Cart Indicator */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-12 right-12 z-[100]"
          >
            <Link
              href="/cart"
              className="bg-[#111111] text-white px-8 py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center gap-6 group hover:scale-105 transition-all"
            >
              <div className="relative">
                <div className="w-12 h-12 bg-[#d97757] rounded-xl flex items-center justify-center">
                  <ShoppingBag size={24} />
                </div>
                <span className="absolute -top-2 -right-2 bg-white text-[#d97757] text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#111111]">
                  {items.length}
                </span>
              </div>
              <div className="text-left pr-4">
                <p className="text-xs font-black">View Order</p>
                <p className="text-[10px] text-[#888888] font-bold uppercase tracking-widest mt-0.5">Checkout Now</p>
              </div>
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
