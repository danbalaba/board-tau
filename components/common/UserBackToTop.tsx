'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useCompareStore } from '@/hooks/use-compare-store';
import { useScrollDirection } from '@/hooks/use-scroll-direction';

const UserBackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = (typeof usePathname === 'function' ? usePathname() : "") || "";
  const isListingDetail = pathname.startsWith('/listings/') && pathname.split('/').length > 2;
  const { selectedListingIds } = useCompareStore();
  const hasCompareBar = pathname === '/favorites' && selectedListingIds.length > 0;
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const isHidden = isMobile && scrollDirection === "down";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{
            opacity: isHidden ? 0 : 1,
            scale: isHidden ? 0.9 : 1,
            y: isHidden ? 160 : 0
          }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={scrollToTop}
          className={cn(
            "fixed right-4 md:right-10 z-[60]",
            `${isListingDetail ? 'bottom-48' : hasCompareBar ? 'bottom-56' : 'bottom-36'} md:bottom-28`,
            "p-3.5 md:p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur-xl",
            "bg-primary text-white",
            "border border-white/20",
            "hover:bg-primary/90 hover:scale-110 active:scale-95",
            "group",
            isHidden && "pointer-events-none",
            pathname.startsWith('/become-a-host') && "hidden md:block"
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
