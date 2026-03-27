import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Settings, Search, LayoutGrid, LogOut, User, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <>
    <nav className="h-16 sm:h-24 bg-white/80 border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 lg:px-12 sticky top-0 z-50 backdrop-blur-3xl transition-all duration-500">
      <div className="flex items-center gap-x-4 sm:gap-x-24">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-xl text-[#d97757]"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
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
        
        <div className="hidden md:flex items-center space-x-6 sm:space-x-10 ml-2 md:ml-4 lg:ml-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link 
                key={link.label}
                href={link.path}
                className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all relative group ${
                  isActive ? 'text-[#d97757]' : 'text-[#888888] hover:text-[#111111]'
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#d97757] rounded-full shadow-[0_0_10px_rgba(217,119,87,0.4)]"
                  />
                )}
                {!isActive && (
                   <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gray-100 rounded-full transition-all group-hover:w-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

        <div className="flex items-center space-x-8">
        <div className="hidden md:flex items-center space-x-6 pr-6 border-r border-gray-100">
          <button 
            onClick={() => toast.info('Neural Search initiated...', { icon: <Search className="text-[#d97757]" /> })}
            className="text-[#888888] hover:text-[#111111] transition-all hover:scale-110 active:scale-95"
          >
            <Search size={18} />
          </button>
          
          <button 
            onClick={() => toast('🔔 Notifications', { description: 'All systems operational. No critical alerts.' })}
            className="text-[#888888] hover:text-[#111111] transition-all relative hover:scale-110 active:scale-95"
          >
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#d97757] rounded-full animate-pulse shadow-[0_0_8px_rgba(217,119,87,0.8)]"></span>
          </button>
          
          <button 
            onClick={() => router.push('/merchant/settings')}
            className="text-[#888888] hover:text-[#111111] transition-all hover:scale-110 active:scale-95"
          >
            <Settings size={18} />
          </button>
        </div>
        
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-4 group p-1 pr-3 hover:bg-[#f9f9f9] rounded-2xl transition-all border border-transparent hover:border-gray-100"
          >
            <div className="w-10 h-10 bg-white border border-gray-100 rounded-2xl overflow-hidden flex items-center justify-center p-0.5 shadow-sm transition-transform group-hover:scale-105">
               <div className="w-full h-full bg-[#fef3f2] rounded-xl flex items-center justify-center text-[#d97757] font-black text-xs uppercase tracking-tighter">
                  {user?.name?.substring(0, 2).toUpperCase() || 'MC'}
               </div>
            </div>
            <div className="hidden sm:block text-left">
               <p className="text-[10px] font-black text-[#111111] uppercase tracking-widest leading-none mb-1">{user?.name || 'Merchant'}</p>
               <p className="text-[8px] font-bold text-[#888888] uppercase tracking-tighter">Premium Partner</p>
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
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d97757]/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div className="space-y-1 relative z-10">
                  <button 
                    onClick={() => { router.push('/profile'); setIsProfileOpen(false); }}
                    className="w-full flex items-center space-x-4 px-6 py-4 rounded-xl hover:bg-[#f9f9f9] transition-all text-[#888888] hover:text-[#111111] group"
                  >
                    <User size={18} className="group-hover:text-[#d97757] transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Public Profile</span>
                  </button>
                  <button 
                    onClick={() => { router.push('/merchant/dashboard'); setIsProfileOpen(false); }}
                    className="w-full flex items-center space-x-4 px-6 py-4 rounded-xl hover:bg-[#f9f9f9] transition-all text-[#888888] hover:text-[#111111] group"
                  >
                    <LayoutGrid size={18} className="group-hover:text-[#d97757] transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Control Center</span>
                  </button>
                  
                  <div className="h-px bg-gray-50 my-2 mx-4"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-4 px-6 py-4 rounded-xl hover:bg-red-50 transition-all text-[#888888] hover:text-red-500 group"
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-[70] md:hidden shadow-2xl p-8 flex flex-col"
            >
              <div className="flex items-center space-x-4 mb-12">
                 <div className="w-10 h-10 bg-[#d97757] rounded-xl flex items-center justify-center">
                    <Logo className="w-6 h-6 text-white" />
                 </div>
                 <h2 className="text-lg font-black tracking-tighter uppercase">Merchant Hub</h2>
              </div>
              
              <div className="flex-1 space-y-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.label}
                    href={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                      pathname === link.path ? 'bg-[#fef3f2] text-[#d97757] border border-[#fee2e2]' : 'text-[#888888] hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <button 
                onClick={handleLogout}
                className="w-full h-14 bg-gray-50 text-[#888888] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3"
              >
                <LogOut size={16} />
                Logout
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
