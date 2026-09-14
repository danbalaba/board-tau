'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeImage from '@/components/common/SafeImage';
import { cn } from '@/utils/helper';
import { Check, Sparkles, Building2, CloudUpload, ShieldCheck, ArrowRight } from 'lucide-react';

import { preloadKerbyAssets } from '@/utils/imagePreloader';

interface PropertySubmissionLoaderModalProps {
  isOpen: boolean;
  progress?: number;
  stage?: 1 | 2 | 3 | 4;
  actionType?: 'create' | 'edit';
  onComplete?: () => void;
}

const STAGES = [
  {
    id: 1,
    title: 'Reviewing Property Details',
    subtitle: 'Kerby is reviewing your property description and room details...',
    mascotSrc: '/assets/mascot/kerby-landlord-blueprint.png',
    fallbackSrc: '/assets/mascot/kerby-500-mechanic.png',
    icon: Building2,
    color: 'from-amber-500 to-orange-500',
    badge: 'Step 1 of 4: Checking Details'
  },
  {
    id: 2,
    title: 'Checking Room & House Rules',
    subtitle: 'Checking your room configurations, amenities, and house rules...',
    mascotSrc: '/assets/mascot/kerby-landlord-checklist.png',
    fallbackSrc: '/assets/mascot/kerby-casual-studying.png',
    icon: ShieldCheck,
    color: 'from-blue-500 to-indigo-500',
    badge: 'Step 2 of 4: Reviewing Rules'
  },
  {
    id: 3,
    title: 'Uploading Photos & Documents',
    subtitle: 'Saving your gallery photos and property documents...',
    mascotSrc: '/assets/mascot/kerby-landlord-uploading.png',
    fallbackSrc: '/assets/mascot/kerby-uniform-driving.png',
    icon: CloudUpload,
    color: 'from-purple-500 to-pink-500',
    badge: 'Step 3 of 4: Uploading Media'
  },
  {
    id: 4,
    title: 'Property Submitted Successfully!',
    subtitle: 'Sent to BoardTAU Team for review. Your listing will be live soon!',
    mascotSrc: '/assets/mascot/kerby-landlord-verified.png',
    fallbackSrc: '/assets/mascot/kerby-uniform-loving.png',
    icon: Sparkles,
    color: 'from-primary to-teal-600',
    badge: 'Step 4 of 4: Ready for Review'
  }
];

const LOADING_TIPS = [
  "Did you know? Properties with complete legal permits get approved 3x faster by Super Admin!",
  "BoardTAU's smart recommendation system highlights verified listings near TAU main gate.",
  "Adding high-resolution bedroom photos increases student booking inquiries by up to 80%.",
  "Clear curfew and visitor rules help build long-term trust with student tenants."
];

