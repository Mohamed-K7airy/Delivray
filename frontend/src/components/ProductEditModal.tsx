'use client';
import { useState, useEffect } from 'react';
import { X, Save, UploadCloud, Activity, Trash2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import { apiClient } from '@/lib/apiClient';
import Input from './Input';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onUpdate: () => void;
  token: string | null;
  categories: any[];
}

export default function ProductEditModal({ isOpen, onClose, product, onUpdate, token, categories }: ProductEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category_id: '',
    image: '',
    availability: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price?.toString() || '',
        description: product.description || '',
        category_id: product.category_id || '',
        image: product.image || '',
        availability: product.availability ?? true
      });
      setImageFile(null);
    }
  }, [product, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = formData.image;

      // 1. Upload new image if selected
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);
        
        const uploadRes = await fetch(`${API_URL}/upload/product-image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: uploadFormData
        });

        const uploadData = await uploadRes.json();
        if (uploadData.url) imageUrl = uploadData.url;
      }

      // 2. Update product details
      const updated = await apiClient(`/products/${product.id}`, {
        method: 'PATCH',
        data: {
          ...formData,
          category_id: formData.category_id || null,
          price: parseFloat(formData.price),
          image: imageUrl
        }
      });

      if (updated) {
        toast.success('Product updated successfully!');
        onUpdate();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 border border-slate-100">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Edit Offering.</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Override Active</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-colors text-slate-300 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 sm:p-10 space-y-8 overflow-y-auto max-h-[80vh] no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Input 
                    label="Item Name"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  <Input 
                    label="Price (ج.م)"
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Category Registry</label>
                    <select 
                      className="w-full h-12 px-5 bg-slate-50 border border-transparent rounded-xl text-slate-900 font-bold outline-none focus:bg-white focus:border-slate-900 transition-all text-sm appearance-none cursor-pointer"
                      value={formData.category_id}
                      onChange={e => setFormData({...formData, category_id: e.target.value})}
                    >
                      <option value="">Standard Sector</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Asset Identity</label>
                    <div className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-inner">
                      <img 
                        src={imageFile ? URL.createObjectURL(imageFile) : (formData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400')} 
                        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all"
                        alt="Product preview"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 text-center">
                        <UploadCloud size={32} className="mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Swap Visual Node</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={e => setImageFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description Logic</label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-all text-sm min-h-[120px] resize-none font-medium shadow-inner"
                />
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${formData.availability ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status: {formData.availability ? 'Active' : 'Offline'}</span>
                </div>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-[9px] text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="h-12 px-10 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-slate-800 transition-all shadow-lg flex items-center gap-3 disabled:opacity-50"
                  >
                    {saving ? <Activity size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>{saving ? 'Synchronizing...' : 'Update Artifact'}</span>
                  </button>
                </div>
              </div>
            </form>
            
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-slate-900/5 rounded-full blur-[80px] pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
