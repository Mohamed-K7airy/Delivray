'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  User,
  LayoutDashboard,
  Map,
  History,
  Settings,
  Store,
  Database,
  CreditCard,
  Users,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  
  // Hide bottom nav on desktop, or specific auth pages
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');
  if (isAuthPage) return null;

  let navItems = [];

  if (user?.role === 'driver') {
    navItems = [
      { id: 'dashboard', label: 'Tasks', icon: LayoutDashboard, path: '/driver/dashboard' },
      { id: 'map', label: 'Map', icon: Map, path: '/driver/map' },
      { id: 'history', label: 'History', icon: History, path: '/driver/history' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/driver/settings' }
    ];
  } else if (user?.role === 'merchant') {
    navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/merchant/dashboard' },
      { id: 'orders', label: 'Orders', icon: Package, path: '/merchant/orders' },
      { id: 'inventory', label: 'Inventory', icon: Database, path: '/merchant/inventory' },
      { id: 'payouts', label: 'Payouts', icon: CreditCard, path: '/merchant/payouts' }
    ];
  } else if (user?.role === 'admin') {
    navItems = [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard?tab=overview' },
      { id: 'users', label: 'Users', icon: Users, path: '/admin/dashboard?tab=users' },
      { id: 'stores', label: 'Stores', icon: Store, path: '/admin/dashboard?tab=stores' },
      { id: 'economics', label: 'Finance', icon: DollarSign, path: '/admin/dashboard?tab=economics' }
    ];
  } else {
    // Default Customer Context
    navItems = [
      { id: 'home', label: 'Home', icon: Home, path: '/' },
      { id: 'cart', label: 'Cart', icon: ShoppingCart, path: '/cart' },
      { id: 'orders', label: 'Orders', icon: Package, path: '/profile' },
      { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
    ];
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-white border-t border-slate-100 z-[150] shadow-[0_-4px_24px_rgba(0,0,0,0.02)] px-2 pb-[env(safe-area-inset-bottom)]">
      <nav className="h-full flex items-center justify-around">
        {navItems.map((item) => {
          // Special logic for admin tab query matching
          const isActive = pathname === item.path || 
                           (item.path.includes('?tab=') && typeof window !== 'undefined' && window.location.search.includes(item.path.split('?')[1]));
          
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
                  layoutId="bottomNavIndicator"
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
