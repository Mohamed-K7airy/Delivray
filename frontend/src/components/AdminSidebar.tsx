'use client';
import { useAuthStore } from '@/store/authStore';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
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
  return (
    <Suspense fallback={<aside className={`h-screen bg-white border-r border-gray-100 flex flex-col hidden md:flex fixed left-0 top-0 z-[100] ${isCollapsed ? 'w-24' : 'w-80'}`} />}>
      <SidebarContent isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
    </Suspense>
  );
}

function SidebarContent({ isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const { logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard?tab=overview' },
    { id: 'users', label: 'Users Control', icon: <Users size={20} />, path: '/admin/dashboard?tab=users' },
    { id: 'stores', label: 'Ecosystem Control', icon: <ShoppingBag size={20} />, path: '/admin/dashboard?tab=stores' },
    { id: 'economics', label: 'Fiscal Audit', icon: <DollarSign size={20} />, path: '/admin/dashboard?tab=economics' },
    { id: 'promos', label: 'Promotions', icon: <FileText size={20} />, path: '/admin/dashboard?tab=promos' },
    { id: 'fleet', label: 'Fleet Schedule', icon: <Activity size={20} />, path: '/admin/dashboard?tab=fleet' },
    { id: 'pulse', label: 'Global Pulse', icon: <Settings size={20} />, path: '/admin/dashboard?tab=pulse' },
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
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg transition-transform hover:scale-105">
               <ShieldAlert className="text-white" size={20} />
            </div>
            <div>
               <h1 className="text-xs font-bold uppercase tracking-widest text-slate-900 leading-none">Admin Nexus</h1>
               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Core Access Layer</p>
            </div>
          </motion.div>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-900 transition-all ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar pt-4">
        {navItems.map(item => {
          const isActive = tab === item.id;
          return (
            <Link 
              key={item.id}
              href={item.path}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all group relative overflow-hidden ${
                isActive 
                  ? 'bg-slate-50 text-slate-900 border border-slate-100 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50/50'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <div className={`${isActive ? 'text-slate-900 scale-110' : 'text-slate-300 group-hover:text-slate-900 group-hover:scale-110'} transition-all duration-300 relative z-10 w-5 h-5 flex items-center justify-center ${isCollapsed ? 'mx-auto' : ''}`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className={`text-[10px] font-bold uppercase tracking-widest relative z-10 transition-all duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                   {item.label}
                </span>
              )}
              {isActive && !isCollapsed && (
                <motion.div 
                  layoutId="activePin"
                  className="absolute left-0 w-1 h-8 bg-slate-900 rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-6 space-y-6">
        {!isCollapsed && (
          <div className="p-5 bg-white border border-slate-100 rounded-3xl flex items-center space-x-4 shadow-sm">
             <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 border border-slate-100 shadow-inner">
                <Activity size={20} />
             </div>
             <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">System State</p>
                <p className="text-[10px] font-bold text-slate-900 uppercase">Operational</p>
             </div>
          </div>
        )}

        <button 
          onClick={handleLogout}
          className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all group ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}
        >
          <LogOut size={18} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
          {!isCollapsed && <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Logout Hub</span>}
        </button>
      </div>
    </aside>
  );
}
