'use client';
import { useKBar } from 'kbar';
import { IconSearch } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchInput() {
  const { query } = useKBar();
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative cursor-pointer group"
        onClick={query.toggle}
      >
        <div
          className={cn(
            "flex items-center h-10 px-4 rounded-2xl border transition-all duration-500 w-[240px] lg:w-[320px]",
            "bg-gray-100/40 dark:bg-white/[0.03] border-transparent",
            "hover:bg-primary/5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 group-active:scale-95"
          )}
        >
          <div className="flex items-center justify-center w-5 h-5 rounded-lg bg-primary/10 text-primary mr-3 group-hover:scale-110 transition-transform">
            <IconSearch size={14} strokeWidth={2.5} />
          </div>
          <span className="text-[13px] font-semibold text-gray-400 group-hover:text-primary/70 transition-colors flex-1 text-left">
            Search...
          </span>
          <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-all">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded-md text-[9px] font-black border border-gray-200 dark:border-gray-700 shadow-sm">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded-md text-[9px] font-black border border-gray-200 dark:border-gray-700 shadow-sm">K</kbd>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
