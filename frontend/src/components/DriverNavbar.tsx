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
    <nav className="h-24 bg-[#0a0a0a]/80 border-b border-white/5 flex items-center justify-between px-8 lg:px-12 sticky top-0 z-50 backdrop-blur-3xl transition-all duration-500">
      <div className="flex items-center gap-x-12">
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
              <Link href="/driver/dashboard" className="w-10 h-10 bg-[#ff8564]/10 rounded-xl flex items-center justify-center border border-[#ff8564]/20 shadow-[0_8px_20px_-5px_rgba(255,133,100,0.3)] active:scale-95 transition-all">
                <Truck className="text-[#ff8564]" size={20} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center space-x-10">
          {['Dashboard', 'Earnings', 'Schedule'].map((link) => (
            <Link 
              key={link} 
              href={`/driver/${link.toLowerCase()}`}
              className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 hover:text-white transition-all relative group"
            >
               {link}
               <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-[#ff8564] transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-10">
        {/* Search */}
        <button className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all active:scale-95">
          <Search size={22} />
        </button>

        {/* Notifications */}
        <button className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all relative group active:scale-95">
          <Bell size={22} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-[#ff8564] rounded-full shadow-[0_0_8px_#ff8564]" />
        </button>

        <div className="h-8 w-px bg-white/10" />

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
           <button 
             onClick={() => setShowProfile(!showProfile)}
             className="flex items-center space-x-4 bg-white/5 p-2 pr-6 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all group"
           >
              <div className="w-12 h-12 bg-[#ff8564] rounded-full flex items-center justify-center text-black font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
                 {user?.name?.[0]?.toUpperCase() || 'D'}
              </div>
              <div className="text-left hidden md:block">
                 <p className="text-sm font-black text-white">{user?.name || 'Driver'}</p>
                 <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#ff8564]">Online</span>
                 </div>
              </div>
              <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${showProfile ? 'rotate-180' : ''}`} />
           </button>

           <AnimatePresence>
             {showProfile && (
               <motion.div
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                 className="absolute right-0 top-full mt-4 w-72 bg-[#1a1a1a] border border-white/5 rounded-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] p-3 z-50 overflow-hidden"
               >
                 <div className="p-4 mb-2 border-b border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Account Managed by</p>
                    <p className="text-md font-black text-white">{user?.email}</p>
                 </div>
                 <div className="space-y-1">
                    <button className="w-full flex items-center space-x-4 px-6 py-4 rounded-xl hover:bg-white/[0.03] transition-all text-gray-400 hover:text-white font-black uppercase tracking-widest text-[10px]">
                       <SettingsIcon size={18} />
                       <span>Profile Settings</span>
                    </button>
                    <button className="w-full flex items-center space-x-4 px-6 py-4 rounded-xl hover:bg-white/[0.03] transition-all text-gray-400 hover:text-white font-black uppercase tracking-widest text-[10px]">
                       <Activity size={18} />
                       <span>Performance Stat</span>
                    </button>
                    <div className="h-px bg-white/5 my-2" />
                    <button 
                      onClick={() => logout()}
                      className="w-full flex items-center space-x-4 px-6 py-4 rounded-xl hover:bg-red-500/10 transition-all text-red-400 font-black uppercase tracking-widest text-[10px]"
                    >
                       <LogOut size={18} />
                       <span>Logout Hub</span>
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
