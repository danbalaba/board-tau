'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/helper';

interface Option {
  value: string;
  label: string;
}

interface ModernInquirySelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export function ModernInquirySelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  label,
  error
}: ModernInquirySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block font-black text-[10px] uppercase tracking-widest mb-2 text-gray-400">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border",
          isOpen 
            ? "border-emerald-500/50 ring-1 ring-emerald-500/30 bg-white dark:bg-gray-900" 
            : error 
              ? "border-rose-500/50 bg-rose-500/5" 
              : "bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-sm"
        )}
      >
        <span className={cn(
          "text-sm font-bold tracking-tight",
          selectedOption ? "text-gray-900 dark:text-white" : "text-gray-400"
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-gray-500 transition-transform duration-300",
            isOpen && "rotate-180 text-emerald-500"
          )} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[100] left-0 right-0 p-2 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            <div className="max-h-60 overflow-y-auto scrollbar-hide">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 mb-1 last:mb-0",
                    value === option.value
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-rose-500 px-1">
          {error}
        </p>
      )}
    </div>
  );
}
