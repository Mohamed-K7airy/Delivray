'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, LogOut, User, Store, LogIn, UserPlus, Menu, X, Search, Bell, Settings } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/Logo';
import NotificationBell from '@/components/NotificationBell';

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

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 py-3 transition-all"
    >
      <div className="container-responsive">
        <div className="flex justify-between items-center">
          {/* 1. Left: Logo & Links */}
          <div className="flex items-center gap-12">
            <Link href="/" className="flex-shrink-0 transition-transform hover:scale-105">
              <Logo />
            </Link>

            {user && (
              <div className="hidden lg:flex items-center gap-8">
                {[
                  { label: 'Explore', href: '/' },
                  { label: 'Orders', href: '/profile' },
                  { label: 'Offers', href: '/' }
                ].map((item) => (
                  <Link 
                    key={item.label} 
                    href={item.href}
                    className={`text-sm font-bold tracking-tight transition-colors ${
                      (pathname === item.href) ? 'text-[#d97757]' : 'text-[#888888] hover:text-[#111111]'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 2. Right: Search, Auth / User Section */}
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-6">
                <button className="text-gray-400 hover:text-[#111111] transition-colors"><Search size={20} /></button>
                {user && (
                   <>
                     <NotificationBell />
                     <button onClick={() => router.push('/profile')} className="text-gray-400 hover:text-[#111111] transition-colors ml-4"><Settings size={20} /></button>
                   </>
                )}
             </div>

            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-4 relative ml-2">
                   {user.role === 'customer' && cartItemCount > 0 && (
                     <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                       <Link href="/cart" className="relative p-2 text-gray-500 hover:text-[#111111] transition-all">
                          <ShoppingCart size={22} />
                          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-black text-white bg-[#d97757] rounded-full border-2 border-white">
                             {cartItemCount}
                          </span>
                       </Link>
                     </motion.div>
                   )}
                   
                   <button 
                     onClick={() => setIsProfileOpen(!isProfileOpen)}
                     className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl transition-all border border-gray-100"
                   >
                      <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                         <div className="w-full h-full bg-[#fef3f2] flex items-center justify-center text-[#d97757] text-xs font-black">
                            {user.name?.slice(0, 2).toUpperCase()}
                         </div>
                      </div>
                     <div className="hidden sm:block text-left">
                        <p className="text-[11px] font-black text-[#111111] uppercase tracking-tight leading-none mb-1">{user.name?.split(' ')[0]}</p>
                        <p className="text-[9px] font-bold text-[#888888] uppercase tracking-widest">{user.role}</p>
                     </div>
                   </button>

                   <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute right-0 top-full mt-4 w-56 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-[60]"
                      >
                         <div className="p-2">
                           <Link 
                             href={user.role === 'merchant' ? '/merchant/dashboard' : user.role === 'driver' ? '/driver/dashboard' : '/profile'}
                             className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-[#888888] hover:text-[#111111] transition-all text-xs font-bold"
                             onClick={() => setIsProfileOpen(false)}
                           >
                             <User size={16} />
                             <span>Profile Details</span>
                           </Link>
                           <button 
                             onClick={handleLogout}
                             className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-500 transition-all text-xs font-bold text-left"
                           >
                             <LogOut size={16} />
                             <span>Sign Out</span>
                           </button>
                         </div>
                      </motion.div>
                    )}
                   </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-sm font-bold text-[#111111] hover:text-[#d97757] transition-all px-4">
                    Log In
                  </Link>
                  <Link href="/register" className="bg-[#d97757] text-white text-sm font-bold px-8 py-3.5 rounded-xl hover:bg-[#c2654a] transition-all shadow-md text-center">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-xl text-[#d97757]"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="container-responsive py-6 flex flex-col gap-4">
               {user && ['Explore', 'Orders', 'Offers'].map((item) => (
                  <Link key={item} href="#" className="text-lg font-bold text-[#111111] p-2" onClick={() => setMobileMenuOpen(false)}>
                    {item}
                  </Link>
               ))}
               {!user && (
                 <>
                   <Link href="/login" className="text-lg font-bold text-[#111111] p-2" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                   <Link href="/register" className="bg-[#d97757] text-white text-lg font-bold p-4 rounded-xl text-center" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                 </>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
