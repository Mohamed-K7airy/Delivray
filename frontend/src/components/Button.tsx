'use client';
import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const baseStyle = "button-responsive inline-flex items-center justify-center font-black transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-xl shadow-primary/20",
    secondary: "bg-white/10 text-white hover:bg-white/20 shadow-xl shadow-white/5",
    outline: "border-2 border-white/10 text-white hover:border-primary hover:text-primary bg-transparent",
    ghost: "bg-transparent text-gray-400 hover:bg-white/5 hover:text-white"
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px]",
    md: "px-6 sm:px-10 py-3 sm:py-4 text-[10px] sm:text-xs",
    lg: "px-8 sm:px-12 py-4 sm:py-5 text-xs sm:text-sm"
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
