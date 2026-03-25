'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Box, Store as StoreIcon, Activity, ListOrdered, UploadCloud, Info, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';

export default function MerchantInventory() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', store_id: '', category: '' });
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
          
          // Fixed API URL: uses query parameter store_id
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
        setNewProduct({ name: '', price: '', description: '', store_id: newProduct.store_id, category: '' });
        
        // Refresh product list immediately
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
     if (!confirm('Are you sure you want to remove this item from your catalog?')) return;
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
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
       {/* Page Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
             <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">Catalog <span className="text-primary italic">Nexus</span></h1>
             <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Advanced inventory management and real-time SKU syncing</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-primary shadow-2xl">
                {products.length} Units Online
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Add Product Form */}
          <div className="lg:col-span-12 xl:col-span-5">
             <div className="bg-[#1a1a1a] p-10 rounded-[3rem] border border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                
                <div className="flex items-center space-x-4 mb-12 relative z-10">
                   <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-lg">
                      <Plus size={20} className="stroke-[3]" />
                   </div>
                   <h2 className="text-2xl font-black uppercase tracking-tighter text-white font-geist leading-none">Initialize <span className="text-primary">SKU</span></h2>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-8 relative z-10">
                   <div className="space-y-6">
                      <div>
                         <label className="block text-[8px] font-black text-gray-600 uppercase tracking-[0.3em] mb-3 ml-1">Terminal Store Identifier</label>
                         <input 
                            readOnly disabled 
                            value={newProduct.store_id || 'LOCALIZING...'} 
                            className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-gray-600 font-mono text-[9px] outline-none"
                         />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                         <div className="md:col-span-2">
                            <label className="block text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 ml-1">Universal Item Name</label>
                            <input 
                               required type="text"
                               value={newProduct.name}
                               onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                               placeholder="e.g. ULTRA SUPREME PIZZA"
                               className="w-full px-6 py-5 bg-white/[0.02] border border-white/5 rounded-2xl text-white outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all font-black uppercase text-xs tracking-widest placeholder:text-gray-800"
                            />
                         </div>
                         <div>
                            <label className="block text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 ml-1">Retail Value ($)</label>
                            <div className="relative">
                               <input 
                                  required type="number" step="0.01"
                                  value={newProduct.price}
                                  onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                                  placeholder="0.00"
                                  className="w-full px-6 py-5 bg-white/[0.02] border border-white/5 rounded-2xl text-white outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all font-black text-xs tracking-widest placeholder:text-gray-800"
                               />
                            </div>
                         </div>
                         <div>
                            <label className="block text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 ml-1">Product Category</label>
                            <input 
                               type="text"
                               value={newProduct.category}
                               onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                               placeholder="e.g. ENTREE"
                               className="w-full px-6 py-5 bg-white/[0.02] border border-white/5 rounded-2xl text-white outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all font-black uppercase text-xs tracking-widest placeholder:text-gray-800"
                            />
                         </div>
                      </div>

                      <div>
                         <label className="block text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3 ml-1">Meta Description</label>
                         <textarea 
                            required
                            value={newProduct.description}
                            onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                            placeholder="Specify technical details, ingredients, and notes..."
                            className="w-full px-6 py-5 bg-white/[0.02] border border-white/5 rounded-2xl text-white outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all font-medium text-sm min-h-[160px] resize-none placeholder:text-gray-800"
                         />
                      </div>
                   </div>

                   <button type="submit" className="group/btn w-full bg-primary text-black py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_50px_-10px_rgba(217,119,87,0.4)] flex items-center justify-center space-x-4">
                      <UploadCloud size={20} className="stroke-[3] group-hover/btn:-translate-y-1 transition-transform" />
                      <span>Inject into Catalog</span>
                   </button>
                </form>
             </div>
          </div>

          {/* Product List */}
          <div className="lg:col-span-12 xl:col-span-7">
             <div className="bg-[#1a1a1a] p-10 rounded-[3rem] border border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -ml-32 -mb-32"></div>
                
                <div className="flex items-center justify-between mb-12 relative z-10">
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-lg">
                         <ListOrdered size={20} />
                      </div>
                      <div>
                         <h2 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">Active <span className="text-primary italic">Stock</span></h2>
                         <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-2">Live synchronization from database cluster</p>
                      </div>
                   </div>
                   <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e] animate-pulse"></div>
                      <span className="text-[8px] font-black text-green-500 uppercase tracking-widest leading-none">Live Sync</span>
                   </div>
                </div>

                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                   <AnimatePresence mode='popLayout'>
                      {loading ? (
                         <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="font-black text-[10px] text-gray-500 uppercase tracking-[0.3em]">Querying Database...</p>
                         </div>
                      ) : products.length === 0 ? (
                         <motion.div 
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="p-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] group hover:border-primary/20 transition-all"
                         >
                            <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                               <Box size={40} className="text-gray-800 stroke-[1.5]" />
                            </div>
                            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px]">Registry is currently depopulated.</p>
                            <p className="text-gray-700 text-[8px] mt-2 font-bold uppercase tracking-widest">Awaiting SKU initialization</p>
                         </motion.div>
                      ) : products.map((product, idx) => (
                         <motion.div 
                            key={product.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05, type: "spring", stiffness: 100 }}
                            className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 flex flex-col sm:flex-row items-center justify-between group hover:bg-white/[0.04] transition-all relative overflow-hidden"
                         >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="flex items-center space-x-6 w-full lg:w-auto relative z-10">
                               <div className="w-16 h-16 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(217,119,87,0.2)] transition-all duration-500">
                                  <Box size={24} className="stroke-[2.5]" />
                               </div>
                               <div>
                                  <div className="flex items-center gap-3">
                                     <h4 className="font-black uppercase tracking-tighter text-xl text-white font-geist">{product.name}</h4>
                                     <span className="px-2 py-1 bg-white/5 rounded-md text-[7px] font-black text-gray-500 uppercase tracking-widest">ID:{product.id.slice(0,4)}</span>
                                  </div>
                                  <div className="flex gap-6 mt-3">
                                    <div className="flex items-center space-x-2">
                                       <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">${product.price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                       <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                       <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none">{product.category || 'GENERAL'}</span>
                                    </div>
                                  </div>
                                  <p className="text-[10px] text-gray-700 font-medium mt-3 line-clamp-1 max-w-[200px]">{product.description}</p>
                               </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 mt-6 sm:mt-0 w-full sm:w-auto relative z-10">
                               <button className="flex-1 sm:flex-none p-4 bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-all active:scale-95 border border-white/5">
                                  <Edit size={18} />
                                </button>
                                <button 
                                  onClick={() => deleteProduct(product.id)}
                                  className="flex-1 sm:flex-none p-4 bg-red-500/10 text-red-500/60 hover:text-white hover:bg-red-500 rounded-xl transition-all active:scale-95 border border-red-500/10"
                                >
                                  <Trash size={18} />
                                </button>
                            </div>
                         </motion.div>
                      ))}
                   </AnimatePresence>
                </div>

                <div className="mt-12 pt-10 border-t border-white/5 flex items-center justify-between relative z-10">
                   <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                         <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(217,119,87,1)]"></div>
                         <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">Live Inventory Telemetry</span>
                      </div>
                   </div>
                   <p className="text-[8px] font-bold text-gray-800 uppercase tracking-widest">Delivray Protocol v4.0.1</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
