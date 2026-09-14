"use client";

import React, { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface HelpTooltipProps {
  text: string;
  children?: React.ReactNode;
  forceVisible?: boolean;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ text, children, forceVisible }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const wasClickedRef = useRef<boolean>(false);
  const [coords, setCoords] = useState({ 
    top: 0, 
    left: 0, 
    isTop: false,
    transform: 'translateX(-50%)',
    pointerLeft: '50%'
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const isNearBottom = rect.bottom > window.innerHeight - 80;
      
      let left = rect.left + rect.width / 2;
      let transform = 'translateX(-50%)';
      let pointerLeft = '50%';
      const screenWidth = document.documentElement.clientWidth;
      const estimatedHalfWidth = 160; // Max width is 320px, so half is 160px

      // Edge clamping to prevent overflow on mobile
      if (left < estimatedHalfWidth + 16) {
        left = 16;
        transform = isNearBottom ? 'translate(0, -100%)' : 'translateX(0)';
        pointerLeft = `${rect.left + rect.width / 2 - 16}px`;
      } else if (left > screenWidth - estimatedHalfWidth - 16) {
        left = screenWidth - 16;
        transform = isNearBottom ? 'translate(-100%, -100%)' : 'translateX(-100%)';
        pointerLeft = `calc(100% - ${screenWidth - 16 - (rect.left + rect.width / 2)}px)`;
      } else {
        transform = isNearBottom ? 'translate(-50%, -100%)' : 'translateX(-50%)';
      }

      setCoords({
        top: isNearBottom ? rect.top - 8 : rect.bottom + 8,
        left,
        transform,
        pointerLeft,
        isTop: isNearBottom
      });
    }
  };

  const handleMouseEnter = () => {
    if (wasClickedRef.current) return;
    timeoutRef.current = setTimeout(() => {
      updatePosition();
      setIsVisible(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!wasClickedRef.current) {
      setIsVisible(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    if (isVisible && wasClickedRef.current) {
      wasClickedRef.current = false;
      setIsVisible(false);
    } else {
      wasClickedRef.current = true;
      updatePosition();
      setIsVisible(true);
    }
  };

  useEffect(() => {
    if (isVisible) {
      const handleGlobalDismiss = (e: Event) => {
        const targetNode = e.target as Node;
        if (triggerRef.current && (triggerRef.current === targetNode || triggerRef.current.contains(targetNode))) {
          return;
        }
        wasClickedRef.current = false;
        setIsVisible(false);
      };

      const timer = setTimeout(() => {
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        window.addEventListener('touchstart', handleGlobalDismiss);
        window.addEventListener('click', handleGlobalDismiss);
      }, 50);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('touchstart', handleGlobalDismiss);
        window.removeEventListener('click', handleGlobalDismiss);
      };
    }
  }, [isVisible]);

  // Sync with forceVisible prop
  useEffect(() => {
    if (forceVisible !== undefined) {
      if (forceVisible) {
        updatePosition();
        setIsVisible(true);
      } else {
        wasClickedRef.current = false;
        setIsVisible(false);
      }
    }
  }, [forceVisible]);

  return (
    <div 
      ref={triggerRef}
      className={`relative flex items-center justify-center z-50 ${children ? 'w-full' : 'ml-1.5'} select-none`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children ? (
        children
      ) : (
        <Info size={14} className="text-gray-400 hover:text-primary transition-colors cursor-help" strokeWidth={2.5} />
      )}
      
      {isMounted && createPortal(
        <AnimatePresence>
          {isVisible && (
            <div
              style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                transform: coords.transform,
                zIndex: 999999,
                width: 'max-content',
                maxWidth: 'calc(100vw - 32px)'
              }}
              className="pointer-events-none"
            >
              <motion.div
                initial={{ opacity: 0, y: coords.isTop ? 5 : -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: coords.isTop ? 5 : -5 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-[320px] p-2.5 text-[11px] leading-relaxed font-normal text-white bg-gray-800 dark:bg-gray-700 shadow-xl rounded-lg"
              >
                <div className="relative z-10 whitespace-normal text-center">{text}</div>
                <div 
                  style={{ left: coords.pointerLeft }}
                  className={`absolute -translate-x-1/2 border-4 border-transparent ${
                    coords.isTop 
                      ? 'top-full -mt-[1px] border-t-gray-800 dark:border-t-gray-700' 
                      : 'bottom-full -mb-[1px] border-b-gray-800 dark:border-b-gray-700'
                  }`}
                ></div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default HelpTooltip;
