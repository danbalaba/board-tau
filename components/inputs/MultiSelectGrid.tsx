"use client";

import React from "react";
import { IconType } from "react-icons";
import { cn } from "@/utils/helper";

export type MultiSelectOption = {
  label: string;
  value: string;
  icon?: IconType;
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
            className={cn(
              "rounded-xl border-2 p-4 flex flex-col gap-3 hover:border-black transition cursor-pointer text-left",
              isSelected ? "border-black" : "border-neutral-200"
            )}
          >
            {Icon && <Icon size={24} className="text-neutral-600" />}
            <span className="font-semibold text-sm">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MultiSelectGrid;
