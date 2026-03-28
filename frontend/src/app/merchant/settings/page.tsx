'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/apiClient';
import { API_URL } from '@/config/api';
import StoreToggle from '@/components/StoreToggle';
import { motion } from 'framer-motion';
import { Settings, Store, Bell, Shield, Smartphone, Globe, Save, UploadCloud, Activity, X } from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantSettings() {
  const { user, token } = useAuthStore();
  const [store, setStore] = useState<any>(null);
  const [storeName, setStoreName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.role === 'merchant') {
      apiClient('/stores/me').then(data => {
        if (data && data.length > 0) {
          setStore(data[0]);
          setStoreName(data[0].name);
        }
      }).catch(err => console.error('Failed to fetch store:', err));
    }
  }, [user]);

  const handleSave = async () => {
    if (!store) return;
    setUploading(true);
    try {
      let imageUrl = store.image;

      // 1. Upload new image if selected
      if (imageFile) {
        console.log('[Upload] Starting file upload:', imageFile.name);
        const formData = new FormData();
        formData.append('image', imageFile); // Unified field name to 'image'
        
        const uploadRes = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadData.message || 'Upload protocol failed');
        }

        console.log('[Upload] Success:', uploadData.url);
        if (uploadData.url) imageUrl = uploadData.url;
      }

      // 2. Update store details
      console.log('[StoreUpdate] Syncing data with DB:', { name: storeName, image: imageUrl });
      const updated = await apiClient(`/stores/${store.id}`, {
        method: 'PATCH',
        data: { name: storeName, image: imageUrl }
      });

      if (updated) {
        console.log('[StoreUpdate] Success:', updated);
        setStore(updated);
        setStoreName(updated.name);
        setImageFile(null);
        toast.success('Store configuration synchronized! 🚀');
      } else {
        throw new Error('Database sync returned empty response');
      }
    } catch (err: any) {
      console.error('[SettingsError]', err);
      toast.error(err.message || 'Failed to sync configuration');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
             <h1 className="text-3xl sm:text-5xl font-bold uppercase tracking-tighter text-[#111111]">Store Settings</h1>
             <p className="text-[#888888] font-medium mt-2">Configure your digital storefront and operational parameters.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={uploading}
            className="bg-[#0f172a] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center space-x-3 shadow-md hover:bg-slate-800 transition-all disabled:opacity-50"
          >
             {uploading ? <Activity size={18} className="animate-spin" /> : <Save size={18} />}
             <span>{uploading ? 'Synchronizing...' : 'Save Configuration'}</span>
          </button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Settings Sidebar */}
          <div className="lg:col-span-4 space-y-4">
             {[
                { label: 'General Info', icon: <Store size={20} />, active: true },
                { label: 'Notifications', icon: <Bell size={20} /> },
                { label: 'Security & Access', icon: <Shield size={20} /> },
                { label: 'Mobile Interface', icon: <Smartphone size={20} /> },
             ].map((item, idx) => (
                <button key={idx} className={`w-full flex items-center space-x-4 px-8 py-5 rounded-2xl transition-all border ${item.active ? 'bg-white border-gray-100 text-[#111111] shadow-md' : 'text-[#888888] hover:text-[#111111] border-transparent'}`}>
                   <span className={item.active ? 'text-[#0f172a]' : 'text-gray-400'}>{item.icon}</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-1">{item.label}</span>
                </button>
             ))}
          </div>

          {/* Settings Form Container */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-12 rounded-2xl border border-gray-100 shadow-xl relative overflow-hidden group">
             
             {/* Store Status Toggle */}
             {store && <StoreToggle storeId={store.id} initialStatus={store.is_open} />}

             <h3 className="text-2xl font-bold uppercase tracking-tighter mb-12 flex items-center space-x-4 text-[#111111]">
                <div className="w-10 h-10 bg-[#f8fafc] rounded-xl flex items-center justify-center text-[#0f172a] border border-gray-100 shadow-inner">
                   <Settings size={20} />
                </div>
                <span>General Store Configuration</span>
             </h3>

             <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Store Name</label>
                      <input 
                        type="text" 
                        value={storeName}
                        onChange={e => setStoreName(e.target.value)}
                        className="w-full h-16 px-8 bg-[#f8fafc] border border-gray-100 rounded-xl text-[#111111] font-bold outline-none focus:border-[#0f172a] transition-all" 
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Contact Email</label>
                      <input 
                        type="email" 
                        disabled
                        defaultValue={user?.email || "merchant@delivray.com"}
                        className="w-full h-16 px-8 bg-[#f8fafc] border border-gray-100 rounded-xl text-[#111111] font-bold outline-none opacity-50 cursor-not-allowed" 
                      />
                   </div>
                </div>

                {/* Brand Visuals */}
                <div className="space-y-4">
                    <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Brand Visuals</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <div className="w-full aspect-square bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden relative group">
                                <img 
                                    src={store?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'} 
                                    className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all"
                                    alt="Store Logo"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <UploadCloud className="text-white" size={24} />
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={e => setImageFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                            <p className="text-[8px] font-bold text-[#888888] uppercase tracking-[0.2em] mt-3 text-center">Store Identity Hub</p>
                        </div>
                        <div className="md:col-span-2 flex flex-col justify-center space-y-4">
                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sync Status</p>
                                {imageFile ? (
                                    <div className="space-y-4">
                                        <p className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                            Pending Upload: {imageFile.name}
                                        </p>
                                        <button 
                                            onClick={handleSave}
                                            className="px-6 py-2.5 bg-[#0f172a] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg"
                                        >
                                            <UploadCloud size={14} />
                                            <span>Synchronize Assets</span>
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                        Asset Live on CDN
                                    </p>
                                )}
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight leading-relaxed">
                                Upload a high-resolution logo or banner. Recommended size: 800x800px. Maximum file size: 5MB.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Operational Zone</label>
                   <div className="flex items-center space-x-4 p-8 bg-[#f8fafc] border border-gray-100 rounded-xl border-dashed">
                      <Globe size={32} className="text-gray-300 mx-auto" />
                      <div className="flex-1 text-center">
                         <p className="text-[10px] text-[#888888] font-bold uppercase tracking-widest">Global delivery operations enabled.</p>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                   <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-[#888888]">Settings Locked & Verified</span>
                   </div>
                   <button className="text-[10px] font-bold text-[#888888] uppercase hover:text-[#111111] transition-colors">Reset Factory Defaults</button>
                </div>
             </div>
             
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0f172a]/5 rounded-full blur-[100px] pointer-events-none -mr-40 -mt-80 opacity-40"></div>
          </div>
       </div>
    </div>
  );
}
