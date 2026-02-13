"use client";

import React from "react";

interface SliderProps {
  id: string;
  label: string;
  subtitle?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
}

const Slider: React.FC<SliderProps> = ({
  id,
  label,
  subtitle,
  min,
  max,
  step = 1,
  value,
  onChange,
  unit = "km",
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <div>
          <label htmlFor={id} className="font-semibold text-[15px]">
            {label}
          </label>
          {subtitle && (
            <p className="text-neutral-500 text-sm font-light">{subtitle}</p>
          )}
        </div>
        <span className="text-neutral-600 font-medium">
          {value} {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary bg-neutral-200"
      />
    </div>
  );
};

export default Slider;
