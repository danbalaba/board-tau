"use client";

import React from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";

export interface AttributeOption {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  badge?: string;
}

interface DynamicAttributeStepProps {
  title: string;
  subtitle?: string;
  options: AttributeOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  isMultiSelect?: boolean;
}

export const DynamicAttributeStep: React.FC<DynamicAttributeStepProps> = ({
  title,
  subtitle,
  options,
  selectedIds,
  onToggle,
  isMultiSelect = true,
}) => {
  const renderIcon = (iconName?: string) => {
    if (!iconName) return <LucideIcons.CheckCircle className="w-5 h-5 text-[#2f7d6d] dark:text-emerald-400" />;
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Sparkles;
    return <IconComponent className="w-5 h-5 text-[#2f7d6d] dark:text-emerald-400" />;
  };

  const handleClear = () => {
    selectedIds.forEach((id) => onToggle(id));
  };

  return (
    <div className="w-full flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Step Header & Clear Button */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h3>
          {subtitle && <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">{subtitle}</p>}
        </div>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-extrabold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 flex items-center gap-1.5 transition-all px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-950/30 border border-slate-200 dark:border-slate-700 shrink-0 mt-1"
          >
            <LucideIcons.RotateCcw className="w-3 h-3 stroke-[2.5]" />
            <span>Clear Selection</span>
          </button>
        )}
      </div>

      {/* Options Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {options.map((opt) => {
          const isSelected = selectedIds.includes(opt.id);

          return (
            <motion.div
              key={opt.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onToggle(opt.id)}
              className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-200 border flex flex-col justify-between ${
                isSelected
                  ? "bg-[#2f7d6d]/15 border-[#2f7d6d] text-slate-900 dark:text-white shadow-md ring-2 ring-[#2f7d6d]/40"
                  : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200"
              }`}
            >
              {/* Header Row */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isSelected
                        ? "bg-[#2f7d6d]/20 border-[#2f7d6d]/50 text-[#2f7d6d] dark:text-emerald-300"
                        : "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {renderIcon(opt.icon)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold leading-snug">{opt.name}</h4>
                    {opt.badge && (
                      <span className="inline-block mt-0.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#2f7d6d]/20 text-[#2f7d6d] dark:text-emerald-300 border border-[#2f7d6d]/30">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Selection Checkbox / Radio Indicator */}
                <div
                  className={`w-5 h-5 rounded-${
                    isMultiSelect ? "md" : "full"
                  } flex items-center justify-center border transition-all ${
                    isSelected
                      ? "bg-[#2f7d6d] border-[#2f7d6d] text-white shadow-sm"
                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50"
                  }`}
                >
                  {isSelected && (
                    <LucideIcons.Check className="w-3.5 h-3.5 stroke-[3]" />
                  )}
                </div>
              </div>

              {/* Plain-Language Description */}
              {opt.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal mt-1 pl-1">
                  {opt.description}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
