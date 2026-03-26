'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Current Task', href: '/driver/dashboard' },
  { icon: MapIcon, label: 'Route Map', href: '/driver/map' },
  { icon: History, label: 'Order History', href: '/driver/history' },
  { icon: LifeBuoy, label: 'Support', href: '/driver/support' },
  { icon: Settings, label: 'Settings', href: '/driver/settings' },
];

export default function DriverSidebar({ isCollapsed, setIsCollapsed }: DriverSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
    toast.success('Secure driver session terminated.');
  };

  return (
    <aside 
      className={`h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-[100] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hidden md:flex ${
        isCollapsed ? 'w-16 lg:w-20' : 'w-56 lg:w-64'
      }`}
    >
      {/* Brand Header */}
      <div className={`p-4 lg:p-6 mb-6 lg:mb-8 flex items-center justify-between transition-all duration-500 ${isCollapsed ? 'px-2 lg:px-4' : 'px-4 lg:px-6'}`}>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="w-10 h-10 bg-[#fef3f2] rounded-xl flex items-center justify-center border border-[#fee2e2] shadow-sm">
               <Truck className="text-[#d97757]" size={20} />
            </div>
            <div>
               <h1 className="text-xs font-black uppercase tracking-[0.2em] text-[#111111] leading-none">Driver Hub</h1>
               <p className="text-[8px] font-bold text-[#888888] uppercase tracking-tighter mt-1">Nexus Fleet</p>
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

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 pt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center space-x-3 lg:space-x-4 px-4 lg:px-5 py-3 lg:py-4 rounded-xl transition-all group relative overflow-hidden ${
                isActive 
                  ? 'bg-[#fef3f2] text-[#d97757] border border-[#fee2e2] shadow-sm' 
                  : 'text-[#888888] hover:text-[#111111] hover:bg-gray-50'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <item.icon size={20} className={`${isActive ? 'text-[#d97757] scale-110' : 'group-hover:text-[#d97757] group-hover:scale-110'} transition-all duration-300 ${isCollapsed ? 'mx-auto' : ''}`} />
              {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>}
              {isActive && !isCollapsed && (
                <motion.div layoutId="activeDot" className="absolute right-4 w-1 h-6 bg-[#d97757] rounded-full shadow-[0_0_8px_rgba(217,119,87,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
        {!isCollapsed && (
          <div className="p-5 bg-white rounded-2xl border border-gray-100 flex items-center space-x-4 shadow-sm">
             <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500 border border-green-100 shadow-inner">
                <ShieldCheck size={20} />
             </div>
             <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-[#d97757]">Tier Status</p>
                <p className="text-[10px] font-black text-[#111111] uppercase">Elite Courier</p>
             </div>
          </div>
        )}

        <button 
          onClick={handleLogout}
          className={`w-full flex items-center space-x-4 text-[#888888] hover:text-[#111111] transition-all group ${isCollapsed ? 'justify-center' : 'justify-center'}`}
        >
          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest italic leading-none">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
