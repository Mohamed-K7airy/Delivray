'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { 
  Package,
  Plus, 
  ChevronRight, 
  DollarSign, 
  Upload,
  TrendingUp,
  ShoppingBag,
  PackageCheck,
  Clock,
  BarChart3,
  Zap,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  ChefHat
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSocket } from '@/context/SocketContext';
import { apiClient } from '@/lib/apiClient';

export default function MerchantDashboard() {
  const { token, user } = useAuthStore();
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalOrdersToday: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState({ title: '', price: '', category: 'Main Courses' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== 'merchant') return router.push('/login');

    const fetchData = async () => {
      try {
        const [ordersData, statsData] = await Promise.all([
          apiClient('/orders/merchant'),
          apiClient('/orders/merchant/stats')
        ]);
        if (ordersData) setOrders(ordersData.slice(0, 4));
        if (statsData) setStats(statsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, user, router]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.6;
      audio.play().catch(err => console.error('Audio play failed:', err));
    } catch (err) {
      console.error('Audio object creation failed:', err);
    }
  };

  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.on('new_order', (order: any) => {
      setOrders(prev => [order, ...prev.slice(0, 3)]);
      toast.success('New order received! 🍔');
      playNotificationSound();
    });
    socket.on('order_status_updated', (updated: any) => {
      setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
    });
    return () => {
      socket.off('new_order');
      socket.off('order_status_updated');
    };
  }, [socket, isConnected]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const updated = await apiClient(`/orders/${orderId}/status`, {
        method: 'PATCH',
        data: { status }
      });
      if (updated) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        toast.success(`Order updated → ${status.replace('_', ' ').toUpperCase()}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient('/products', {
        method: 'POST',
        data: {
          name: productForm.title,
          price: parseFloat(productForm.price),
          category: productForm.category,
          store_id: user?.store_id
        }
      });
      if (res) {
        toast.success('Product added to inventory! 🚀');
        setProductForm({ title: '', price: '', category: 'Main Courses' });
      }
    } catch {
       toast.error('Failed to add product.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const map: Record<string, { label: string; pill: string; icon: React.ReactElement; nextAction?: string; nextStatus?: string; nextColor?: string }> = {
      pending:          { label: 'Pending',    pill: 'bg-amber-50 text-amber-600 border-amber-200',   icon: <Clock size={12} />,        nextAction: 'Accept',     nextStatus: 'accepted',        nextColor: 'bg-[#111111] hover:bg-[#333] text-white' },
      accepted:         { label: 'Accepted',   pill: 'bg-blue-50 text-blue-600 border-blue-200',      icon: <CheckCircle2 size={12} />, nextAction: 'Start Prep', nextStatus: 'preparing',       nextColor: 'bg-[#0f172a] hover:bg-[#c2654a] text-white' },
      preparing:        { label: 'Preparing',  pill: 'bg-[#fef3f2] text-[#0f172a] border-[#fee2e2]',  icon: <ChefHat size={12} />,      nextAction: 'Mark Ready', nextStatus: 'ready_for_pickup', nextColor: 'bg-blue-600 hover:bg-blue-700 text-white' },
      ready_for_pickup: { label: 'Ready',      pill: 'bg-green-50 text-green-600 border-green-200',   icon: <PackageCheck size={12} />,   nextAction: 'Dispatched', nextStatus: 'delivering',      nextColor: 'bg-purple-600 hover:bg-purple-700 text-white' },
      delivering:       { label: 'Delivering', pill: 'bg-purple-50 text-purple-600 border-purple-200',icon: <Zap size={12} /> },
      completed:        { label: 'Completed',  pill: 'bg-gray-50 text-gray-500 border-gray-200',      icon: <CheckCircle2 size={12} /> },
    };
    return map[status.toLowerCase()] ?? { label: status, pill: 'bg-gray-100 text-gray-500 border-gray-200', icon: <AlertCircle size={12} /> };
  };

  const orderIcon = <Package size={22} className="text-slate-300" />;

  const statCards = [
    { label: "Today's Revenue",  value: `${stats.todayRevenue.toFixed(2)} ج.م`, sub: 'Real-time', icon: <DollarSign size={20} />, accent: '#334155', bg: '#f8fafc' },
    { label: 'Completed Orders', value: stats.completedOrders,               sub: 'All time',  icon: <PackageCheck size={20} />, accent: '#334155', bg: '#f8fafc' },
    { label: 'Pending Action',   value: stats.pendingOrders,                 sub: 'Need review', icon: <AlertCircle size={20} />, accent: '#e11d48', bg: '#fff1f2' },
    { label: 'Total Today',      value: stats.totalOrdersToday,              sub: 'Orders', icon: <ShoppingBag size={20} />, accent: '#334155', bg: '#f8fafc' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container-responsive py-8 sm:py-12 space-y-10 sm:space-y-14">
  
        {/* ── Header ── */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center gap-1.5 bg-white text-slate-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-slate-100 shadow-sm">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Live Network
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              Operational Summary.
            </h1>
            <p className="text-slate-400 mt-2 font-medium text-sm">Merchant terminal for {user?.name?.split(' ')[0]} Hub.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none h-11 px-5 bg-white border border-slate-100 text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-slate-900 transition-all flex items-center justify-center gap-2 shadow-sm">
              <Upload size={14} /> Export Report
            </button>
            <button
              onClick={() => router.push('/merchant/inventory')}
              className="flex-1 sm:flex-none h-11 px-6 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Plus size={16} /> New Product
            </button>
          </div>
        </header>
  
        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-900 flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    {s.icon}
                  </div>
                  <div className="flex flex-col items-end">
                     <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">{s.sub}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-slate-900 tracking-tight leading-none">{s.value}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
  
        {/* ── Main Content ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 items-start">
  
          {/* Left: Orders */}
          <div className="xl:col-span-8 space-y-8">
  
            {/* Live Orders Card */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 bg-white">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Active Queue</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Processing Environment</p>
                </div>
                <button
                  onClick={() => router.push('/merchant/orders')}
                  className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1.5 hover:text-slate-400 transition-colors"
                >
                  History <ChevronRight size={14} />
                </button>
              </div>
  
              <div className="p-8 space-y-4">
                {loading ? (
                  <div className="flex flex-col gap-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-24 bg-slate-50 rounded-xl animate-pulse border border-slate-100" />
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <AnimatePresence>
                    <div className="flex flex-col gap-4">
                      {orders.map((order, idx) => {
                        const cfg = getStatusConfig(order.status);
                        const item = order.order_items?.[0]?.products?.name || 'Itemized Signal';
                        const itemCount = order.order_items?.length || 1;
                        const time = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                          <motion.div
                            key={order.id}
                            layout
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-slate-50/50 rounded-xl p-5 border border-slate-100 flex flex-col md:flex-row md:items-center gap-6 hover:bg-white hover:shadow-md transition-all group"
                          >
                            <div className="w-14 h-14 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                               <Package size={22} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                            </div>
  
                            {/* Order Info */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-3">
                                 <h4 className="text-sm font-bold text-slate-900 tracking-tight uppercase">#{order.id.slice(0,8)}</h4>
                                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-widest border bg-white ${cfg.pill.includes('amber') ? 'text-amber-600 border-amber-100' : cfg.pill.includes('blue') ? 'text-blue-600 border-blue-100' : 'text-slate-400 border-slate-100'}`}>
                                    {cfg.icon} {cfg.label}
                                 </span>
                              </div>
                              
                              <p className="text-xs font-medium text-slate-400 flex items-center gap-2 flex-wrap">
                                 <span className="text-slate-900 font-bold">{item}</span>
                                 {itemCount > 1 && <span className="text-slate-300">+{itemCount - 1} Units</span>}
                                 <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                 <span className="text-slate-300 font-bold uppercase text-[9px]">{time}</span>
                              </p>
                            </div>
  
                            {/* Price & Actions */}
                            <div className="flex items-center justify-between md:justify-end gap-10 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                               <div className="text-left md:text-right">
                                  <p className="text-lg font-bold text-slate-900 tracking-tight">{Number(order.total_price || 0).toFixed(2)} ج.م</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Flow</p>
                               </div>
  
                               <div className="flex items-center gap-2">
                                  {!['completed', 'delivering'].includes(order.status.toLowerCase()) ? (
                                    <div className="relative">
                                      <select
                                        value={order.status}
                                        onChange={e => { if (e.target.value && e.target.value !== order.status) updateStatus(order.id, e.target.value); }}
                                        className="h-10 pl-3 pr-8 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-white text-slate-900 border border-slate-100 outline-none cursor-pointer appearance-none transition-all hover:border-slate-300"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                                      >
                                        <option value="pending" disabled>Queue</option>
                                        <option value="accepted">Accept</option>
                                        <option value="preparing">Process</option>
                                        <option value="ready_for_pickup">Ready</option>
                                        <option value="cancelled">Void</option>
                                      </select>
                                    </div>
                                  ) : (
                                    <div className="h-10 px-4 rounded-lg bg-white border border-slate-100 flex items-center gap-2">
                                       <CheckCircle2 size={12} className="text-slate-300" />
                                       <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">Finalized</span>
                                    </div>
                                  )}
                                  
                                  <button
                                    onClick={() => router.push('/merchant/orders')}
                                    className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-300 hover:text-slate-900 border border-slate-100 shadow-sm transition-all"
                                  >
                                    <ChevronRight size={16} />
                                  </button>
                               </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </AnimatePresence>
                ) : (
                  <div className="py-24 flex flex-col items-center gap-4 text-center opacity-40">
                     <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
                      <ShoppingBag size={24} className="text-slate-200" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Queue Empty</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Scanning Network...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
  
            {/* Core Insights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: <Clock size={16} />, title: 'Efficiency', desc: 'Avg response: 1.8 mins' },
                { icon: <Zap size={16} />, title: 'Uptime', desc: 'System operational (100%)' },
                { icon: <CheckCircle2 size={16} />, title: 'Fulfillment', desc: '99.4% Success rate' },
              ].map((tip, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-start gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-900 border border-slate-100">
                    {tip.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-1">{tip.title}</p>
                    <p className="text-[9px] font-bold text-slate-400 leading-normal uppercase tracking-tight">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          {/* Right Sidebar: Quick Actions */}
          <aside className="xl:col-span-4 space-y-8 xl:sticky xl:top-8">
  
            {/* Deployment Form */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 bg-white">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Rapid Deployment</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Internal Registry Entry</p>
              </div>
  
              <form onSubmit={handleSaveProduct} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Internal Title</label>
                  <input
                    required
                    placeholder="e.g. Signature Blend"
                    value={productForm.title}
                    onChange={e => setProductForm({...productForm, title: e.target.value})}
                    className="w-full h-11 bg-slate-50 px-4 rounded-lg border border-transparent focus:bg-white focus:border-slate-100 outline-none text-xs font-bold text-slate-900 transition-all placeholder:text-slate-200"
                  />
                </div>
  
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Price (ج.م)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full h-11 bg-slate-50 px-4 rounded-lg border border-transparent focus:bg-white focus:border-slate-100 outline-none text-xs font-bold text-slate-900 transition-all"
                      onChange={e => setProductForm({...productForm, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select
                      className="w-full h-11 bg-slate-50 px-4 rounded-lg border border-transparent outline-none text-[9px] font-bold uppercase tracking-widest text-slate-400 cursor-pointer focus:bg-white focus:border-slate-100 transition-all"
                      onChange={e => setProductForm({...productForm, category: e.target.value})}
                    >
                      <option>Main Courses</option>
                      <option>Beverages</option>
                    </select>
                  </div>
                </div>
  
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-slate-900 text-white rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-md"
                >
                  {submitting ? 'Authenticating...' : 'Confirm Sync'}
                </button>
              </form>
            </div>
  
            {/* Quick Stats Nav */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Orders',    icon: <ShoppingBag size={18} />, path: '/merchant/orders' },
                { label: 'Registry', icon: <Package size={18} />, path: '/merchant/inventory' },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.path)}
                  className="bg-white border border-slate-100 rounded-xl p-6 flex flex-col items-center gap-3 hover:border-slate-900 transition-all shadow-sm group"
                >
                  <div className="text-slate-200 group-hover:text-slate-900 transition-colors">{item.icon}</div>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-900 uppercase tracking-widest transition-colors">{item.label}</span>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
