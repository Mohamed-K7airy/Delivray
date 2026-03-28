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
        
        const productData = await apiClient(`/products?store_id=${newProduct.store_id}`);
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
    <div className="bg-slate-50 min-h-screen">
      <div className="container-responsive py-8 sm:py-12 space-y-10 sm:space-y-14">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
             <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">Inventory Registry.</h1>
                <p className="text-slate-400 mt-2 max-w-2xl font-medium text-sm sm:text-base">Manage your menu items, pricing, and real-time stock levels.</p>
             </div>
             <div className="bg-white px-5 py-2.5 rounded-full border border-slate-100 flex items-center space-x-3 shadow-sm">
                <div className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-pulse shadow-[0_0_8px_rgba(15,23,42,0.3)]"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{products.length} Units Online</span>
             </div>
          </div>

         <div className="grid grid-cols-1 gap-10">
            {/* Add Product Form */}
             <div className="w-full">
                <div className="bg-white rounded-xl p-8 sm:p-10 border border-slate-100 shadow-sm">
                   <div className="flex items-center space-x-4 mb-10">
                      <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                         <Plus size={20} />
                      </div>
                      <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900">New Offering</h2>
                   </div>

                   <form onSubmit={handleCreateProduct} className="space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                         <div className="lg:col-span-1">
                           <Input 
                              label="ITEM NAME"
                              required
                              value={newProduct.name}
                              onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                              placeholder="e.g. Signature Burger"
                           />
                         </div>
                         <div>
                           <Input 
                              label="UNIT PRICE ($)"
                              required
                              type="number"
                              step="0.01"
                              value={newProduct.price}
                              onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                              placeholder="0.00"
                           />
                         </div>
                         <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Category</label>
                            <div className="flex gap-2">
                              <select 
                                 className="flex-1 h-12 px-4 bg-slate-50 border border-transparent rounded-lg text-slate-900 font-bold outline-none focus:bg-white focus:border-slate-100 transition-all text-sm appearance-none cursor-pointer"
                                 value={newProduct.category}
                                 onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                              >
                                 <option value="">Select Category</option>
                                 {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                              <button 
                                type="button"
                                onClick={() => setShowCategoryModal(true)}
                                className="w-12 h-12 bg-slate-50 border border-transparent rounded-lg flex items-center justify-center text-slate-900 hover:bg-slate-100 transition-all"
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                         </div>
                         <div className="sm:col-span-2 lg:col-span-3">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Description</label>
                            <textarea 
                               required
                               value={newProduct.description}
                               onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                               placeholder="Ingredients, allergens, or special notes..."
                               className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-lg text-slate-900 outline-none focus:bg-white focus:border-slate-100 transition-all text-sm min-h-[100px] resize-none font-medium"
                            />
                         </div>
                         <div className="sm:col-span-2 lg:col-span-3">
                             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Asset Upload</label>
                             <div className="relative group cursor-pointer">
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                  className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                                />
                                <div className="h-28 bg-slate-50 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center group-hover:bg-white group-hover:border-slate-200 transition-all">
                                   {imageFile ? (
                                     <div className="flex flex-col items-center">
                                        <p className="text-sm font-bold text-slate-900">{imageFile.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ready for deployment</p>
                                     </div>
                                   ) : (
                                     <>
                                        <UploadCloud className="text-slate-300 mb-2" size={24} />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Product Media</p>
                                     </>
                                   )}
                                </div>
                             </div>
                          </div>
                      </div>

                      <div className="flex justify-end pt-4">
                         <button type="submit" disabled={uploading} className="h-14 px-10 bg-slate-900 text-white rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all flex items-center gap-3 shadow-md disabled:opacity-50">
                            {uploading ? <Activity size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                            <span>{uploading ? 'Processing...' : 'Deploy to Catalog'}</span>
                         </button>
                      </div>
                   </form>
                </div>
             </div>

             {/* Product List */}
             <div className="w-full flex flex-col space-y-6">
                <div className="bg-white rounded-xl p-8 sm:p-10 border border-slate-100 shadow-sm">
                   <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center space-x-4">
                         <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-900 border border-slate-100">
                            <ListOrdered size={20} />
                         </div>
                         <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900">Active Registry</h2>
                      </div>
                      <div className="hidden sm:flex items-center space-x-2.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                         <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Network Synchronized</span>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <AnimatePresence mode='popLayout'>
                         {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                               <Activity size={32} className="animate-spin text-slate-200" />
                               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Syncing Registry</p>
                            </div>
                         ) : products.length === 0 ? (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.2 }}
                              className="py-24 text-center border-2 border-dashed border-slate-50 rounded-xl"
                            >
                               <Package size={40} className="mx-auto mb-4 text-slate-100" />
                               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">No signals detected in catalog</p>
                            </motion.div>
                         ) : products.map((product, idx) => (
                            <motion.div 
                               key={product.id}
                               initial={{ opacity: 0, y: 10 }}
                               animate={{ opacity: 1, y: 0 }}
                               exit={{ opacity: 0, scale: 0.98 }}
                               transition={{ duration: 0.2, delay: idx * 0.03 }}
                               className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-white hover:shadow-md transition-all group relative overflow-hidden"
                            >
                               <div className="flex items-center space-x-5 w-full sm:w-auto">
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-lg flex items-center justify-center text-slate-900 border border-slate-100 group-hover:scale-105 transition-all shadow-sm overflow-hidden">
                                     {product.image ? (
                                         <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                     ) : (
                                         <Package size={24} className="text-slate-200" />
                                     )}
                                  </div>
                                  <div>
                                     <div className="flex items-center gap-2.5 mb-1.5">
                                        <h4 className="font-bold uppercase tracking-tight text-lg text-slate-900">{product.name}</h4>
                                        <span className="px-2 py-0.5 bg-slate-900/5 border border-slate-900/10 rounded-md text-[8px] font-bold text-slate-500 uppercase tracking-widest">{product.category || 'STD'}</span>
                                     </div>
                                     <p className="text-xl font-bold text-slate-900 tracking-tight">${product.price.toFixed(2)}</p>
                                     <p className="text-[10px] text-slate-400 font-medium mt-1.5 line-clamp-1">{product.description}</p>
                                  </div>
                               </div>
                               
                               <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
                                  <button className="flex-1 sm:flex-none h-12 w-12 flex items-center justify-center bg-white text-slate-400 hover:text-slate-900 rounded-lg transition-all border border-slate-100 shadow-sm">
                                     <Edit size={16} />
                                   </button>
                                   <button 
                                     onClick={() => deleteProduct(product.id)}
                                     className="flex-1 sm:flex-none h-12 w-12 flex items-center justify-center bg-white text-slate-400 hover:text-red-500 rounded-lg transition-all border border-slate-100 shadow-sm"
                                   >
                                     <Trash size={16} />
                                   </button>
                               </div>
                            </motion.div>
                         ))}
                      </AnimatePresence>
                   </div>

                   <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between text-slate-200">
                      <div className="flex items-center space-x-3">
                         <ShieldCheck size={14} />
                         <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Validated Asset Channel</span>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">Rev v4.5</span>
                   </div>
                </div>
             </div>
         </div>

         {/* Category Modal */}
         <AnimatePresence>
           {showCategoryModal && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.2 }}
                 onClick={() => setShowCategoryModal(false)}
                 className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 10 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 10 }}
                 transition={{ duration: 0.2 }}
                 className="relative w-full max-w-sm bg-white rounded-2xl p-8 shadow-2xl overflow-hidden"
               >
                 <div className="relative z-10 space-y-6">
                   <div className="flex items-center justify-between">
                     <h3 className="text-xl font-bold uppercase tracking-widest text-slate-900">New Category</h3>
                     <button onClick={() => setShowCategoryModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors text-slate-300">
                       <X size={18} />
                     </button>
                   </div>

                   <div className="space-y-3">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Registry Name</label>
                     <input 
                       autoFocus
                       value={newCatName}
                       onChange={e => setNewCatName(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handleCreateCategory()}
                       placeholder="e.g. Signature Sides"
                       className="w-full h-12 px-5 bg-slate-50 border border-transparent rounded-lg text-slate-900 font-bold outline-none focus:bg-white focus:border-slate-100 transition-all text-sm"
                     />
                   </div>

                   <button 
                     onClick={handleCreateCategory}
                     disabled={!newCatName}
                     className="w-full h-12 bg-slate-900 text-white rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all disabled:opacity-40 shadow-sm"
                   >
                     Create Category
                   </button>
                 </div>
               </motion.div>
             </div>
           )}
         </AnimatePresence>
      </div>
    </div>
  );
}
