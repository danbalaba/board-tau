"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, Minus, Users, UserCheck } from "lucide-react";

interface CounterStepProps {
  title: string;
  subtitle?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (newValue: number) => void;
  unitLabel?: string;
  presetBadge?: string;
}

export const CounterStep: React.FC<CounterStepProps> = ({
  title,
  subtitle,
  value,
  min = 1,
  max = 10,
  onChange,
  unitLabel = "Occupants",
  presetBadge,
}) => {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <div>
        <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h3>
        {subtitle && <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">{subtitle}</p>}
      </div>

      {/* Main Interactive Counter Card */}
      <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-white/15 flex flex-col items-center justify-center gap-6 shadow-lg backdrop-blur-md">
        {presetBadge && (
          <span className="px-3.5 py-1 rounded-full bg-[#2f7d6d]/15 text-[#2f7d6d] dark:text-emerald-300 border border-[#2f7d6d]/30 text-xs font-bold uppercase tracking-wider">
            {presetBadge}
          </span>
        )}

        <div className="flex items-center gap-6 md:gap-10">
          {/* Decrement Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDecrement}
            disabled={value <= min}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all text-xl font-bold ${
              value <= min
                ? "bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                : "bg-[#2f7d6d]/15 hover:bg-[#2f7d6d]/25 border-[#2f7d6d]/40 text-[#2f7d6d] dark:text-emerald-300 shadow-sm"
            }`}
          >
            <Minus className="w-6 h-6 stroke-[2.5]" />
          </motion.button>

          {/* Number Display */}
          <div className="flex flex-col items-center min-w-[120px]">
            <motion.span
              key={value}
              initial={{ opacity: 0, scale: 0.8, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight drop-shadow-md"
            >
              {value}
            </motion.span>
            <span className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1 tracking-wide uppercase">
              {value === 1 ? unitLabel.replace(/s$/, "") : unitLabel}
            </span>
          </div>

          {/* Increment Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleIncrement}
            disabled={value >= max}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all text-xl font-bold ${
              value >= max
                ? "bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                : "bg-[#2f7d6d]/15 hover:bg-[#2f7d6d]/25 border-[#2f7d6d]/40 text-[#2f7d6d] dark:text-emerald-300 shadow-sm"
            }`}
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </motion.button>
        </div>

        {/* Informative Guidance */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/60 px-4 py-2 rounded-full border border-slate-200 dark:border-white/5 shadow-sm">
          <UserCheck className="w-4 h-4 text-[#2f7d6d] dark:text-emerald-400" />
          <span className="font-medium">
            {value === 1
              ? "Solo room or single boarder capacity"
              : `Filters listings with at least ${value} available slots/capacity`}
          </span>
        </div>
      </div>
    </div>
  );
};
