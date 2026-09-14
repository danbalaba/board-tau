"use client";

import React from "react";
import { FaCheck } from "react-icons/fa";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";
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

  const activeStepRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (activeStepRef.current && typeof window !== "undefined" && window.innerWidth < 768) {
      activeStepRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentStepId]);

  return (
    <div className="w-full flex flex-col gap-3 py-2 px-2 md:px-6">
      {/* Top Meta Status Row: Step Badge + Percentage */}
      <div className="flex items-center justify-between text-xs font-semibold px-1">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <span className="px-2.5 py-1 rounded-full bg-[#2f7d6d]/15 text-[#2f7d6d] dark:text-emerald-400 font-bold border border-[#2f7d6d]/30 text-[11px] uppercase tracking-wider">
            Step {displayStep} of {totalSteps}
          </span>
          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] md:max-w-xs">
            {currentStepObj?.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#2f7d6d] dark:text-emerald-400 font-extrabold font-mono text-xs">
            {progressPercent}%
          </span>
          <div className="w-16 md:w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#2f7d6d] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            />
          </div>
        </div>
      </div>

      {/* Balanced Stepper Track */}
      <div className="relative w-full flex items-center justify-between pt-1 pb-5 md:pb-6 overflow-x-auto md:overflow-visible no-scrollbar">
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
              ref={isCurrent ? activeStepRef : null}
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
                className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
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

              {/* Step Label underneath node: Only active step visible by default; others reveal on hover */}
              <span
                className={`hidden md:block absolute -bottom-5 text-[10px] font-bold tracking-tight whitespace-nowrap transition-all duration-300 pointer-events-none ${
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
