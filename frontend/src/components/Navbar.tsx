'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, LogOut, User, Store, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/Logo';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (pathname.startsWith('/merchant')) return null;

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setIsProfileOpen(false);
    router.push('/login');
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setIsProfileOpen(false);
  };

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-[#262624]/60 backdrop-blur-xl border-b border-white/10 shadow-2xl sticky top-0 z-50 transition-all duration-300"
    >
      <div className="container-responsive">
        <div className="flex justify-between h-16 md:h-20 items-center">
          {/* 1. Left: Logo */}
          <Link href="/" onClick={closeMenu} className="flex-shrink-0 flex items-center group transition-transform duration-300 hover:scale-105 z-[60]">
            <Logo className="w-10 h-10 md:w-12 md:h-12" />
          </Link>

          {/* 2. Middle: Navigation Links (Desktop) */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex space-x-10 items-center">
              {['Services', 'Tracking', 'Pricing', 'Partners'].map((item) => (
                <Link 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  onClick={closeMenu}
                  className="text-gray-300 hover:text-white transition-all text-[11px] font-black tracking-[0.2em] uppercase hover:scale-110 active:scale-95"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* 3. Right: Auth / User Section (Desktop) */}
          <div className="hidden md:flex items-center space-x-5">
            {user ? (
              <div className="flex items-center space-x-4 relative">
                {user.role === 'customer' && (
                  <Link href="/cart" onClick={closeMenu} className="relative p-2.5 text-gray-400 hover:text-white transition-all bg-white/5 rounded-full border border-white/10 hover:bg-white/10 hover:shadow-lg">
                    <ShoppingCart size={20} />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-black text-white bg-primary rounded-full border-2 border-[#262624]">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                )}

                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 border ${isProfileOpen ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <div className={`${isProfileOpen ? 'text-white' : 'text-primary'}`}>
                      {user.role === 'merchant' ? <Store size={20}/> : <User size={20}/>}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-64 bg-[#262624] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden z-[60] backdrop-blur-2xl"
                      >
                        <div className="p-6 border-b border-white/10 bg-white/5">
                           <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Logged in as</div>
                           <div className="text-sm font-black text-white uppercase tracking-wider truncate">{user.name}</div>
                           <div className="text-[10px] font-bold text-gray-500 uppercase mt-1">{user.role}</div>
                        </div>
                        
                        <div className="p-2">
                          <Link 
                            href={user.role === 'merchant' ? '/merchant/dashboard' : user.role === 'driver' ? '/driver/panel' : user.role === 'admin' ? '/admin/dashboard' : '/profile'}
                            onClick={closeMenu}
                            className="flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-white/5 text-gray-300 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                          >
                            <User size={16} className="text-primary"/>
                            <span>Control Center</span>
                          </Link>
                          
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-red-500/10 text-gray-300 hover:text-red-400 transition-all text-xs font-black uppercase tracking-widest text-left"
                          >
                            <LogOut size={16} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-[11px] font-black text-white/70 hover:text-white transition-all uppercase tracking-[0.2em] px-4">
                  Log In
                </Link>
                <Link href="/register">
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 text-[11px] font-black text-white bg-primary px-6 py-3 rounded-full hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all uppercase tracking-[0.2em]"
                  >
                    <UserPlus size={16} />
                    <span>Sign Up</span>
                  </motion.div>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-4 z-[70]">
            {user?.role === 'customer' && (
              <Link href="/cart" onClick={closeMenu} className="relative p-2 text-white/70 hover:text-primary transition-colors">
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white bg-primary rounded-full border-2 border-[#262624]">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'bg-primary text-white rotate-90' : 'bg-white/5 text-white hover:bg-white/10'}`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mobileMenuOpen ? 'close' : 'open'}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Modern Mobile Full-Screen Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 1, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 top-0 left-0 w-full h-screen bg-[#0a0a0a] z-[65] flex flex-col md:hidden"
          >
             {/* Decorative Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[120px]"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="flex flex-col h-full pt-24 px-6 relative z-10">
              <nav className="flex flex-col space-y-6">
                {['Services', 'Tracking', 'Pricing', 'Partners'].map((item, idx) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                  >
                    <Link 
                      href={`#${item.toLowerCase()}`} 
                      onClick={closeMenu}
                      className="text-4xl font-black text-white/40 hover:text-primary uppercase tracking-tighter transition-all block"
                    >
                      {item}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto mb-12 space-y-4">
                {user ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Link 
                        href={user.role === 'merchant' ? '/merchant/dashboard' : user.role === 'driver' ? '/driver/panel' : user.role === 'admin' ? '/admin/dashboard' : '/profile'}
                        onClick={closeMenu}
                        className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all"
                      >
                         <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                               {user.role === 'merchant' ? <Store size={24}/> : <User size={24}/>}
                            </div>
                            <div className="text-left">
                               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Logged in as</p>
                               <p className="text-lg font-black text-white uppercase tracking-tight">{user.name}</p>
                            </div>
                         </div>
                         <div className="p-2 bg-white/5 rounded-full">
                            <User size={18} className="text-white/40"/>
                         </div>
                      </Link>
                    </motion.div>

                    <motion.button 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      onClick={handleLogout}
                      className="w-full p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-500 font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3"
                    >
                      <LogOut size={18} />
                      <span>Terminate Session</span>
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Link 
                        href="/login" 
                        onClick={closeMenu}
                        className="w-full p-6 bg-white/5 border border-white/10 rounded-[2rem] text-white font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3"
                      >
                        <LogIn size={18} className="text-primary"/>
                        <span>Access Terminal</span>
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Link 
                        href="/register" 
                        onClick={closeMenu}
                        className="w-full p-6 bg-primary rounded-[2rem] text-white font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-2xl shadow-primary/20"
                      >
                        <UserPlus size={18} />
                        <span>Initialize Account</span>
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
