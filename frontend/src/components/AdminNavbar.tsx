'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Settings, Search, LayoutGrid, LogOut, User, Menu, X, ShieldAlert } from 'lucide-react';
import Logo from './Logo';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import NotificationBell from './NotificationBell';

interface AdminNavbarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

export default function AdminNavbar({ isCollapsed, isMobileOpen, setIsMobileOpen }: AdminNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
    toast.success('Admin terminal disconnected securely.');
  };

  const navLinks = [
    { label: 'Overview', path: '/admin/dashboard' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Stores', path: '/admin/stores' },
    { label: 'Revenue', path: '/admin/revenue' },
  ];

  return (

    <nav className="h-16 sm:h-24 bg-white/80 border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 lg:px-12 sticky top-0 z-50 backdrop-blur-3xl transition-all duration-500">
      <div className="flex items-center gap-x-4 sm:gap-x-24">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-xl text-[#0f172a]"
        >
          <Menu size={20} />
        </button>
        
        {/* Logo logic matches Merchant portal for consistency if used in Admin layout */}
        <AnimatePresence mode="wait">
          {isCollapsed && (
            <motion.div
              key="admin-navbar-logo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Link href="/" className="hover:opacity-80 transition-opacity block">
                <Logo className="w-8 h-8 scale-90" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="hidden md:flex items-center space-x-6 sm:space-x-10 ml-2 md:ml-4 lg:ml-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link 
                key={link.label}
                href={link.path}
                className={`text-[10px] font-bold uppercase tracking-[0.25em] transition-all relative group ${
                  isActive ? 'text-[#0f172a]' : 'text-[#888888] hover:text-[#111111]'
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeNavAdmin"
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#0f172a] rounded-full shadow-[0_0_10px_rgba(15,23,42,0.2)]"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center space-x-8">
        <div className="hidden md:flex items-center space-x-6 pr-6 border-r border-gray-100">
          <button 
            onClick={() => toast.info('System Search initialized...')}
            className="text-[#888888] hover:text-[#111111] transition-all"
          >
            <Search size={18} />
          </button>
          
          <NotificationBell />
          
          <button 
            onClick={() => router.push('/admin/settings')}
            className="text-[#888888] hover:text-[#111111] transition-all"
          >
            <Settings size={18} />
          </button>
        </div>
        
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-4 group p-1 pr-3 hover:bg-[#f8fafc] rounded-2xl transition-all border border-transparent hover:border-gray-100"
          >
            <div className="w-10 h-10 bg-white border border-gray-100 rounded-2xl overflow-hidden flex items-center justify-center p-0.5 shadow-sm transition-transform group-hover:scale-105">
               <div className="w-full h-full bg-[#fef3f2] rounded-xl flex items-center justify-center text-[#0f172a] font-bold text-xs uppercase tracking-tighter">
                  {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
               </div>
            </div>
            <div className="hidden sm:block text-left">
               <p className="text-[10px] font-bold text-[#111111] uppercase tracking-widest leading-none mb-1">{user?.name || 'Administrator'}</p>
               <p className="text-[8px] font-bold text-[#888888] uppercase tracking-tighter">System Authority</p>
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 z-50 overflow-hidden"
              >
                <div className="space-y-1 relative z-10">
                  <button 
                    onClick={() => { router.push('/profile'); setIsProfileOpen(false); }}
                    className="w-full flex items-center space-x-4 px-6 py-4 rounded-xl hover:bg-[#f8fafc] transition-all text-[#888888] hover:text-[#111111] group"
                  >
                    <User size={18} className="group-hover:text-[#0f172a] transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Profile Details</span>
                  </button>
                  <button 
                    onClick={() => { router.push('/admin/dashboard'); setIsProfileOpen(false); }}
                    className="w-full flex items-center space-x-4 px-6 py-4 rounded-xl hover:bg-[#f8fafc] transition-all text-[#888888] hover:text-[#111111] group"
                  >
                    <LayoutGrid size={18} className="group-hover:text-[#0f172a] transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Nexus Console</span>
                  </button>
                  
                  <div className="h-px bg-gray-50 my-2 mx-4"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-4 px-6 py-4 rounded-xl hover:bg-red-50 transition-all text-[#888888] hover:text-red-500 group"
                  >
                    <LogOut size={18} className="transition-transform group-hover:translate-x-1" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Disconnect Terminal</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
