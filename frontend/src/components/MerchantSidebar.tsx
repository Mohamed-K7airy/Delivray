'use client';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
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
  isMobileOpen?: boolean;
  setIsMobileOpen?: (val: boolean) => void;
}

export default function MerchantSidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: MerchantSidebarProps) {
  return (
    <Suspense fallback={<aside className="h-screen bg-white w-64 hidden md:flex" />}>
      <SidebarContent isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
    </Suspense>
  );
}

function SidebarContent({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: MerchantSidebarProps) {
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

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const actualCollapsed = isCollapsed && !isMobile;

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen?.(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[140] md:hidden"
          />
        )}
      </AnimatePresence>
      <aside 
        className={`h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-[150] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isMobileOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full md:translate-x-0'
        } ${actualCollapsed ? 'md:w-16 lg:w-20' : 'md:w-56 lg:w-64'}`}
      >
      {/* Brand Header */}
      <div className={`p-6 mb-8 flex items-center justify-between transition-all duration-500 ${actualCollapsed ? 'px-4 lg:px-6' : 'px-6 lg:px-8'}`}>
        {!actualCollapsed && (
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
          className={`hidden md:block p-2 rounded-xl bg-gray-50 border border-gray-100 text-[#888888] hover:text-[#111111] transition-all hover:bg-gray-100 ${actualCollapsed ? 'mx-auto' : ''}`}
        >
          {actualCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button 
              key={item.id}
              onClick={() => {
                router.push(item.path);
                setIsMobileOpen?.(false);
              }}
              className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all group relative overflow-hidden ${
                isActive 
                  ? 'bg-[#fef3f2] text-[#0f172a] border border-[#fee2e2] shadow-[0_4px_20px_-4px_rgba(217,119,87,0.15)]' 
                  : 'text-[#888888] hover:text-[#111111] hover:bg-[#f8fafc]'
              } ${actualCollapsed ? 'justify-center px-0' : ''}`}
            >
              <div className={`${isActive ? 'text-[#0f172a] scale-110' : 'text-[#888888] group-hover:text-[#0f172a] group-hover:scale-110'} transition-all duration-300 relative z-10 w-5 h-5 flex items-center justify-center ${actualCollapsed ? 'mx-auto' : ''}`}>
                {item.icon}
              </div>
              {!actualCollapsed && (
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] relative z-10 transition-all duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                   {item.label}
                </span>
              )}
              {isActive && !actualCollapsed && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-5 bg-slate-900 rounded-r-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 lg:p-6 space-y-4">
        {!actualCollapsed && (
          <button 
            onClick={() => toast.success('Server connection established.')}
            className="w-full bg-slate-100 text-slate-900 border border-slate-200 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-900 hover:text-white transition-all shadow-sm"
          >
            System Online
          </button>
        )}
        
        <div className={`flex flex-col gap-4 ${actualCollapsed ? 'items-center' : ''}`}>
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-4 text-[#888888] hover:text-[#111111] transition-all group px-4 py-3 rounded-xl hover:bg-[#f8fafc] ${actualCollapsed ? 'justify-center p-0' : ''}`}
          >
            <div className="w-8 h-8 flex items-center justify-center bg-gray-50 group-hover:bg-white rounded-lg shadow-sm group-hover:text-red-500 group-hover:shadow-md transition-all">
               <LogOut size={16} />
            </div>
            {!actualCollapsed && <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100">Sign Out</span>}
          </button>
          
          {!actualCollapsed && (
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
    </>
  );
}
