'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import MerchantSidebar from '@/components/MerchantSidebar';
import MerchantNavbar from '@/components/MerchantNavbar';
import { motion } from 'framer-motion';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('merchant-sidebar-collapsed');
    if (stored === 'true') setIsCollapsed(true);
  }, []);

  const toggleCollapse = (val: boolean) => {
    setIsCollapsed(val);
    localStorage.setItem('merchant-sidebar-collapsed', String(val));
  };

  useEffect(() => {
    if (mounted) {
      if (!token || user?.role !== 'merchant') {
        router.replace('/login');
      }
    }
  }, [token, user, router, mounted]);

  if (!mounted || !token || user?.role !== 'merchant') {
     return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-bold">
           <div className="w-12 h-12 border-4 border-[#0f172a] border-t-transparent rounded-full animate-spin" />
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#111111] flex relative overflow-x-hidden">
      <MerchantSidebar isCollapsed={isCollapsed} setIsCollapsed={toggleCollapse} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      <main 
        className={`flex-1 flex flex-col min-h-screen relative z-10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isCollapsed ? 'md:ml-16 lg:ml-20' : 'md:ml-56 lg:ml-64'
        }`}
      >
        <MerchantNavbar isCollapsed={isCollapsed} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#0f172a]/5 rounded-full blur-[150px] pointer-events-none -mr-40 -mt-80"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full relative z-20 max-w-[1600px] mx-auto p-4 sm:p-8 lg:p-12 xl:p-16"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
