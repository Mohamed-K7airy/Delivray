'use client';
import { InputHTMLAttributes, ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: string;
  label?: string;
}

export default function Input({ icon, error, label, className = '', ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full flex flex-col gap-2">
      {label && <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">{label}</label>}
      <div 
        className={`relative flex items-center bg-white/5 rounded-2xl overflow-hidden border transition-all duration-300 ${focused ? 'border-primary shadow-[0_0_20px_rgba(217,119,87,0.15)] bg-white/[0.08]' : error ? 'border-red-500/50 bg-red-500/5' : 'border-white/5 hover:border-white/10'}`}
      >
        {icon && (
          <div className={`pl-5 transition-colors ${focused ? 'text-primary' : 'text-gray-500'}`}>
            {icon}
          </div>
        )}
        <input 
          className={`flex-grow px-5 py-4 sm:py-5 outline-none text-white bg-transparent placeholder-gray-600 text-sm font-medium ${className}`}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-[10px] text-red-400 font-bold uppercase tracking-wider ml-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
