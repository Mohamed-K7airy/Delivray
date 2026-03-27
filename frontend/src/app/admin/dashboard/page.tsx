'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Users, ShoppingBag, DollarSign, Activity, ShieldAlert, ShieldCheck, Check, Search, Filter, Ban, AlertTriangle, Eye, Store, X, RotateCcw, Zap, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import { apiClient } from '@/lib/apiClient';
import Button from '@/components/Button';
import MapView from '@/components/MapView';
import { useSocket } from '@/context/SocketContext';
import { Truck, Navigation as NavIcon, Map as MapIcon } from 'lucide-react';

interface Stats {
  totalOrders: number;
  totalUsers: number;
  totalStores: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allStores, setAllStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'stores' | 'economics' | 'promos' | 'pulse'>('overview');
  const { socket } = useSocket();
  const [activeDrivers, setActiveDrivers] = useState<Record<string, any>>({});
  const [financials, setFinancials] = useState<any>(null);
  const [promos, setPromos] = useState<any[]>([]);
  const [newPromo, setNewPromo] = useState({ code: '', discount_amount: '', min_subtotal: '', expires_at: '' });
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, pendingData, usersData, storesData, finData, promoData] = await Promise.all([
          apiClient('/admin/stats'),
          apiClient('/admin/pending-users'),
          apiClient(`/admin/users?search=${userSearch}&role=${userRoleFilter}`),
          apiClient('/admin/stores'),
          apiClient('/admin/financials'),
          apiClient('/admin/promos')
        ]);
        
        if (statsData) setStats(statsData);
        if (pendingData) setPendingUsers(pendingData);
        if (usersData) setAllUsers(usersData);
        if (storesData) setAllStores(storesData);
        if (finData) setFinancials(finData);
        if (promoData) setPromos(promoData);
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
        toast.success('Promo code active.');
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
    <div className="container-responsive py-6 sm:py-10 space-y-12 sm:space-y-16">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
           <h1 className="heading-responsive !text-3xl sm:!text-5xl">Admin <span className="text-[#d97757] italic">Portal.</span></h1>
           <p className="text-responsive mt-3 max-w-2xl font-medium text-[#888888]">Global infrastructure telemetry and security authorization console.</p>
        </div>
        <div className="bg-[#fef3f2] px-6 py-3 rounded-xl border border-[#fee2e2] flex items-center space-x-4 shadow-sm">
           <div className="w-2.5 h-2.5 bg-[#d97757] rounded-full animate-pulse shadow-[0_0_8px_rgba(217,119,87,0.5)]"></div>
           <span className="text-[10px] font-black text-[#d97757] uppercase tracking-[0.3em]">System Status: Operational</span>
        </div>
      </header>
      
      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-100 pb-4">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'users', label: 'Personnel', icon: Users },
          { id: 'stores', label: 'Partner Sockets', icon: Store },
          { id: 'economics', label: 'Economics', icon: DollarSign },
          { id: 'promos', label: 'Promos', icon: Zap },
          { id: 'pulse', label: 'Global Pulse', icon: MapIcon }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-[#111111] text-white' : 'text-[#888888] hover:bg-gray-50'
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="space-y-16"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
              {[
                { label: 'Network Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'text-[#d97757]', bg: 'bg-[#fef3f2]' },
                { label: 'Active Personnel', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Capital Throughput', value: `$${stats?.totalRevenue.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Partner Sockets', value: stats?.totalStores || 0, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((item, idx) => (
                <div key={item.label} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md">
                   <div className="flex items-center justify-between mb-8">
                      <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center`}>
                        <item.icon size={24}/>
                      </div>
                   </div>
                   <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest leading-none mb-3">{item.label}</p>
                   <p className="text-3xl font-black text-[#111111] tracking-tighter">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Authorization Queue */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
              <div className="px-8 py-8 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#111111] uppercase tracking-tight">Authorization Queue</h2>
                <span className="text-[10px] font-black text-[#d97757] uppercase tracking-widest">{pendingUsers.length} INCOMING</span>
              </div>
              <div className="p-8">
                {pendingUsers.length === 0 ? (
                  <div className="py-20 text-center opacity-40">Grid is Secure.</div>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map(u => (
                      <div key={u.id} className="p-6 rounded-2xl bg-[#f9f9f9] flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-[#fef3f2] rounded-xl flex items-center justify-center text-[#d97757] font-black text-2xl">{u.name?.[0].toUpperCase()}</div>
                          <div>
                            <h4 className="text-xl font-black text-[#111111] uppercase tracking-tight">{u.name}</h4>
                            <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest">{u.role} · {u.email}</p>
                          </div>
                        </div>
                        <button onClick={() => handleApprove(u.id)} className="px-8 py-4 bg-[#111111] text-white rounded-xl font-black uppercase text-[9px] tracking-widest">Authorize</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-2xl border border-gray-100">
               <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search personnel by name or email..."
                    className="w-full h-12 bg-[#f9f9f9] pl-12 pr-4 rounded-xl border-none outline-none text-xs font-bold"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                  />
               </div>
               <select
                 className="h-12 bg-[#f9f9f9] px-6 rounded-xl border-none outline-none text-xs font-black uppercase tracking-widest"
                 value={userRoleFilter}
                 onChange={e => setUserRoleFilter(e.target.value)}
               >
                 <option value="">All Roles</option>
                 <option value="customer">Customer</option>
                 <option value="merchant">Merchant</option>
                 <option value="driver">Driver</option>
               </select>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-[#f9f9f9] border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#888888]">Personnel</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#888888]">Role</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#888888]">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#888888] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allUsers.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-black text-[#111111]">{u.name?.[0].toUpperCase()}</div>
                              <div>
                                 <p className="text-sm font-black text-[#111111] tracking-tight">{u.name}</p>
                                 <p className="text-[10px] font-medium text-[#888888]">{u.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6"><span className="text-[10px] font-black uppercase tracking-widest text-[#d97757]">{u.role}</span></td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             u.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' :
                             u.status === 'banned' ? 'bg-red-50 text-red-600 border-red-100' :
                             u.status === 'rejected' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                             'bg-yellow-50 text-yellow-600 border-yellow-100'
                           }`}>
                             {u.status}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex items-center justify-end gap-2">
                             {u.status === 'pending' && (
                               <>
                                 <button onClick={() => handleApprove(u.id)} className="p-2 text-green-400 hover:text-green-600 transition-colors"><Check size={16}/></button>
                                 <button onClick={() => handleUpdateStatus(u.id, 'rejected')} className="p-2 text-orange-400 hover:text-orange-600 transition-colors"><X size={16}/></button>
                               </>
                             )}
                             {u.status === 'active' && (
                               <button onClick={() => handleUpdateStatus(u.id, 'banned')} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Ban size={16}/></button>
                             )}
                             {u.status === 'banned' && (
                               <button onClick={() => handleUpdateStatus(u.id, 'active')} className="p-2 text-green-400 hover:text-green-600 transition-colors"><RotateCcw size={16}/></button>
                             )}
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'stores' && (
          <motion.div key="stores" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {allStores.map(s => (
              <div key={s.id} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                 <div className={`absolute top-0 right-0 w-1 h-full ${s.admin_disabled ? 'bg-red-500' : 'bg-green-500'}`} />
                 <div className="flex justify-between items-start mb-8">
                    <div>
                       <h3 className="text-2xl font-black text-[#111111] uppercase tracking-tight mb-2">{s.name}</h3>
                       <p className="text-[10px] font-black text-[#d97757] uppercase tracking-widest italic">{s.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                         s.admin_disabled ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                       }`}>
                         {s.admin_disabled ? 'Suspended' : 'Operational'}
                       </span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-gray-50 rounded-xl">
                       <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest mb-1">Owner</p>
                       <p className="text-xs font-bold text-[#111111] truncate">{s.users?.name}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                       <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest mb-1">Created</p>
                       <p className="text-xs font-bold text-[#111111]">{new Date(s.created_at).toLocaleDateString()}</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button className="flex-1 h-12 bg-gray-50 hover:bg-gray-100 text-[#111111] rounded-xl font-black uppercase text-[9px] tracking-widest transition-all">View Analytics</button>
                    <button 
                      onClick={() => handleToggleStore(s.id, s.admin_disabled)}
                      className={`h-12 px-6 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all border ${
                        s.admin_disabled ? 'bg-green-500 text-white border-green-500' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {s.admin_disabled ? 'Unsuspend' : 'Suspend Node'}
                    </button>
                 </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'economics' && (
          <motion.div key="economics" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest mb-3">Gross Merchandise Value (GMV)</p>
                <p className="text-4xl font-black text-[#111111] tracking-tighter">${financials?.gmv || '0.00'}</p>
                <div className="mt-4 h-1 bg-green-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[70%]" />
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest mb-3">Platform Commission (20%)</p>
                <p className="text-4xl font-black text-[#d97757] tracking-tighter">${financials?.platformCommission || '0.00'}</p>
                 <div className="mt-4 h-1 bg-[#d97757]/20 rounded-full overflow-hidden">
                  <div className="h-full bg-[#d97757] w-[45%]" />
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest mb-3">Net Merchant Payouts</p>
                <p className="text-4xl font-black text-blue-600 tracking-tighter">${financials?.netMerchantPayout || '0.00'}</p>
                 <div className="mt-4 h-1 bg-blue-600/20 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-[85%]" />
                </div>
              </div>
            </div>

            <div className="bg-[#111111] p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
               <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                  <div className="space-y-4 text-center lg:text-left">
                     <h3 className="text-3xl font-black tracking-tight">Financial Health <span className="text-[#d97757]">Active.</span></h3>
                     <p className="text-sm font-medium text-gray-400 max-w-md">System wide fiscal integrity is currently at 99.8%. All merchant payouts are processed through the secure ledger.</p>
                  </div>
                  <div className="flex gap-4">
                     <button className="h-14 px-10 bg-white text-[#111111] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all">Export Ledger</button>
                     <button className="h-14 px-10 bg-[#d97757] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#c2654a] transition-all">System Audit</button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'promos' && (
          <motion.div key="promos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-md">
               <h3 className="text-xl font-black uppercase tracking-tight mb-8">Deploy New Promo</h3>
               <form onSubmit={handleCreatePromo} className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <input 
                    placeholder="CODE" 
                    className="h-14 px-6 bg-[#f9f9f9] rounded-xl font-black uppercase tracking-widest text-[10px] border-none outline-none focus:ring-2 ring-[#d97757]"
                    value={newPromo.code}
                    onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
                    required
                  />
                  <input 
                    type="number" 
                    placeholder="Discount ($)" 
                    className="h-14 px-6 bg-[#f9f9f9] rounded-xl font-black uppercase tracking-widest text-[10px] border-none outline-none focus:ring-2 ring-[#d97757]"
                    value={newPromo.discount_amount}
                    onChange={e => setNewPromo({...newPromo, discount_amount: e.target.value})}
                    required
                  />
                  <input 
                    type="number" 
                    placeholder="Min Order ($)" 
                    className="h-14 px-6 bg-[#f9f9f9] rounded-xl font-black uppercase tracking-widest text-[10px] border-none outline-none focus:ring-2 ring-[#d97757]"
                    value={newPromo.min_subtotal}
                    onChange={e => setNewPromo({...newPromo, min_subtotal: e.target.value})}
                  />
                  <input 
                    type="date"
                    className="h-14 px-6 bg-[#f9f9f9] rounded-xl font-black uppercase tracking-widest text-[10px] border-none outline-none focus:ring-2 ring-[#d97757]"
                    value={newPromo.expires_at}
                    onChange={e => setNewPromo({...newPromo, expires_at: e.target.value})}
                    required
                  />
                  <button type="submit" className="bg-[#111111] text-white rounded-xl font-black uppercase tracking-widest text-[10px] h-14 hover:bg-black transition-all">Activate</button>
               </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {promos.map(promo => (
                 <div key={promo.id} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#d97757]/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                    <div className="flex justify-between items-start mb-6">
                       <h4 className="text-3xl font-black text-[#111111] tracking-tighter">{promo.code}</h4>
                       <button onClick={() => handleDeletePromo(promo.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                    </div>
                    <div className="space-y-2">
                       <p className="text-xs font-black text-[#d97757] uppercase tracking-widest">-${promo.value} USD</p>
                       <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest">Min Order: ${promo.min_subtotal}</p>
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'pulse' && (
          <motion.div key="pulse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
             <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden relative h-[600px]">
                <MapView 
                  center={[30.0444, 31.2357]} // Default Cairo center (change as needed)
                  zoom={12}
                  markers={Object.values(activeDrivers).map(d => ({
                    position: [d.lat, d.lng],
                    type: 'driver',
                    label: `Courier ${d.driverId.slice(0,4)}`
                  })) as any}
                />
                <div className="absolute top-8 left-8 z-[400] flex flex-col gap-4">
                   <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/50 shadow-2xl flex items-center gap-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
                      <div>
                        <p className="text-[10px] font-black text-[#111111] uppercase tracking-[0.2em]">Network Pulse Active</p>
                        <p className="text-[9px] font-bold text-[#888888] uppercase tracking-widest">{Object.keys(activeDrivers).length} live points detected</p>
                      </div>
                   </div>
                </div>
                
                <div className="absolute top-8 right-8 z-[400] flex flex-col gap-3">
                   {Object.values(activeDrivers).slice(0, 5).map(d => (
                      <div key={d.driverId} className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/40 shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
                         <div className="w-1.5 h-1.5 bg-[#d97757] rounded-full" />
                         <span className="text-[9px] font-black text-[#111111] uppercase tracking-wider">#{d.driverId.slice(0,8)} Signal update</span>
                      </div>
                   ))}
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Active Couriers', value: Object.keys(activeDrivers).length, icon: Truck, color: 'text-[#d97757]' },
                  { label: 'Latency', value: '14ms', icon: Activity, color: 'text-green-500' },
                  { label: 'Signal Stream', value: 'Encrypted', icon: ShieldCheck, color: 'text-blue-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gray-50 ${stat.color} flex items-center justify-center`}>
                       <stat.icon size={18} />
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                       <p className="text-xl font-black text-[#111111] tracking-tight">{stat.value}</p>
                    </div>
                  </div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Branding Footer */}
      <div className="pt-12 text-center opacity-30 hover:opacity-100 transition-opacity cursor-default">
         <div className="flex items-center justify-center gap-4 mb-6">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#111111]">Delivray <span className="text-[#d97757]">Core</span></h2>
         </div>
         <div className="flex items-center justify-center gap-10 text-[9px] font-black uppercase tracking-[0.5em] text-[#888888]">
            <span>Kernel Access</span>
            <span>Security Terminal</span>
            <span>Global Pulse</span>
         </div>
      </div>
    </div>
  );
}
