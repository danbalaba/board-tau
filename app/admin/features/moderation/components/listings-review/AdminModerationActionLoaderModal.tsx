'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeImage from '@/components/common/SafeImage';
import { cn } from '@/utils/helper';
import { Check, Sparkles, Building2, CloudUpload, ShieldCheck, AlertTriangle, FileText, Send, ShieldAlert, Gavel } from 'lucide-react';
import { preloadKerbyAssets } from '@/utils/imagePreloader';

export interface AdminModerationActionLoaderModalProps {
  isOpen: boolean;
  actionType: 'approve' | 'reject';
  progress?: number;
  stage?: 1 | 2 | 3 | 4;
  listingTitle?: string;
  onComplete?: () => void;
}

const APPROVAL_STAGES = [
  {
    id: 1,
    title: 'Biometric & Tech Spec Audit',
    subtitle: 'Kerby is inspecting property blueprints, photo clarity & landlord ID verification...',
    mascotSrc: '/assets/mascot/kerby-admin-audit-specs.png',
    fallbackSrc: '/assets/mascot/kerby-halfbody-blueprint.png',
    icon: Building2,
    color: 'from-amber-500 to-orange-500',
    badge: 'Step 1 of 4: Tech & Blueprint Audit'
  },
  {
    id: 2,
    title: 'Verifying Legal Permits & Compliance',
    subtitle: 'Checking room configurations, house rules, fire safety & business permits...',
    mascotSrc: '/assets/mascot/kerby-admin-compliance-check.png',
    fallbackSrc: '/assets/mascot/kerby-landlord-checklist.png',
    icon: ShieldCheck,
    color: 'from-blue-500 to-indigo-500',
    badge: 'Step 2 of 4: Compliance Check'
  },
  {
    id: 3,
    title: 'Broadcasting Listing to Student Feed',
    subtitle: 'Syncing verified listing status across TAU mobile app & student search engine...',
    mascotSrc: '/assets/mascot/kerby-admin-live-broadcast.png',
    fallbackSrc: '/assets/mascot/kerby-landlord-uploading.png',
    icon: CloudUpload,
    color: 'from-purple-500 to-pink-500',
    badge: 'Step 3 of 4: Live Broadcast Sync'
  },
  {
    id: 4,
    title: 'Listing Approved & Official Seal Granted!',
    subtitle: 'Super Admin approval recorded. Property is now live for all TAU students!',
    mascotSrc: '/assets/mascot/kerby-admin-gavel-approved.png',
    fallbackSrc: '/assets/mascot/kerby-landlord-verified.png',
    icon: Sparkles,
    color: 'from-primary to-teal-600',
    badge: 'Step 4 of 4: Official Approval Seal'
  }
];

const REJECTION_STAGES = [
  {
    id: 1,
    title: 'Flagging Non-Compliant Specifications',
    subtitle: 'Kerby identified items requiring landlord correction (documents, rules, or photos)...',
    mascotSrc: '/assets/mascot/kerby-admin-revision-stop.png',
    fallbackSrc: '/assets/mascot/kerby-500-mechanic.png',
    icon: AlertTriangle,
    color: 'from-rose-500 to-amber-500',
    badge: 'Step 1 of 4: Identifying Issues'
  },
  {
    id: 2,
    title: 'Compiling Detailed Audit Feedback',
    subtitle: 'Formulating step-by-step revision guidance for the property owner...',
    mascotSrc: '/assets/mascot/kerby-admin-correction-pencil.png',
    fallbackSrc: '/assets/mascot/kerby-landlord-checklist.png',
    icon: FileText,
    color: 'from-amber-500 to-orange-500',
    badge: 'Step 2 of 4: Writing Audit Notes'
  },
  {
    id: 3,
    title: 'Dispatching Revision Ticket to Landlord',
    subtitle: 'Sending encrypted moderation feedback and revision notification...',
    mascotSrc: '/assets/mascot/kerby-admin-dispatch-ticket.png',
    fallbackSrc: '/assets/mascot/kerby-landlord-uploading.png',
    icon: Send,
    color: 'from-blue-500 to-indigo-500',
    badge: 'Step 3 of 4: Dispatching Ticket'
  },
  {
    id: 4,
    title: 'Rejection & Revision Notice Delivered!',
    subtitle: 'Listing status updated to "Revision Required". Landlord notified for updates.',
    mascotSrc: '/assets/mascot/kerby-admin-stamp-rejected.png',
    fallbackSrc: '/assets/mascot/kerby-401-security.png',
    icon: ShieldAlert,
    color: 'from-rose-500 to-red-600',
    badge: 'Step 4 of 4: Revision Ticket Sent'
  }
];

