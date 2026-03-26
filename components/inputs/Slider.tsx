import React from "react";
import * as RadixSlider from "@radix-ui/react-slider";
import { cn } from "@/utils/helper";

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
  step = 0.5,
  value,
  onChange,
  unit = "km",
}) => {
  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex justify-between items-end">
        <div>
          <label htmlFor={id} className="font-semibold text-[15px] mb-1">
            {label}
          </label>
          {subtitle && (
            <p className="text-neutral-500 text-sm font-light">{subtitle}</p>
          )}
        </div>
        <div className="flex items-baseline gap-1 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          <span className="text-primary font-bold text-lg">
            {value}
          </span>
          <span className="text-primary/70 text-xs font-semibold uppercase">{unit}</span>
        </div>
      </div>

      <RadixSlider.Root
        className="relative flex items-center select-none touch-none w-full h-8"
        defaultValue={[value]}
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        max={max}
        min={min}
        step={step}
      >
        {/* The Track (Background) */}
        <RadixSlider.Track className="bg-neutral-200 dark:bg-gray-700 relative grow rounded-full h-[6px]">
          {/* The Range (Filled portion) */}
          <RadixSlider.Range className="absolute bg-primary rounded-full h-full" />
        </RadixSlider.Track>

        {/* The Thumb (Slider Head) */}
        <RadixSlider.Thumb
          className="block w-6 h-6 bg-white border-2 border-primary rounded-full shadow-lg hover:bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95"
          aria-label="Distance limit"
        />
      </RadixSlider.Root>

      {/* Visual Min/Max Indicators */}
      <div className="flex justify-between px-1 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        <span>{min} {unit}</span>
        <span>{Math.floor(max/2)} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
};

export default Slider;
