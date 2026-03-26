"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/helper";

interface SwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <div className="flex items-center space-x-3 group animate-in fade-in slide-in-from-right-2 duration-300">
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-none",
          checked ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
        )}
      >
        <span className="sr-only">{label || "Toggle"}</span>
        <motion.span
          animate={{ x: checked ? 16 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg"
        />
      </button>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-semibold cursor-pointer select-none transition-colors",
            checked ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Switch;
