'use client';
import Link from 'next/link';
import Logo from './Logo';
import { Globe, Share2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/merchant')) return null;

  return (
    <footer className="bg-[#262624] pt-12 sm:pt-20 pb-8 sm:pb-10 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 sm:mb-16 gap-6 sm:gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-sm">
            <Logo />
            <p className="text-gray-500 mt-6 text-sm font-medium leading-relaxed">
              © 2024 DELIVRAY. THE NEON NOCTURNE EXPERIENCE. delivering happiness to your doorstep with speed and precision, anytime, anywhere.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-10 md:gap-14">
            <Link href="/privacy" className="text-gray-300 hover:text-white text-xs font-black tracking-widest uppercase transition-colors">Privacy</Link>
            <Link href="/terms" className="text-gray-300 hover:text-white text-xs font-black tracking-widest uppercase transition-colors">Terms</Link>
            <Link href="/fleet" className="text-gray-300 hover:text-white text-xs font-black tracking-widest uppercase transition-colors">Fleet</Link>
            <Link href="/support" className="text-gray-300 hover:text-white text-xs font-black tracking-widest uppercase transition-colors">Support</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/10">
              <Globe size={18} />
            </button>
            <button className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/10">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
