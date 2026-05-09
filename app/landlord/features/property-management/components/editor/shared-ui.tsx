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
    <motion.label
      htmlFor={id}
      whileHover={{ scale: 1.01, x: 2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center space-x-3 cursor-pointer group select-none p-3.5 rounded-xl border transition-all duration-300",
        checked 
          ? "bg-primary/5 border-primary/30 shadow-md shadow-primary/5" 
          : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
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
              ? "bg-primary border-primary shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 group-hover:border-primary/50"
          )}
          initial={false}
          animate={{
            scale: checked ? 1 : 0.95,
            rotate: checked ? 0 : -10
          }}
        >
          <AnimatePresence mode="wait">
            {checked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Check className="w-3.5 h-3.5 text-white stroke-[4px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <span
        className={cn(
          "text-[13px] font-bold uppercase tracking-wider transition-colors duration-300",
          checked ? "text-primary dark:text-primary" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
        )}
      >
        {label}
      </span>
    </motion.label>
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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{ y: -4, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.05)" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 md:p-12 shadow-sm relative overflow-hidden group mb-12 scroll-mt-24 transition-colors duration-500 hover:border-primary/20"
    >
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 pointer-events-none group-hover:scale-125 group-hover:-rotate-12">
        <Icon size={120} />
      </div>

      <div className="flex items-center gap-5 mb-12">
        <motion.div 
          whileHover={{ rotate: 12, scale: 1.1 }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-2xl shadow-primary/25 relative z-10"
        >
          <Icon size={24} />
        </motion.div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            {title}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <div className="w-6 h-[2px] bg-primary/30" />
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">{description}</p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {children}
      </motion.div>
    </motion.section>
  );
};

export const PropertyEditorHeader = ({ 
  isSubmitting, 
  onSubmit, 
  isEditing 
}: { 
  isSubmitting: boolean, 
  onSubmit: () => void,
  isEditing: boolean
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 shadow-2xl">
            <Check size={24} strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              {isEditing ? 'Refine Listing' : 'Finalize Listing'}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Draft Mode
              </span>
              <div className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Standardized Logic v2.0</span>
            </div>
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={cn(
            "px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed",
            "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-105 active:scale-95 shadow-gray-900/20 dark:shadow-white/10"
          )}
        >
          {isSubmitting ? 'Synchronizing...' : isEditing ? 'Push Updates Live' : 'Launch Listing'}
        </button>
      </div>
    </div>
  );
};

export const PropertyFormSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-[#0B0F1A] pt-40 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-80 lg:shrink-0 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 w-full bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 animate-pulse" />
            ))}
          </div>
          <div className="flex-1 max-w-4xl space-y-24">
            {[1, 2].map((i) => (
              <div key={i} className="h-[500px] w-full bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
