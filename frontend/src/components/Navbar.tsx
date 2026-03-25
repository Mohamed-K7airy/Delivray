'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, LogOut, User, Store, LogIn, UserPlus, Menu, X, Search, Bell, Settings } from 'lucide-react';
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

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white border-b border-gray-100 sticky top-0 z-50 py-3 md:py-4 transition-all"
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
                {['Explore', 'Orders', 'Offers'].map((item) => (
                  <Link 
                    key={item} 
                    href={`#${item.toLowerCase()}`}
                    className={`text-sm font-bold tracking-tight transition-colors ${
                      item === 'Explore' ? 'text-[#FF5A3C]' : 'text-gray-500 hover:text-[#0A0A0A]'
                    }`}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 2. Right: Search, Auth / User Section */}
          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:flex items-center gap-6">
               <button className="text-gray-400 hover:text-[#0A0A0A] transition-colors">
                  <Search size={20} />
               </button>
               {user && (
                 <>
                   <button className="text-gray-400 hover:text-[#0A0A0A] transition-colors relative">
                      <Bell size={20} />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full border-2 border-white"></span>
                   </button>
                   <button className="text-gray-400 hover:text-[#0A0A0A] transition-colors">
                      <Settings size={20} />
                   </button>
                 </>
               )}
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-4 relative ml-2">
                   {user.role === 'customer' && cartItemCount > 0 && (
                     <Link href="/cart" className="relative p-2 text-gray-500 hover:text-[#0A0A0A]">
                        <ShoppingCart size={22} />
                        <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-[#FF5A3C] rounded-full border-2 border-white">
                           {cartItemCount}
                        </span>
                     </Link>
                   )}
                   
                   <button 
                     onClick={() => setIsProfileOpen(!isProfileOpen)}
                     className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-2xl transition-all border border-gray-100"
                   >
                     <div className="w-10 h-10 bg-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="w-full h-full bg-[#3B3B3B] flex items-center justify-center text-white text-xs font-bold uppercase italic">
                           {user.name?.slice(0, 2)}
                        </div>
                     </div>
                     <div className="hidden sm:block text-left">
                        <p className="text-[11px] font-black text-[#0A0A0A] uppercase tracking-tight leading-none mb-1">{user.name?.split(' ')[0]}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{user.role} Partner</p>
                     </div>
                   </button>

                   <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute right-0 top-full mt-4 w-56 bg-white border border-gray-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden z-[60]"
                      >
                         <div className="p-2">
                           <Link 
                             href={user.role === 'merchant' ? '/merchant/dashboard' : user.role === 'driver' ? '/driver/dashboard' : '/profile'}
                             className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-[#0A0A0A] transition-all text-xs font-bold"
                             onClick={() => setIsProfileOpen(false)}
                           >
                             <User size={16} />
                             <span>Profile Details</span>
                           </Link>
                           <button 
                             onClick={handleLogout}
                             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-500 transition-all text-xs font-bold text-left"
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
                  <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-[#0A0A0A] transition-all px-4">
                    Log In
                  </Link>
                  <Link href="/register" className="bg-[#FF5A3C] text-white text-sm font-bold px-8 py-3.5 rounded-2xl hover:bg-[#E84A2C] transition-all shadow-lg shadow-[#FF5A3C]/20 text-center">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
                  <Link key={item} href="#" className="text-lg font-bold text-gray-700 p-2" onClick={() => setMobileMenuOpen(false)}>
                    {item}
                  </Link>
               ))}
               {!user && (
                 <>
                   <Link href="/login" className="text-lg font-bold text-gray-700 p-2" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                   <Link href="/register" className="bg-[#FF5A3C] text-white text-lg font-bold p-4 rounded-xl text-center" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                 </>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
