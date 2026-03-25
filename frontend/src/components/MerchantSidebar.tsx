'use client';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Store as StoreIcon, 
  LayoutDashboard, 
  Database, 
  Map, 
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
  const { logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/merchant/dashboard' },
      { id: 'orders', label: 'Orders', icon: <Package size={20} />, path: '/merchant/orders' },
      { id: 'inventory', label: 'Inventory', icon: <Database size={20} />, path: '/merchant/inventory' },
    { id: 'live_map', label: 'Live Map', icon: <Map size={20} />, path: '/merchant/live_map' },
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
      className={`h-screen bg-[#0a0a0a] border-r border-white/5 flex flex-col fixed left-0 top-0 z-[100] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hidden md:flex ${
        isCollapsed ? 'w-20 lg:w-24' : 'w-64 lg:w-80'
      }`}
    >
      {/* Sidebar Header */}
      <div className={`p-8 lg:p-10 border-b border-white/5 flex items-center justify-between ${isCollapsed ? 'px-4 lg:px-6' : ''}`}>
        {!isCollapsed && (
          <div className="flex items-center space-x-5 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
              <Zap size={24} className="text-white fill-current" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter uppercase italic group-hover:text-primary transition-colors">Delivray.</span>
          </div>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.map(item => {
          const isActive = pathname === item.path;
          return (
            <button 
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center space-x-3 lg:space-x-4 px-4 lg:px-5 py-3 lg:py-4 rounded-xl lg:rounded-2xl transition-all group relative overflow-hidden ${
                isActive 
                  ? 'bg-white/[0.04] text-white border border-white/5 shadow-2xl' 
                  : 'text-gray-500 hover:text-white hover:bg-white/[0.02]'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <div className={`${isActive ? 'text-primary scale-110' : 'text-gray-600 group-hover:text-white group-hover:scale-110'} transition-all duration-300 relative z-10 w-5 h-5 flex items-center justify-center ${isCollapsed ? 'mx-auto' : ''}`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className={`text-[10px] font-black uppercase tracking-[0.25em] relative z-10 transition-all duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                   {item.label}
                </span>
              )}
              {isActive && !isCollapsed && (
                <motion.div 
                  layoutId="activePin"
                  className="absolute right-0 w-1.5 h-10 bg-primary rounded-l-full shadow-[0_0_15px_rgba(217,119,87,1)]"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {!isCollapsed && (
          <button 
            onClick={() => toast.success('Connecting to Delivery Terminal... System LIVE!')}
            className="w-full bg-primary text-black py-4 lg:py-5 rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_50px_-10px_rgba(217,119,87,0.4)]"
          >
            Go Live
          </button>
        )}
        <button 
          onClick={handleLogout}
          className={`w-full flex items-center space-x-4 text-gray-500 hover:text-white transition-all group ${isCollapsed ? 'justify-center' : 'justify-center'}`}
        >
          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest italic leading-none">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
