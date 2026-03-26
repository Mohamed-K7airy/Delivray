'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Bell, 
  ChevronRight, 
  Clock, 
  DollarSign, 
  Percent, 
  Tag, 
  BarChart3, 
  Upload, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  PackageCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';

const liveOrdersData = [
  { id: 'DEL-4829', items: 'Artisan Burger Combo', status: 'PREPARING', time: '8 mins ago', est: 'pickup in 12m', icon: '🍔' },
  { id: 'DEL-4831', items: 'Truffle Mushroom Pizza (x2)', status: 'READY', time: '15 mins ago', est: 'Waiting for driver', icon: '🍕' },
  { id: 'DEL-4825', items: 'Pastry Selection Box', status: 'COMPLETED', time: '45 mins ago', est: 'Delivered at 12:45 PM', icon: '🥐' },
];

export default function MerchantDashboard() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState({ title: '', price: '', category: 'Main Courses' });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Product saved successfully! 🚀');
    setProductForm({ title: '', price: '', category: 'Main Courses' });
  };

  return (
    <div className="space-y-10 lg:space-y-12 pb-24">
      
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <h1 className="text-4xl lg:text-5xl font-black text-[#0A0A0A] tracking-tighter mb-2">Merchant Portal</h1>
            <div className="flex items-center gap-4">
               <span className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Status: Active
               </span>
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last synced: 2 mins ago</span>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <button className="h-14 px-8 bg-white text-[#0A0A0A] border border-gray-100 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all flex items-center gap-3">
               <Upload size={16} />
               Export Reports
            </button>
            <button 
               onClick={() => router.push('/merchant/inventory')}
               className="h-14 px-8 bg-[#FF5A3C] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#E84A2C] transition-all flex items-center gap-3 shadow-xl shadow-[#FF5A3C]/20"
            >
               <Plus size={18} />
               New Listing
            </button>
         </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-14 items-start">
         
         {/* Center Column: Live Orders Queue */}
         <div className="xl:col-span-8 space-y-10">
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
               <div className="flex items-center justify-between mb-10">
                  <div>
                     <h2 className="text-2xl font-black text-[#0A0A0A] tracking-tighter mb-1">Live Orders</h2>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority kitchen queue</p>
                  </div>
                  <button className="text-[10px] font-black text-[#FF5A3C] uppercase tracking-widest hover:underline">View All Queue</button>
               </div>

               <div className="space-y-6">
                  {liveOrdersData.map((order, idx) => (
                    <motion.div 
                       key={order.id}
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: idx * 0.1 }}
                       className="group bg-[#F8F8F8] hover:bg-white hover:shadow-xl hover:shadow-black/5 rounded-[2rem] p-6 lg:p-8 flex items-center justify-between border border-transparent hover:border-gray-100 transition-all cursor-pointer"
                       onClick={() => router.push('/merchant/orders')}
                    >
                       <div className="flex items-center gap-6 lg:gap-10">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-white transition-transform group-hover:scale-110 duration-500 ${
                             order.status === 'READY' ? 'bg-blue-50' : order.status === 'PREPARING' ? 'bg-orange-50' : 'bg-gray-50'
                          }`}>
                             {order.icon}
                          </div>
                          <div>
                             <div className="flex items-center gap-4 mb-2">
                                <span className="text-lg font-black text-[#0A0A0A] tracking-tight">{order.id} — {order.items}</span>
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                   order.status === 'READY' ? 'bg-blue-50 text-blue-500 border-blue-100' : 
                                   order.status === 'PREPARING' ? 'bg-orange-50 text-[#FF5A3C] border-orange-100' : 
                                   'bg-gray-100 text-gray-400 border-gray-200'
                                }`}>
                                   {order.status}
                                </span>
                             </div>
                             <p className="text-xs font-bold text-gray-400">
                                Ordered by <span className="text-[#0A0A0A]">{order.id === 'DEL-4829' ? 'Sarah Jenkins' : order.id === 'DEL-4831' ? 'Marcus Chen' : 'Elena Rodriguez'}</span> • {order.time}
                             </p>
                          </div>
                       </div>
                       <div className="flex items-center gap-8">
                          <div className="text-right hidden sm:block">
                             <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${order.status === 'READY' ? 'text-blue-500' : 'text-gray-400'}`}>
                                {order.status === 'READY' ? 'READY' : order.status === 'COMPLETED' ? 'COMPLETED' : 'PREPARING'}
                             </p>
                             <p className="text-xs font-bold text-gray-500">{order.est}</p>
                          </div>
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-300 group-hover:text-[#FF5A3C] group-hover:bg-[#FF5A3C]/5 border border-gray-50 transition-all">
                             {order.status === 'COMPLETED' ? <PackageCheck size={20} className="text-green-500" /> : <ChevronRight size={20} />}
                          </div>
                       </div>
                    </motion.div>
                  ))}
               </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
               {[
                 { label: 'TOTAL SALES (TODAY)', value: '$1,482.00', sub: '+12% vs yesterday', icon: <DollarSign size={20} />, color: '#FF5A3C' },
                 { label: 'COMPLETION RATE', value: '98.4%', sub: 'Target: 95%', icon: <TrendingUp size={20} />, color: '#0A0A0A' },
                 { label: 'ACTIVE PROMOS', value: '3', sub: 'MANAGE DEALS', icon: <Tag size={20} />, color: '#0A0A0A' },
               ].map((stat, idx) => (
                 <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-gray-100 shadow-sm text-center group hover:shadow-xl hover:shadow-black/5 transition-all"
                  >
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">{stat.label}</p>
                    <h4 className="text-4xl font-black text-[#0A0A0A] tracking-tighter mb-4 leading-none">{stat.value}</h4>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${idx === 0 ? 'text-green-500' : idx === 2 ? 'text-[#FF5A3C] cursor-pointer hover:underline' : 'text-gray-400'}`}>
                       {idx === 0 && <TrendingUp size={12} className="inline mr-2" />}
                       {stat.sub}
                    </p>
                 </motion.div>
               ))}
            </div>

            {/* Pro Tips Banner */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-[#0A0A0A] rounded-[3rem] p-10 lg:p-14 relative overflow-hidden group border border-gray-800"
            >
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                  <div className="max-w-md">
                     <span className="bg-[#FF5A3C] text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 inline-block">PRO TIPS</span>
                     <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tighter leading-tight mb-6">Boost your visibility during lunchtime.</h3>
                     <p className="text-gray-400 text-sm font-bold leading-relaxed mb-10">Merchants using our AI-driven "Speed Tags" see a 24% increase in click-through rates from local customers.</p>
                     <button className="bg-white text-[#0A0A0A] px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all flex items-center gap-3">
                        Learn More
                     </button>
                  </div>
                  <div className="relative w-full md:w-auto flex items-center justify-center">
                     <div className="w-64 h-64 bg-white/5 rounded-full blur-3xl absolute animate-pulse" />
                     <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=400&auto=format&fit=crop" className="w-[400px] h-[250px] object-cover rounded-3xl opacity-50 transition-opacity group-hover:opacity-70 duration-700 shadow-2xl" alt="Lunch Rush" />
                  </div>
               </div>
            </motion.div>
         </div>

         {/* Right Sidebar: Quick Add Product */}
         <aside className="xl:col-span-4 lg:sticky lg:top-8 space-y-10">
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
               <h3 className="text-2xl font-black text-[#0A0A0A] tracking-tighter mb-10">Quick Add Product</h3>
               
               <form onSubmit={handleSaveProduct} className="space-y-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PRODUCT TITLE</label>
                     <input 
                        required
                        placeholder="e.g. Summer Harvest Salad" 
                        value={productForm.title}
                        onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                        className="w-full h-16 bg-[#F8F8F8] px-6 rounded-2xl border border-gray-100 focus:border-[#FF5A3C] outline-none font-bold text-[#0A0A0A] transition-all"
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PRICE (USD)</label>
                     <div className="relative">
                        <DollarSign size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input 
                           required
                           type="number"
                           step="0.01"
                           placeholder="0.00" 
                           value={productForm.price}
                           onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                           className="w-full h-16 bg-[#F8F8F8] pl-14 pr-6 rounded-2xl border border-gray-100 focus:border-[#FF5A3C] outline-none font-bold text-[#0A0A0A] transition-all"
                        />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CATEGORY</label>
                     <select 
                        value={productForm.category}
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        className="w-full h-16 bg-[#F8F8F8] px-6 rounded-2xl border border-gray-100 focus:border-[#FF5A3C] outline-none font-bold text-[#0A0A0A] transition-all appearance-none cursor-pointer"
                     >
                        <option>Main Courses</option>
                        <option>Appetizers</option>
                        <option>Desserts</option>
                        <option>Beverages</option>
                     </select>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PRODUCT PHOTO</label>
                     <div className="w-full h-40 border-2 border-dashed border-gray-100 rounded-[2rem] bg-[#F8F8F8] flex flex-col items-center justify-center gap-3 cursor-pointer group hover:border-[#FF5A3C]/30 hover:bg-[#FFF9F8] transition-all">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-[#FF5A3C] transition-all">
                           <Upload size={20} />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400">Drag & drop or <span className="text-[#FF5A3C]">browse</span></p>
                     </div>
                  </div>

                  <button 
                     type="submit"
                     className="w-full h-20 bg-[#FF5A3C] text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#E84A2C] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#FF5A3C]/30"
                  >
                     SAVE PRODUCT
                  </button>
               </form>
            </div>

            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm flex items-center gap-6">
               <div className="w-16 h-16 bg-[#F3F4F6] rounded-2xl flex items-center justify-center text-[#0A0A0A] shrink-0">
                  <BarChart3 size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">DATA INSIGHTS</p>
                  <p className="text-xs font-black text-[#0A0A0A] leading-tight">Weekly report is ready for download.</p>
                  <button className="text-[9px] font-black text-[#FF5A3C] uppercase tracking-widest mt-1 hover:underline">Download PDF</button>
               </div>
            </div>
         </aside>

      </div>
      
      {/* Footer Branding */}
      <footer className="pt-20 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40">
         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">© 2024 Delivray Merchant Services</p>
         <div className="flex items-center gap-8">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-[#0A0A0A]">Privacy</span>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-[#0A0A0A]">Merchant Agreement</span>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-[#0A0A0A]">Support</span>
         </div>
      </footer>
    </div>
  );
}
