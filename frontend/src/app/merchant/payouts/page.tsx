'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, TrendingUp, ArrowDownRight, Clock, ShieldCheck, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { API_URL } from '@/config/api';

export default function MerchantPayouts() {
  const { token } = useAuthStore();
  const [balance, setBalance] = useState({ available_balance: 0, pending_payouts: 0, total_withdrawn: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balRes, payRes] = await Promise.all([
          fetch(`${API_URL}/stores/balance`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/stores/payouts`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (balRes.ok) setBalance(await balRes.json());
        if (payRes.ok) setTransactions(await payRes.json());
      } catch (err) {
        console.error('Error fetching payout data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const stats = [
    { label: 'Available Balance', value: `$${balance.available_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <DollarSign size={40} />, color: 'primary' },
    { label: 'Pending Payouts', value: `$${balance.pending_payouts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <Clock size={40} />, color: 'white' },
    { label: 'Total Withdrawn', value: `$${balance.total_withdrawn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <TrendingUp size={40} />, color: 'white' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-16 px-4">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           <div className="space-y-2">
              <h1 className="text-3xl sm:text-6xl font-black uppercase tracking-tighter text-[#111111]">Payouts</h1>
              <p className="text-[#888888] font-bold text-sm">Financial telemetry and transaction settlement history.</p>
           </div>
           <div className="bg-white px-6 py-3 rounded-xl border border-gray-100 flex items-center space-x-6 shadow-sm">
              <div className="flex items-center space-x-3 text-[#d97757]">
                 <Lock size={14} className="stroke-[3]" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Settlement</span>
              </div>
              <div className="h-4 w-px bg-gray-100"></div>
              <div className="flex items-center space-x-3">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#888888]">Next Payout:</span>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111]">24h</span>
              </div>
           </div>
        </div>

        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {stats.map((stat, idx) => (
              <motion.div 
                 key={idx}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.1 }}
                 className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-100 shadow-md relative overflow-hidden group hover:shadow-xl transition-all"
              >
                 <div className="absolute -top-4 -right-4 text-[#d97757]/[0.05] transform rotate-12">
                    {stat.icon}
                 </div>
                 <div className="w-12 h-12 bg-[#f9f9f9] rounded-xl flex items-center justify-center text-[#d97757] border border-gray-100 mb-8 shadow-inner">
                    {stat.icon}
                 </div>
                 <p className="text-[10px] font-black text-[#888888] uppercase tracking-[0.3em] mb-3">{stat.label}</p>
                 <h3 className={`text-4xl font-black ${stat.color === 'primary' ? 'text-[#d97757]' : 'text-[#111111]'} tracking-tighter`}>{stat.value}</h3>
              </motion.div>
           ))}
        </div>

        {/* Transaction History */}
        <div className="bg-white p-6 sm:p-12 rounded-2xl border border-gray-100 shadow-xl relative overflow-hidden">
           <div className="flex items-center space-x-5 mb-14 relative z-10">
              <div className="w-10 h-10 bg-[#f9f9f9] rounded-xl flex items-center justify-center text-[#111111] border border-gray-100">
                 <CreditCard size={20} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-widest italic text-[#111111]">Transaction History</h2>
           </div>

           <div className="space-y-6 relative z-10">
              {loading ? (
                 <div className="py-20 text-center text-[#888888] font-black uppercase tracking-widest text-xs animate-pulse">Loading telemetry...</div>
              ) : transactions.length === 0 ? (
                 <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                    <CreditCard size={40} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-[#888888] font-bold uppercase tracking-widest text-[10px]">No transaction history found.</p>
                 </div>
              ) : transactions.map((tx, idx) => (
                 <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                    className="bg-[#f9f9f9] p-8 rounded-xl border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-lg transition-all group cursor-pointer"
                 >
                    <div className="flex items-center space-x-8">
                       <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#888888] transition-colors group-hover:text-[#d97757] border border-gray-100 shadow-sm">
                          <ArrowDownRight size={20} />
                       </div>
                       <div className="space-y-1">
                          <h4 className="font-black uppercase tracking-tighter text-xl text-[#111111]">{tx.id}</h4>
                          <p className="text-[9px] font-bold text-[#888888] uppercase tracking-[0.3em]">{new Date(tx.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</p>
                       </div>
                    </div>
                    <div className="text-right space-y-2">
                       <p className="text-3xl font-black tracking-tighter text-[#111111]">${Number(tx.amount).toFixed(2)}</p>
                       <div className="flex items-center justify-end space-x-2">
                          <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${tx.status === 'settled' ? 'bg-[#d97757]' : 'bg-yellow-500'}`}></div>
                          <span className={`text-[9px] font-black uppercase tracking-widest italic ${tx.status === 'settled' ? 'text-[#d97757]' : 'text-yellow-500'}`}>{tx.status}</span>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </div>
           
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d97757]/5 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-40 opacity-30"></div>
       </div>
    </div>
  );
}
