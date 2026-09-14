import React, { useEffect, useState } from "react";
import Heading from "@/components/common/Heading";
import { FieldErrors, FieldValues, UseFormRegister, UseFormWatch } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Coins, Building, Home, Crown, Minus, Plus, Check, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { isStepCached, markStepCached } from "@/lib/searchStepCache";

interface BudgetStepProps {
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  watch: UseFormWatch<FieldValues>;
  minPrice: string | number;
  maxPrice: string | number;
  setCustomValue: (id: string, value: any) => void;
  propertyTypeSelected?: string[];
  roomTypeSelected?: string[];
}

export default function BudgetStep({
  register,
  errors,
  watch,
  minPrice,
  maxPrice,
  setCustomValue,
  propertyTypeSelected = [],
  roomTypeSelected = [],
}: BudgetStepProps) {
  const [showPresets, setShowPresets] = useState(false);
  const [isLoading, setIsLoading] = useState(() => !isStepCached("BUDGET"));

  useEffect(() => {
    if (isStepCached("BUDGET")) {
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      markStepCached("BUDGET");
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const currentMin = Number(minPrice) || 0;
  const currentMax = Number(maxPrice) || 10000;

  const hasActiveBudget = (minPrice !== "" && Number(minPrice) > 0) || (maxPrice !== "" && Number(maxPrice) !== 10000);

  const propName = propertyTypeSelected[0] || "Boarding House";
  const roomName = roomTypeSelected[0] || "";

  // Dynamic Preset Budget Ranges tailored to Property & Room selection
  const BUDGET_PRESETS = React.useMemo(() => {
    const isApartmentOrHouse =
      propName.toLowerCase().includes("apartment") ||
      propName.toLowerCase().includes("transient") ||
      propName.toLowerCase().includes("hostel") ||
      propName.toLowerCase().includes("whole house");

    if (isApartmentOrHouse) {
      return [
        {
          id: "studio",
          name: "Compact Studio",
          rangeText: "₱3,000 - ₱5,000",
          desc: `Affordable compact ${propName} layout`,
          min: 3000,
          max: 5000,
          icon: Coins,
        },
        {
          id: "1bed",
          name: "1-Bedroom Unit",
          rangeText: "₱5,000 - ₱8,000",
          desc: "Private 1-bedroom with living space",
          min: 5000,
          max: 8000,
          icon: Building,
        },
        {
          id: "2bed",
          name: "2-Bedroom Unit",
          rangeText: "₱8,000 - ₱12,000",
          desc: "Spacious 2-bedroom for groups or families",
          min: 8000,
          max: 12000,
          icon: Home,
        },
        {
          id: "whole_house",
          name: "Full House / Suite",
          rangeText: "₱12,000+",
          desc: `Entire ${propName} property exclusive use`,
          min: 12000,
          max: 20000,
          icon: Crown,
        },
      ];
    }

    if (roomName === "Bedspace") {
      return [
        {
          id: "bedspace_budget",
          name: "Budget Bedspace",
          rangeText: "Under ₱1,500",
          desc: "Economy shared per-head slot",
          min: 0,
          max: 1500,
          icon: Coins,
        },
        {
          id: "bedspace_standard",
          name: "Standard Bedspace",
          rangeText: "₱1,500 - ₱2,500",
          desc: "Popular shared bedspace with fan/study area",
          min: 1500,
          max: 2500,
          icon: Building,
        },
        {
          id: "bedspace_aircon",
          name: "Aircon Bedspace",
          rangeText: "₱2,500 - ₱3,500",
          desc: "Air-conditioned shared bedspace slot",
          min: 2500,
          max: 3500,
          icon: Home,
        },
        {
          id: "bedspace_allin",
          name: "All-Inclusive Bedspace",
          rangeText: "₱3,500+",
          desc: "Premium bedspace including utility bills",
          min: 3500,
          max: 6000,
          icon: Crown,
        },
      ];
    }

    // Default for Solo Room or Boarding House
    return [
      {
        id: "solo_budget",
        name: "Budget Solo Room",
        rangeText: "Under ₱2,500",
        desc: `Affordable private solo ${propName}`,
        min: 0,
        max: 2500,
        icon: Coins,
      },
      {
        id: "solo_standard",
        name: "Standard Solo Room",
        rangeText: "₱2,500 - ₱4,000",
        desc: "Standard private solo bedroom",
        min: 2500,
        max: 4000,
        icon: Building,
      },
      {
        id: "solo_aircon",
        name: "Aircon Solo Room",
        rangeText: "₱4,000 - ₱6,000",
        desc: "Private air-conditioned solo room",
        min: 4000,
        max: 6000,
        icon: Home,
      },
      {
        id: "solo_deluxe",
        name: "Deluxe Solo Suite",
        rangeText: "₱6,000+",
        desc: "Spacious private suite with own CR",
        min: 6000,
        max: 10000,
        icon: Crown,
      },
    ];
  }, [propName, roomName]);

  const handleClearBudget = () => {
    setCustomValue("minPrice", "");
    setCustomValue("maxPrice", "");
  };

  const handlePresetSelect = (presetMin: number, presetMax: number) => {
    const isPresetActive =
      (currentMin === presetMin || (presetMin === 0 && currentMin === 0)) &&
      currentMax === presetMax;

    if (isPresetActive) {
      handleClearBudget();
    } else {
      setCustomValue("minPrice", presetMin === 0 ? "" : presetMin);
      setCustomValue("maxPrice", presetMax);
    }
  };

  const handleMinChange = (newMin: number) => {
    const val = Math.max(0, Math.min(newMin, currentMax > 0 ? currentMax - 250 : 15000));
    setCustomValue("minPrice", val === 0 ? "" : val);
  };

  const handleMaxChange = (newMax: number) => {
    const val = Math.max(currentMin > 0 ? currentMin + 250 : 500, newMax);
    setCustomValue("maxPrice", val);
  };

  // Format currency display
  const formatCurrency = (val: number) => {
    if (!val || val === 0) return "No Min";
    return `₱${val.toLocaleString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="space-y-2 py-1">
            <div className="h-7 w-72 rounded-xl bg-slate-200/70 dark:bg-slate-800/70" />
            <div className="h-4 w-96 max-w-full rounded-lg bg-slate-200/50 dark:bg-slate-800/50" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-200/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between h-20" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <Heading
            title="What is your monthly budget range?"
            subtitle="Filter properties by your ideal monthly rate in Philippine Peso (₱)."
            helpText="Select a quick preset below or drag the sliders to set a precise custom budget range."
          />

          {/* QUICK PRESETS SECTION */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#2f7d6d] dark:text-emerald-400" />
                <span>Quick Budget Presets</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPresets((prev) => !prev)}
                  className="text-xs font-bold text-[#2f7d6d] dark:text-emerald-400 hover:text-[#256659] dark:hover:text-emerald-300 flex items-center gap-1 transition-all px-2.5 py-1 rounded-xl bg-[#2f7d6d]/10 dark:bg-emerald-500/10 border border-[#2f7d6d]/20 dark:border-emerald-500/20"
                >
                  {showPresets ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span>{showPresets ? "Hide Presets" : "Show Presets"}</span>
                </button>

                {hasActiveBudget && (
                  <button
                    type="button"
                    onClick={handleClearBudget}
                    className="text-xs font-extrabold text-slate-500 hover:text-[#2f7d6d] dark:text-slate-400 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-all px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-[#2f7d6d]/10 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700"
                  >
                    <RotateCcw size={12} strokeWidth={2.5} />
                    <span>Clear Filter</span>
                  </button>
                )}
              </div>
            </div>

            <AnimatePresence initial={false}>
              {showPresets && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-hidden"
                >
                  {BUDGET_PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    const isPresetActive =
                      (currentMin === preset.min || (preset.min === 0 && currentMin === 0)) &&
                      currentMax === preset.max;

                    return (
                      <div
                        key={preset.id}
                        onClick={() => handlePresetSelect(preset.min, preset.max)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          isPresetActive
                            ? "border-[#2f7d6d] bg-[#2f7d6d]/10 dark:border-emerald-400 shadow-md ring-2 ring-[#2f7d6d]/20"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`p-2.5 rounded-xl ${isPresetActive ? "bg-[#2f7d6d] text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                                {preset.name}
                              </h4>
                              <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[#2f7d6d] dark:text-emerald-400">
                                {preset.rangeText}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">
                              {preset.desc}
                            </p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isPresetActive ? "border-[#2f7d6d] bg-[#2f7d6d] text-white" : "border-slate-300 dark:border-slate-600"}`}>
                          {isPresetActive && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* DYNAMIC BUDGET BADGE DISPLAY & DUAL SLIDERS */}
          <div className="p-5 sm:p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col gap-6">
            {/* Dynamic Highlight Badge */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Selected Budget Range
                </span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight flex items-center gap-2">
                  <span className="text-[#2f7d6d] dark:text-emerald-400">{formatCurrency(currentMin)}</span>
                  <span className="text-slate-400 dark:text-slate-600 font-bold">—</span>
                  <span className="text-[#2f7d6d] dark:text-emerald-400">
                    {currentMax >= 15000 ? "₱15,000+" : `₱${currentMax.toLocaleString()}`}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/ month</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasActiveBudget && (
                  <button
                    type="button"
                    onClick={handleClearBudget}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-[#2f7d6d] hover:text-white dark:hover:bg-emerald-600 transition-all font-bold text-xs flex items-center gap-1.5"
                    title="Reset Budget Filter"
                  >
                    <RotateCcw size={12} strokeWidth={2.5} />
                    <span>Reset</span>
                  </button>
                )}
                <div className="px-3 py-1.5 rounded-lg bg-[#2f7d6d]/15 text-[#2f7d6d] dark:text-emerald-400 font-bold text-xs">
                  {currentMax <= 2000 ? "Budget Friendly" : currentMax <= 5000 ? "Student Choice" : "Premium Range"}
                </div>
              </div>
            </div>

            {/* DUAL RANGE SLIDERS */}
            <div className="flex flex-col gap-5 pt-2">
              {/* Min Price Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Minimum Price</span>
                  <span className="text-[#2f7d6d] dark:text-emerald-400 font-black">{formatCurrency(currentMin)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="250"
                  value={currentMin}
                  onChange={(e) => handleMinChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#2f7d6d]"
                />
              </div>

              {/* Max Price Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Maximum Price</span>
                  <span className="text-[#2f7d6d] dark:text-emerald-400 font-black">
                    {currentMax >= 15000 ? "₱15,000+" : `₱${currentMax.toLocaleString()}`}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="15000"
                  step="250"
                  value={currentMax}
                  onChange={(e) => handleMaxChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#2f7d6d]"
                />
              </div>
            </div>

            {/* STEPPER FINE-TUNING CONTROLS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Min Stepper */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Min Limit</span>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                    {formatCurrency(currentMin)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMinChange(currentMin - 500)}
                    className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors shadow-sm"
                  >
                    <Minus size={14} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMinChange(currentMin + 500)}
                    className="p-2 rounded-lg bg-[#2f7d6d] text-white hover:bg-[#256659] shadow-sm transition-colors"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Max Stepper */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Max Limit</span>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                    {currentMax >= 15000 ? "₱15,000+" : `₱${currentMax.toLocaleString()}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMaxChange(currentMax - 500)}
                    className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors shadow-sm"
                  >
                    <Minus size={14} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMaxChange(currentMax + 500)}
                    className="p-2 rounded-lg bg-[#2f7d6d] text-white hover:bg-[#256659] shadow-sm transition-colors"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
