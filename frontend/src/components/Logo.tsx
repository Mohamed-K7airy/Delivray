import React from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
        <div className="w-5 h-5 border-2 border-white rounded-md relative after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-1.5 after:h-1.5 after:bg-white after:rounded-full"></div>
      </div>
      <span className="text-2xl font-bold tracking-tight text-slate-900">Delivray.</span>
    </div>
  );
}
