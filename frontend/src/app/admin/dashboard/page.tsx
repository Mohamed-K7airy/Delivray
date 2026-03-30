'use client';
import { useEffect, useState, Suspense } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, ShoppingBag, DollarSign, Activity, ShieldAlert, ShieldCheck, Check, Search, Filter, Ban, AlertTriangle, Eye, Store, X, RotateCcw, Zap, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import { apiClient } from '@/lib/apiClient';
import Button from '@/components/Button';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-50 animate-pulse flex items-center justify-center text-[10px] uppercase font-bold tracking-widest text-[#888888]">Initializing Live Map Tracking...</div>
});
import { useSocket } from '@/context/SocketContext';
import { Truck, Navigation as NavIcon, Map as MapIcon } from 'lucide-react';
import AnalyticsChart from '@/components/AnalyticsChart';

interface Stats {
  totalOrders: number;
  totalUsers: number;
  totalStores: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#0f172a] border-t-transparent rounded-full animate-spin"></div></div>}>
      <AdminDashboardContent />
    </Suspense>
  )
}

function AdminDashboardContent() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as 'overview' | 'users' | 'stores' | 'economics' | 'promos' | 'pulse' | 'fleet';
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allStores, setAllStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'stores' | 'economics' | 'promos' | 'pulse' | 'fleet'>(tabFromUrl || 'overview');

  useEffect(() => {
    if (tabFromUrl) setActiveTab(tabFromUrl);
  }, [tabFromUrl]);
  const { socket } = useSocket();
  const [activeDrivers, setActiveDrivers] = useState<Record<string, any>>({});
  const [financials, setFinancials] = useState<any>(null);
  const [promos, setPromos] = useState<any[]>([]);
  const [newPromo, setNewPromo] = useState({ code: '', discount_amount: '', min_subtotal: '', expires_at: '' });
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [schedulingData, setSchedulingData] = useState<any[]>([]);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, pendingData, usersData, storesData, finData, promoData, anData, schData, pendingPayoutsData] = await Promise.all([
          apiClient('/admin/stats'),
          apiClient('/admin/pending-users'),
          apiClient(`/admin/users?search=${userSearch}&role=${userRoleFilter}`),
          apiClient('/admin/stores'),
          apiClient('/admin/financials'),
          apiClient('/admin/promos'),
          apiClient('/admin/analytics'),
          apiClient('/scheduling/admin/all'),
          apiClient('/admin/pending-payouts')
        ]);
        
        if (statsData) setStats(statsData);
        if (pendingData) setPendingUsers(pendingData);
        if (usersData) setAllUsers(usersData);
        if (storesData) setAllStores(storesData);
        if (finData) setFinancials(finData);
        if (promoData) setPromos(promoData);
        if (anData) setAnalyticsData(anData);
        if (schData) setSchedulingData(schData);
        if (pendingPayoutsData) setPendingPayouts(pendingPayoutsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token, user, router, userSearch, userRoleFilter]);

  useEffect(() => {
    if (socket && activeTab === 'pulse') {
      socket.emit('join', { role: 'admin' });
      const handlePulse = (data: any) => {
        setActiveDrivers(prev => ({ ...prev, [data.driverId]: data }));
      };
      socket.on('driver_location_pulse', handlePulse);
      return () => { socket.off('driver_location_pulse', handlePulse); };
    }
  }, [socket, activeTab]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const data = await apiClient(`/admin/users/${id}/status`, {
        method: 'PATCH',
        data: { status }
      });
      if (data) {
        setAllUsers(allUsers.map(u => u.id === id ? { ...u, status } : u));
        toast.success(`User status updated to ${status}`);
      }
    } catch (err) {
      // apiClient handles toasts
    }
  };

  const handleToggleStore = async (id: string, currentStatus: boolean) => {
    try {
      const data = await apiClient(`/admin/stores/${id}/toggle-disable`, {
        method: 'PATCH',
        data: { admin_disabled: !currentStatus }
      });
      if (data) {
        setAllStores(allStores.map(s => s.id === id ? data : s));
        toast.success(`Store ${data.admin_disabled ? 'disabled' : 'enabled'}`);
      }
    } catch (err) {
      // apiClient handles toasts
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const data = await apiClient(`/admin/approve-user/${id}`, {
        method: 'PATCH'
      });
      if (data) {
        setPendingUsers(pendingUsers.filter(u => u.id !== id));
        toast.success('Core Authorization Granted.');
      }
    } catch (err) {
      // apiClient handles toasts
    }
  };

  const handleApprovePayout = async (id: string) => {
    try {
      const data = await apiClient(`/admin/payouts/${id}/approve`, {
        method: 'PATCH',
      });
      if (data) {
        toast.success('Payout approved and settled');
        setPendingPayouts(pendingPayouts.filter(p => p.id !== id));
        // Refresh financials
        const finData = await apiClient('/admin/financials');
        if (finData) setFinancials(finData);
      }
    } catch (err) {}
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiClient('/admin/promos', {
        method: 'POST',
        data: {
          ...newPromo,
          discount_amount: parseFloat(newPromo.discount_amount),
          min_subtotal: parseFloat(newPromo.min_subtotal) || 0
        }
      });
      if (data) {
        setPromos([data, ...promos]);
        setNewPromo({ code: '', discount_amount: '', min_subtotal: '', expires_at: '' });
        toast.success('Promotion created.');
      }
    } catch (err) {}
  };

  const handleDeletePromo = async (id: string) => {
    try {
      await apiClient(`/admin/promos/${id}`, { method: 'DELETE' });
      setPromos(promos.filter(p => p.id !== id));
      toast.success('Promo code revoked.');
    } catch (err) {}
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container-responsive py-8 sm:py-12 space-y-10 sm:space-y-14">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div>
             <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">Admin Console.</h1>
             <p className="text-slate-400 mt-2 max-w-2xl font-medium text-sm sm:text-base">Infrastructure telemetry and security authorization terminal.</p>
          </div>
          <div className="bg-white px-5 py-2.5 rounded-full border border-slate-100 flex items-center space-x-3 shadow-sm">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
             <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Signal: Operational</span>
          </div>
        </header>
        
        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'users', label: 'Personnel', icon: Users },
            { id: 'stores', label: 'Partner Sockets', icon: Store },
            { id: 'economics', label: 'Economics', icon: DollarSign },
            { id: 'promos', label: 'Promos', icon: Zap },
            { id: 'fleet', label: 'Fleet Schedule', icon: Truck },
            { id: 'pulse', label: 'Live Map Tracking', icon: MapIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => router.push(`/admin/dashboard?tab=${tab.id}`)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-white hover:text-slate-900'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
 
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-12"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                {[
                  { label: 'Network Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'text-slate-900' },
                  { label: 'Active Personnel', value: stats?.totalUsers || 0, icon: Users, color: 'text-slate-900' },
                  { label: 'Capital Flow', value: `${stats?.totalRevenue.toFixed(2) || '0.00'} ج.م`, icon: DollarSign, color: 'text-slate-900' },
                  { label: 'Partner Sockets', value: stats?.totalStores || 0, icon: Activity, color: 'text-slate-900' },
                ].map((item, idx) => (
                  <div key={item.label} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                     <div className="flex items-center justify-between mb-6">
                        <div className={`w-10 h-10 bg-slate-50 ${item.color} rounded-lg flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all`}>
                          <item.icon size={20}/>
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 group-hover:text-slate-900 transition-colors">LIVE</span>
                     </div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{item.label}</p>
                     <p className="text-3xl font-bold text-slate-900 tracking-tight">{item.value}</p>
                  </div>
                ))}
              </div>
              
              {/* Analytics Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AnalyticsChart data={analyticsData} type="orders" />
                <AnalyticsChart data={analyticsData} type="revenue" />
              </div>
 
              {/* Authorization Queue */}
              <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Authorization Queue</h2>
                  <span className="px-3 py-1 bg-slate-50 text-slate-900 rounded-full text-[9px] font-bold uppercase tracking-widest border border-slate-100">{pendingUsers.length} Pending</span>
                </div>
                <div className="p-8">
                  {pendingUsers.length === 0 ? (
                    <div className="py-20 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">Auth Grid is Secure.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingUsers.map(u => (
                        <div key={u.id} className="p-5 rounded-xl border border-slate-50 bg-slate-50/50 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-900 font-bold text-lg shadow-sm">{u.name?.[0].toUpperCase()}</div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{u.name}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.role} · {u.email}</p>
                            </div>
                          </div>
                          <button onClick={() => handleApprove(u.id)} className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold uppercase text-[9px] tracking-widest hover:bg-slate-800 transition-all">Authorize</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
 
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                 <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="text"
                      placeholder="Search personnel directory..."
                      className="w-full h-12 bg-slate-50 pl-11 pr-4 rounded-xl border border-transparent outline-none text-xs font-bold text-slate-900 placeholder-slate-300 focus:border-slate-100 focus:bg-white transition-all"
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                    />
                 </div>
                 <select
                   className="h-12 bg-slate-50 px-6 rounded-xl border border-transparent outline-none text-xs font-bold uppercase tracking-widest text-slate-900 cursor-pointer focus:bg-white transition-all"
                   value={userRoleFilter}
                   onChange={e => setUserRoleFilter(e.target.value)}
                 >
                   <option value="">All Roles</option>
                   <option value="customer">Customer</option>
                   <option value="merchant">Merchant</option>
                   <option value="driver">Driver</option>
                 </select>
              </div>
 
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-slate-50 border-b border-slate-100">
                         <tr>
                           <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Personnel</th>
                           <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Role</th>
                           <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                           <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                         {allUsers.map(u => (
                           <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-4">
                                   <div className="w-9 h-9 bg-white border border-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-900 text-xs shadow-sm">{u.name?.[0].toUpperCase()}</div>
                                   <div>
                                      <p className="text-sm font-bold text-slate-900 tracking-tight">{u.name}</p>
                                      <p className="text-[10px] font-medium text-slate-400">{u.email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-5"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">{u.role}</span></td>
                             <td className="px-8 py-5">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                                  u.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' :
                                  u.status === 'banned' ? 'bg-red-50 text-red-600 border-red-100' :
                                  'bg-slate-50 text-slate-400 border-slate-100'
                                }`}>
                                  {u.status}
                                </span>
                             </td>
                             <td className="px-8 py-5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {u.status === 'pending' && (
                                    <>
                                      <button onClick={() => handleApprove(u.id)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Check size={16}/></button>
                                      <button onClick={() => handleUpdateStatus(u.id, 'rejected')} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={16}/></button>
                                    </>
                                  )}
                                  {u.status === 'active' && (
                                    <button onClick={() => handleUpdateStatus(u.id, 'banned')} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Ban size={16}/></button>
                                  )}
                                  {u.status === 'banned' && (
                                    <button onClick={() => handleUpdateStatus(u.id, 'active')} className="p-2 text-slate-400 hover:text-green-500 transition-colors"><RotateCcw size={16}/></button>
                                  )}
                                </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            </motion.div>
          )}
 
          {activeTab === 'stores' && (
            <motion.div key="stores" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allStores.map(s => (
                <div key={s.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                   <div className="flex justify-between items-start mb-6">
                      <div>
                         <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-1">{s.name}</h3>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.type}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest border ${
                        s.admin_disabled ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-900 border-slate-100'
                      }`}>
                        {s.admin_disabled ? 'Suspended' : 'Operational'}
                      </span>
                   </div>
                   <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-4 mb-6">
                      <div>
                         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Owner</p>
                         <p className="text-xs font-bold text-slate-900 truncate">{s.users?.name}</p>
                      </div>
                      <div>
                         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Created</p>
                         <p className="text-xs font-bold text-slate-900">{new Date(s.created_at).toLocaleDateString()}</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button className="flex-1 h-11 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-lg font-bold uppercase text-[9px] tracking-widest transition-all">Analytics</button>
                      <button 
                        onClick={() => handleToggleStore(s.id, s.admin_disabled)}
                        className={`px-6 h-11 rounded-lg font-bold uppercase text-[9px] tracking-widest transition-all ${
                          s.admin_disabled ? 'bg-slate-900 text-white' : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
                        }`}
                      >
                        {s.admin_disabled ? 'Restore' : 'Suspend'}
                      </button>
                   </div>
                </div>
              ))}
            </motion.div>
          )}
 
          {activeTab === 'economics' && (
            <motion.div key="economics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Gross Merchandise Value (GMV)</p>
                  <p className="text-4xl font-bold text-slate-900 tracking-tight">{financials?.gmv || '0.00'} ج.م</p>
                </div>
                <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Platform Revenue (20%)</p>
                  <p className="text-4xl font-bold text-slate-900 tracking-tight">{financials?.platformCommission || '0.00'} ج.م</p>
                </div>
                <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Merchant Payouts</p>
                  <p className="text-4xl font-bold text-slate-900 tracking-tight">{financials?.netMerchantPayout || '0.00'} ج.م</p>
                </div>
              </div>
 
              <div className="bg-slate-900 p-10 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                 <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                    <div className="space-y-4">
                       <h3 className="text-3xl font-bold tracking-tight">Financial Overview</h3>
                       <p className="text-sm font-medium text-slate-400 max-w-md">Global fiscal integrity is currently at 99.8%. All merchant payouts are processed through the automated ledger.</p>
                    </div>
                    <div className="flex gap-4">
                       <button className="h-14 px-10 bg-white text-slate-900 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">Export Report</button>
                       <button className="h-14 px-10 bg-slate-800 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-all">Deep Audit</button>
                    </div>
                 </div>
              </div>

              {/* Pending Payouts List */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                      <DollarSign size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Pending Withdrawals</h3>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{pendingPayouts.length} requests awaiting settlement</p>
                    </div>
                  </div>
                </div>
                
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                  {pendingPayouts.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No pending payouts</p>
                    </div>
                  ) : (
                    pendingPayouts.map(payout => (
                      <div key={payout.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="text-xs font-bold text-slate-900 uppercase mb-1">
                            {payout.merchant?.name || payout.driver?.users?.name || 'Unknown Entity'}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-100 uppercase tracking-wider shadow-sm">{payout.payout_type?.replace('_', ' ')}</span>
                            <span className="text-[10px] text-slate-400">{new Date(payout.created_at || Date.now()).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                          <p className="text-xl font-bold text-slate-900 tracking-tight">{Number(payout.amount).toFixed(2)} ج.م</p>
                          <button 
                            onClick={() => handleApprovePayout(payout.id)}
                            className="h-9 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold uppercase text-[9px] tracking-widest transition-all shadow-sm"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

        {activeTab === 'promos' && (
          <motion.div key="promos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-10">
            <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
               <h3 className="text-sm font-bold uppercase tracking-widest mb-8 text-slate-900">Deploy New Promotion</h3>
               <form onSubmit={handleCreatePromo} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <input 
                    placeholder="CODE" 
                    className="h-12 px-5 bg-slate-50 rounded-lg font-bold uppercase tracking-widest text-[10px] border border-transparent outline-none focus:bg-white focus:border-slate-100 transition-all text-slate-900"
                    value={newPromo.code}
                    onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
                    required
                  />
                  <input 
                    type="number" 
                    placeholder="Discount (ج.م)" 
                    className="h-12 px-5 bg-slate-50 rounded-lg font-bold uppercase tracking-widest text-[10px] border border-transparent outline-none focus:bg-white focus:border-slate-100 transition-all text-slate-900"
                    value={newPromo.discount_amount}
                    onChange={e => setNewPromo({...newPromo, discount_amount: e.target.value})}
                    required
                  />
                  <input 
                    type="number" 
                    placeholder="Min Order (ج.م)" 
                    className="h-12 px-5 bg-slate-50 rounded-lg font-bold uppercase tracking-widest text-[10px] border border-transparent outline-none focus:bg-white focus:border-slate-100 transition-all text-slate-900"
                    value={newPromo.min_subtotal}
                    onChange={e => setNewPromo({...newPromo, min_subtotal: e.target.value})}
                  />
                  <input 
                    type="date"
                    className="h-12 px-5 bg-slate-50 rounded-lg font-bold uppercase tracking-widest text-[10px] border border-transparent outline-none focus:bg-white focus:border-slate-100 transition-all text-slate-900"
                    value={newPromo.expires_at}
                    onChange={e => setNewPromo({...newPromo, expires_at: e.target.value})}
                    required
                  />
                  <button type="submit" className="bg-slate-900 text-white rounded-lg font-bold uppercase tracking-widest text-[10px] h-12 hover:bg-slate-800 transition-all shadow-sm">Activate</button>
               </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {promos.map(promo => (
                 <div key={promo.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative group overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                       <h4 className="text-3xl font-bold text-slate-900 tracking-tight">{promo.code}</h4>
                       <button onClick={() => handleDeletePromo(promo.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    </div>
                    <div className="space-y-1">
                       <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">-{promo.value} ج.م</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min Order: {promo.min_subtotal} ج.م</p>
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'fleet' && (
          <motion.div key="fleet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-6">
             <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                         <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Driver</th>
                         <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                         <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Shift</th>
                         <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {schedulingData.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50/30 transition-colors">
                           <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-900 text-[10px] shadow-sm">{s.drivers?.users?.name?.[0]}</div>
                                 <p className="text-xs font-bold text-slate-900 tracking-tight">{s.drivers?.users?.name}</p>
                              </div>
                           </td>
                           <td className="px-8 py-5 text-xs font-bold text-slate-400">{new Date(s.date).toLocaleDateString()}</td>
                           <td className="px-8 py-5 text-[10px] font-bold text-slate-900 uppercase tracking-tight">{s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}</td>
                           <td className="px-8 py-5">
                              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-bold uppercase tracking-widest border border-green-100">{s.status}</span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
                {schedulingData.length === 0 && <div className="py-20 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">No Fleet Movements Scheduled</div>}
             </div>
          </motion.div>
        )}

        {activeTab === 'pulse' && (
          <motion.div key="pulse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-8">
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xl overflow-hidden relative h-[600px]">
                <MapView 
                  center={[30.0444, 31.2357]} 
                  zoom={12}
                  markers={Object.values(activeDrivers).map(d => ({
                    position: [d.lat, d.lng],
                    type: 'driver',
                    label: `Courier ${d.driverId.slice(0,4)}`
                  })) as any}
                />
                <div className="absolute top-8 left-8 z-[400] flex flex-col gap-4">
                   <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-xl border border-slate-100 shadow-2xl flex items-center gap-4">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Network Pulse Active</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{Object.keys(activeDrivers).length} active signals</p>
                      </div>
                   </div>
                </div>
                
                <div className="absolute top-8 right-8 z-[400] flex flex-col gap-2">
                   {Object.values(activeDrivers).slice(0, 5).map(d => (
                      <div key={d.driverId} className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-50 shadow-sm flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                         <div className="w-1 h-1 bg-slate-900 rounded-full" />
                         <span className="text-[9px] font-bold text-slate-900 uppercase tracking-widest">#{d.driverId.slice(0,8)} Signal update</span>
                      </div>
                   ))}
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Active Couriers', value: Object.keys(activeDrivers).length, icon: Truck },
                  { label: 'Signal Latency', value: '14ms', icon: Activity },
                  { label: 'Network Stream', value: 'Encrypted', icon: ShieldCheck },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:bg-slate-50 transition-colors">
                    <div className={`w-10 h-10 rounded-lg bg-slate-50 text-slate-900 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors`}>
                       <stat.icon size={18} />
                    </div>
                    <div>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                       <p className="text-xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                    </div>
                  </div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Branding Footer */}
      <footer className="pt-16 pb-8 text-center border-t border-slate-100 mt-20">
         <div className="flex items-center justify-center gap-3 mb-6">
            <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900 underline decoration-slate-200 underline-offset-8">Delivray Core.</h2>
         </div>
         <div className="flex items-center justify-center gap-8 text-[9px] font-bold uppercase tracking-[0.4em] text-slate-300">
            <span className="hover:text-slate-900 transition-colors cursor-default">Kernel Access</span>
            <span className="hover:text-slate-900 transition-colors cursor-default">Security Hub</span>
            <span className="hover:text-slate-900 transition-colors cursor-default">Signal Terminal</span>
         </div>
      </footer>
    </div>
  </div>
);
}
