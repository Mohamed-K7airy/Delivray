'use client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import MerchantNavbar from '@/components/MerchantNavbar'; // We can reuse or create AdminNavbar
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('admin-sidebar-collapsed');
    if (stored === 'true') setIsCollapsed(true);
  }, []);

  const toggleCollapse = (val: boolean) => {
    setIsCollapsed(val);
    localStorage.setItem('admin-sidebar-collapsed', String(val));
  };

  useEffect(() => {
    if (mounted) {
      if (!token || user?.role !== 'admin') {
        router.replace('/login');
      }
    }
  }, [token, user, router, mounted]);

  if (!mounted || !token || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#d97757] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f9f9f9] text-[#111111] relative overflow-x-hidden">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={toggleCollapse} />
      <div 
        className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isCollapsed ? 'ml-0 md:ml-24' : 'ml-0 md:ml-80'
        }`}
      >
        <MerchantNavbar isCollapsed={isCollapsed} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 custom-scrollbar relative">
           {/* Background Decor */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#d97757]/5 rounded-full blur-[150px] pointer-events-none -mr-40 -mt-80"></div>
          
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="relative z-10 h-full max-w-[1600px] mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
