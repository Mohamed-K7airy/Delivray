'use client';
import { motion } from 'framer-motion';
import { Settings, Store, Bell, Shield, Smartphone, Globe, Save, HelpCircle } from 'lucide-react';

export default function MerchantSettings() {
  return (
    <div className="max-w-7xl mx-auto space-y-12">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
             <h1 className="text-5xl font-black uppercase tracking-tighter text-white">Store Settings</h1>
             <p className="text-gray-500 font-medium mt-2">Configure your digital storefront and operational parameters.</p>
          </div>
          <button className="bg-primary text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center space-x-3 shadow-[0_20px_40px_-10px_rgba(217,119,87,0.3)] hover:scale-105 active:scale-95 transition-all">
             <Save size={18} />
             <span>Save Configuration</span>
          </button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Settings Sidebar */}
          <div className="lg:col-span-4 space-y-6">
             {[
                { label: 'General Info', icon: <Store size={20} />, active: true },
                { label: 'Notifications', icon: <Bell size={20} /> },
                { label: 'Security & Access', icon: <Shield size={20} /> },
                { label: 'Mobile Interface', icon: <Smartphone size={20} /> },
             ].map((item, idx) => (
                <button key={idx} className={`w-full flex items-center space-x-4 px-8 py-5 rounded-3xl transition-all border ${item.active ? 'bg-[#262624] border-white/5 text-white shadow-xl' : 'text-gray-500 hover:text-white border-transparent'}`}>
                   <span className={item.active ? 'text-primary' : 'text-gray-600'}>{item.icon}</span>
                   <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-1">{item.label}</span>
                </button>
             ))}
          </div>

          {/* Settings Form Placeholder */}
          <div className="lg:col-span-8 bg-[#262624] p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
             <h3 className="text-2xl font-black uppercase tracking-tighter mb-12 flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-primary">
                   <Settings size={20} />
                </div>
                <span>General Store Configuration</span>
             </h3>

             <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Store Name</label>
                      <input 
                        type="text" 
                        defaultValue="Premium Merchant Central"
                        className="w-full px-8 py-5 bg-white/[0.03] border border-white/5 rounded-2xl text-white font-medium outline-none focus:border-primary/40 transition-all placeholder:text-gray-700" 
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Contact Email</label>
                      <input 
                        type="email" 
                        defaultValue="merchant@delivray.com"
                        className="w-full px-8 py-5 bg-white/[0.03] border border-white/5 rounded-2xl text-white font-medium outline-none focus:border-primary/40 transition-all placeholder:text-gray-700" 
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Operational Zone</label>
                   <div className="flex items-center space-x-4 p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] border-dashed">
                      <Globe size={32} className="text-gray-700 mx-auto" />
                      <div className="flex-1 text-center">
                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global delivery operations enabled.</p>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Settings Locked & Verified</span>
                   </div>
                   <button className="text-[10px] font-black text-gray-700 uppercase hover:text-white transition-colors">Reset Factory Defaults</button>
                </div>
             </div>
             
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -mr-40 -mt-80 opacity-40"></div>
          </div>
       </div>
    </div>
  );
}
