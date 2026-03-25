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
      className={`h-screen bg-[#0a0a0a] border-r border-white/5 flex flex-col fixed left-0 top-0 z-[100] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hidden md:flex ${
        isCollapsed ? 'w-20 lg:w-24' : 'w-64 lg:w-80'
      }`}
    >
      {/* Brand Header */}
      <div className={`p-6 lg:p-8 mb-8 lg:mb-12 flex items-center justify-between transition-all duration-500 ${isCollapsed ? 'px-4 lg:px-6' : 'px-6 lg:px-8'}`}>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="w-10 h-10 bg-[#ff8564]/10 rounded-xl flex items-center justify-center border border-[#ff8564]/20 shadow-[0_8px_20px_-5px_rgba(255,133,100,0.3)]">
               <Truck className="text-[#ff8564]" size={20} />
            </div>
            <div>
               <h1 className="text-xs font-black uppercase tracking-[0.2em] text-white leading-none">Driver Hub</h1>
               <p className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter mt-1">Nexus Fleet</p>
            </div>
          </motion.div>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center space-x-3 lg:space-x-4 px-4 lg:px-5 py-3 lg:py-4 rounded-xl lg:rounded-[1.25rem] transition-all group relative overflow-hidden ${
                isActive 
                  ? 'bg-white/[0.04] text-white border border-white/5' 
                  : 'text-gray-500 hover:text-white hover:bg-white/[0.02]'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <item.icon size={20} className={`${isActive ? 'text-[#ff8564] scale-110' : 'group-hover:text-[#ff8564] group-hover:scale-110'} transition-all duration-300 ${isCollapsed ? 'mx-auto' : ''}`} />
              {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>}
              {isActive && !isCollapsed && (
                <motion.div layoutId="activeDot" className="absolute right-4 w-1.5 h-6 bg-[#ff8564] rounded-full shadow-[0_0_10px_#ff8564]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
        {!isCollapsed && (
          <div className="p-5 bg-white/[0.02] rounded-3xl border border-white/5 flex items-center space-x-4">
             <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                <ShieldCheck size={20} />
             </div>
             <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-[#ff8564]">Tier Status</p>
                <p className="text-[10px] font-black text-white uppercase">Elite Courier</p>
             </div>
          </div>
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
