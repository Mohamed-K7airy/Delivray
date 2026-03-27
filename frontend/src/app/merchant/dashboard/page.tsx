'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { 
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
      accepted:         { label: 'Accepted',   pill: 'bg-blue-50 text-blue-600 border-blue-200',      icon: <CheckCircle2 size={12} />, nextAction: 'Start Prep', nextStatus: 'preparing',       nextColor: 'bg-[#d97757] hover:bg-[#c2654a] text-white' },
      preparing:        { label: 'Preparing',  pill: 'bg-[#fef3f2] text-[#d97757] border-[#fee2e2]',  icon: <ChefHat size={12} />,      nextAction: 'Mark Ready', nextStatus: 'ready_for_pickup', nextColor: 'bg-blue-600 hover:bg-blue-700 text-white' },
      ready_for_pickup: { label: 'Ready',      pill: 'bg-green-50 text-green-600 border-green-200',   icon: <PackageCheck size={12} />,   nextAction: 'Dispatched', nextStatus: 'delivering',      nextColor: 'bg-purple-600 hover:bg-purple-700 text-white' },
      delivering:       { label: 'Delivering', pill: 'bg-purple-50 text-purple-600 border-purple-200',icon: <Zap size={12} /> },
      completed:        { label: 'Completed',  pill: 'bg-gray-50 text-gray-500 border-gray-200',      icon: <CheckCircle2 size={12} /> },
    };
    return map[status.toLowerCase()] ?? { label: status, pill: 'bg-gray-100 text-gray-500 border-gray-200', icon: <AlertCircle size={12} /> };
  };

  const orderEmojis = ['🍔', '🍕', '🥗', '🍱', '🌮', '🍜'];

  const statCards = [
    { label: "Today's Revenue",  value: `$${stats.todayRevenue.toFixed(2)}`, sub: 'Real-time', icon: <DollarSign size={20} />, accent: '#d97757', bg: '#fef3f2' },
    { label: 'Completed Orders', value: stats.completedOrders,               sub: 'All time',  icon: <PackageCheck size={20} />, accent: '#16a34a', bg: '#f0fdf4' },
    { label: 'Pending Action',   value: stats.pendingOrders,                 sub: 'Need review', icon: <AlertCircle size={20} />, accent: '#d97757', bg: '#fef3f2' },
    { label: 'Total Today',      value: stats.totalOrdersToday,              sub: 'Orders', icon: <ShoppingBag size={20} />, accent: '#2563eb', bg: '#eff6ff' },
  ];

  return (
    <div className="space-y-8 lg:space-y-10 pb-24">

      {/* ── Header ── */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
            <span className="text-[10px] text-[#888888] font-bold uppercase tracking-widest">Real-time sync active</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-[#111111] tracking-tighter">
            Good morning, <span className="text-[#d97757]">{user?.name?.split(' ')[0]}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none h-11 px-5 bg-white border border-gray-100 text-[#111111] rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm">
            <Upload size={14} /> Export
          </button>
          <button
            onClick={() => router.push('/merchant/inventory')}
            className="flex-1 sm:flex-none h-11 px-5 bg-[#d97757] text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#c2654a] transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Plus size={16} /> New Item
          </button>
        </div>
      </header>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg, color: s.accent }}>
                {s.icon}
              </div>
              <ArrowUpRight size={14} className="text-gray-200 group-hover:text-[#d97757] transition-colors" />
            </div>
            <p className="text-2xl lg:text-3xl font-black text-[#111111] tracking-tighter leading-none mb-1">{s.value}</p>
            <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest">{s.label}</p>
            <p className="text-[8px] font-bold mt-1" style={{ color: s.accent }}>{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 items-start">

        {/* Left: Orders */}
        <div className="xl:col-span-8 space-y-8">

          {/* Live Orders */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
              <div>
                <h2 className="text-xl font-black text-[#111111] tracking-tighter">Live Orders</h2>
                <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mt-0.5">Priority Kitchen Queue</p>
              </div>
              <button
                onClick={() => router.push('/merchant/orders')}
                className="text-[10px] font-black text-[#d97757] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All <ChevronRight size={14} />
              </button>
            </div>

            <div className="divide-y divide-gray-50">
              {loading ? (
                <div className="py-16 flex flex-col items-center gap-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-full px-8">
                      <div className="h-20 bg-gray-50 rounded-xl animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <AnimatePresence>
                  {orders.map((order, idx) => {
                    const cfg = getStatusConfig(order.status);
                    const item = order.order_items?.[0]?.products?.name || 'Mixed Order';
                    const itemCount = order.order_items?.length || 1;
                    const time = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-5 px-8 py-5 hover:bg-[#fafafa] transition-colors group"
                      >
                        {/* Emoji */}
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                          {orderEmojis[idx % orderEmojis.length]}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <span className="text-sm font-black text-[#111111] tracking-tight truncate">
                              #{order.id.slice(0,8).toUpperCase()}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${cfg.pill}`}>
                              {cfg.icon} {cfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-[#888888] font-bold truncate">
                            <span className="text-[#111111]">{item}</span>
                            {itemCount > 1 && <span className="text-[#d97757]"> +{itemCount - 1} more</span>}
                            <span className="mx-2">·</span>
                            {order.customer?.name || 'Customer'}
                            <span className="mx-2">·</span>
                            {time}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="text-right hidden sm:block shrink-0">
                          <p className="text-base font-black text-[#111111] tracking-tighter">${Number(order.total_price || 0).toFixed(2)}</p>
                          <p className="text-[9px] font-bold text-[#888888] uppercase tracking-widest">Total</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Status Dropdown */}
                          {!['completed', 'delivering'].includes(order.status.toLowerCase()) ? (
                            <select
                              value={order.status}
                              onChange={e => { if (e.target.value && e.target.value !== order.status) updateStatus(order.id, e.target.value); }}
                              className="h-9 pl-3 pr-7 rounded-lg text-[9px] font-black uppercase tracking-wider bg-[#111111] text-white border-0 outline-none cursor-pointer appearance-none transition-all hover:bg-[#333] focus:ring-2 focus:ring-[#d97757]/40"
                              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                            >
                              <option value="pending"          disabled={order.status === 'pending'}>⏳ Pending</option>
                              <option value="accepted"         disabled={order.status === 'accepted'}>✅ Accept</option>
                              <option value="preparing"        disabled={order.status === 'preparing'}>🍳 Preparing</option>
                              <option value="ready_for_pickup" disabled={order.status === 'ready_for_pickup'}>📦 Ready</option>
                              <option value="cancelled">❌ Cancel</option>
                            </select>
                          ) : (
                            <span className="h-9 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider bg-gray-50 text-gray-300 border border-gray-100 flex items-center">
                              {order.status === 'completed' ? 'Done' : 'En Route'}
                            </span>
                          )}
                          <button
                            onClick={() => router.push('/merchant/orders')}
                            className="w-9 h-9 rounded-xl bg-gray-50 group-hover:bg-[#fef3f2] flex items-center justify-center text-gray-300 group-hover:text-[#d97757] border border-gray-100 transition-all"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              ) : (
                <div className="py-20 flex flex-col items-center gap-4 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                    <ShoppingBag size={28} className="text-gray-200" />
                  </div>
                  <p className="text-[10px] font-black text-[#888888] uppercase tracking-[0.3em]">No active orders</p>
                  <p className="text-xs text-gray-300 font-bold">New orders will appear here in real-time</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Tips */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              { icon: <ChefHat size={18} />, title: 'Accept Fast', desc: 'Orders accepted within 2 min get 4.9★ ratings on average.', color: '#d97757', bg: '#fef3f2' },
              { icon: <Zap size={18} />, title: 'Mark Ready Early', desc: 'Early pickup status reduces delivery time by ~8 minutes.', color: '#2563eb', bg: '#eff6ff' },
              { icon: <CheckCircle2 size={18} />, title: 'Low Cancellations', desc: 'Your cancellation rate is <2%. Keep it up!', color: '#16a34a', bg: '#f0fdf4' },
            ].map((tip, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tip.bg, color: tip.color }}>
                  {tip.icon}
                </div>
                <div>
                  <p className="text-xs font-black text-[#111111] tracking-tight mb-1">{tip.title}</p>
                  <p className="text-[10px] text-[#888888] font-medium leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Quick Add */}
        <aside className="xl:col-span-4 space-y-6 xl:sticky xl:top-8">

          {/* Quick Add Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50">
              <h3 className="text-lg font-black text-[#111111] tracking-tighter">Quick Add Product</h3>
              <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mt-0.5">Deploy to inventory instantly</p>
            </div>

            <form onSubmit={handleSaveProduct} className="p-8 space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#888888] uppercase tracking-widest">Product Name</label>
                <input
                  required
                  placeholder="e.g. Summer Harvest Salad"
                  value={productForm.title}
                  onChange={e => setProductForm({...productForm, title: e.target.value})}
                  className="w-full h-12 bg-[#f9f9f9] px-4 rounded-xl border border-transparent focus:border-[#d97757] outline-none text-sm font-bold text-[#111111] transition-all placeholder:text-gray-300"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#888888] uppercase tracking-widest">Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-black text-sm">$</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={productForm.price}
                    onChange={e => setProductForm({...productForm, price: e.target.value})}
                    className="w-full h-12 bg-[#f9f9f9] pl-8 pr-4 rounded-xl border border-transparent focus:border-[#d97757] outline-none text-sm font-bold text-[#111111] transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#888888] uppercase tracking-widest">Category</label>
                <select
                  value={productForm.category}
                  onChange={e => setProductForm({...productForm, category: e.target.value})}
                  className="w-full h-12 bg-[#f9f9f9] px-4 rounded-xl border border-transparent focus:border-[#d97757] outline-none text-sm font-bold text-[#111111] transition-all appearance-none cursor-pointer"
                >
                  {['Main Courses', 'Appetizers', 'Desserts', 'Beverages', 'Sides'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#888888] uppercase tracking-widest">Product Photo</label>
                <div className="w-full h-32 border-2 border-dashed border-gray-100 rounded-xl bg-[#f9f9f9] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#d97757]/40 hover:bg-[#fef3f2]/50 transition-all group/upload">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-200 group-hover/upload:text-[#d97757] shadow-sm transition-colors">
                    <Upload size={18} />
                  </div>
                  <p className="text-[10px] font-bold text-[#888888]">
                    Drop image or <span className="text-[#d97757]">browse</span>
                  </p>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-[#d97757] text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#c2654a] active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Plus size={14} /> Save Product</>
                )}
              </button>
            </form>
          </div>

          {/* Insights Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-[#f9f9f9] rounded-xl flex items-center justify-center text-[#111111] shrink-0">
              <BarChart3 size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest mb-1">Data Insights</p>
              <p className="text-sm font-black text-[#111111] leading-tight">Weekly report ready</p>
              <button className="text-[9px] font-black text-[#d97757] uppercase tracking-widest mt-1 hover:underline flex items-center gap-1">
                Download PDF <ChevronRight size={10} />
              </button>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Orders',    icon: <ShoppingBag size={18} />, path: '/merchant/orders' },
              { label: 'Inventory', icon: <PackageCheck size={18} />, path: '/merchant/inventory' },
              { label: 'Payouts',   icon: <DollarSign size={18} />,   path: '/merchant/payouts' },
              { label: 'Analytics', icon: <TrendingUp size={18} />,   path: '/merchant/dashboard' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => router.push(item.path)}
                className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-[#d97757]/30 hover:bg-[#fef3f2] text-[#888888] hover:text-[#d97757] transition-all group shadow-sm"
              >
                <div className="group-hover:scale-110 transition-transform">{item.icon}</div>
                <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
