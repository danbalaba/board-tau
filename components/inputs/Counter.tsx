"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";
import { FieldValues, UseFormWatch } from "react-hook-form";
import HelpTooltip from "@/components/common/HelpTooltip";

interface CounterProps {
  title: string;
  subtitle: string;
  onChange: (name: string, value: number | string) => void;
  name: string;
  watch: UseFormWatch<FieldValues>;
  disabled?: boolean;
  minValue?: number;
  helpText?: string;
}

const Counter: React.FC<CounterProps> = ({
  title,
  subtitle,
  onChange,
  name,
  watch,
  disabled = false,
  minValue = 1,
  helpText,
}) => {
  const rawValue = watch(name);
  const value = typeof rawValue === 'number' ? rawValue : (rawValue ? Number(rawValue) : 0);
  const displayValue = value === 0 ? "Any" : value;

  const onAdd = () => {
    if (!disabled) {
      onChange(name, value === 0 ? minValue : value + 1);
    }
  };

  const onReduce = () => {
    if (disabled || value === 0) return;
    if (value === minValue) {
      onChange(name, ""); // Allow unsetting the value back to "Any"
      return;
    }
    onChange(name, value - 1);
  };

  return (
    <div className={`p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{title}</h3>
          {helpText && <HelpTooltip text={helpText} />}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-1.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 self-start sm:self-auto">
        <button 
          type="button"
          onClick={onReduce}
          disabled={disabled || value === 0}
          className={`p-2 rounded-xl transition-all ${
            disabled || value === 0
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          <Minus size={14} strokeWidth={2.5} />
        </button>
        
        <span className="font-extrabold text-sm select-none text-slate-900 dark:text-white min-w-[2.5rem] text-center px-1">
          {displayValue}
        </span>

        <button 
          type="button"
          onClick={onAdd}
          disabled={disabled}
          className={`p-2 rounded-xl transition-all ${
            disabled
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
              : 'bg-[#2f7d6d] hover:bg-[#256659] text-white shadow-sm'
          }`}
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default Counter;
