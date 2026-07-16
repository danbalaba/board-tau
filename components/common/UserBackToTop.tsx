'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const UserBackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // For tenant side, we usually watch the window scroll
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
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
            "fixed right-4 md:right-10 z-[60]",
            "bottom-24 md:bottom-28", // Positioned nicely above ChatBot on mobile
            "p-3.5 md:p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur-xl",
            "bg-primary text-white",
            "border border-white/20",
            "hover:bg-primary/90 hover:scale-110 active:scale-95",
            "transition-all duration-300 group"
          )}
          aria-label="Back to top"
        >
          <ArrowUp
            size={20}
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

export default UserBackToTop;
