"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { Lock, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/helper";

export const INQUIRY_STEPS = [
  { id: 1, label: "Payment", shortLabel: "Pay" },
  { id: 2, label: "Stay Details", shortLabel: "Stay" },
  { id: 3, label: "Host Note", shortLabel: "Note" },
  { id: 4, label: "KYC Prep", shortLabel: "Prepare" },
  { id: 5, label: "Live Selfie", shortLabel: "Selfie" },
  { id: 6, label: "ID Match", shortLabel: "ID" },
  { id: 7, label: "OTP Verify", shortLabel: "Verify" },
  { id: 8, label: "Review & Sign", shortLabel: "Review" },
];

interface InquiryProgressBarProps {
  currentStepId: number;
  maxUnlockedStepId: number;
  onStepClick: (stepId: number) => void;
}

export default function InquiryProgressBar({
  currentStepId,
  maxUnlockedStepId,
  onStepClick,
}: InquiryProgressBarProps) {
  const foundIndex = INQUIRY_STEPS.findIndex((s) => s.id === currentStepId);
  const activeIndex = foundIndex >= 0 ? foundIndex : Math.min(Math.max(0, currentStepId - 1), INQUIRY_STEPS.length - 1);
  const displayStep = activeIndex + 1;
  const totalSteps = INQUIRY_STEPS.length;
  const progressPercent = Math.round((displayStep / totalSteps) * 100);
  const currentStepObj = INQUIRY_STEPS[activeIndex] || INQUIRY_STEPS[0];

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
    <div className="w-full flex flex-col gap-2.5 py-1 px-1 md:px-2 mb-4 md:mb-6 bg-white dark:bg-gray-800/40 p-3 md:p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-xs">
      {/* Top Progress & Expand Header */}
      <div className="flex items-center justify-between gap-2 text-xs font-semibold px-1">
        {/* Step Badge & Title */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile Interactive Toggle Button (With Chevron) */}
          <button
            type="button"
            onClick={() => setIsExpandedMobile(!isExpandedMobile)}
            className="md:hidden px-2.5 py-1 rounded-full bg-primary/15 text-primary font-extrabold border border-primary/30 text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all hover:bg-primary/25 active:scale-95 shrink-0 cursor-pointer"
          >
            <span>Step {displayStep} of {totalSteps}</span>
            <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isExpandedMobile && "rotate-180")} />
          </button>

          {/* Desktop Static Badge (Clean Tag without Chevron) */}
          <span className="hidden md:inline-flex px-2.5 py-1 rounded-full bg-primary/15 text-primary font-extrabold border border-primary/30 text-[11px] uppercase tracking-wider shrink-0 select-none">
            Step {displayStep} of {totalSteps}
          </span>
          
          <span className="font-extrabold text-gray-900 dark:text-white truncate text-xs md:text-sm">
            {currentStepObj?.label}
          </span>
        </div>

        {/* Percentage & Progress Bar */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-primary font-black font-mono text-xs">
            {progressPercent}%
          </span>
          <div className="w-14 md:w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            />
          </div>
        </div>
      </div>

      {/* MOBILE VIEW: Step Carousel Strip */}
      <div className="block md:hidden w-full">
        {/* Carousel Pill Strip */}
        <div 
          ref={mobileScrollRef}
          className="relative flex items-center gap-2 overflow-x-auto py-1.5 px-0.5 no-scrollbar hide-scrollbar scroll-smooth"
        >
          {INQUIRY_STEPS.map((stepObj, index) => {
            const stepNum = index + 1;
            const isPast = activeIndex > index;
            const isCurrent = activeIndex === index;
            const isLocked = stepObj.id > maxUnlockedStepId;

            return (
              <motion.button
                key={stepObj.id}
                ref={isCurrent ? activePillRef : null}
                data-active={isCurrent ? "true" : "false"}
                type="button"
                layout
                onClick={() => {
                  if (!isLocked) {
                    onStepClick(stepObj.id);
                  }
                }}
                disabled={isLocked}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border cursor-pointer select-none",
                  isCurrent
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/30 scale-105"
                    : isPast
                    ? "bg-primary/10 text-primary border-primary/25 hover:bg-primary/20"
                    : isLocked
                    ? "bg-gray-100/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600 border-gray-200/50 dark:border-gray-700/50 opacity-60 cursor-not-allowed"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                )}
              >
                {/* Badge Icon / Number */}
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 transition-colors",
                    isCurrent
                      ? "bg-white text-primary dark:bg-gray-900 font-black shadow-xs"
                      : isPast
                      ? "bg-primary text-white font-black"
                      : isLocked
                      ? "bg-gray-200 dark:bg-gray-700/80 text-gray-400 dark:text-gray-500"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
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

                {/* Step Short Label */}
                <span className={cn("whitespace-nowrap transition-all", isCurrent ? "font-black text-xs" : "font-semibold text-[11px]")}>
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
              className="overflow-hidden mt-2 pt-2 border-t border-gray-100 dark:border-gray-700"
            >
              <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50/80 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800">
                {INQUIRY_STEPS.map((stepObj, index) => {
                  const stepNum = index + 1;
                  const isPast = activeIndex > index;
                  const isCurrent = activeIndex === index;
                  const isLocked = stepObj.id > maxUnlockedStepId;

                  return (
                    <button
                      key={stepObj.id}
                      type="button"
                      onClick={() => {
                        if (!isLocked) {
                          onStepClick(stepObj.id);
                          setIsExpandedMobile(false);
                        }
                      }}
                      disabled={isLocked}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-xl text-left text-xs font-bold transition-all border cursor-pointer",
                        isCurrent
                          ? "bg-primary text-white border-primary shadow-sm"
                          : isPast
                          ? "bg-primary/10 text-primary border-primary/30"
                          : isLocked
                          ? "bg-gray-100/40 dark:bg-gray-900/40 text-gray-400/60 dark:text-gray-600/60 border-gray-200/40 dark:border-gray-800/40 opacity-50 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0",
                          isCurrent
                            ? "bg-white text-primary dark:bg-gray-900 font-black shadow-xs"
                            : isPast
                            ? "bg-primary text-white font-black"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {isLocked ? <Lock size={9} /> : isPast ? <FaCheck size={8} /> : stepNum}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] truncate leading-tight font-extrabold">{stepObj.label}</div>
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
      <div className="hidden md:flex relative w-full items-center justify-between pt-1 pb-5 overflow-visible">
        {/* Continuous Background Connecting Bar */}
        <div className="absolute top-[18px] left-4 right-4 h-[2px] bg-gray-100 dark:bg-gray-700 rounded-full z-0">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${(activeIndex / Math.max(1, totalSteps - 1)) * 100}%`,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          />
        </div>

        {/* Step Nodes */}
        {INQUIRY_STEPS.map((stepObj, index) => {
          const stepNum = index + 1;
          const isPast = activeIndex > index;
          const isCurrent = activeIndex === index;
          const isLocked = stepObj.id > maxUnlockedStepId;

          return (
            <div
              key={stepObj.id}
              onClick={() => {
                if (!isLocked) {
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
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  isCurrent
                    ? "bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20 scale-110 z-10"
                    : isPast
                    ? "bg-primary text-white shadow-xs"
                    : isLocked
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-700 scale-90 opacity-60"
                    : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700"
                )}
              >
                {isLocked ? (
                  <Lock size={10} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 transition-colors" />
                ) : isPast ? (
                  <FaCheck className="w-3 h-3 text-white" />
                ) : (
                  stepNum
                )}
              </motion.div>

              {/* Step Short Label underneath node */}
              <span
                className={cn(
                  "absolute -bottom-5 text-[9px] font-extrabold tracking-widest uppercase whitespace-nowrap transition-all duration-300 pointer-events-none",
                  isCurrent
                    ? "text-primary opacity-100"
                    : isPast
                    ? "text-primary/70 opacity-80"
                    : "text-gray-400 dark:text-gray-500 opacity-60"
                )}
              >
                {stepObj.shortLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
