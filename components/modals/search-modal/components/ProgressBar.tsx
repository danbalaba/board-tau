"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { Lock, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/helper";

interface ProgressBarProps {
  steps: { id: number; label: string }[];
  currentStepId: number;
  maxUnlockedStepId?: number;
  onStepClick?: (stepId: number) => void;
}

export default function ProgressBar({
  steps,
  currentStepId,
  maxUnlockedStepId,
  onStepClick,
}: ProgressBarProps) {
  const foundIndex = steps.findIndex((s) => s.id === currentStepId);
  const activeIndex = foundIndex >= 0 ? foundIndex : Math.min(Math.max(0, currentStepId), steps.length - 1);
  const displayStep = activeIndex + 1;
  const totalSteps = steps.length;
  const progressPercent = Math.round((displayStep / totalSteps) * 100);
  const currentStepObj = steps[activeIndex] || steps[0];

  const [isExpandedMobile, setIsExpandedMobile] = useState(false);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);
  const activePillRef = useRef<HTMLButtonElement | null>(null);

  // Auto-scroll active carousel pill to center on step change or layout mount
  useEffect(() => {
    const scrollPillIntoCenter = () => {
      const container = mobileScrollRef.current;
      if (!container) return;

      const children = Array.from(container.children) as HTMLElement[];
      const targetPill = children[activeIndex];

      if (targetPill) {
        const containerWidth = container.clientWidth;
        const pillLeft = targetPill.offsetLeft;
        const pillWidth = targetPill.offsetWidth;

        // Guard: Ensure flexbox layout has positioned the target pill before scrolling
        if (containerWidth > 0 && pillWidth > 0 && (activeIndex === 0 || pillLeft > 0)) {
          const targetScrollLeft = Math.max(0, pillLeft - containerWidth / 2 + pillWidth / 2);

          container.scrollTo({
            left: targetScrollLeft,
            behavior: "smooth",
          });
        }
      }
    };

    // Immediate + multi-stage timers to handle dynamic imports & modal animations
    requestAnimationFrame(scrollPillIntoCenter);
    const timers = [20, 100, 250, 450, 700].map((delay) =>
      setTimeout(scrollPillIntoCenter, delay)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [currentStepId, activeIndex]);

  return (
    <div className="w-full flex flex-col gap-2.5 py-1 px-1 md:px-6">
      {/* Top Progress & Expand Bar */}
      <div className="flex items-center justify-between gap-2 text-xs font-semibold px-1">
        {/* Step Badge & Expand Toggle */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setIsExpandedMobile(!isExpandedMobile)}
            className="px-2.5 py-1 rounded-full bg-[#2f7d6d]/15 text-[#2f7d6d] dark:text-emerald-400 font-bold border border-[#2f7d6d]/30 text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all hover:bg-[#2f7d6d]/25 active:scale-95 shrink-0"
          >
            <span>Step {displayStep} of {totalSteps}</span>
            <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isExpandedMobile && "rotate-180")} />
          </button>
          
          <span className="font-extrabold text-slate-900 dark:text-white truncate text-xs md:text-sm">
            {currentStepObj?.label}
          </span>
        </div>

        {/* Percentage & Mini Bar */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[#2f7d6d] dark:text-emerald-400 font-extrabold font-mono text-xs">
            {progressPercent}%
          </span>
          <div className="w-14 md:w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#2f7d6d] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            />
          </div>
        </div>
      </div>

      {/* MOBILE VIEW: Expandable Step Carousel & Grid Overview */}
      <div className="block md:hidden w-full">
        {/* Carousel Pill Strip */}
        <div 
          ref={mobileScrollRef}
          className="relative flex items-center gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar hide-scrollbar scroll-smooth"
        >
          {steps.map((stepObj, index) => {
            const stepNum = index + 1;
            const isPast = activeIndex > index;
            const isCurrent = activeIndex === index;
            const isLocked = maxUnlockedStepId !== undefined && stepObj.id > maxUnlockedStepId;

            return (
              <motion.button
                key={stepObj.id}
                ref={isCurrent ? activePillRef : null}
                data-active={isCurrent ? "true" : "false"}
                type="button"
                layout
                onClick={() => {
                  if (!isLocked && onStepClick) {
                    onStepClick(stepObj.id);
                  }
                }}
                disabled={isLocked}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border cursor-pointer select-none",
                  isCurrent
                    ? "bg-[#2f7d6d] text-white border-[#2f7d6d] shadow-md shadow-[#2f7d6d]/30 scale-105"
                    : isPast
                    ? "bg-[#2f7d6d]/15 text-[#2f7d6d] dark:text-emerald-400 border-[#2f7d6d]/30 hover:bg-[#2f7d6d]/25"
                    : isLocked
                    ? "bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 border-slate-200/50 dark:border-slate-800/50 opacity-60 cursor-not-allowed"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                )}
              >
                {/* Badge Icon / Number */}
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 transition-colors",
                    isCurrent
                      ? "bg-white text-[#2f7d6d] dark:bg-slate-900 dark:text-emerald-400 font-black shadow-xs"
                      : isPast
                      ? "bg-[#2f7d6d] text-white dark:bg-emerald-500 dark:text-slate-950 font-black"
                      : isLocked
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  )}
                >
                  {isLocked ? (
                    <Lock size={9} />
                  ) : isPast ? (
                    <FaCheck size={8} />
                  ) : (
                    stepNum
                  )}
                </div>

                {/* Step Label */}
                <span className={cn("whitespace-nowrap transition-all", isCurrent ? "font-extrabold text-xs" : "font-medium text-[11px]")}>
                  {stepObj.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Expandable Accordion Grid Sheet for Mobile */}
        <AnimatePresence>
          {isExpandedMobile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-800"
            >
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                {steps.map((stepObj, index) => {
                  const stepNum = index + 1;
                  const isPast = activeIndex > index;
                  const isCurrent = activeIndex === index;
                  const isLocked = maxUnlockedStepId !== undefined && stepObj.id > maxUnlockedStepId;

                  return (
                    <button
                      key={stepObj.id}
                      type="button"
                      onClick={() => {
                        if (!isLocked && onStepClick) {
                          onStepClick(stepObj.id);
                          setIsExpandedMobile(false);
                        }
                      }}
                      disabled={isLocked}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-xl text-left text-xs font-bold transition-all border",
                        isCurrent
                          ? "bg-[#2f7d6d] text-white border-[#2f7d6d] shadow-sm"
                          : isPast
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-[#2f7d6d] dark:text-emerald-400 border-[#2f7d6d]/30"
                          : isLocked
                          ? "bg-slate-100/40 dark:bg-slate-900/40 text-slate-400/60 dark:text-slate-600/60 border-slate-200/40 dark:border-slate-800/40 opacity-50 cursor-not-allowed"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0",
                          isCurrent
                            ? "bg-white text-[#2f7d6d] dark:bg-slate-900 dark:text-emerald-400 font-black shadow-xs"
                            : isPast
                            ? "bg-[#2f7d6d] text-white dark:bg-emerald-500 dark:text-slate-950 font-black"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                        )}
                      >
                        {isLocked ? <Lock size={9} /> : isPast ? <FaCheck size={8} /> : stepNum}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] truncate leading-tight">{stepObj.label}</div>
                        <div className="text-[9px] opacity-75 font-semibold">
                          {isCurrent ? "Current" : isPast ? "Completed" : isLocked ? "Locked" : "Upcoming"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DESKTOP VIEW: Continuous Stepper Track */}
      <div className="hidden md:flex relative w-full items-center justify-between pt-1 pb-6 overflow-visible">
        {/* Continuous Background Connecting Bar */}
        <div className="absolute top-[18px] left-3 right-3 h-[3px] bg-slate-200 dark:bg-slate-800 rounded-full z-0">
          <motion.div
            className="h-full bg-[#2f7d6d] rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${(activeIndex / Math.max(1, totalSteps - 1)) * 100}%`,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          />
        </div>

        {/* Step Nodes */}
        {steps.map((stepObj, index) => {
          const stepNum = index + 1;
          const isPast = activeIndex > index;
          const isCurrent = activeIndex === index;
          const isLocked = maxUnlockedStepId !== undefined && stepObj.id > maxUnlockedStepId;

          return (
            <div
              key={stepObj.id}
              onClick={() => {
                if (!isLocked && onStepClick) {
                  onStepClick(stepObj.id);
                }
              }}
              className={cn(
                "relative z-10 flex flex-col items-center group shrink-0 transition-all",
                isLocked ? "cursor-not-allowed" : "cursor-pointer"
              )}
              title={isLocked ? `Step ${stepNum}: ${stepObj.label} (Locked)` : `Step ${stepNum}: ${stepObj.label}`}
            >
              <motion.div
                whileHover={!isLocked ? { scale: 1.15 } : { scale: 1.05 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCurrent
                    ? "bg-[#2f7d6d] text-white shadow-lg shadow-[#2f7d6d]/40 ring-4 ring-[#2f7d6d]/20 scale-110 z-10"
                    : isPast
                    ? "bg-[#2f7d6d] text-white shadow-sm"
                    : isLocked
                    ? "bg-slate-100/40 dark:bg-slate-900/40 text-slate-400/60 dark:text-slate-600/60 border border-slate-200/40 dark:border-slate-800/40 scale-90"
                    : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700"
                }`}
              >
                {isLocked ? (
                  <Lock size={10} className="text-slate-400/70 dark:text-slate-600/70 group-hover:text-slate-500 transition-colors" />
                ) : isPast ? (
                  <FaCheck className="w-3 h-3 text-white" />
                ) : (
                  stepNum
                )}
              </motion.div>

              {/* Step Label underneath node */}
              <span
                className={`absolute -bottom-5 text-[10px] font-bold tracking-tight whitespace-nowrap transition-all duration-300 pointer-events-none ${
                  isCurrent
                    ? "text-[#2f7d6d] dark:text-emerald-400 font-extrabold opacity-100"
                    : "text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100"
                }`}
              >
                {stepObj.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
