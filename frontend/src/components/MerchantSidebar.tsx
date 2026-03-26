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
      className={`h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-[100] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hidden md:flex ${
        isCollapsed ? 'w-20 lg:w-24' : 'w-64 lg:w-80'
      }`}
    >
      {/* Sidebar Header */}
      <div className={`p-8 lg:p-10 border-b border-gray-100 flex items-center justify-between ${isCollapsed ? 'px-4 lg:px-6' : ''}`}>
        {!isCollapsed && (
          <div className="flex items-center space-x-5 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-12 h-12 bg-[#FF5A3C] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#FF5A3C]/20 group-hover:scale-110 transition-transform duration-500">
              <Zap size={24} className="text-white fill-current" />
            </div>
            <div className="flex flex-col">
               <span className="text-xl font-black text-[#0A0A0A] tracking-tighter uppercase leading-none">Delivray</span>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Merchant Portal</span>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 hover:text-[#0A0A0A] hover:bg-gray-100 transition-all ${isCollapsed ? 'mx-auto' : ''}`}
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
                  ? 'bg-[#FFF9F8] text-[#FF5A3C] border border-[#FFE7E2] shadow-sm' 
                  : 'text-gray-500 hover:text-[#0A0A0A] hover:bg-gray-50'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <div className={`${isActive ? 'text-[#FF5A3C] scale-110' : 'text-gray-400 group-hover:text-[#0A0A0A] group-hover:scale-110'} transition-all duration-300 relative z-10 w-5 h-5 flex items-center justify-center ${isCollapsed ? 'mx-auto' : ''}`}>
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
            className="w-full bg-[#FF5A3C] text-white py-4 lg:py-5 rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_50px_-10px_rgba(255,90,60,0.4)]"
          >
            Go Live
          </button>
        )}
        <button 
          onClick={handleLogout}
          className={`w-full flex items-center space-x-4 text-gray-400 hover:text-red-500 transition-all group ${isCollapsed ? 'justify-center' : 'justify-center'}`}
        >
          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest italic leading-none">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
