'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconChevronUp } from '@tabler/icons-react';
import { cn } from '@/utils/helper';

const BackToTop = (props: { bottomClass?: string; containerId?: string }) => {
  const bottomClass = props.bottomClass || "bottom-32";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const container = props.containerId ? document.getElementById(props.containerId) : document.getElementById('scroll-container');
      const scrollTop = container ? container.scrollTop : window.scrollY;

      if (scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const target = props.containerId ? document.getElementById(props.containerId) : window;

    if (props.containerId) {
      target?.addEventListener('scroll', toggleVisibility);
    } else {
      window.addEventListener('scroll', toggleVisibility, true);
    }

    return () => {
      if (props.containerId) {
        target?.removeEventListener('scroll', toggleVisibility);
      } else {
        window.removeEventListener('scroll', toggleVisibility, true);
      }
    };
  }, [props.containerId]);

  const scrollToTop = () => {
    const targetId = props.containerId || 'scroll-container';
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={scrollToTop}
          className={cn(
            "fixed right-10 z-40",
            bottomClass,
            "p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl",
            "bg-primary text-white",
            "border-2 border-white/30",
            "hover:bg-primary/90 hover:scale-110 active:scale-95",
            "transition-all duration-300 group"
          )}
          aria-label="Back to top"
        >
          <IconChevronUp
            size={24}
            strokeWidth={3}
            className="group-hover:-translate-y-1 transition-transform duration-300"
          />

          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 rounded-2xl bg-primary blur-xl opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
