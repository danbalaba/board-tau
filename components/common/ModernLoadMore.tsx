'use client';

import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import { IconChevronDown, IconLoader2, IconSparkles } from '@tabler/icons-react';
import { cn } from '@/utils/helper';

interface ModernLoadMoreProps {
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
  label?: string;
  loadingLabel?: string;
  className?: string;
}

export const ModernLoadMore = ({
  onLoadMore,
  isLoading,
  hasMore,
  label = "Load More",
  loadingLabel = "Fetching more...",
  className
}: ModernLoadMoreProps) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoading, onLoadMore]);

  if (!hasMore) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-8 px-4"
      >
        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-gray-300 mb-2 grayscale opacity-40">
          <IconSparkles size={20} />
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
          You've reached the end
        </p>
      </motion.div>
    );
  }

  return (
    <div ref={ref} className={cn("w-full py-8 flex flex-col items-center justify-center transition-all duration-700", className)}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary relative overflow-hidden">
                <IconLoader2 size={20} className="animate-spin relative z-10" />
                <motion.div 
                  className="absolute inset-0 bg-primary/15"
                  animate={{ 
                    scale: [1, 1.4, 1],
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-primary animate-pulse">
              {loadingLabel}
            </p>
          </motion.div>
        ) : (
          <motion.button
            key="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={onLoadMore}
            className="group relative flex flex-col items-center gap-3 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg shadow-gray-200/20 dark:shadow-none flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:border-primary/30 transition-all duration-500 group-hover:-translate-y-0.5">
              <IconChevronDown size={20} className="group-hover:translate-y-0.5 transition-transform duration-500" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 group-hover:text-primary transition-colors duration-500">
              {label}
            </span>
            
            {/* Background Glow */}
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
