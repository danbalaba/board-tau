"use client";

import React from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
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
    <div className={`flex flex-row items-center justify-between ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex flex-col">
        <div className="flex items-center">
          <h3 className="font-semibold text-text-primary">{title}</h3>
          {helpText && <HelpTooltip text={helpText} />}
        </div>
        <p className="font-light text-[14px] text-text-secondary">{subtitle}</p>
      </div>
      <div className="flex flex-row items-center gap-4">
        <button type="button"
          onClick={onReduce}
          disabled={disabled || value === 0}
          className={`w-8 h-8 rounded-full border-[1px] flex items-center justify-center transition-all ${
            disabled || value === 0
              ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed opacity-50'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <AiOutlineMinus size={16} />
        </button>
        <span className="font-semibold text-lg select-none text-gray-900 dark:text-gray-100 w-10 text-center">
          {displayValue}
        </span>
        <button type="button"
          onClick={onAdd}
          disabled={disabled}
          className={`w-8 h-8 rounded-full border-[1px] flex items-center justify-center transition-all ${
            disabled
              ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed opacity-50'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          autoFocus={title === "Guests"}
        >
          <AiOutlinePlus size={16} />
        </button>
      </div>
    </div>
  );
};

export default Counter;