export function PropertySubmissionLoaderModal({
  isOpen,
  progress: externalProgress,
  stage: externalStage,
  actionType = 'create',
  onComplete
}: PropertySubmissionLoaderModalProps) {
  const [internalProgress, setInternalProgress] = useState(0);
  const [internalStage, setInternalStage] = useState<1 | 2 | 3 | 4>(1);
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    if (isOpen) {
      preloadKerbyAssets();
    }
  }, [isOpen]);

  // Auto-progress simulation if external progress is not passed
  useEffect(() => {
    if (!isOpen) {
      setInternalProgress(0);
      setInternalStage(1);
      return;
    }

    if (externalProgress !== undefined) {
      setInternalProgress(externalProgress);
      if (externalStage !== undefined) {
        setInternalStage(externalStage);
      } else if (externalProgress >= 85) setInternalStage(4);
      else if (externalProgress >= 55) setInternalStage(3);
      else if (externalProgress >= 25) setInternalStage(2);
      else setInternalStage(1);
      return;
    }

    // Auto-smooth timer if controlled internally (relaxed 9 seconds total)
    const startTime = Date.now();
    const duration = 9000; // 9.0 seconds (approx 2.25s per stage)

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentPct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setInternalProgress(currentPct);

      if (currentPct >= 85) setInternalStage(4);
      else if (currentPct >= 55) setInternalStage(3);
      else if (currentPct >= 25) setInternalStage(2);
      else setInternalStage(1);

      if (currentPct >= 100) {
        clearInterval(interval);
        if (onComplete) setTimeout(onComplete, 1200);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen, externalProgress, onComplete]);

  // Rotate tips every 3.5 seconds
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStageNum = externalStage !== undefined ? externalStage : internalStage;
  const rawStageObj = STAGES.find(s => s.id === currentStageNum) || STAGES[0];
  
  const currentStageObj = actionType === 'edit' ? {
    ...rawStageObj,
    title: currentStageNum === 1 ? 'Auditing Updated Property Specs' : currentStageNum === 2 ? 'Inspecting Permits & Compliance' : currentStageNum === 3 ? 'Syncing Media & Gallery Updates' : 'Property Specs Updated Successfully!',
    subtitle: currentStageNum === 1 ? 'Kerby is reviewing your updated room rates, house rules & basic details...' : currentStageNum === 2 ? 'Checking updated room configurations, house rules & compliance permits...' : currentStageNum === 3 ? 'Encrypting and syncing photo gallery updates to EdgeStore Cloud...' : 'Re-submitting to BoardTAU Moderation Team for instant verification...',
    badge: currentStageNum === 1 ? 'Step 1: Auditing Specs' : currentStageNum === 2 ? 'Step 2: Compliance Check' : currentStageNum === 3 ? 'Step 3: Cloud Sync' : 'Step 4: Sync Complete'
  } : rawStageObj;
  const activeProgress = externalProgress !== undefined ? externalProgress : internalProgress;

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col justify-between items-center p-4 sm:p-12 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-3xl overflow-y-auto overflow-x-hidden max-w-full w-full text-slate-900 dark:text-white antialiased transition-colors duration-300">
      {/* Ambient Background Glowing Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 dark:bg-primary/20 blur-[130px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 dark:bg-primary/20 blur-[130px] animate-pulse" />
      </div>

      {/* Top Header Branding Bar */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 z-10 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-sm">
            <Building2 size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">BoardTAU Housing Platform</h2>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block truncate">Property Publishing Pipeline</span>
          </div>
        </div>

        <motion.div
          key={currentStageObj.badge}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-primary/10 dark:bg-primary/15 border border-primary/20 dark:border-primary/30 text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-sm shrink-0"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span>{currentStageObj.badge}</span>
        </motion.div>
      </div>

      {/* Main Center Content Section */}
      <div className="w-full max-w-2xl my-auto py-6 sm:py-8 flex flex-col items-center text-center z-10 space-y-4 sm:space-y-6">
        
        {/* Kerby Mascot Image Showcase with Continuous Infinite Floating Motion */}
        <div className="relative w-48 h-48 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* Infinite Floating 3D Physics Motion */}
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
                {currentStageObj.title}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {currentStageObj.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 4-Step Pipeline Indicators */}
        <div className="w-full grid grid-cols-4 gap-3 max-w-md pt-2">
          {STAGES.map((s) => {
            const isDone = s.id < currentStageNum || activeProgress === 100;
            const isCurrent = s.id === currentStageNum && activeProgress < 100;

            return (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-full h-2.5 rounded-full transition-all duration-500",
                    isDone
                      ? "bg-primary shadow-md shadow-primary/25"
                      : isCurrent
                        ? "bg-primary animate-pulse shadow-md shadow-primary/40"
                        : "bg-slate-200 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700/50"
                  )}
                />
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-wider",
                  isDone ? "text-primary font-bold" : isCurrent ? "text-primary font-black" : "text-slate-400 dark:text-slate-500 font-semibold"
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
            <span>Publishing Progress</span>
            <span className="text-primary font-black text-sm">{activeProgress}%</span>
          </div>
          <div className="w-full h-3.5 bg-slate-200/90 dark:bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-300/80 dark:border-slate-800 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-teal-500 to-primary rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${activeProgress}%` }}
              transition={{ ease: "easeInOut", duration: 0.2 }}
            />
          </div>
        </div>

      </div>

      {/* Bottom Landlord Tip Footer Bar */}
      <div className="w-full max-w-2xl z-10">
        <div className="p-4 sm:p-5 rounded-3xl bg-white/95 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 text-left flex items-start gap-4 shadow-xl shadow-slate-200/60 dark:shadow-none backdrop-blur-md">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 border border-amber-500/20">
            <Sparkles size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-0.5">Landlord Tip</span>
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIdx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug"
              >
                "{LOADING_TIPS[tipIdx]}"
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

    </div>
  );
}
