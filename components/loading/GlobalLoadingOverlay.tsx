"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLoading } from "./LoadingContext";
import LoadingAnimation from "../common/LoadingAnimation";

const MINIMUM_LOADING_TIME = 800;

const GlobalLoadingOverlay: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoading, stopLoading } = useLoading();
  
  const [shouldRender, setShouldRender] = useState(false);
  const loadingStartTimeRef = useRef<number>(0);

  // 1. Sync local visibility with global state and track start time
  useEffect(() => {
    if (isLoading) {
      setShouldRender(true);
      loadingStartTimeRef.current = Date.now();
    }
  }, [isLoading]);

  // 2. Navigation Complete Detection
  useEffect(() => {
    if (!shouldRender) return;

    const endLoading = () => {
      const elapsedTime = Date.now() - loadingStartTimeRef.current;
      const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - elapsedTime);

      setTimeout(() => {
        setShouldRender(false);
        stopLoading();
      }, remainingTime);
    };

    endLoading();
  }, [pathname, searchParams, stopLoading, shouldRender]);

  // 3. Fail-safe: Always stop after 5 seconds no matter what
  useEffect(() => {
    if (shouldRender) {
      const failSafe = setTimeout(() => {
        setShouldRender(false);
        stopLoading();
      }, 5000);
      return () => clearTimeout(failSafe);
    }
  }, [shouldRender, stopLoading]);

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/40 dark:bg-[#020817]/60 backdrop-blur-xl"
        >
          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 z-[10000]">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="relative">
                <motion.div 
                    className="absolute -inset-8 rounded-full border border-primary/20"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
                <LoadingAnimation text="" size="large" />
            </div>

            <div className="flex flex-col items-center gap-3">
                <motion.span 
                    className="text-xs font-black uppercase tracking-[0.3em] text-primary dark:text-emerald-400"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    BoardTAU Syncing
                </motion.span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest opacity-60">
                    Preparing your destination
                </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoadingOverlay;
