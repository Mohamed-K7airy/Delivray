'use client';
import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const baseStyle = "inline-flex items-center justify-center font-bold tracking-tight transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-xl";
  
  const variants = {
    primary: "bg-[#d97757] text-white hover:bg-[#c2654a] shadow-md",
    secondary: "bg-white text-[#111111] border border-gray-200 hover:bg-gray-50 shadow-sm",
    outline: "border-2 border-gray-200 text-[#555555] hover:border-[#d97757] hover:text-[#d97757] bg-transparent",
    ghost: "bg-transparent text-[#888888] hover:bg-gray-100 hover:text-[#111111]"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
