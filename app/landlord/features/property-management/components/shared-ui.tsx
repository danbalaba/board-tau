'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { cn } from '@/utils/helper';
import { Check, LucideIcon } from 'lucide-react';

export const LocalCheckbox = ({
  id,
  label,
  checked,
  onChange
}: {
  id: string,
  label: string,
  checked: boolean,
  onChange: () => void
}) => {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center space-x-3 cursor-pointer group select-none p-3 rounded-xl border transition-all duration-200",
        checked 
          ? "bg-primary/5 border-primary/20" 
          : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-primary/20"
      )}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />

        <motion.div
          className={cn(
            "w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center",
            checked
              ? "bg-primary border-primary shadow-sm"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 group-hover:border-primary/50"
          )}
          initial={false}
          animate={{
            scale: checked ? 1 : 0.95,
          }}
          whileTap={{ scale: 0.85 }}
        >
          <AnimatePresence>
            {checked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.15 }}
              >
                <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <span
        className={cn(
          "text-[13px] font-bold uppercase tracking-wider transition-colors duration-200",
          checked ? "text-primary dark:text-primary" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
        )}
      >
        {label}
      </span>
    </label>
  );
};

export const PropertyFormSection = ({ 
    id, 
    children, 
    title, 
    icon: Icon, 
    description, 
    setActiveSection 
  }: {
    id: string,
    children: React.ReactNode,
    title: string,
    icon: LucideIcon | any,
    description: string,
    setActiveSection: (id: string) => void
  }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    amount: 0.1,
    margin: "-200px 0px -60% 0px" 
  });
  
  useEffect(() => {
    if (isInView) setActiveSection(id);
  }, [isInView, id, setActiveSection]);

  return (
    <motion.section 
      id={id}
      ref={ref}
      className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 md:p-12 shadow-sm relative overflow-hidden group mb-12 scroll-mt-24"
    >
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-all duration-500 pointer-events-none group-hover:scale-110">
        <Icon size={120} />
      </div>

      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
          <Icon size={22} />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            {title}
          </h2>
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-1">{description}</p>
        </div>
      </div>

      {children}
    </motion.section>
  );
};
