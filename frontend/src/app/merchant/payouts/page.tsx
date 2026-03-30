'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, TrendingUp, ArrowDownRight, Clock, ShieldCheck, Lock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

export default function MerchantPayouts() {
  const { token } = useAuthStore();
  const [balance, setBalance] = useState({ available_balance: 0, pending_payouts: 0, total_withdrawn: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) return toast.error('Enter a valid amount');
    if (amount > balance.available_balance) return toast.error('Insufficient available balance');

    try {
      setWithdrawing(true);
      const res = await apiClient('/stores/withdraw', {
        method: 'POST',
        data: { amount }
      });
      if (res) {
        toast.success(`Withdrawal request for ${amount.toFixed(2)} ج.م submitted successfully`);
        setWithdrawAmount('');
        // Refresh data
        const [balData, payData] = await Promise.all([
          apiClient('/stores/balance'),
          apiClient('/stores/payouts')
        ]);
        if (balData) setBalance(balData);
        if (payData) setTransactions(payData);
      }
    } catch (err) {
      // apiClient already shows toast on error
    } finally {
      setWithdrawing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balData, payData] = await Promise.all([
          apiClient('/stores/balance'),
          apiClient('/stores/payouts')
        ]);

        if (balData) setBalance(balData);
        if (payData) setTransactions(payData);
      } catch (err) {
        console.error('Error fetching payout data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const stats = [
    { label: 'Available Balance', value: `${balance.available_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م`, icon: <DollarSign size={40} />, color: 'primary' },
    { label: 'Pending Payouts', value: `${balance.pending_payouts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م`, icon: <Clock size={40} />, color: 'white' },
    { label: 'Total Withdrawn', value: `${balance.total_withdrawn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م`, icon: <TrendingUp size={40} />, color: 'white' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-16 px-4">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           <div className="space-y-2">
              <h1 className="text-3xl sm:text-6xl font-bold uppercase tracking-tighter text-[#111111]">Payouts</h1>
              <p className="text-[#888888] font-bold text-sm">Financial telemetry and transaction settlement history.</p>
           </div>
           <div className="bg-white px-6 py-3 rounded-xl border border-gray-100 flex items-center space-x-6 shadow-sm">
              <div className="flex items-center space-x-3 text-[#0f172a]">
                 <Lock size={14} className="stroke-[3]" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure Settlement</span>
              </div>
              <div className="h-4 w-px bg-gray-100"></div>
              <div className="flex items-center space-x-3">
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888]">Next Payout:</span>
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111111]">24h</span>
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
                 className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-md relative overflow-hidden group hover:shadow-xl transition-all flex items-center gap-4 sm:gap-6"
              >
                 <div className="absolute -top-4 -right-4 text-[#0f172a]/[0.05] transform rotate-12 pointer-events-none">
                    {stat.icon}
                 </div>
                 <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-[#f8fafc] rounded-xl flex items-center justify-center text-[#0f172a] border border-gray-100 shadow-inner">
                    {stat.icon}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[8px] sm:text-[10px] font-bold text-[#888888] uppercase tracking-widest sm:tracking-[0.3em] mb-0.5 sm:mb-1 truncate">{stat.label}</p>
                    <h3 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${stat.color === 'primary' ? 'text-[#0f172a]' : 'text-[#111111]'} tracking-tighter truncate`}>{stat.value}</h3>
                 </div>
              </motion.div>
           ))}
         </div>

        {/* Withdrawal Action */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-100 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex-1 space-y-2 relative z-10 text-center md:text-left">
              <h3 className="text-2xl font-bold uppercase tracking-widest text-[#111111]">Request Payout</h3>
              <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest leading-relaxed max-w-sm">Enter the amount you wish to withdraw to your linked bank account. Minimum withdrawal is 50.00 ج.م.</p>
           </div>
           <form onSubmit={handleWithdraw} className="w-full md:w-auto flex flex-col md:flex-row items-center gap-3 relative z-10">
              <div className="relative w-full md:w-64">
                 <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" />
                 <input 
                   type="number" 
                   step="0.01"
                   min="50"
                   max={balance.available_balance}
                   placeholder="Amount (ج.م)" 
                   className="w-full h-14 pl-12 pr-4 bg-[#f8fafc] border border-gray-100 rounded-xl text-sm font-bold text-[#111111] placeholder-[#888888] focus:border-[#0f172a] focus:bg-white outline-none transition-all"
                   value={withdrawAmount}
                   onChange={e => setWithdrawAmount(e.target.value)}
                   disabled={withdrawing}
                   required
                 />
              </div>
              <button 
                type="submit" 
                disabled={withdrawing || balance.available_balance < 50}
                className="w-full md:w-auto h-14 px-8 bg-[#0f172a] text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#111111] transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {withdrawing ? 'Processing...' : 'Withdraw Funds'}
              </button>
           </form>
           
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#0f172a]/5 rounded-full blur-[100px] pointer-events-none -mr-40 -mt-40 opacity-50"></div>
        </div>

        {/* Transaction History */}
        <div className="bg-white p-6 sm:p-12 rounded-2xl border border-gray-100 shadow-xl relative overflow-hidden">
           <div className="flex items-center space-x-5 mb-14 relative z-10">
              <div className="w-10 h-10 bg-[#f8fafc] rounded-xl flex items-center justify-center text-[#111111] border border-gray-100">
                 <CreditCard size={20} />
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-widest italic text-[#111111]">Transaction History</h2>
           </div>

           <div className="space-y-6 relative z-10">
              {loading ? (
                 <div className="py-20 text-center text-[#888888] font-bold uppercase tracking-widest text-xs animate-pulse">Loading telemetry...</div>
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
                    className="bg-[#f8fafc] p-4 sm:p-6 rounded-xl border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-lg transition-all group cursor-pointer"
                 >
                    <div className="flex items-center space-x-4 sm:space-x-6 min-w-0">
                       <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-white rounded-xl flex items-center justify-center text-[#888888] transition-colors group-hover:text-[#0f172a] border border-gray-100 shadow-sm">
                          <ArrowDownRight size={18} />
                       </div>
                       <div className="space-y-0.5 sm:space-y-1 min-w-0">
                          <h4 className="font-bold uppercase tracking-tight text-sm sm:text-lg text-[#111111] truncate">{tx.id}</h4>
                          <p className="text-[8px] sm:text-[9px] font-bold text-[#888888] uppercase tracking-widest sm:tracking-[0.3em] truncate">{new Date(tx.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</p>
                       </div>
                    </div>
                    <div className="text-right space-y-1 sm:space-y-2 shrink-0 ml-4">
                       <p className="text-lg sm:text-2xl font-bold tracking-tighter text-[#111111] whitespace-nowrap">{Number(tx.amount).toFixed(2)} ج.م</p>
                       <div className="flex items-center justify-end space-x-1.5 sm:space-x-2">
                          <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${tx.status === 'settled' ? 'bg-[#0f172a]' : 'bg-yellow-500'}`}></div>
                          <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widest italic ${tx.status === 'settled' ? 'text-[#0f172a]' : 'text-yellow-500'}`}>{tx.status}</span>
                       </div>
                    </div>
                 </motion.div>
              ))}
           </div>
           
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0f172a]/5 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-40 opacity-30"></div>
       </div>
    </div>
  );
}
