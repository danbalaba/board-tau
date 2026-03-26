"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/helper";

interface MonthPickerProps {
  id: string;
  label: string;
  value: string; // Format: "YYYY-MM"
  onChange: (value: string) => void;
  placeholder?: string;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MonthPicker: React.FC<MonthPickerProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = "Select move-in month...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const [viewYear, setViewYear] = useState(
    value ? parseInt(value.split("-")[0], 10) : currentYear
  );

  // Parse current value string back into year & month
  const selectedYear = value ? parseInt(value.split("-")[0], 10) : null;
  const selectedMonth = value ? parseInt(value.split("-")[1], 10) - 1 : null;

  // Close calendar if clicked outside the container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMonthClick = (monthIndex: number) => {
    // Smart Constraint: Disallow picking a move-in date that has already passed in the current year.
    if (viewYear === currentYear && monthIndex < currentMonth) {
        return; 
    }

    const formattedMonth = (monthIndex + 1).toString().padStart(2, "0");
    const formattedResult = `${viewYear}-${formattedMonth}`;
    
    // If user clicks the exact exact same month again, we can treat it as a "clear" action (optional).
    if (value === formattedResult) {
        onChange("");
    } else {
        onChange(formattedResult);
    }
    
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    if (!selectedYear || selectedMonth === null) return placeholder;
    return `${MONTHS[selectedMonth]} ${selectedYear}`;
  };

  return (
    <motion.div layout="position" transition={{ duration: 0.3, ease: "easeInOut" }} className="relative flex flex-col gap-2" ref={containerRef}>
      <label htmlFor={id} className="font-semibold text-sm mb-1 text-zinc-600 dark:text-zinc-400">
        {label}
      </label>

      {/* The Main Select Input Lookalike */}
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl outline-none transition-all duration-200",
          isOpen 
            ? "border-primary ring-2 ring-primary/20 shadow-sm"
            : "border-gray-300 dark:border-gray-700 hover:border-primary/50",
          (!selectedYear || selectedMonth === null) ? "text-gray-500 font-light" : "text-gray-900 dark:text-gray-100 font-medium"
        )}
      >
        <div className="flex items-center gap-3">
          <Calendar className={cn("w-5 h-5 transition-colors duration-200", isOpen ? "text-primary" : "text-gray-400")} />
          <span>{getDisplayValue()}</span>
        </div>
      </button>

      {/* The Interactive Date Picker Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: "8px" }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-3.5">
              {/* Year Navigator Component */}
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-gray-700 pb-1.5">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setViewYear((y) => Math.max(currentYear, y - 1)); }}
                disabled={viewYear <= currentYear}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-30 transition-colors"
                aria-label="Previous year"
              >
                <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <span className="font-bold text-base text-gray-900 dark:text-gray-100 tracking-wide">{viewYear}</span>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setViewYear((y) => y + 1); }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Next year"
              >
                <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {/* Grid of Months View */}
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((month, index) => {
                const isPast = viewYear === currentYear && index < currentMonth;
                const isSelected = selectedYear === viewYear && selectedMonth === index;

                return (
                  <button
                    key={month}
                    type="button"
                    onClick={(e) => { e.preventDefault(); handleMonthClick(index); }}
                    disabled={isPast}
                    className={cn(
                      "py-2 rounded-md font-semibold text-[13px] transition-all duration-200 uppercase tracking-wide",
                      isSelected
                        ? "bg-primary text-white shadow-sm scale-105"
                        : isPast
                        ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50/50 dark:bg-gray-800/50 line-through decoration-gray-300/50"
                        : "text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20"
                    )}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
            {/* Helper Text Footer */}
            <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 text-center text-[11px] text-gray-400 flex justify-between items-center">
               <span>Only future dates allowed</span>
               {value && (
                <button 
                  type="button"
                  onClick={() => { onChange(""); setIsOpen(false); }}
                  className="text-red-500 hover:text-red-600 font-semibold transition"
                >
                  Clear Selection
                </button>
               )}
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MonthPicker;
