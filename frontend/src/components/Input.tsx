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
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>}
      <div 
        className={`relative flex items-center bg-white rounded-xl overflow-hidden border-2 transition-all duration-300 ${focused ? 'border-primary ring-4 ring-primary/10' : error ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'}`}
      >
        {icon && (
          <div className={`pl-4 transition-colors ${focused ? 'text-primary' : 'text-gray-400'}`}>
            {icon}
          </div>
        )}
        <input 
          className={`flex-grow px-4 py-3 outline-none text-foreground bg-transparent placeholder-gray-400 ${className}`}
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-500 font-medium ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
