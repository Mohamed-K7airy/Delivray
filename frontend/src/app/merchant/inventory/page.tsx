'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Box, Store as StoreIcon, Activity, ListOrdered, UploadCloud, Info, Trash, Package, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import { apiClient } from '@/lib/apiClient';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function MerchantInventory() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', store_id: '', category: '', image: '' });
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== 'merchant') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const stores = await apiClient('/stores/me');
        if (stores && stores.length > 0) {
          const storeId = stores[0].id;
          setNewProduct(prev => ({ ...prev, store_id: storeId }));
          
          const productData = await apiClient(`/products?store_id=${storeId}`);
          if (productData) setProducts(productData);

          const catData = await apiClient(`/categories/store/${storeId}`);
          if (catData) setCategories(catData);
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
    setUploading(true);
    try {
      let imageUrl = newProduct.image;

      // Handle File Upload if exists
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const uploadRes = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) imageUrl = uploadData.url;
      }

      const data = await apiClient('/products', {
        method: 'POST',
        data: {
          ...newProduct,
          price: parseFloat(newProduct.price),
          category_id: newProduct.category || null,
          image: imageUrl,
          availability: true
        }
      });

      if (data) {
        toast.success('Product added to catalog!');
        setNewProduct({ name: '', price: '', description: '', store_id: newProduct.store_id, category: '', image: '' });
        setImageFile(null);
        
        const productData = await apiClient(`/products?store_id={newProduct.store_id}`);
        if (productData) setProducts(productData);
      }
    } catch (err: any) {
      // apiClient handles toasts
    } finally {
        setUploading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName) return;
    try {
      const data = await apiClient('/categories', {
        method: 'POST',
        data: { name: newCatName, store_id: newProduct.store_id }
      });
      if (data) {
        setCategories([...categories, data]);
        setNewCatName('');
        setShowCategoryModal(false);
        toast.success('Category created!');
      }
    } catch (err) {
      // apiClient handles toasts
    }
  };

  const deleteProduct = async (id: string) => {
     if (!confirm('Are you sure you want to remove this item?')) return;
     try {
        const data = await apiClient(`/products/${id}`, { method: 'DELETE' });
        if (data) {
           toast.success('Product removed.');
           setProducts(products.filter(p => p.id !== id));
        }
     } catch (err) {
        // apiClient handles toasts
     }
  };

  return (
    <div className="container-responsive py-6 sm:py-10 space-y-12 sm:space-y-16">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
           <div>
              <h1 className="heading-responsive !text-3xl sm:!text-5xl font-black text-[#111111] tracking-tighter">Store <span className="text-[#d97757] italic">Catalog.</span></h1>
              <p className="text-responsive mt-3 max-w-2xl font-medium text-[#888888]">Manage your menu items, pricing, and real-time inventory levels.</p>
           </div>
           <div className="bg-white px-6 py-3 rounded-xl border border-gray-100 flex items-center space-x-4 shadow-sm whitespace-nowrap">
              <div className="w-2 h-2 bg-[#d97757] rounded-full animate-pulse shadow-[0_0_8px_rgba(217,119,87,0.5)]"></div>
              <span className="text-[10px] font-black text-[#888888] uppercase tracking-[0.3em]">{products.length} Units Online</span>
           </div>
        </div>

       <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Add Product Form */}
           <div className="xl:col-span-12 2xl:col-span-12">
              <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-100 shadow-md">
                 <div className="flex items-center space-x-5 mb-12">
                    <div className="w-12 h-12 bg-[#fef3f2] rounded-xl flex items-center justify-center text-[#d97757] border border-[#fee2e2]">
                       <Plus size={24} />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-[#111111]">Add <span className="text-[#d97757]">Item</span></h2>
                 </div>

                 <form onSubmit={handleCreateProduct} className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                       <div className="lg:col-span-1">
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
                          <label className="block text-[10px] font-black text-[#888888] uppercase tracking-widest mb-3 ml-1">Category</label>
                          <div className="flex gap-2">
                            <select 
                               className="flex-1 h-14 px-6 bg-[#f9f9f9] border border-gray-100 rounded-xl text-[#111111] font-bold outline-none focus:border-[#d97757] transition-all text-sm appearance-none"
                               value={newProduct.category}
                               onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                            >
                               <option value="">Select Category</option>
                               {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <button 
                              type="button"
                              onClick={() => setShowCategoryModal(true)}
                              className="w-14 h-14 bg-[#f9f9f9] border border-gray-100 rounded-xl flex items-center justify-center text-[#d97757] hover:bg-gray-100 transition-all"
                            >
                              <Plus size={20} />
                            </button>
                          </div>
                       </div>
                       <div className="sm:col-span-2 lg:col-span-3">
                          <label className="block text-[10px] font-black text-[#888888] uppercase tracking-widest mb-3 ml-1">Description</label>
                          <textarea 
                             required
                             value={newProduct.description}
                             onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                             placeholder="Detail ingredients or specials..."
                             className="w-full px-6 py-5 bg-[#f9f9f9] border border-gray-100 rounded-xl text-[#111111] outline-none focus:border-[#d97757] transition-all text-sm min-h-[120px] resize-none"
                          />
                       </div>
                       <div className="sm:col-span-2 lg:col-span-3">
                           <label className="block text-[10px] font-black text-[#888888] uppercase tracking-widest mb-3 ml-1">Product Image</label>
                           <div className="relative group cursor-pointer">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                              />
                              <div className="h-32 bg-[#f9f9f9] border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center group-hover:border-[#d97757]/30 transition-all">
                                 {imageFile ? (
                                   <div className="flex flex-col items-center">
                                      <p className="text-sm font-bold text-[#111111]">{imageFile.name}</p>
                                      <p className="text-[10px] font-black text-[#d97757] uppercase tracking-widest mt-1">Ready to upload</p>
                                   </div>
                                 ) : (
                                   <>
                                      <UploadCloud className="text-gray-300 mb-2" size={32} />
                                      <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest">Click or drag image here</p>
                                   </>
                                 )}
                              </div>
                           </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                       <button type="submit" disabled={uploading} className="h-16 px-12 bg-[#d97757] text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#c2654a] transition-all flex items-center gap-3 shadow-md disabled:opacity-50">
                          {uploading ? <Activity size={20} className="animate-spin" /> : <UploadCloud size={20} />}
                          <span>{uploading ? 'Processing...' : 'Release To Catalog'}</span>
                       </button>
                    </div>
                 </form>
              </div>
           </div>

           {/* Product List */}
           <div className="xl:col-span-12 flex flex-col space-y-8">
              <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-100 shadow-md">
                 <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center space-x-5">
                       <div className="w-12 h-12 bg-[#f9f9f9] rounded-xl flex items-center justify-center text-[#111111] border border-gray-100">
                          <ListOrdered size={24} />
                       </div>
                       <h2 className="text-2xl font-black uppercase tracking-tight text-[#111111]">Active <span className="text-[#d97757] italic">Stock</span></h2>
                    </div>
                    <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-green-50 border border-green-100 rounded-full">
                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                       <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Live Sync</span>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <AnimatePresence mode='popLayout'>
                       {loading ? (
                          <div className="py-20 flex flex-col items-center justify-center space-y-6">
                             <Activity size={40} className="animate-spin text-[#d97757]" />
                             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#888888]">Fetching Registry</p>
                          </div>
                       ) : products.length === 0 ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-32 text-center border-2 border-dashed border-gray-100 rounded-2xl"
                          >
                             <Box size={48} className="mx-auto mb-6 text-gray-200" />
                             <p className="text-[10px] font-black uppercase tracking-widest text-[#888888]">No Items Registered</p>
                          </motion.div>
                       ) : products.map((product, idx) => (
                          <motion.div 
                             key={product.id}
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, scale: 0.95 }}
                             transition={{ delay: idx * 0.05 }}
                             className="bg-[#f9f9f9] p-6 sm:p-8 rounded-xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-8 hover:bg-white hover:shadow-lg transition-all group relative overflow-hidden"
                          >
                             <div className="flex items-center space-x-6 w-full sm:w-auto z-10">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl flex items-center justify-center text-[#d97757] border border-gray-100 group-hover:scale-105 transition-transform shadow-sm overflow-hidden">
                                   {product.image ? (
                                       <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                   ) : (
                                       <Package size={28} />
                                   )}
                                </div>
                                <div>
                                   <div className="flex items-center gap-3 mb-2">
                                      <h4 className="font-black uppercase tracking-tight text-xl text-[#111111]">{product.name}</h4>
                                      <span className="px-2 py-0.5 bg-white border border-gray-100 rounded text-[8px] font-black text-[#888888] uppercase tracking-widest">{product.category || 'GEN'}</span>
                                   </div>
                                   <p className="text-2xl font-black text-[#d97757] tracking-tight">${product.price.toFixed(2)}</p>
                                   <p className="text-[10px] text-[#888888] font-medium mt-2 line-clamp-1 italic">{product.description}</p>
                                </div>
                             </div>
                             
                             <div className="flex items-center space-x-4 w-full sm:w-auto z-10 shrink-0">
                                <button className="flex-1 sm:flex-none h-14 w-14 flex items-center justify-center bg-white text-[#888888] hover:text-[#d97757] rounded-xl transition-all border border-gray-100 shadow-sm">
                                   <Edit size={18} />
                                 </button>
                                 <button 
                                   onClick={() => deleteProduct(product.id)}
                                   className="flex-1 sm:flex-none h-14 w-14 flex items-center justify-center bg-[#fef3f2] text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all border border-[#fee2e2] shadow-sm"
                                 >
                                   <Trash size={18} />
                                 </button>
                             </div>
                          </motion.div>
                       ))}
                    </AnimatePresence>
                 </div>

                 <div className="mt-12 pt-10 border-t border-gray-100 flex items-center justify-between text-[#888888]">
                    <div className="flex items-center space-x-3">
                       <ShieldCheck size={14} />
                       <span className="text-[9px] font-black uppercase tracking-widest">Secure Stock Channel</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Protocol v4.2</span>
                 </div>
              </div>
           </div>
       </div>

       {/* Category Modal */}
       <AnimatePresence>
         {showCategoryModal && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowCategoryModal(false)}
               className="absolute inset-0 bg-[#111111]/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
             >
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#d97757]/5 rounded-full -mr-16 -mt-16 blur-2xl" />
               
               <div className="relative z-10 space-y-8">
                 <div className="flex items-center justify-between">
                   <h3 className="text-2xl font-black uppercase tracking-tight text-[#111111]">New <span className="text-[#d97757]">Category</span></h3>
                   <button onClick={() => setShowCategoryModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors text-gray-400">
                     <X size={20} />
                   </button>
                 </div>

                 <div className="space-y-4">
                   <label className="text-[10px] font-black text-[#888888] uppercase tracking-widest ml-1">Category Name</label>
                   <input 
                     autoFocus
                     value={newCatName}
                     onChange={e => setNewCatName(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleCreateCategory()}
                     placeholder="e.g. Signature Sides"
                     className="w-full h-16 px-8 bg-[#f9f9f9] border border-gray-100 rounded-xl text-[#111111] font-bold outline-none focus:border-[#d97757] transition-all"
                   />
                 </div>

                 <button 
                   onClick={handleCreateCategory}
                   disabled={!newCatName}
                   className="w-full h-16 bg-[#d97757] text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#c2654a] transition-all disabled:opacity-40 shadow-md"
                 >
                   Create Category
                 </button>
               </div>
             </motion.div>
           </div>
         )}
       </AnimatePresence>
    </div>
  );
}
