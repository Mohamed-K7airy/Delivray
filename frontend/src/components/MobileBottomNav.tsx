'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  User
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  
  // Hide bottom nav on desktop, or specific auth pages
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');
  if (isAuthPage) return null;

  // We only show this for customers
  if (user && user.role !== 'customer') return null;

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, path: '/cart' },
    { id: 'orders', label: 'Orders', icon: Package, path: '/profile' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-white border-t border-slate-100 z-[150] shadow-[0_-4px_24px_rgba(0,0,0,0.02)] px-2 pb-[env(safe-area-inset-bottom)]">
      <nav className="h-full flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link 
              key={item.id} 
              href={item.path}
              className="relative flex flex-col items-center justify-center w-auto px-4 h-full gap-1 group"
            >
              <div className={`transition-all duration-300 ${isActive ? 'text-slate-900 -translate-y-1' : 'text-slate-400 group-hover:text-slate-600'}`}>
                <item.icon size={22} className={isActive ? 'fill-slate-900/10' : ''} />
              </div>
              <span className={`text-[9px] font-bold tracking-widest uppercase transition-all duration-300 ${isActive ? 'text-slate-900 opacity-100' : 'text-slate-400 opacity-0 lg:opacity-100 absolute bottom-1'}`}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="mobileBottomNavIndicator"
                  className="absolute top-0 w-8 h-1 bg-slate-900 rounded-b-full shadow-[0_2px_8px_rgba(15,23,42,0.4)]"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
