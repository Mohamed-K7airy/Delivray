'use client';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Store as StoreIcon, 
  LayoutDashboard, 
  Database, 
  CreditCard, 
  Settings, 
  Headset, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  ShieldCheck,
  Package,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface MerchantSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function MerchantSidebar({ isCollapsed, setIsCollapsed }: MerchantSidebarProps) {
  const { logout, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/merchant/dashboard' },
      { id: 'orders', label: 'Orders', icon: <Package size={20} />, path: '/merchant/orders' },
      { id: 'inventory', label: 'Inventory', icon: <Database size={20} />, path: '/merchant/inventory' },
    { id: 'payouts', label: 'Payouts', icon: <CreditCard size={20} />, path: '/merchant/payouts' },
    { id: 'settings', label: 'Store Settings', icon: <Settings size={20} />, path: '/merchant/settings' },
    { id: 'support', label: 'Support', icon: <Headset size={20} />, path: '/merchant/support' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
    toast.success('Logged out from Merchant Central');
  };

  return (
    <aside 
      className={`h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-[100] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hidden md:flex ${
        isCollapsed ? 'w-20' : 'w-64 lg:w-72'
      }`}
    >
      {/* Header / Logo */}
      <div className={`h-24 flex items-center justify-between px-6 border-b border-slate-50 transition-all duration-300 ${isCollapsed ? 'px-4' : ''}`}>
        {!isCollapsed && (
          <div 
            className="flex items-center gap-3.5 cursor-pointer group" 
            onClick={() => router.push('/')}
          >
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
              <Zap size={20} className="text-white fill-current" />
            </div>
            <div className="flex flex-col">
               <span className="text-xl font-bold text-slate-900 tracking-tight leading-none">Delivray.</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Management</span>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button 
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-slate-50 text-slate-900 border border-slate-100' 
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50/50'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <div className={`${isActive ? 'text-slate-900' : 'text-slate-300 group-hover:text-slate-900 group-hover:scale-105'} transition-all duration-300 relative z-10 w-5 h-5 flex items-center justify-center`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className={`text-[11px] font-bold uppercase tracking-widest relative z-10 transition-all duration-300 ${isActive ? 'translate-x-0.5' : 'group-hover:translate-x-0.5 opacity-80 group-hover:opacity-100'}`}>
                   {item.label}
                </span>
              )}
              {isActive && !isCollapsed && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-5 bg-slate-900 rounded-r-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-6 space-y-6">
        {!isCollapsed && (
          <button 
            onClick={() => toast.success('Server connection established.')}
            className="w-full bg-slate-100 text-slate-900 border border-slate-200 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-900 hover:text-white transition-all shadow-sm"
          >
            System Online
          </button>
        )}
        
        <div className={`flex flex-col gap-4 ${isCollapsed ? 'items-center' : ''}`}>
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-4 text-[#888888] hover:text-[#111111] transition-all group px-4 py-2 rounded-xl hover:bg-[#f8fafc] ${isCollapsed ? 'justify-center p-0' : ''}`}
          >
            <div className="w-8 h-8 flex items-center justify-center bg-gray-50 group-hover:bg-white rounded-lg shadow-sm group-hover:text-red-500 group-hover:shadow-md transition-all">
               <LogOut size={16} />
            </div>
            {!isCollapsed && <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100">Sign Out</span>}
          </button>
          
          {!isCollapsed && (
            <div className="px-4 py-4 bg-[#f8fafc] rounded-2xl border border-[#f0f0f0] flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-white border border-[#f5f5f5] flex items-center justify-center overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=${user?.name || 'M'}&background=d97757&color=fff`} className="w-full h-full object-cover" />
               </div>
               <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-[#111111] truncate uppercase tracking-tight">{user?.name || 'Merchant'}</span>
                  <span className="text-[8px] font-bold text-[#888888] uppercase tracking-widest leading-none mt-0.5">Primary Node</span>
               </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
