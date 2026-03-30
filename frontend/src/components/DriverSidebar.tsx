'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  History, 
  LifeBuoy, 
  Settings, 
  LogOut,

  ChevronLeft,
  ChevronRight,
  Menu,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

interface DriverSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (val: boolean) => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Current Task', href: '/driver/dashboard' },
  { icon: MapIcon, label: 'Route Map', href: '/driver/map' },
  { icon: History, label: 'Order History', href: '/driver/history' },
  { icon: LifeBuoy, label: 'Support', href: '/driver/support' },
  { icon: Settings, label: 'Settings', href: '/driver/settings' },
];

export default function DriverSidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: DriverSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const actualCollapsed = isCollapsed && !isMobile;

  const handleLogout = () => {
    logout();
    router.push('/login');
    toast.success('Secure driver session terminated.');
  };

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
      <div className={`p-4 lg:p-6 mb-6 lg:mb-8 flex items-center justify-between transition-all duration-500 ${actualCollapsed ? 'px-2 lg:px-4' : 'px-4 lg:px-6'}`}>
        {!actualCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg transition-transform hover:scale-105">
               <Truck className="text-white" size={20} />
            </div>
            <div>
               <h1 className="text-xs font-bold uppercase tracking-widest text-slate-900 leading-none">Driver Dashboard</h1>
               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Active Fleet</p>
            </div>
          </motion.div>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden md:block p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-900 transition-all ${actualCollapsed ? 'mx-auto' : ''}`}
        >
          {actualCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 pt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center space-x-3 lg:space-x-4 px-4 lg:px-5 py-3 lg:py-4 rounded-xl transition-all group relative overflow-hidden ${
                isActive 
                  ? 'bg-slate-50 text-slate-900 border border-slate-100 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50/50'
              } ${actualCollapsed ? 'justify-center px-0' : ''}`}
              onClick={() => setIsMobileOpen?.(false)}
            >
              <item.icon size={20} className={`${isActive ? 'text-slate-900 scale-110' : 'group-hover:text-slate-900 group-hover:scale-105'} transition-all duration-300 ${actualCollapsed ? 'mx-auto' : ''}`} />
              {!actualCollapsed && <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>}
              {isActive && !actualCollapsed && (
                <motion.div layoutId="activeDot" className="absolute left-0 w-1 h-6 bg-slate-900 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
        {!actualCollapsed && (
          <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center space-x-4 shadow-sm">
             <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 border border-slate-100">
                <ShieldCheck size={20} />
             </div>
             <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">System Status</p>
                <p className="text-[10px] font-bold text-slate-900 uppercase">Online</p>
             </div>
          </div>
        )}

        <button 
          onClick={handleLogout}
          className={`w-full flex items-center space-x-3 lg:space-x-4 px-4 py-3 lg:py-4 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all group ${actualCollapsed ? 'justify-center px-0' : 'justify-start'}`}
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          {!actualCollapsed && <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Terminate Session</span>}
        </button>
      </div>
    </aside>
    </>
  );
}
