'use client';
import { 
  Search, 
  Bell, 
  User, 
  ChevronDown,
  Activity,
  LogOut,
  Settings as SettingsIcon,
  Truck
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface DriverNavbarProps {
  isCollapsed?: boolean;
}

export default function DriverNavbar({ isCollapsed = false }: DriverNavbarProps) {
  const { user, logout } = useAuthStore();
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="h-16 sm:h-24 bg-white/80 border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 lg:px-12 sticky top-0 z-50 backdrop-blur-3xl transition-all duration-500">
      <div className="flex items-center gap-x-6 sm:gap-x-12">
        {/* Only show logo in navbar if sidebar is collapsed */}
        <AnimatePresence mode="wait">
          {isCollapsed && (
            <motion.div
              key="navbar-logo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-4"
            >
              <Link href="/driver/dashboard" className="w-10 h-10 bg-[#FF5A3C]/10 rounded-xl flex items-center justify-center border border-[#FF5A3C]/20 shadow-sm active:scale-95 transition-all">
                <Truck className="text-[#FF5A3C]" size={20} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hidden sm:flex items-center space-x-6 sm:space-x-10">
          {['Dashboard', 'Earnings', 'Schedule'].map((link) => (
            <Link 
              key={link} 
              href={`/driver/${link.toLowerCase()}`}
              className="text-[10px] font-black uppercase tracking-[0.25em] text-[#888888] hover:text-[#111111] transition-all relative group"
            >
               {link}
               <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-[#d97757] transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4 sm:space-x-10">
        {/* Search */}
        <button className="w-10 h-10 sm:w-12 sm:h-12 bg-[#f9f9f9] rounded-xl flex items-center justify-center text-[#888888] hover:text-[#111111] hover:bg-white transition-all active:scale-95 border border-gray-100">
          <Search size={18} />
        </button>

        {/* Notifications */}
        <button className="w-10 h-10 sm:w-12 sm:h-12 bg-[#f9f9f9] rounded-xl flex items-center justify-center text-[#888888] hover:text-[#111111] hover:bg-white transition-all relative group active:scale-95 border border-gray-100">
          <Bell size={18} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-[#d97757] rounded-full shadow-[0_0_8px_rgba(217,119,87,0.8)]" />
        </button>

        <div className="h-8 w-px bg-gray-100" />

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
           <button 
             onClick={() => setShowProfile(!showProfile)}
             className="flex items-center space-x-2 sm:space-x-4 bg-white p-1.5 sm:p-2 pr-4 sm:pr-6 rounded-2xl border border-gray-100 hover:bg-[#f9f9f9] transition-all group shadow-sm"
           >
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[#fef3f2] rounded-full flex items-center justify-center text-[#d97757] font-black text-base sm:text-lg border border-[#fee2e2] shadow-sm group-hover:scale-105 transition-transform">
                 {user?.name?.[0]?.toUpperCase() || 'D'}
              </div>
              <div className="text-left hidden md:block">
                 <p className="text-sm font-black text-[#111111]">{user?.name || 'Driver'}</p>
                 <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#d97757]">Online</span>
                 </div>
              </div>
              <ChevronDown size={16} className={`text-[#888888] transition-transform duration-300 ${showProfile ? 'rotate-180' : ''}`} />
           </button>

           <AnimatePresence>
             {showProfile && (
               <motion.div
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                 className="absolute right-0 top-full mt-4 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 z-50 overflow-hidden"
               >
                 <div className="p-4 mb-2 border-b border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#888888]">Account Managed by</p>
                    <p className="text-md font-black text-[#111111]">{user?.email}</p>
                 </div>
                 <div className="space-y-1">
                    <button className="w-full flex items-center space-x-4 px-6 py-4 rounded-xl hover:bg-[#f9f9f9] transition-all text-[#888888] hover:text-[#111111] font-black uppercase tracking-widest text-[10px]">
                       <SettingsIcon size={18} />
                       <span>Profile Settings</span>
                    </button>
                    <button className="w-full flex items-center space-x-4 px-6 py-4 rounded-xl hover:bg-[#f9f9f9] transition-all text-[#888888] hover:text-[#111111] font-black uppercase tracking-widest text-[10px]">
                       <Activity size={18} />
                       <span>Performance Stat</span>
                    </button>
                    <div className="h-px bg-gray-100 my-2" />
                    <button 
                      onClick={() => logout()}
                      className="w-full flex items-center space-x-4 px-6 py-4 rounded-xl hover:bg-red-50 transition-all text-red-500 font-black uppercase tracking-widest text-[10px]"
                    >
                       <LogOut size={18} />
                       <span>Logout Hub</span>
                    </button>
                 </div>
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#d97757]/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
