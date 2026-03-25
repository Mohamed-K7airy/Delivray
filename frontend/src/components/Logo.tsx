import React from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        className="text-primary w-full h-full drop-shadow-sm" 
        fill="currentColor" 
        style={{ minWidth: '32px' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top Dash */}
        <polygon points="12,28 28,28 24,36 8,36" />
        {/* Middle Dash */}
        <polygon points="6,46 22,46 18,54 2,54" />
        {/* Bottom Dash */}
        <polygon points="14,64 26,64 22,72 10,72" />
        
        {/* Right side curve (Map Pin body) */}
        <path d="M 34,28 
                 L 50,28 
                 C 75,28 92,38 92,58 
                 C 92,72 80,84 62,100 
                 L 52,90 
                 C 48,86 44,81 40,76 
                 L 50,70 
                 C 53,74 65,85 64,83
                 C 75,72 80,64 80,56
                 C 80,44 68,38 50,38
                 L 31,38 Z" 
        />
        
        {/* Inner Arrow */}
        <polygon points="30,44 55,44 55,34 75,50 55,66 55,56 26,56" />
      </svg>
      <span className="text-3xl font-black text-white tracking-tight logo-text">
        Delivray
      </span>
    </div>
  );
}
