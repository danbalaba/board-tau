"use client";

import React, { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface HelpTooltipProps {
  text: string;
  children?: React.ReactNode;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, isTop: false });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // Check if there is enough space below. If not, place above.
      const isNearBottom = rect.bottom > window.innerHeight - 80;
      
      setCoords({
        top: isNearBottom ? rect.top - 8 : rect.bottom + 8,
        left: rect.left + rect.width / 2,
        isTop: isNearBottom
      });
    }
  };

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      updatePosition();
      setIsVisible(true);
    }, 400); // 400ms hover debounce
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible]);

  return (
    <div 
      ref={triggerRef}
      className={`relative flex items-center justify-center z-50 ${children ? 'w-full' : 'ml-1.5'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children ? (
        children
      ) : (
        <Info size={14} className="text-gray-400 hover:text-primary transition-colors cursor-help" strokeWidth={2.5} />
      )}
      
      {isMounted && createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, y: coords.isTop ? 5 : -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: coords.isTop ? 5 : -5 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                transform: coords.isTop ? 'translate(-50%, -100%)' : 'translateX(-50%)',
                zIndex: 999999,
              }}
              className="w-max max-w-xs p-2.5 text-[11px] leading-relaxed font-normal text-white bg-gray-800 dark:bg-gray-700 shadow-xl rounded-lg pointer-events-none"
            >
              <div className="relative z-10 whitespace-normal text-center">{text}</div>
              <div 
                className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
                  coords.isTop 
                    ? 'top-full -mt-[1px] border-t-gray-800 dark:border-t-gray-700' 
                    : 'bottom-full -mb-[1px] border-b-gray-800 dark:border-b-gray-700'
                }`}
              ></div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default HelpTooltip;
