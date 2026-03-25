'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Box, Store as StoreIcon, Activity, ListOrdered, UploadCloud, Info, Trash, Package, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function MerchantInventory() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', store_id: '', category: '', image: '' });
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== 'merchant') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const storeRes = await fetch(`${API_URL}/stores/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const stores = await storeRes.json();
        if (storeRes.ok && stores.length > 0) {
          const storeId = stores[0].id;
          setNewProduct(prev => ({ ...prev, store_id: storeId }));
          
          const productRes = await fetch(`${API_URL}/products?store_id=${storeId}`, {
             headers: { Authorization: `Bearer ${token}` }
          });
          if (productRes.ok) setProducts(await productRes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, user, router]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          availability: true
        })
      });
      if (res.ok) {
        toast.success('Product added to catalog!');
        setNewProduct({ name: '', price: '', description: '', store_id: newProduct.store_id, category: '', image: '' });
        
        const productRes = await fetch(`${API_URL}/products?store_id=${newProduct.store_id}`, {
             headers: { Authorization: `Bearer ${token}` }
          });
        if (productRes.ok) setProducts(await productRes.json());
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to add product');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteProduct = async (id: string) => {
     if (!confirm('Are you sure you want to remove this item?')) return;
     try {
        const res = await fetch(`${API_URL}/products/${id}`, {
           method: 'DELETE',
           headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
           toast.success('Product removed.');
           setProducts(products.filter(p => p.id !== id));
        }
     } catch (err) {
        toast.error('Failed to remove product');
     }
  };

  return (
    <div className="container-responsive py-6 sm:py-10 space-y-12 sm:space-y-16">
       {/* Page Header */}
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div>
             <h1 className="heading-responsive !text-3xl sm:!text-5xl">Store <span className="text-primary italic">Catalog.</span></h1>
             <p className="text-responsive mt-3 max-w-2xl font-medium">Manage your menu items, pricing, and real-time inventory levels.</p>
          </div>
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 flex items-center space-x-4 shadow-xl whitespace-nowrap">
             <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(217,119,87,1)]"></div>
             <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{products.length} Units Online</span>
          </div>
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Add Product Form */}
          <div className="xl:col-span-12 2xl:col-span-5">
             <div className="card-responsive !p-8 sm:!p-12 !bg-[#111111] border-white/5 shadow-2xl">
                <div className="flex items-center space-x-5 mb-12">
                   <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                      <Plus size={24} />
                   </div>
                   <h2 className="text-2xl font-black uppercase tracking-tight">Add <span className="text-primary">Item</span></h2>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-8">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="sm:col-span-2">
                        <Input 
                           label="Item Name"
                           required
                           value={newProduct.name}
                           onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                           placeholder="e.g. Double Smash Burger"
                        />
                      </div>
                      <div>
                        <Input 
                           label="Price ($)"
                           required
                           type="number"
                           step="0.01"
                           value={newProduct.price}
                           onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                           placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Input 
                           label="Category"
                           value={newProduct.category}
                           onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                           placeholder="e.g. Burgers"
                        />
                      </div>
                      <div className="sm:col-span-2">
                         <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Description</label>
                         <textarea 
                            required
                            value={newProduct.description}
                            onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                            placeholder="Detail ingredients or specials..."
                            className="w-full px-6 py-5 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-primary transition-all text-sm min-h-[120px] resize-none"
                         />
                      </div>
                   </div>

                   <Button type="submit" className="w-full h-18 bg-primary text-white text-base">
                      <UploadCloud size={20} className="mr-3" />
                      <span>Release To Catalog</span>
                   </Button>
                </form>
             </div>
          </div>

          {/* Product List */}
          <div className="xl:col-span-12 2xl:col-span-7 flex flex-col space-y-8">
             <div className="card-responsive !p-8 sm:!p-12 border-transparent">
                <div className="flex items-center justify-between mb-12">
                   <div className="flex items-center space-x-5">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10">
                         <ListOrdered size={24} />
                      </div>
                      <h2 className="text-2xl font-black uppercase tracking-tight">Active <span className="text-primary italic">Stock</span></h2>
                   </div>
                   <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Live Sync</span>
                   </div>
                </div>

                <div className="space-y-6">
                   <AnimatePresence mode='popLayout'>
                      {loading ? (
                         <div className="py-20 flex flex-col items-center justify-center space-y-6 opacity-30">
                            <Activity size={40} className="animate-spin-slow text-primary" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Fetching Registry</p>
                         </div>
                      ) : products.length === 0 ? (
                         <motion.div 
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-30"
                         >
                            <Box size={48} className="mx-auto mb-6" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No Items Registered</p>
                         </motion.div>
                      ) : products.map((product, idx) => (
                         <motion.div 
                            key={product.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white/5 p-6 sm:p-8 rounded-[2rem] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8 hover:bg-white/[0.08] transition-all group relative overflow-hidden"
                         >
                            <div className="flex items-center space-x-6 w-full sm:w-auto z-10">
                               <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/40 rounded-2xl flex items-center justify-center text-primary border border-white/5 group-hover:scale-105 transition-transform shadow-inner">
                                  <Package size={28} />
                               </div>
                               <div>
                                  <div className="flex items-center gap-3 mb-2">
                                     <h4 className="font-black uppercase tracking-tight text-xl text-white">{product.name}</h4>
                                     <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black text-gray-500 uppercase tracking-widest">{product.category || 'GEN'}</span>
                                  </div>
                                  <p className="text-2xl font-black text-primary tracking-tight">${product.price.toFixed(2)}</p>
                                  <p className="text-[10px] text-gray-600 font-medium mt-2 line-clamp-1 italic">{product.description}</p>
                               </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 w-full sm:w-auto z-10 shrink-0">
                               <button className="flex-1 sm:flex-none h-14 w-14 flex items-center justify-center bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-white/5">
                                  <Edit size={18} />
                                </button>
                                <button 
                                  onClick={() => deleteProduct(product.id)}
                                  className="flex-1 sm:flex-none h-14 w-14 flex items-center justify-center bg-red-500/10 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all border border-red-500/10"
                                >
                                  <Trash size={18} />
                                </button>
                            </div>
                         </motion.div>
                      ))}
                   </AnimatePresence>
                </div>

                <div className="mt-12 pt-10 border-t border-white/5 flex items-center justify-between text-gray-800">
                   <div className="flex items-center space-x-3">
                      <ShieldCheck size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Secure Stock Channel</span>
                   </div>
                   <span className="text-[9px] font-black uppercase tracking-widest">Protocol v4.2</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
