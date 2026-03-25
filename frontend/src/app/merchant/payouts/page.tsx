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
       {/* High-Fidelity Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
             <h1 className="text-6xl font-black uppercase tracking-tighter text-white">Payouts</h1>
             <p className="text-gray-500 font-bold text-sm">Financial telemetry and transaction settlement history.</p>
          </div>
          <div className="bg-[#1a1a1a] px-6 py-3 rounded-xl border border-white/5 flex items-center space-x-6 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
             <div className="flex items-center space-x-3 text-primary">
                <Lock size={14} className="stroke-[3]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Settlement</span>
             </div>
             <div className="h-4 w-px bg-white/10"></div>
             <div className="flex items-center space-x-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Next Payout:</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">24h</span>
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
                className="bg-[#1a1a1a] p-10 rounded-[2.5rem] border border-white/5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden group hover:border-primary/20 transition-all"
             >
                <div className="absolute -top-4 -right-4 text-white/[0.03] group-hover:text-primary/5 transition-colors transform rotate-12">
                   {stat.icon}
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-700 mb-8">
                   {stat.icon}
                </div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-3">{stat.label}</p>
                <h3 className={`text-4xl font-black ${stat.color === 'primary' ? 'text-primary' : 'text-white'} tracking-tighter`}>{stat.value}</h3>
             </motion.div>
          ))}
       </div>

       {/* Modernized Transaction History */}
       <div className="bg-[#151515] p-10 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center space-x-5 mb-14 relative z-10">
             <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10">
                <CreditCard size={20} />
             </div>
             <h2 className="text-2xl font-black uppercase tracking-widest italic">Transaction History</h2>
          </div>

          <div className="space-y-6 relative z-10">
             {loading ? (
                <div className="py-20 text-center text-gray-700 font-black uppercase tracking-widest text-xs animate-pulse">Loading telemetry...</div>
             ) : transactions.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                   <CreditCard size={40} className="mx-auto text-gray-800 mb-4 opacity-50" />
                   <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">No transaction history found.</p>
                </div>
             ) : transactions.map((tx, idx) => (
                <motion.div 
                   key={idx}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.3 + (idx * 0.1) }}
                   className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-all group cursor-pointer"
                >
                   <div className="flex items-center space-x-8">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-700 transition-colors group-hover:text-primary">
                         <ArrowDownRight size={20} />
                      </div>
                      <div className="space-y-1">
                         <h4 className="font-black uppercase tracking-tighter text-xl text-white">{tx.id}</h4>
                         <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em]">{new Date(tx.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</p>
                      </div>
                   </div>
                   <div className="text-right space-y-2">
                      <p className="text-3xl font-black tracking-tightest text-white">${Number(tx.amount).toFixed(2)}</p>
                      <div className="flex items-center justify-end space-x-2">
                         <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${tx.status === 'settled' ? 'bg-primary' : 'bg-yellow-500'}`}></div>
                         <span className={`text-[9px] font-black uppercase tracking-widest italic ${tx.status === 'settled' ? 'text-primary' : 'text-yellow-500'}`}>{tx.status}</span>
                      </div>
                   </div>
                </motion.div>
             ))}
          </div>
          
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-40 opacity-30"></div>
       </div>
    </div>
  );
}
