'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Search, 
  Bell, 
  Filter, 
  Download, 
  MoreVertical, 
  Eye, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  CheckCircle2,
  Timer,
  ShoppingBag
} from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { apiClient } from '@/lib/apiClient';

const statsData = [
  { label: 'TOTAL ORDERS TODAY', value: '148', change: '+12% vs yesterday', icon: <ShoppingBag size={20} />, color: 'orange' },
  { label: 'PENDING ORDERS', value: '24', change: '', icon: <Timer size={20} />, color: 'red' },
  { label: 'COMPLETED ORDERS', value: '112', change: '', icon: <CheckCircle2 size={20} />, color: 'green' },
];

export default function MerchantOrders() {
  const { token, user } = useAuthStore();
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== 'merchant') {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await apiClient('/orders/merchant');
        if (data) setOrders(data);
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

    socket.on('new_order', (order) => {
      setOrders(prev => [order, ...prev]);
      toast.success(`New Order #${order.id.slice(0, 8)}`);
    });

    socket.on('order_status_updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
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
        toast.success(`Order status updated to ${status}`);
      }
    } catch (err) {
      console.error('[Status Update Error]', err);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'preparing': return 'bg-orange-50 text-orange-500 border-orange-100';
      case 'delivering': case 'out for delivery': return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'completed': case 'delivered': return 'bg-green-50 text-green-500 border-green-100';
      case 'pending': return 'bg-gray-50 text-gray-500 border-gray-100';
      default: return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  };

  return (
    <div className="space-y-10 lg:space-y-12 pb-24">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
        {statsData.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-black/5 transition-all"
          >
            <div className="flex items-center justify-between mb-8 relative z-10">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  stat.color === 'orange' ? 'bg-orange-50 text-orange-500' : 
                  stat.color === 'red' ? 'bg-red-50 text-red-500' : 
                  'bg-green-50 text-green-500'
               }`}>
                  {stat.icon}
               </div>
               {stat.change && (
                  <span className="bg-green-50 text-green-500 text-[9px] font-black px-3 py-1 rounded-full border border-green-100">
                     {stat.change}
                  </span>
               )}
            </div>
            <div className="relative z-10">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
               <h3 className="text-5xl font-black text-[#0A0A0A] tracking-tighter leading-none">{stat.value}</h3>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 ${
               stat.color === 'orange' ? 'text-orange-500' : stat.color === 'red' ? 'text-red-500' : 'text-green-500'
            }`}>
               {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content: Recent Orders */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-gray-50">
           <div>
              <h2 className="text-2xl font-black text-[#0A0A0A] tracking-tighter">Recent Orders</h2>
           </div>
           <div className="flex items-center gap-4">
              <button className="h-12 px-6 bg-[#F8F8F8] text-[#0A0A0A] rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center gap-3 hover:bg-gray-100 transition-all">
                 <Filter size={14} />
                 Filter
              </button>
              <button className="h-12 px-6 bg-[#F8F8F8] text-[#0A0A0A] rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center gap-3 hover:bg-gray-100 transition-all">
                 <Download size={14} />
                 Export
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <th className="px-10 py-6">Order ID</th>
                    <th className="px-10 py-6">Customer</th>
                    <th className="px-10 py-6">Items</th>
                    <th className="px-10 py-6">Total</th>
                    <th className="px-10 py-6">Status</th>
                    <th className="px-10 py-6">Date/Time</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {orders.length > 0 ? orders.map((order, idx) => (
                    <motion.tr 
                       key={order.id}
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       transition={{ delay: idx * 0.05 }}
                       className="group hover:bg-[#F8F8F8] transition-all cursor-pointer"
                    >
                       <td className="px-10 py-8">
                          <span className="text-sm font-black text-[#FF5A3C] tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</span>
                       </td>
                       <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 border border-white">
                                {order.customer?.users?.name?.[0] || 'U'}
                             </div>
                             <span className="text-sm font-bold text-[#0A0A0A]">{order.customer?.users?.name || 'Customer'}</span>
                          </div>
                       </td>
                       <td className="px-10 py-8">
                          <span className="text-sm font-medium text-gray-500 max-w-[200px] block truncate">
                             {order.order_items?.[0]?.quantity}x {order.order_items?.[0]?.products?.name}
                             {order.order_items?.length > 1 && `, +${order.order_items.length - 1} more`}
                          </span>
                       </td>
                       <td className="px-10 py-8">
                          <span className="text-sm font-black text-[#0A0A0A]">${Number(order.total_price).toFixed(2)}</span>
                       </td>
                       <td className="px-10 py-8">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                             {order.status.replace(/_/g, ' ')}
                          </span>
                       </td>
                       <td className="px-10 py-8 text-xs font-bold text-gray-400">
                          Today, {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </td>
                       <td className="px-10 py-8 text-right">
                          <div className="flex items-center justify-end gap-4">
                             <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[#0A0A0A] transition-all">
                                <Eye size={16} />
                             </button>
                             {order.status === 'pending' && (
                                <button 
                                   onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'accepted'); }}
                                   className="h-10 px-6 bg-[#0A0A0A] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#333] transition-all"
                                >
                                   Accept
                                </button>
                             )}
                             {order.status === 'accepted' && (
                                <button 
                                   onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'preparing'); }}
                                   className="h-10 px-6 bg-[#FF5A3C] text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#E84A2C] transition-all"
                                >
                                   Prepare
                                </button>
                             )}
                             {order.status === 'preparing' && (
                                <button 
                                   onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'ready_for_pickup'); }}
                                   className="h-10 px-6 bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                                >
                                   Ready
                                </button>
                             )}
                             {order.status !== 'pending' && order.status !== 'preparing' && order.status !== 'accepted' && (
                                <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-gray-300">
                                   <MoreVertical size={16} />
                                </button>
                             )}
                          </div>
                       </td>
                    </motion.tr>
                 )) : (
                    <tr>
                       <td colSpan={7} className="px-10 py-32 text-center">
                          <div className="flex flex-col items-center gap-6 opacity-20">
                             <ShoppingBag size={48} />
                             <p className="text-[10px] font-black uppercase tracking-[0.5em]">No recent signals</p>
                          </div>
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>

        {/* Pagination Placeholder */}
        <div className="p-10 bg-[#F8F8F8]/50 border-t border-gray-50 flex items-center justify-between">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Showing 1-10 of 48 orders</p>
           <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-gray-300 hover:text-[#0A0A0A] transition-all">
                 <ChevronLeft size={16} />
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-[#FF5A3C] text-white rounded-xl text-[10px] font-black">1</button>
              <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 hover:bg-gray-50 transition-all">2</button>
              <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 hover:bg-gray-50 transition-all">3</button>
              <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl text-gray-300 hover:text-[#0A0A0A] transition-all">
                 <ChevronRight size={16} />
              </button>
           </div>
        </div>
      </div>

      {/* Lunch Rush Detected Banner */}
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-[#F8F8F8] border-l-4 border-orange-500 rounded-3xl p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-8"
      >
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20">
               <Zap size={24} className="fill-current" />
            </div>
            <div>
               <h4 className="text-xl font-black text-[#0A0A0A] tracking-tighter mb-1">Lunch Rush Detected</h4>
               <p className="text-sm font-medium text-gray-400">Order volume is 30% higher than average. Consider increasing prep time slightly.</p>
            </div>
         </div>
         <button className="h-14 px-10 bg-white text-[#0A0A0A] border border-gray-100 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all shadow-sm">
            Adjust Prep Time
         </button>
      </motion.div>

    </div>
  );
}
