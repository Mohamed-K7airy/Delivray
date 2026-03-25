'use client';
import Link from 'next/link';
import Logo from './Logo';
import { Globe, Share2, MessageSquare } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/merchant')) return null;

  return (
    <footer className="bg-white pt-12 sm:pt-24 pb-12 sm:pb-16 border-t border-gray-100 mt-auto">
      <div className="container-responsive">
        <div className="flex flex-col lg:flex-row justify-between gap-16 lg:gap-8 mb-16 sm:mb-20">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-sm">
            <Logo />
            <p className="text-gray-400 mt-8 text-sm font-medium leading-relaxed">
              Your favorite local stores delivered to your doorstep with lightning speed and premium care. Experience the future of delivery today.
            </p>
            <div className="flex items-center gap-4 mt-8">
              {[Globe, Share2, MessageSquare].map((Icon, i) => (
                <button key={i} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#FF5A3C] hover:bg-[#FFF9F8] transition-all border border-gray-100 group">
                  <Icon size={18} className="transition-transform group-hover:scale-110" />
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-20">
            <div className="space-y-6">
               <h4 className="text-[11px] font-black text-[#0A0A0A] uppercase tracking-[0.2em]">Platform</h4>
               <div className="flex flex-col gap-4">
                  <Link href="/explore" className="text-gray-400 hover:text-[#0A0A0A] text-sm font-bold transition-colors">Explore</Link>
                  <Link href="/offers" className="text-gray-400 hover:text-[#0A0A0A] text-sm font-bold transition-colors">Offers</Link>
                  <Link href="/pricing" className="text-gray-400 hover:text-[#0A0A0A] text-sm font-bold transition-colors">Pricing</Link>
               </div>
            </div>
            <div className="space-y-6">
               <h4 className="text-[11px] font-black text-[#0A0A0A] uppercase tracking-[0.2em]">Company</h4>
               <div className="flex flex-col gap-4">
                  <Link href="/about" className="text-gray-400 hover:text-[#0A0A0A] text-sm font-bold transition-colors">About Us</Link>
                  <Link href="/careers" className="text-gray-400 hover:text-[#0A0A0A] text-sm font-bold transition-colors">Careers</Link>
                  <Link href="/support" className="text-gray-400 hover:text-[#0A0A0A] text-sm font-bold transition-colors">Support</Link>
               </div>
            </div>
            <div className="space-y-6 col-span-2 sm:col-span-1">
               <h4 className="text-[11px] font-black text-[#0A0A0A] uppercase tracking-[0.2em]">Legal</h4>
               <div className="flex flex-col gap-4">
                  <Link href="/privacy" className="text-gray-400 hover:text-[#0A0A0A] text-sm font-bold transition-colors">Privacy Policy</Link>
                  <Link href="/terms" className="text-gray-400 hover:text-[#0A0A0A] text-sm font-bold transition-colors">Terms of Service</Link>
               </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
           <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest italic">
              © 2026 DELIVRAY — PREMIUM DISPATCH INTERFACE
           </p>
           <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-gray-400 hover:text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest transition-colors">
                 <Globe size={14} />
                 <span>English (US)</span>
              </button>
           </div>
        </div>
      </div>
    </footer>
  );
}
