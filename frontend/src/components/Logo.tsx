import React from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-10 h-10 bg-[#FF5A3C] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF5A3C]/20 transition-transform group-hover:scale-110">
        <div className="w-5 h-5 border-3 border-white rounded-md relative after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-1.5 after:h-1.5 after:bg-white after:rounded-full"></div>
      </div>
      <span className="text-2xl font-black tracking-tight text-[#0A0A0A]">Delivray</span>
    </div>
  );
}
