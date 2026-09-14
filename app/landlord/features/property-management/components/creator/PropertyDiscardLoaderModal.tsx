'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeImage from '@/components/common/SafeImage';
import { cn } from '@/utils/helper';
import { Building2, Sparkles, Trash2, CheckCircle2 } from 'lucide-react';
import { preloadKerbyAssets } from '@/utils/imagePreloader';

interface PropertyDiscardLoaderModalProps {
  isOpen: boolean;
  onComplete?: () => void;
  title?: string;
}

const STAGES = [
  {
    id: 1,
    title: 'Clearing Saved Draft...',
    subtitle: 'Removing your saved listing draft so you can start completely fresh.',
    mascotSrc: '/assets/mascot/kerby-landlord-checklist.png',
    fallbackSrc: '/assets/mascot/kerby-500-mechanic.png',
    badge: 'Step 1 of 3: Clearing Draft',
  },
  {
    id: 2,
    title: 'Resetting Listing Form...',
    subtitle: 'Cleaning up all fields and preparing a brand new form for you.',
    mascotSrc: '/assets/mascot/kerby-landlord-blueprint.png',
    fallbackSrc: '/assets/mascot/kerby-casual-studying.png',
    badge: 'Step 2 of 3: Resetting Form',
  },
  {
    id: 3,
    title: 'All Clean & Ready!',
    subtitle: 'Your draft has been cleared. Taking you back now...',
    mascotSrc: '/assets/mascot/kerby-landlord-verified.png',
    fallbackSrc: '/assets/mascot/kerby-uniform-loving.png',
    badge: 'Step 3 of 3: All Clean',
  },
];

const SIMPLE_TIPS = [
  "Starting fresh gives you a clean page to build your property listing.",
  "Your draft auto-saves as soon as you start typing new information.",
  "Your published listings in the dashboard are always safe.",
];

export function PropertyDiscardLoaderModal({
  isOpen,
  onComplete,
  title: customTitle
}: PropertyDiscardLoaderModalProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [tipIdx, setTipIdx] = useState(0);

  const onCompleteRef = React.useRef(onComplete);
  const hasCompletedRef = React.useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (isOpen) {
      preloadKerbyAssets();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setStage(1);
      hasCompletedRef.current = false;
      return;
    }

    hasCompletedRef.current = false;
    const startTime = Date.now();
    const duration = 2200; // 2.2 seconds total

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(pct);

      if (pct >= 85) setStage(3);
      else if (pct >= 40) setStage(2);
      else setStage(1);

      if (pct >= 100) {
        clearInterval(interval);
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          if (onCompleteRef.current) {
            setTimeout(() => {
              if (onCompleteRef.current) {
                onCompleteRef.current();
              }
            }, 300);
          }
        }
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Rotate tips
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % SIMPLE_TIPS.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStageObj = STAGES.find(s => s.id === stage) || STAGES[0];

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col justify-between items-center p-4 sm:p-12 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-3xl overflow-y-auto overflow-x-hidden max-w-full w-full text-slate-900 dark:text-white antialiased transition-colors duration-300">
      {/* Ambient Background Glowing Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-rose-500/10 dark:bg-rose-500/20 blur-[130px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-amber-500/10 dark:bg-amber-500/20 blur-[130px] animate-pulse" />
      </div>

      {/* Top Header Branding Bar */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 z-10 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Trash2 size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">BoardTAU Housing Platform</h2>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block truncate">Property Creator</span>
          </div>
        </div>

        <motion.div
          key={currentStageObj.badge}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-sm shrink-0"
        >
          <div className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          <span>{currentStageObj.badge}</span>
        </motion.div>
      </div>

      {/* Main Center Content Section */}
      <div className="w-full max-w-2xl my-auto py-6 sm:py-8 flex flex-col items-center text-center z-10 space-y-4 sm:space-y-6">
        
        {/* Kerby Mascot Image Showcase with Continuous Infinite Floating Motion */}
        <div className="relative w-48 h-48 sm:w-72 sm:h-72 flex items-center justify-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStageObj.id}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: "spring", damping: 22, stiffness: 220 }}
                className="relative w-full h-full drop-shadow-[0_15px_25px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)] flex items-center justify-center"
              >
                <SafeImage
                  src={currentStageObj.mascotSrc}
                  fallbackSrc={currentStageObj.fallbackSrc}
                  alt="Kerby Carabao Landlord Mascot"
                  showSkeleton={false}
                  containerClassName="w-full h-full overflow-visible flex items-center justify-center"
                  className="w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)]"
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Title & Dynamic Subtitle */}
        <div className="space-y-2 max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStageObj.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-snug tracking-tight">
                {customTitle || currentStageObj.title}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {currentStageObj.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3-Step Pipeline Indicators */}
        <div className="w-full grid grid-cols-3 gap-3 max-w-md pt-2">
          {STAGES.map((s) => {
            const isDone = s.id < stage || progress === 100;
            const isCurrent = s.id === stage && progress < 100;

            return (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-full h-2.5 rounded-full transition-all duration-500",
                    isDone
                      ? "bg-primary shadow-md shadow-primary/25"
                      : isCurrent
                        ? "bg-rose-500 animate-pulse shadow-md shadow-rose-500/40"
                        : "bg-slate-200 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700/50"
                  )}
                />
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-wider",
                  isDone ? "text-primary font-bold" : isCurrent ? "text-rose-400 font-black" : "text-slate-400 dark:text-slate-500 font-semibold"
                )}>
                  {isDone ? '✓ Done' : `Step ${s.id}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Main Progress Bar & Percentage */}
        <div className="w-full max-w-lg space-y-2.5 pt-2">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <span>Clearing Progress</span>
            <span className="text-rose-400 font-black text-sm">{progress}%</span>
          </div>
          <div className="w-full h-3.5 bg-slate-200/90 dark:bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-300/80 dark:border-slate-800 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-primary rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut", duration: 0.2 }}
            />
          </div>
        </div>

      </div>

      {/* Bottom Landlord Tip Footer Bar */}
      <div className="w-full max-w-2xl z-10">
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 text-left flex items-start gap-4 shadow-xl backdrop-blur-md">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 shrink-0 mt-0.5 border border-amber-500/20">
            <Sparkles size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-0.5">Landlord Tip</span>
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIdx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-xs font-medium text-slate-300 leading-snug"
              >
                "{SIMPLE_TIPS[tipIdx]}"
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

    </div>
  );
}
