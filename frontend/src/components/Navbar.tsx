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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* 1. Left: Logo */}
          <Link href="/" onClick={closeMenu} className="flex-shrink-0 flex items-center group transition-transform duration-300 hover:scale-105 z-50">
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
                        className="absolute right-0 mt-4 w-64 bg-[#262624] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden z-50 backdrop-blur-2xl"
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
                            <span>My Profile</span>
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

          {/* Mobile Actions (Visible Only on Mobile) */}
          <div className="md:hidden flex items-center space-x-4">
            {user?.role === 'customer' && (
              <Link href="/cart" onClick={closeMenu} className="relative p-2 text-white/70 hover:text-primary transition-colors">
                <ShoppingCart size={24} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[11px] font-bold text-white bg-primary rounded-full border-2 border-[#262624]">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors z-50 relative"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#1a1a1a] border-b border-white/10 overflow-hidden absolute w-full left-0 top-20 shadow-2xl"
          >
            <div className="px-4 py-6 space-y-4 flex flex-col items-start bg-black/20 backdrop-blur-3xl">
              {user ? (
                <>
                  <Link 
                    href={user.role === 'merchant' ? '/merchant/dashboard' : user.role === 'driver' ? '/driver/panel' : user.role === 'admin' ? '/admin/dashboard' : '/profile'}
                    onClick={closeMenu}
                    className="w-full flex items-center space-x-3 text-lg font-bold text-white bg-white/5 border border-white/10 px-5 py-4 rounded-xl hover:bg-white/10 transition-all"
                  >
                    {user.role === 'merchant' ? <Store size={22} className="text-primary"/> : <User size={22} className="text-primary"/>}
                    <span>{user.name}</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 text-lg font-bold text-red-400 bg-red-400/5 border border-red-400/10 px-5 py-4 rounded-xl hover:bg-red-400/10 transition-all text-left"
                  >
                    <LogOut size={22} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  {['Services', 'Tracking', 'Pricing', 'Partners'].map((item) => (
                    <Link 
                      key={item} 
                      href={`#${item.toLowerCase()}`} 
                      onClick={closeMenu}
                      className="text-gray-300 hover:text-white text-lg font-black tracking-widest uppercase transition-colors"
                    >
                      {item}
                    </Link>
                  ))}
                  <Link href="/login" onClick={closeMenu} className="w-full flex items-center space-x-3 text-lg font-bold text-white bg-white/5 border border-white/10 px-5 py-4 rounded-xl hover:bg-white/10 transition-all">
                    <LogIn size={22} className="text-primary" />
                    <span>Log In</span>
                  </Link>
                  <Link href="/register" onClick={closeMenu}>
                    <button className="w-full bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-full font-black text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                      Sign Up
                    </button>
                  </Link> 
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
