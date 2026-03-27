'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Wallet, Package, DollarSign, TrendingUp, Calendar, ArrowUpRight, ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

export default function EarningsPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({ earnings: 0, deliveries: 0, delivery_fee: 3.00 });
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || user?.role !== 'driver') { router.push('/login'); return; }
    Promise.all([
      apiClient('/delivery/stats'),
      apiClient('/orders/driver')
    ]).then(([statsData, ordersData]) => {
      if (statsData) setStats({ earnings: statsData.earnings, deliveries: statsData.deliveries, delivery_fee: statsData.delivery_fee || 3.00 });
      if (ordersData && Array.isArray(ordersData)) {
        setHistory(ordersData.filter((o: any) => o.status === 'completed').slice(0, 20));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token, user, router]);

  const weeklyGoal = 10; // trips
  const progress = Math.min((stats.deliveries / weeklyGoal) * 100, 100);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#111111] tracking-tighter">Earnings</h1>
        <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest mt-0.5">Your delivery payout history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Earned', value: `$${stats.earnings.toFixed(2)}`, icon: <Wallet size={18} />, accent: '#d97757', bg: '#fef3f2', desc: 'All-time delivery fees' },
          { label: 'Deliveries', value: stats.deliveries, icon: <Package size={18} />, accent: '#2563eb', bg: '#eff6ff', desc: 'Completed trips' },
          { label: 'Per Delivery', value: `$${stats.delivery_fee.toFixed(2)}`, icon: <DollarSign size={18} />, accent: '#16a34a', bg: '#f0fdf4', desc: 'Fixed delivery fee' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg, color: s.accent }}>
                {s.icon}
              </div>
              <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest leading-tight">{s.label}</p>
            </div>
            <p className="text-3xl font-black text-[#111111] tracking-tighter">{s.value}</p>
            <p className="text-[10px] text-[#888888] mt-1 font-medium">{s.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly Progress */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-black text-[#111111] tracking-tight">Weekly Goal</p>
            <p className="text-[10px] text-[#888888] font-medium">{stats.deliveries} of {weeklyGoal} deliveries</p>
          </div>
          <span className="text-[10px] font-black text-[#d97757] uppercase tracking-wider">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-[#d97757] rounded-full"
          />
        </div>
        <p className="text-[10px] text-[#888888] font-medium mt-2">
          {stats.deliveries >= weeklyGoal ? '🎉 Goal reached!' : `${weeklyGoal - stats.deliveries} more to reach your weekly goal`}
        </p>
      </div>

      {/* How Earnings Work Info */}
      <div className="bg-[#eff6ff] rounded-2xl p-5 border border-blue-100 flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
          <TrendingUp size={18} />
        </div>
        <div>
          <p className="text-xs font-black text-[#111111] mb-1">How Your Pay Works</p>
          <p className="text-[11px] text-[#555555] font-medium leading-relaxed">
            You earn a <strong className="text-[#d97757]">${stats.delivery_fee.toFixed(2)} delivery fee</strong> per completed delivery.
            The product subtotal (order value) goes directly to the merchant.
            Simple, transparent, fair.
          </p>
        </div>
      </div>

      {/* Delivery History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-[#111111] tracking-tight">Delivery History</p>
            <p className="text-[10px] text-[#888888] font-medium">{history.length} completed trips</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-[#888888] uppercase tracking-wider">
            <Calendar size={14} /> All Time
          </div>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="py-20 text-center">
            <Package size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest">No completed deliveries yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {history.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="px-6 py-4 flex items-center justify-between hover:bg-[#fafafa] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#fef3f2] text-[#d97757] flex items-center justify-center">
                    <Package size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#111111]">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-[10px] text-[#888888] font-medium">
                      {order.stores?.name || 'Delivery'} · {new Date(order.updated_at || order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-green-600">+${stats.delivery_fee.toFixed(2)}</p>
                  <p className="text-[9px] text-[#888888] font-bold uppercase tracking-wide">Delivery Fee</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
