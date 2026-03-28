'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  CheckCircle2,
  Timer,
  ShoppingBag,
  ChefHat,
  PackageCheck,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { apiClient } from '@/lib/apiClient';

const STATUS_CONFIG: Record<string, { label: string; pill: string }> = {
  pending:          { label: 'Pending',    pill: 'bg-amber-50 text-amber-600 border-amber-200' },
  accepted:         { label: 'Accepted',   pill: 'bg-blue-50 text-blue-600 border-blue-200' },
  preparing:        { label: 'Preparing',  pill: 'bg-[#fef3f2] text-[#0f172a] border-[#fee2e2]' },
  ready_for_pickup: { label: 'Ready',      pill: 'bg-green-50 text-green-600 border-green-200' },
  delivering:       { label: 'Delivering', pill: 'bg-purple-50 text-purple-600 border-purple-200' },
  completed:        { label: 'Completed',  pill: 'bg-gray-50 text-gray-500 border-gray-200' },
  cancelled:        { label: 'Cancelled',  pill: 'bg-red-50 text-red-500 border-red-200' },
};

const FILTER_TABS = ['All', 'Pending', 'Accepted', 'Preparing', 'Ready', 'Delivering', 'Completed'];

export default function MerchantOrders() {
  const { token, user } = useAuthStore();
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalOrdersToday: 0, pendingOrders: 0, completedOrders: 0, todayRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!token || user?.role !== 'merchant') { router.push('/login'); return; }
    const fetchOrders = async () => {
      try {
        const [ordersData, statsData] = await Promise.all([
          apiClient('/orders/merchant'),
          apiClient('/orders/merchant/stats')
        ]);
        if (ordersData) setOrders(ordersData);
        if (statsData) setStats(statsData);
      } catch (err) {
        console.error('[MerchantOrders] Load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token, user?.role, router]);

  useEffect(() => {
    if (!socket || !isConnected) return;
    socket.on('new_order', (order: any) => {
      setOrders(prev => [order, ...prev]);
      toast.success(`New Order #${order.id.slice(0, 8)}`);
    });
    socket.on('order_status_updated', (updated: any) => {
      setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
    });
    return () => { socket.off('new_order'); socket.off('order_status_updated'); };
  }, [socket, isConnected]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const updated = await apiClient(`/orders/${orderId}/status`, { method: 'PATCH', data: { status } });
      if (updated) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        toast.success(`Order → ${status.replace(/_/g, ' ').toUpperCase()}`);
      }
    } catch (err) { console.error('[Status Update Error]', err); }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = activeFilter === 'All' ||
      o.status.toLowerCase().replace(/_/g, ' ') === activeFilter.toLowerCase() ||
      (activeFilter === 'Pending' && o.status === 'pending') ||
      (activeFilter === 'Accepted' && o.status === 'accepted') ||
      (activeFilter === 'Preparing' && o.status === 'preparing') ||
      (activeFilter === 'Ready' && o.status === 'ready_for_pickup') ||
      (activeFilter === 'Delivering' && o.status === 'delivering') ||
      (activeFilter === 'Completed' && o.status === 'completed');
    const matchesSearch = !searchQuery || 
      o.id.includes(searchQuery) ||
      o.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statCards = [
    { label: "Today's Orders", value: stats.totalOrdersToday, icon: <ShoppingBag size={18} />, accent: '#0f172a', bg: '#fef3f2' },
    { label: 'Pending',        value: stats.pendingOrders,    icon: <Timer size={18} />,       accent: '#0f172a', bg: '#fef3f2' },
    { label: 'Completed',      value: stats.completedOrders,  icon: <CheckCircle2 size={18} />, accent: '#16a34a', bg: '#f0fdf4' },
    { label: "Today's Revenue",value: `$${stats.todayRevenue.toFixed(2)}`, icon: <Zap size={18} />, accent: '#2563eb', bg: '#eff6ff' },
  ];

  return (
    <div className="space-y-6 pb-24">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111111] tracking-tighter">Orders</h1>
          <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mt-0.5">Live kitchen queue · {orders.length} total orders</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search order or customer..."
              className="h-10 pl-9 pr-4 bg-white border border-gray-100 rounded-xl text-xs font-bold text-[#111111] placeholder:text-gray-300 outline-none focus:border-[#0f172a] transition-all w-56"
            />
          </div>
          <button className="h-10 px-4 bg-white border border-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#888888] flex items-center gap-2 hover:bg-gray-50 transition-all">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg, color: s.accent }}>
              {s.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-[#111111] tracking-tighter leading-none">{s.value}</p>
              <p className="text-[9px] font-bold text-[#888888] uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`h-8 px-4 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-all border ${
              activeFilter === tab
                ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-sm'
                : 'bg-white text-[#888888] border-gray-200 hover:border-gray-300 hover:text-[#111111]'
            }`}
          >
            {tab}
          </button>
        ))}
        <span className="ml-2 text-[10px] font-bold text-[#888888] shrink-0">{filteredOrders.length} orders</span>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4 text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-3">
                      <div className="h-10 bg-gray-50 rounded-xl animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length > 0 ? (
                <AnimatePresence>
                  {filteredOrders.map((order, idx) => {
                    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['pending'];
                    const isTerminal = ['completed', 'delivering', 'cancelled'].includes(order.status);
                    return (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group hover:bg-[#fafafa] transition-colors"
                      >
                        {/* Order ID */}
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-[#0f172a] tracking-tight">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#fef3f2] flex items-center justify-center text-[10px] font-bold text-[#0f172a] border border-[#fee2e2]">
                              {order.customer?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-xs font-bold text-[#111111]">{order.customer?.name || 'Customer'}</span>
                          </div>
                        </td>

                        {/* Items */}
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-[#555555] max-w-[180px] block truncate">
                            {order.order_items?.[0]?.quantity}× {order.order_items?.[0]?.products?.name}
                            {order.order_items?.length > 1 && <span className="text-[#0f172a]"> +{order.order_items.length - 1}</span>}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-[#111111]">${Number(order.total_price).toFixed(2)}</span>
                        </td>

                        {/* Status Pill */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${cfg.pill}`}>
                            {cfg.label}
                          </span>
                        </td>

                        {/* Time */}
                        <td className="px-6 py-4 text-[10px] font-bold text-gray-400 whitespace-nowrap">
                          {new Date(order.created_at).toDateString() === new Date().toDateString()
                            ? `Today · ${new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </td>

                        {/* Status Dropdown */}
                        <td className="px-6 py-4 text-right">
                          {isTerminal ? (
                            <span className="h-9 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-gray-50 text-gray-300 border border-gray-100 inline-flex items-center">
                              {order.status === 'completed' ? '✓ Done' : order.status === 'cancelled' ? '✕ Cancelled' : '🚀 En Route'}
                            </span>
                          ) : (
                            <select
                              value={order.status}
                              onChange={e => { if (e.target.value !== order.status) updateStatus(order.id, e.target.value); }}
                              className="h-9 pl-3 pr-7 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-[#111111] text-white border-0 outline-none cursor-pointer appearance-none hover:bg-[#333] transition-all"
                              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                            >
                              <option value="pending"          disabled={order.status === 'pending'}>⏳ Pending</option>
                              <option value="accepted"         disabled={order.status === 'accepted'}>✅ Accept</option>
                              <option value="preparing"        disabled={order.status === 'preparing'}>🍳 Preparing</option>
                              <option value="ready_for_pickup" disabled={order.status === 'ready_for_pickup'}>📦 Ready</option>
                              <option value="cancelled">❌ Cancel</option>
                            </select>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <ShoppingBag size={40} />
                      <p className="text-[10px] font-bold uppercase tracking-[0.4em]">
                        {searchQuery || activeFilter !== 'All' ? 'No matching orders' : 'No orders yet'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filteredOrders.length > 0 && (
          <div className="px-6 py-4 bg-[#fafafa] border-t border-gray-50 flex items-center justify-between">
            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 rounded-lg text-gray-300 hover:text-[#111111] transition-all">
                <ChevronLeft size={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-[#0f172a] text-white rounded-lg text-[10px] font-bold">1</button>
              <button className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 rounded-lg text-gray-300 hover:text-[#111111] transition-all">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
