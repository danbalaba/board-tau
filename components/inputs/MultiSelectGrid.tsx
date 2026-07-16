"use client";

import React from "react";
import { IconType } from "react-icons";
import { cn } from "@/utils/helper";

import HelpTooltip from "@/components/common/HelpTooltip";

export type MultiSelectOption = {
  label: string;
  value: string;
  icon?: IconType;
  description?: string;
};

interface MultiSelectGridProps {
  options: MultiSelectOption[];
  selected: string[];
  onToggle: (value: string) => void;
  className?: string;
}

const MultiSelectGrid: React.FC<MultiSelectGridProps> = ({
  options,
  selected,
  onToggle,
  className,
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto",
        className
      )}
    >
      {options.map((item) => {
        const isSelected = selected.includes(item.value);
        const Icon = item.icon;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onToggle(item.value)}
            className={`
              flex items-center justify-between p-4 cursor-pointer rounded-xl transition-all duration-200 border bg-white dark:bg-gray-800
              ${isSelected 
                ? 'border-primary ring-1 ring-primary shadow-sm' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
            `}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg flex items-center justify-center ${isSelected ? 'text-primary bg-primary/10' : 'text-gray-500 bg-gray-100 dark:bg-gray-700'}`}>
                {Icon && <Icon size={20} />}
              </div>
              <div className="flex items-center gap-1">
                <span className={`font-semibold ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {item.label}
                </span>
                {item.description && <HelpTooltip text={item.description} />}
              </div>
            </div>
            
            {/* Checkbox Indicator */}
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'}`}>
              {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default MultiSelectGrid;
