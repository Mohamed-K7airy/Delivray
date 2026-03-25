import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'sonner';
import LayoutWrapper from '@/components/LayoutWrapper';
import PageTransition from '@/components/PageTransition';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Delivray - Food & Grocery Delivery',
  description: 'Your favorite local stores delivered to your door',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground tracking-tight selection:bg-primary/20 flex flex-col min-h-screen`}>
        <LayoutWrapper>
          <PageTransition>
            {children}
          </PageTransition>
        </LayoutWrapper>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
