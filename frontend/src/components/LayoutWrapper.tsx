'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuthStore } from '@/store/authStore';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { _hasHydrated, token } = useAuthStore();
  const isPortal = pathname?.startsWith('/merchant') || pathname?.startsWith('/driver') || pathname?.startsWith('/admin');
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');

  useEffect(() => {
    const handleUnauthorized = () => {
      router.push('/login');
    };
    window.addEventListener('delivray-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('delivray-unauthorized', handleUnauthorized);
  }, [router]);

  // Prevent flickering/false logouts during hydration
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {!isPortal && !isAuthPage && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isPortal && !isAuthPage && <Footer />}
    </>
  );
}
