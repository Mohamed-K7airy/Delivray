'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith('/merchant') || pathname?.startsWith('/driver');

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
