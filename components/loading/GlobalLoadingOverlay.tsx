"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useLoading } from "./LoadingContext";
import SafeImage from "@/components/common/SafeImage";
import { preloadKerbyAssets } from "@/utils/imagePreloader";

import {
  MASTER_LOADING_CONFIGS,
  getLoadingContextFromPath,
  LoadingContextKey,
} from "@/utils/loadingMessages";

// Preload mascot assets early on client load
if (typeof window !== "undefined") {
  preloadKerbyAssets();
}

const MINIMUM_LOADING_TIME = process.env.NODE_ENV === "test" ? 800 : 1500;

const GlobalLoadingOverlay: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoading, loadingContext, loadingMeta, stopLoading } = useLoading();

  const [shouldRender, setShouldRender] = useState(false);
  const [poseIdx, setPoseIdx] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const loadingStartTimeRef = useRef<number>(0);
  const startPathRef = useRef<string>("");

  // Determine current context (explicitly provided or auto-inferred from pathname)
  const resolvedContextKey: LoadingContextKey =
    (loadingContext as LoadingContextKey) || getLoadingContextFromPath(pathname);
  const currentConfig =
    MASTER_LOADING_CONFIGS[resolvedContextKey] || MASTER_LOADING_CONFIGS.default;
  const poses = currentConfig.poses;
  const tips = currentConfig.tips;

  // Sync local visibility with global state and pick random starting mascot pose
  useEffect(() => {
    if (isLoading) {
      preloadKerbyAssets();
      setShouldRender(true);
      if (!loadingStartTimeRef.current) {
        loadingStartTimeRef.current = Date.now();
        startPathRef.current = `${pathname}?${searchParams?.toString() || ""}`;
      }
      setPoseIdx((prev) => (prev + 1) % poses.length);
      setTipIdx(0);
    } else {
      loadingStartTimeRef.current = 0;
      startPathRef.current = "";
      if (shouldRender) {
        // When isLoading becomes false, smoothly snap progress to 100% then dismiss
        setProgress(100);
        const timer = setTimeout(() => {
          setShouldRender(false);
        }, 250);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, shouldRender, poses.length]);

  // Rotate tips periodically while overlay is visible
  useEffect(() => {
    if (!shouldRender || tips.length <= 1) return;
    const interval = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % tips.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [shouldRender, tips.length]);

  // Real-time trickling progress while loading is active
  useEffect(() => {
    if (!shouldRender || !isLoading) return;

    setProgress(20);
    const t1 = setTimeout(() => setProgress(45), 250);
    const t2 = setTimeout(() => setProgress(70), 800);
    const t3 = setTimeout(() => setProgress(85), 2000);
    const t4 = setTimeout(() => setProgress(92), 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [shouldRender, isLoading]);

  // Route Navigation Complete Detection:
  // Only complete if an actual route change occurred since loading started!
  useEffect(() => {
    if (!shouldRender) return;

    const currentPath = `${pathname}?${searchParams?.toString() || ""}`;
    const hasNavigated = Boolean(startPathRef.current && currentPath !== startPathRef.current);

    if (hasNavigated) {
      const elapsedTime = Date.now() - loadingStartTimeRef.current;
      const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - elapsedTime);

      const timer = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setShouldRender(false);
          stopLoading();
        }, 200);
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, stopLoading, shouldRender]);

  // Fail-safe: Always stop after 10 seconds no matter what in case of network freeze
  useEffect(() => {
    if (shouldRender) {
      const failSafe = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setShouldRender(false);
          stopLoading();
        }, 200);
      }, 10000);
      return () => clearTimeout(failSafe);
    }
  }, [shouldRender, stopLoading]);

  if (!shouldRender) return null;

  const currentPose = poses[poseIdx % poses.length];
  const displayTitle = loadingMeta?.title || currentPose.title;
  const displaySubtitle = loadingMeta?.subtitle || currentPose.subtitle;

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white/75 dark:bg-[#020817]/85 backdrop-blur-2xl antialiased overflow-x-hidden max-w-full w-full"
        >
          {/* Top Real-time Dynamic Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 z-[10000] bg-primary/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(20,184,166,0.6)]"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.35 }}
            />
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-5 sm:gap-6 text-center max-w-sm px-6"
          >
            {/* Context Badge */}
            {currentPose.badge && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary dark:text-emerald-400"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {currentPose.badge}
              </motion.div>
            )}

            {/* Animated Kerby Mascot Display with continuous floating */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center overflow-visible">
              <motion.div
                className="absolute -inset-8 rounded-full border border-primary/20 bg-primary/10 pointer-events-none"
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full flex items-center justify-center"
              >
                <SafeImage
                  src={currentPose.src}
                  fallbackSrc={currentPose.fallbackSrc}
                  alt="BoardTAU Mascot"
                  priority={true}
                  showSkeleton={false}
                  showSpinner={false}
                  containerClassName="w-full h-full overflow-visible flex items-center justify-center"
                  className="w-full h-full object-contain filter drop-shadow-2xl"
                />
              </motion.div>
            </div>

            {/* Dynamic Status Text */}
            <div className="space-y-1.5">
              <motion.h4
                key={displayTitle}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-black uppercase tracking-[0.25em] text-primary"
              >
                {displayTitle}
              </motion.h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                {displaySubtitle}
              </p>
            </div>

            {/* Context-Aware Rotating Tip Widget */}
            {tips && tips.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 px-3.5 py-2 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/80 max-w-xs shadow-xs"
              >
                <AnimatePresence mode="wait">
                  <motion.p
                    key={tipIdx}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.2 }}
                    className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-snug line-clamp-2"
                  >
                    {tips[tipIdx % tips.length]}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoadingOverlay;
