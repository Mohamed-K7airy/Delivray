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
import ProductCard from '@/components/ProductCard';
import { API_URL } from '@/config/api';
import { apiClient } from '@/lib/apiClient';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  store_id: string;
  availability: boolean;
  category_id?: string;
  categories?: { name: string };
}

interface Store {
  id: string;
  name: string;
  type: string;
  image?: string;
  location_lat: number;
  location_lng: number;
  description?: string;
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
  const [storeCategories, setStoreCategories] = useState<any[]>([]);

  const categories = ['All Items', ...storeCategories.map(c => c.name)];

  const { items, addItem, removeItem, updateItemQuantity } = useCartStore();
  const { token, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const [storeData, categoriesData] = await Promise.all([
          apiClient(`/stores/${id}`),
          apiClient(`/categories/store/${id}`)
        ]);
        
        if (storeData) setStore(storeData);
        if (categoriesData) setStoreCategories(categoriesData);

      } catch (err: any) {
        toast.error(err.message || 'Store not found');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStoreData();
  }, [id]);

  const handleAddToCart = async (product: Product) => {
    if (!token || user?.role !== 'customer') {
      toast.error('Please log in as a customer to order');
      router.push('/login');
      return;
    }

    try {
      const data = await apiClient('/cart/add', {
        method: 'POST',
        data: { product_id: product.id, quantity: 1 }
      });

      if (!data) return;

      addItem({
        id: data.id,
        product_id: product.id,
        quantity: data.quantity || 1,
        products: product
      });

      toast.success(`${product.name} added to cart!`);
    } catch (err: any) {
      // apiClient already toasts errors, we just catch to prevent crash
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

  const renderProductCard = (product: Product) => {
    const qty = getProductQuantity(product.id);
    const cartItemId = getCartItemId(product.id);
    
    return (
      <ProductCard 
        key={product.id}
        product={product}
        quantity={qty}
        accentColor={store?.type === 'Restaurant' ? '#ef4444' : '#3b82f6'} // Red for Resto, Blue for Grocery
        onAdd={() => handleAddToCart(product)}
        onRemove={() => handleRemoveFromCart(product.id, cartItemId)}
      />
    );
  };

  if (!store) {
    return (
      <div className="container-responsive py-32 flex flex-col items-center justify-center text-center">
        <h2 className="text-4xl font-bold text-slate-900 mb-8 tracking-tight">Hub <span className="text-slate-400">Offline.</span></h2>
        <button
          onClick={() => router.push('/')}
          className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium Store Hero */}
      <div className="bg-white border-b border-slate-100">
        <div className="container-responsive py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-20 items-center lg:items-start text-left">
            {/* Store Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="w-full lg:w-1/2 aspect-video rounded-3xl overflow-hidden shadow-sm relative group border border-slate-100"
            >
              <img
                src={
                  store.image || (
                    `https://images.unsplash.com/photo-${store.type === 'Restaurant' ? '1504674900247-0877df9cc836' : '1542831371-29b0f74f9713'}?w=1200&auto=format&fit=crop`
                  )
                }
                className="w-full h-full object-cover grayscale-[0.2] transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0"
                alt={store.name}
              />
              <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-md text-slate-900 px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl border border-slate-100">
                {store.type}
              </div>
            </motion.div>

            {/* Store Information */}
            <div className="flex-1 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Operational: Phase I</span>
                </div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-5xl sm:text-6xl lg:text-8xl font-bold text-slate-900 tracking-tighter leading-[0.85]"
                >
                  {store.name}.
                </motion.h1>
                <p className="text-slate-400 font-medium text-lg lg:text-xl max-w-xl uppercase tracking-tighter">
                  Verified quality source. Global fulfillment from {store.name} logistics network.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-10 pt-4">
                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lead Time</p>
                    <p className="text-lg font-bold text-slate-900 tracking-tight">20 - 30 MIN</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">PROXIMITY</p>
                    <p className="text-lg font-bold text-slate-900 tracking-tight">2.0 KM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-16 lg:py-24 space-y-20">
        {/* Menu Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b border-slate-100 pb-10">
          <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 tracking-tighter mb-4">{store.name}.</h1>
              {store.description && (
                <p className="max-w-xl text-lg font-medium text-slate-500 leading-relaxed mb-8">
                  {store.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-6">
                <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Select assets for logistics fulfillment.</p>
              </div>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap shrink-0 border shadow-sm active:scale-95
                    ${selectedCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl'
                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid Grouped by Category OR All Items */}
        <div className="space-y-32">
          {selectedCategory === 'All Items' ? (
            <div className="space-y-14">
              <div className="flex items-center gap-8">
                 <div className="w-1.5 h-10 bg-slate-900 rounded-full" />
                 <div>
                  <h3 className="text-3xl font-bold text-slate-900 uppercase tracking-tighter leading-none">Catalog Assets</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Full Logistics Inventory</p>
                 </div>
                 <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 xl:gap-14"
              >
                {store.products.map((product) => renderProductCard(product))}
              </motion.div>
            </div>
          ) : (
            categories.filter(c => c !== 'All Items' && (selectedCategory === 'All Items' || selectedCategory === c)).map((catName) => {
              const categoryProducts = store.products.filter(p => 
                (p.categories?.name === catName) || 
                (catName === 'Uncategorized' && !p.category_id)
              );

              if (categoryProducts.length === 0) return null;

              return (
                <div key={catName} className="space-y-14">
                  <div className="flex items-center gap-8">
                     <div className="w-1.5 h-10 bg-slate-900 rounded-full" />
                     <div>
                      <h3 className="text-3xl font-bold text-slate-900 uppercase tracking-tighter leading-none">{catName}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Logistics Assets</p>
                     </div>
                     <div className="h-px bg-slate-100 flex-1"></div>
                  </div>

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 xl:gap-14"
                  >
                    {categoryProducts.map((product) => renderProductCard(product))}
                  </motion.div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Cart Indicator */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-8"
          >
            <Link
              href="/cart"
              className="bg-slate-900/95 backdrop-blur-xl text-white px-10 py-8 rounded-[2.5rem] font-bold uppercase tracking-[0.2em] shadow-2xl flex items-center justify-between group hover:scale-[1.02] hover:bg-slate-900 transition-all duration-300 border border-white/10"
            >
              <div className="flex items-center gap-8">
                <div className="relative">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110">
                    <ShoppingBag size={28} />
                  </div>
                  <span className="absolute -top-3 -right-3 bg-white text-slate-900 text-[10px] font-bold w-7 h-7 rounded-full flex items-center justify-center border-[3px] border-slate-900 shadow-xl animate-pulse">
                    {items.length}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold tracking-tight mb-1">Logistics Queue.</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] group-hover:text-white transition-colors">Authorize Deployment</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                 <div className="h-10 w-px bg-white/10"></div>
                 <ChevronRight size={28} className="text-slate-400 group-hover:text-white group-hover:translate-x-2 transition-all" />
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
