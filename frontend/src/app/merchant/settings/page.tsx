'use client';
import { motion } from 'framer-motion';
import { Settings, Store, Bell, Shield, Smartphone, Globe, Save, HelpCircle } from 'lucide-react';

export default function MerchantSettings() {
  return (
    <div className="max-w-7xl mx-auto space-y-12">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
             <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-[#111111]">Store Settings</h1>
             <p className="text-[#888888] font-medium mt-2">Configure your digital storefront and operational parameters.</p>
          </div>
          <button className="bg-[#d97757] text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center space-x-3 shadow-md hover:bg-[#c2654a] transition-all">
             <Save size={18} />
             <span>Save Configuration</span>
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
                   <span className={item.active ? 'text-[#d97757]' : 'text-gray-400'}>{item.icon}</span>
                   <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-1">{item.label}</span>
                </button>
             ))}
          </div>

          {/* Settings Form Container */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-12 rounded-2xl border border-gray-100 shadow-xl relative overflow-hidden group">
             <h3 className="text-2xl font-black uppercase tracking-tighter mb-12 flex items-center space-x-4 text-[#111111]">
                <div className="w-10 h-10 bg-[#f9f9f9] rounded-xl flex items-center justify-center text-[#d97757] border border-gray-100 shadow-inner">
                   <Settings size={20} />
                </div>
                <span>General Store Configuration</span>
             </h3>

             <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-[#888888] uppercase tracking-widest ml-1">Store Name</label>
                      <input 
                        type="text" 
                        defaultValue="Premium Merchant Central"
                        className="w-full h-16 px-8 bg-[#f9f9f9] border border-gray-100 rounded-xl text-[#111111] font-bold outline-none focus:border-[#d97757] transition-all" 
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-[#888888] uppercase tracking-widest ml-1">Contact Email</label>
                      <input 
                        type="email" 
                        defaultValue="merchant@delivray.com"
                        className="w-full h-16 px-8 bg-[#f9f9f9] border border-gray-100 rounded-xl text-[#111111] font-bold outline-none focus:border-[#d97757] transition-all" 
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-[#888888] uppercase tracking-widest ml-1">Operational Zone</label>
                   <div className="flex items-center space-x-4 p-8 bg-[#f9f9f9] border border-gray-100 rounded-xl border-dashed">
                      <Globe size={32} className="text-gray-300 mx-auto" />
                      <div className="flex-1 text-center">
                         <p className="text-[10px] text-[#888888] font-bold uppercase tracking-widest">Global delivery operations enabled.</p>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                   <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#888888]">Settings Locked & Verified</span>
                   </div>
                   <button className="text-[10px] font-black text-[#888888] uppercase hover:text-[#111111] transition-colors">Reset Factory Defaults</button>
                </div>
             </div>
             
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d97757]/5 rounded-full blur-[100px] pointer-events-none -mr-40 -mt-80 opacity-40"></div>
          </div>
       </div>
    </div>
  );
}
