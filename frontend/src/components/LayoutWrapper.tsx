'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPortal = pathname?.startsWith('/merchant') || pathname?.startsWith('/driver') || pathname?.startsWith('/admin');

  useEffect(() => {
    const handleUnauthorized = () => {
      router.push('/login');
    };
    window.addEventListener('delivray-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('delivray-unauthorized', handleUnauthorized);
  }, [router]);

  return (
    <>
      {!isPortal && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isPortal && <Footer />}
    </>
  );
}
