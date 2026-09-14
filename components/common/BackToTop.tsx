'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconChevronUp } from '@tabler/icons-react';
import { cn } from '@/utils/helper';

const BackToTop = (props: { bottomClass?: string; containerId?: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = (e?: Event) => {
      const targetId = props.containerId || 'scroll-container';
      const container = document.getElementById(targetId);
      const target = e?.target as Element | null;

      let scrollTop = 0;
      if (target && target.nodeType === 1 && typeof target.scrollTop === 'number') {
        scrollTop = target.scrollTop;
      } else if (container) {
        scrollTop = container.scrollTop;
      } else {
        scrollTop = Math.max(
          window.scrollY || 0,
          document.documentElement.scrollTop || 0,
          document.body.scrollTop || 0
        );
      }

      if (scrollTop > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Intercept scroll events during capture phase for custom scroll containers like #scroll-container
    window.addEventListener('scroll', toggleVisibility, { capture: true, passive: true });
    document.addEventListener('scroll', toggleVisibility, { capture: true, passive: true });

    const targetId = props.containerId || 'scroll-container';
    const container = document.getElementById(targetId);
    if (container) {
      container.addEventListener('scroll', toggleVisibility, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', toggleVisibility, { capture: true } as any);
      document.removeEventListener('scroll', toggleVisibility, { capture: true } as any);
      if (container) {
        container.removeEventListener('scroll', toggleVisibility);
      }
    };
  }, [props.containerId]);

  const scrollToTop = () => {
    const targetId = props.containerId || 'scroll-container';
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (document.documentElement) {
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={scrollToTop}
          className={cn(
            "fixed z-[90]",
            props.bottomClass 
              ? (/right-|left-/.test(props.bottomClass) ? props.bottomClass : `${props.bottomClass} right-4 md:right-9`)
              : "bottom-24 right-4 md:bottom-[112px] md:right-9",
            "w-11 h-11 md:w-[50px] md:h-[50px] rounded-full md:rounded-2xl shadow-lg md:shadow-2xl backdrop-blur-xl flex items-center justify-center",
            "bg-[#2f7d6d] text-white",
            "border border-white/30 dark:border-white/20",
            "hover:bg-[#256659] hover:scale-110 active:scale-95",
            "transition-all duration-300 group"
          )}
          aria-label="Back to top"
        >
          <IconChevronUp
            size={20}
            strokeWidth={2.8}
            className="group-hover:-translate-y-0.5 transition-transform duration-300"
          />

          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-emerald-500 blur-md opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;