const MODERATION_TIPS_APPROVE = [
  "Super Admin Tip: Approved listings receive instant priority placement in student search results.",
  "Verifying permits thoroughly maintains BoardTAU's high safety standards for university housing.",
  "Approved properties with clean legal documents have an average booking rate of over 92%.",
  "Once approved, the landlord receives a automated verification badge and congratulatory notification."
];

const MODERATION_TIPS_REJECT = [
  "Super Admin Tip: Specific feedback helps landlords fix issues quickly and resubmit within 24 hours.",
  "Rejecting incomplete permits prevents non-compliant listings from reaching TAU students.",
  "Landlords receive instant step-by-step revision guidance in their property management dashboard.",
  "Flagged listings can be resubmitted easily once the requested document updates are made."
];

export function AdminModerationActionLoaderModal({
  isOpen,
  actionType = 'approve',
  progress: externalProgress,
  stage: externalStage,
  listingTitle,
  onComplete
}: AdminModerationActionLoaderModalProps) {
  const [internalProgress, setInternalProgress] = useState(0);
  const [internalStage, setInternalStage] = useState<1 | 2 | 3 | 4>(1);
  const [tipIdx, setTipIdx] = useState(0);

  const STAGES = actionType === 'approve' ? APPROVAL_STAGES : REJECTION_STAGES;
  const LOADING_TIPS = actionType === 'approve' ? MODERATION_TIPS_APPROVE : MODERATION_TIPS_REJECT;

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

    // Auto-smooth timer if controlled internally (relaxed 4.5 seconds total for quick admin actions)
    const startTime = Date.now();
    const duration = 4500; // 4.5 seconds

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
        if (onComplete) setTimeout(onComplete, 800);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isOpen, externalProgress, externalStage, onComplete]);

  // Rotate tips every 2.5 seconds
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [isOpen, LOADING_TIPS.length]);

  if (!isOpen) return null;

  const currentStageNum = externalStage !== undefined ? externalStage : internalStage;
  const currentStageObj = STAGES.find((s) => s.id === currentStageNum) || STAGES[0];
  const activeProgress = externalProgress !== undefined ? externalProgress : internalProgress;

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col justify-between items-center p-4 sm:p-12 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-3xl overflow-y-auto overflow-x-hidden max-w-full w-full text-slate-900 dark:text-white antialiased transition-colors duration-300">
      {/* Ambient Background Glowing Lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            "absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[130px] animate-pulse",
            actionType === 'approve' ? "bg-primary/10 dark:bg-primary/20" : "bg-rose-500/20"
          )}
        />
        <div
          className={cn(
            "absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full blur-[130px] animate-pulse",
            actionType === 'approve' ? "bg-primary/10 dark:bg-primary/20" : "bg-amber-500/20"
          )}
        />
      </div>

      {/* Top Header Branding Bar */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 z-10 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm",
              actionType === 'approve'
                ? "bg-primary/10 border-primary/20 text-primary"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            )}
          >
            <Gavel size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">
              Super Admin Moderation Console
            </h2>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block truncate">
              {listingTitle ? `Listing: ${listingTitle}` : 'Property Decision Pipeline'}
            </span>
          </div>
        </div>

        <motion.div
          key={currentStageObj.badge}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-sm shrink-0 border",
            actionType === 'approve'
              ? "bg-primary/10 dark:bg-primary/15 border-primary/20 dark:border-primary/30 text-primary"
              : "bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-rose-500/10"
          )}
        >
          <div
            className={cn(
              "w-2 h-2 rounded-full animate-ping",
              actionType === 'approve' ? "bg-primary" : "bg-rose-400"
            )}
          />
          <span>{currentStageObj.badge}</span>
        </motion.div>
      </div>

      {/* Main Center Content Section */}
      <div className="w-full max-w-2xl my-auto py-6 sm:py-8 flex flex-col items-center text-center z-10 space-y-4 sm:space-y-6">
        {/* Kerby Mascot Image Showcase with Continuous Floating Motion */}
        <div className="relative w-48 h-48 sm:w-72 sm:h-72 flex items-center justify-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-full h-full flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${actionType}-${currentStageObj.id}`}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 220 }}
                className="relative w-full h-full drop-shadow-[0_15px_25px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)] flex items-center justify-center"
              >
                <SafeImage
                  src={currentStageObj.mascotSrc}
                  fallbackSrc={currentStageObj.fallbackSrc}
                  alt="Kerby Carabao Super Admin Mascot"
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
                    'w-full h-2.5 rounded-full transition-all duration-500',
                    isDone
                      ? actionType === 'approve'
                        ? 'bg-primary shadow-md shadow-primary/25'
                        : 'bg-rose-500 shadow-md shadow-rose-500/30'
                      : isCurrent
                      ? actionType === 'approve'
                        ? 'bg-primary animate-pulse shadow-md shadow-primary/40'
                        : 'bg-rose-400 animate-pulse shadow-md shadow-rose-400/40'
                      : 'bg-slate-200 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700/50'
                  )}
                />
                <span
                  className={cn(
                    'text-[9px] font-black uppercase tracking-wider',
                    isDone
                      ? actionType === 'approve'
                        ? 'text-primary font-bold'
                        : 'text-rose-400'
                      : isCurrent
                      ? actionType === 'approve'
                        ? 'text-primary font-black'
                        : 'text-rose-300 font-black'
                      : 'text-slate-400 dark:text-slate-500 font-semibold'
                  )}
                >
                  {isDone ? '✓ Done' : `Step ${s.id}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Main Progress Bar & Percentage */}
        <div className="w-full max-w-lg space-y-2.5 pt-2">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <span>{actionType === 'approve' ? 'Approval Progress' : 'Rejection Progress'}</span>
            <span
              className={cn(
                'font-black text-sm',
                actionType === 'approve' ? 'text-primary' : 'text-rose-400'
              )}
            >
              {activeProgress}%
            </span>
          </div>
          <div className="w-full h-3.5 bg-slate-200/90 dark:bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-300/80 dark:border-slate-800 shadow-inner">
            <motion.div
              className={cn(
                'h-full rounded-full shadow-lg bg-gradient-to-r',
                actionType === 'approve'
                  ? 'from-primary via-teal-500 to-primary'
                  : 'from-rose-500 via-amber-500 to-red-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${activeProgress}%` }}
              transition={{ ease: 'easeInOut', duration: 0.2 }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Tip Footer Bar */}
      <div className="w-full max-w-2xl z-10">
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 text-left flex items-start gap-4 shadow-xl backdrop-blur-md">
          <div
            className={cn(
              'p-2.5 rounded-2xl shrink-0 mt-0.5 border',
              actionType === 'approve'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/20'
            )}
          >
            <Sparkles size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <span
              className={cn(
                'text-[10px] font-black uppercase tracking-widest block mb-0.5',
                actionType === 'approve' ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              Super Admin Moderation Insight
            </span>
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIdx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-xs font-medium text-slate-300 leading-snug"
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
