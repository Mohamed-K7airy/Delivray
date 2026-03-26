'use client';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  FileText,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function AdminSidebar({ isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const { logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { id: 'users', label: 'Users Control', icon: <Users size={20} />, path: '/admin/users' },
    { id: 'stores', label: 'Store Portals', icon: <ShoppingBag size={20} />, path: '/admin/stores' },
    { id: 'revenue', label: 'Revenue Flow', icon: <DollarSign size={20} />, path: '/admin/revenue' },
    { id: 'logs', label: 'System Logs', icon: <FileText size={20} />, path: '/admin/logs' },
    { id: 'settings', label: 'System Settings', icon: <Settings size={20} />, path: '/admin/settings' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
    toast.success('Secure admin terminal disconnected.');
  };

  return (
    <aside 
      className={`h-screen bg-white border-r border-gray-100 flex flex-col hidden md:flex fixed left-0 top-0 z-[100] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isCollapsed ? 'w-24' : 'w-80'
      }`}
    >
      {/* Brand Header */}
      <div className={`p-8 mb-12 flex items-center justify-between transition-all duration-500 ${isCollapsed ? 'px-6' : 'px-8'}`}>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="w-10 h-10 bg-[#fef3f2] rounded-xl flex items-center justify-center border border-[#fee2e2] shadow-sm">
               <ShieldAlert className="text-[#d97757]" size={20} />
            </div>
            <div>
               <h1 className="text-xs font-black uppercase tracking-widest text-[#111111] leading-none">Admin Nexus</h1>
               <p className="text-[8px] font-bold text-[#888888] uppercase tracking-tighter mt-1">Core Access Layer</p>
            </div>
          </motion.div>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-xl bg-gray-50 border border-gray-100 text-[#888888] hover:text-[#111111] hover:bg-gray-100 transition-all ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar pt-4">
        {navItems.map(item => {
          const isActive = pathname === item.path;
          return (
            <button 
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all group relative overflow-hidden ${
                isActive 
                  ? 'bg-[#fef3f2] text-[#d97757] border border-[#fee2e2] shadow-sm' 
                  : 'text-[#888888] hover:text-[#111111] hover:bg-gray-50'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <div className={`${isActive ? 'text-[#d97757] scale-110' : 'text-gray-400 group-hover:text-[#111111] group-hover:scale-110'} transition-all duration-300 relative z-10 w-5 h-5 flex items-center justify-center ${isCollapsed ? 'mx-auto' : ''}`}>
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
                  className="absolute right-0 w-1 h-8 bg-[#d97757] rounded-l-full shadow-[0_0_10px_rgba(217,119,87,0.5)]"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-6 space-y-6">
        {!isCollapsed && (
          <div className="p-5 bg-white border border-gray-100 rounded-3xl flex items-center space-x-4 shadow-sm">
             <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 border border-blue-100 shadow-inner">
                <Activity size={20} />
             </div>
             <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-[#d97757]">System State</p>
                <p className="text-[10px] font-black text-[#111111] uppercase">Operational</p>
             </div>
          </div>
        )}

        <button 
          onClick={handleLogout}
          className={`w-full flex items-center space-x-4 text-[#888888] hover:text-[#111111] transition-all group ${isCollapsed ? 'justify-center' : 'justify-center'}`}
        >
          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest italic leading-none">Logout Hub</span>}
        </button>
      </div>
    </aside>
  );
}
