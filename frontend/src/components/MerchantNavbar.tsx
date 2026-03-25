import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Settings, Search, LayoutGrid, LogOut, User } from 'lucide-react';
import Logo from './Logo';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface MerchantNavbarProps {
  isCollapsed?: boolean;
}

export default function MerchantNavbar({ isCollapsed = false }: MerchantNavbarProps) {
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
    toast.success('Terminated secure session. Logged out.');
  };

  const navLinks = [
    { label: 'Analytics', path: '/merchant/dashboard' },
    { label: 'Orders', path: '/merchant/orders' },
    { label: 'Inventory', path: '/merchant/inventory' },
  ];

  return (
    <nav className="h-20 bg-[#111111]/80 border-b border-white/5 flex items-center justify-between px-8 lg:px-12 sticky top-0 z-50 backdrop-blur-3xl transition-all duration-500">
      <div className="flex items-center gap-x-16">
        {/* Only show logo in navbar if sidebar is collapsed */}
        <AnimatePresence mode="wait">
          {isCollapsed && (
            <motion.div
              key="navbar-logo"
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
        
        <div className="flex items-center space-x-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link 
                key={link.label}
                href={link.path}
                className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all relative group ${
                  isActive ? 'text-primary' : 'text-gray-500 hover:text-white'
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_15px_rgba(217,119,87,0.6)]"
                  />
                )}
                {!isActive && (
                   <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-white/20 rounded-full transition-all group-hover:w-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center space-x-8">
        <div className="hidden md:flex items-center space-x-6 pr-6 border-r border-white/5">
          <button 
            onClick={() => toast.info('Neural Search initiated...', { icon: <Search className="text-primary" /> })}
            className="text-gray-500 hover:text-white transition-all hover:scale-110 active:scale-95"
          >
            <Search size={18} />
          </button>
          
          <button 
            onClick={() => toast('🔔 Neural Notifications', { description: 'All systems operational. No critical alerts.' })}
            className="text-gray-500 hover:text-white transition-all relative hover:scale-110 active:scale-95"
          >
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(217,119,87,1)]"></span>
          </button>
          
          <button 
            onClick={() => router.push('/merchant/settings')}
            className="text-gray-500 hover:text-white transition-all hover:scale-110 active:scale-95"
          >
            <Settings size={18} />
          </button>
        </div>
        
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-4 group p-1 pr-3 hover:bg-white/[0.03] rounded-2xl transition-all border border-transparent hover:border-white/5"
          >
            <div className="w-10 h-10 bg-[#262624] border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center p-0.5 shadow-2xl transition-transform group-hover:scale-105">
               <div className="w-full h-full bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black text-xs uppercase tracking-tighter">
                  {user?.name?.substring(0, 2).toUpperCase() || 'MC'}
               </div>
            </div>
            <div className="hidden sm:block text-left">
               <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">{user?.name || 'Merchant'}</p>
               <p className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter">Premium Partner</p>
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-64 bg-[#1a1a1a] border border-white/5 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] p-4 z-50 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div className="space-y-1 relative z-10">
                  <button 
                    onClick={() => { router.push('/profile'); setIsProfileOpen(false); }}
                    className="w-full flex items-center space-x-4 px-6 py-4 rounded-xl hover:bg-white/[0.03] transition-all text-gray-500 hover:text-white group"
                  >
                    <User size={18} className="group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Public Profile</span>
                  </button>
                  <button 
                    onClick={() => { router.push('/merchant/dashboard'); setIsProfileOpen(false); }}
                    className="w-full flex items-center space-x-4 px-6 py-4 rounded-xl hover:bg-white/[0.03] transition-all text-gray-500 hover:text-white group"
                  >
                    <LayoutGrid size={18} className="group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Control Center</span>
                  </button>
                  
                  <div className="h-px bg-white/5 my-2 mx-4"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-4 px-6 py-4 rounded-xl hover:bg-red-500/10 transition-all text-gray-500 hover:text-red-400 group"
                  >
                    <LogOut size={18} className="transition-transform group-hover:translate-x-1" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
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
