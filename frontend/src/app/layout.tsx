import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'sonner';
import LayoutWrapper from '@/components/LayoutWrapper';
import PageTransition from '@/components/PageTransition';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Delivray - Food & Grocery Delivery',
  description: 'Your favorite local stores delivered to your door',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
};

import { SocketProvider } from '@/context/SocketContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground tracking-tight selection:bg-primary/20 flex flex-col min-h-screen`}>
        <ErrorBoundary>
          <SocketProvider>
            <LayoutWrapper>
              <PageTransition>
                {children}
              </PageTransition>
            </LayoutWrapper>
          </SocketProvider>
        </ErrorBoundary>
        <Toaster position="bottom-right" richColors />
        <Script
          id="register-sw"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
