"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useLoading } from "./LoadingContext";
import SafeImage from "@/components/common/SafeImage";
import { preloadKerbyAssets } from "@/utils/imagePreloader";

const MINIMUM_LOADING_TIME = 800;

const GLOBAL_KERBY_POSES = [
  {
    src: '/assets/mascot/kerby-global-search.png',
    fallbackSrc: '/assets/mascot/kerby-casual-waving.png',
    title: 'BoardTAU Syncing',
    subtitle: 'Preparing your destination & housing data...'
  },
  {
    src: '/assets/mascot/kerby-global-scooter.png',
    fallbackSrc: '/assets/mascot/kerby-uniform-driving.png',
    title: 'Zooming to Route',
    subtitle: 'Navigating across campus & property listings...'
  },
  {
    src: '/assets/mascot/kerby-global-studying.png',
    fallbackSrc: '/assets/mascot/kerby-casual-studying.png',
    title: 'Fetching Live Data',
    subtitle: 'Calculating availability & amenity specs...'
  },
  {
    src: '/assets/mascot/kerby-global-navigation.png',
    fallbackSrc: '/assets/mascot/kerby-casual-excited.png',
    title: 'Almost Ready!',
    subtitle: 'Finalizing view layout & dynamic features...'
  }
];

const GlobalLoadingOverlay: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoading, stopLoading } = useLoading();

  const [shouldRender, setShouldRender] = useState(false);
  const [poseIdx, setPoseIdx] = useState(0);
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});
  const loadingStartTimeRef = useRef<number>(0);

  // Sync local visibility with global state and pick random starting mascot pose
  useEffect(() => {
    if (isLoading) {
      preloadKerbyAssets();
      setShouldRender(true);
      loadingStartTimeRef.current = Date.now();
      setPoseIdx((prev) => (prev + 1) % GLOBAL_KERBY_POSES.length);
    }
  }, [isLoading]);

  // Navigation Complete Detection
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

  // Fail-safe: Always stop after 5 seconds no matter what
  useEffect(() => {
    if (shouldRender) {
      const failSafe = setTimeout(() => {
        setShouldRender(false);
        stopLoading();
      }, 5000);
      return () => clearTimeout(failSafe);
    }
  }, [shouldRender, stopLoading]);

  if (!shouldRender) return null;

  const currentPose = GLOBAL_KERBY_POSES[poseIdx];

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white/70 dark:bg-[#020817]/80 backdrop-blur-2xl antialiased overflow-x-hidden max-w-full w-full"
        >
          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 z-[10000]">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-teal-500 to-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-6 text-center max-w-sm px-6"
          >
            {/* Animated Kerby Mascot Display */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center overflow-visible">
              <motion.div
                className="absolute -inset-8 rounded-full border border-primary/20 bg-primary/10 pointer-events-none"
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <SafeImage
                src={currentPose.src}
                fallbackSrc={currentPose.fallbackSrc}
                alt="BoardTAU Mascot"
                showSkeleton={false}
                containerClassName="w-full h-full overflow-visible flex items-center justify-center"
                className="w-full h-full object-contain filter drop-shadow-2xl"
              />
            </div>

            {/* Dynamic Status Text */}
            <div className="space-y-1.5">
              <motion.h4
                className="text-sm font-black uppercase tracking-[0.25em] text-primary"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {currentPose.title}
              </motion.h4>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                {currentPose.subtitle}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoadingOverlay;
