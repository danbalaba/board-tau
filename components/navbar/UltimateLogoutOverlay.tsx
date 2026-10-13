"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import SafeImage from "@/components/common/SafeImage";
import { MASTER_LOADING_CONFIGS } from "@/utils/loadingMessages";

interface UltimateLogoutOverlayProps {
  userName?: string | null;
}

const LOGOUT_KERBY_POSES = [
  {
    src: '/assets/mascot/kerby-casual-waving.png',
    fallbackSrc: '/assets/mascot/kerby-uniform-waving.png',
    title: 'Signing Out',
  },
  {
    src: '/assets/mascot/kerby-casual-driving.png',
    fallbackSrc: '/assets/mascot/kerby-uniform-driving.png',
    title: 'Heading Out',
  },
  {
    src: '/assets/mascot/kerby-carabao-sleeping-pillow.png',
    fallbackSrc: '/assets/mascot/kerby-casual-sleeping.png',
    title: 'Rest Well',
  },
  {
    src: '/assets/mascot/kerby-casual-loving.png',
    fallbackSrc: '/assets/mascot/kerby-desktop-welcome.png',
    title: 'Safe Travels',
  },
];

const LOGOUT_TIPS = MASTER_LOADING_CONFIGS.logout.tips;

const UltimateLogoutOverlay: React.FC<UltimateLogoutOverlayProps> = ({ userName }) => {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [poseIdx, setPoseIdx] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Progress tick interval for accessibility and test suite
    const progressInterval = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + 1 : 100));
    }, 250);

    // Mascot switching with fade animation (cycles through poses)
    const poseInterval = setInterval(() => {
      setPoseIdx(prev => (prev + 1) % LOGOUT_KERBY_POSES.length);
    }, 2000);

    // Tip rotation interval
    const tipInterval = setInterval(() => {
      setTipIdx(prev => (prev + 1) % LOGOUT_TIPS.length);
    }, 2400);

    return () => {
      setMounted(false);
      clearInterval(progressInterval);
      clearInterval(poseInterval);
      clearInterval(tipInterval);
    };
  }, []);

  if (!mounted) return null;

  const firstName = userName?.split(' ')[0] || 'User';
  const currentPose = LOGOUT_KERBY_POSES[poseIdx];
  const currentTip = LOGOUT_TIPS[tipIdx];

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2147483647] flex flex-col items-center justify-center bg-white/70 dark:bg-[#020817]/80 backdrop-blur-2xl antialiased overflow-x-hidden max-w-full w-full select-none"
      >
        {/* Top Progress Bar matching GlobalLoadingOverlay */}
        <div className="absolute top-0 left-0 right-0 h-1 z-[10000]">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-teal-500 to-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>

        {/* Hidden progress percentage for assistive tech and unit test compatibility */}
        <span className="sr-only" aria-live="polite">{progress}%</span>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center gap-6 text-center max-w-sm px-6"
        >
          {/* Animated Kerby Mascot Showcase with Continuous Floating & Fade-Switching */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center overflow-visible">
            {/* Background glowing halo aura */}
            <motion.div
              className="absolute -inset-8 rounded-full border border-primary/20 bg-primary/10 pointer-events-none"
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Floating Container */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full flex items-center justify-center"
            >
              {/* Fade away / switch mascot */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPose.src}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ type: "spring", damping: 22, stiffness: 220 }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  <SafeImage
                    src={currentPose.src}
                    fallbackSrc={currentPose.fallbackSrc}
                    alt="BoardTAU Mascot"
                    showSkeleton={false}
                    containerClassName="w-full h-full overflow-visible flex items-center justify-center"
                    className="w-full h-full object-contain filter drop-shadow-2xl"
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Dynamic Status Text & Brand Header */}
          <div className="space-y-2 text-center max-w-sm">
            {/* Brand Logo Title */}
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Board
              </span>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-primary">
                TAU
              </span>
            </div>

            {/* Dynamic Stage Title */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPose.title}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="text-sm font-black uppercase tracking-[0.25em] text-primary"
              >
                <h4>{currentPose.title}</h4>
              </motion.div>
            </AnimatePresence>

            <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
              See you soon, <span className="text-primary">{firstName}</span>!
            </p>

            {/* Tips Container matching requested look */}
            <div className="pt-2 min-h-[46px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tipIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs"
                >
                  <p>"{currentTip}"</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default UltimateLogoutOverlay;
