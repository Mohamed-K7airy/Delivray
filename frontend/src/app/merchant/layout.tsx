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
        <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center font-black">
           <div className="w-12 h-12 border-4 border-[#FF5A3C] border-t-transparent rounded-full animate-spin" />
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-[#0A0A0A] flex relative overflow-x-hidden">
      <MerchantSidebar isCollapsed={isCollapsed} setIsCollapsed={toggleCollapse} />
      <main 
        className={`flex-1 flex flex-col min-h-screen relative z-10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isCollapsed ? 'md:ml-20 lg:ml-24' : 'md:ml-64 lg:ml-80'
        }`}
      >
        <MerchantNavbar isCollapsed={isCollapsed} />
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#FF5A3C]/5 rounded-full blur-[150px] pointer-events-none -mr-40 -mt-80"></div>
          
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
