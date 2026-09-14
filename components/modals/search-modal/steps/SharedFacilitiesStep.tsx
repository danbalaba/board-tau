"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { fetchTaxonomyData, getTaxonomyDataSync } from "@/lib/taxonomyCache";
import Heading from "@/components/common/Heading";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import {
  Utensils,
  Store,
  ShoppingBag,
  Shirt,
  Droplets,
  Wifi,
  Radio,
  Zap,
  Container,
  Activity,
  Droplet,
  GlassWater,
  Sparkles,
  UserCheck,
  BookOpen,
  Sofa,
  Wrench,
  BedDouble,
  Car,
  Warehouse,
  Bike,
  Check,
  RotateCcw,
  ShieldCheck,
  Lock,
  Trees,
  Sun,
} from "lucide-react";
import { FieldValues, UseFormRegister, UseFormWatch } from "react-hook-form";
import { KerbyPose } from "../KerbyMascot";

interface SharedFacilitiesStepProps {
  propertyTypeSelected: string[];
  amenitiesSelected: string[];
  setCustomValue: (id: string, value: any) => void;
  toggleMulti: (id: "amenities" | "rules" | "advanced" | "roomAmenities" | "propertyType" | "roomType", value: string) => void;
  register: UseFormRegister<FieldValues>;
  watch: UseFormWatch<FieldValues>;
  subStep: number;
  setSubStep: (val: number | ((prev: number) => number)) => void;
  onUpdateKerbySpeech: (speech: string, pose?: KerbyPose) => void;
  onTotalSubStepsChange?: (count: number) => void;
  isBranchB?: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function SharedFacilitiesStep({
  propertyTypeSelected = [],
  amenitiesSelected = [],
  toggleMulti,
  subStep,
  setSubStep,
  onUpdateKerbySpeech,
  onTotalSubStepsChange,
  isBranchB = false,
  onLoadingChange,
}: SharedFacilitiesStepProps) {
  const propName = propertyTypeSelected[0] || "Boarding House";
  const isUnitPricing =
    isBranchB ||
    propName.toLowerCase().includes("apartment") ||
    propName.toLowerCase().includes("transient") ||
    propName.toLowerCase().includes("hostel") ||
    propName.toLowerCase().includes("unit");

  const [dynamicAttributes, setDynamicAttributes] = useState<any[]>(() => {
    const syncData = getTaxonomyDataSync("AMENITY");
    return syncData ? syncData.attributes : [];
  });
  const [dynamicSubGroups, setDynamicSubGroups] = useState<any[]>(() => {
    const syncData = getTaxonomyDataSync("AMENITY");
    return syncData ? syncData.subGroups : [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !getTaxonomyDataSync("AMENITY");
  });

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  }, [isLoading, onLoadingChange]);

  useEffect(() => {
    fetchTaxonomyData("AMENITY")
      .then((data) => {
        setDynamicAttributes(data.attributes);
        setDynamicSubGroups(data.subGroups);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const activeSubGroups = useMemo(() => {
    const selectedProp = (propertyTypeSelected[0] || "Boarding House").toLowerCase();

    let groups = [...dynamicSubGroups];

    if (groups.length === 0 && dynamicAttributes.length > 0) {
      const keys = Array.from(new Set(dynamicAttributes.map((a: any) => a.subGroupKey).filter(Boolean)));
      groups = keys.map((k: any, idx: number) => ({
        key: k,
        tabLabel: k.replace("_", " "),
        displayOrder: idx + 1,
      }));
    }

    // Filter sub-groups: keep if it has active attributes matching the selected property type
    return groups.filter((sg: any) => {
      const matchingAttrs = dynamicAttributes.filter((attr: any) => {
        if (!attr.isActive) return false;
        if (attr.subGroupKey !== sg.key) return false;
        
        const rawTypes = attr.propertyTypeNames || attr.propertyTypes || [];
        if (!attr.isUniversal && rawTypes && rawTypes.length > 0) {
          return rawTypes.some((pt: any) => {
            const pName = (pt.name || pt || "").toString().toLowerCase().trim();
            return pName.includes(selectedProp) || selectedProp.includes(pName);
          });
        }

        return attr.isUniversal ?? true;
      });
      return matchingAttrs.length > 0;
    });
  }, [dynamicSubGroups, dynamicAttributes, propertyTypeSelected]);

  useEffect(() => {
    if (!isLoading && activeSubGroups.length > 0 && onTotalSubStepsChange) {
      onTotalSubStepsChange(activeSubGroups.length);
    }
  }, [isLoading, activeSubGroups.length, onTotalSubStepsChange]);

  // Sub-step configuration definition purely derived from database subGroup & attributes
  const currentSubGroup = activeSubGroups[subStep] || activeSubGroups[0];
  const currentSubGroupKey = currentSubGroup?.key || "STORES";
  const label = currentSubGroup?.tabLabel || currentSubGroup?.title || currentSubGroupKey;

  const excludedStoresNames = [
    "walking distance to campus gate",
    "near tricycle terminal",
    "near jeepney route",
  ];

  const currentItems = dynamicAttributes
    .filter((attr) => {
      if (!attr.isActive) return false;
      if (excludedStoresNames.includes(attr.name.toLowerCase().trim())) return false;
      if (attr.subGroupKey) {
        return attr.subGroupKey === currentSubGroupKey;
      }
      return currentSubGroupKey === "STORES";
    })
    .filter((attr) => {
      const rawTypes = attr.propertyTypeNames || attr.propertyTypes || [];
      if (!attr.isUniversal && rawTypes && rawTypes.length > 0) {
        const selectedProp = (propertyTypeSelected[0] || "Boarding House").toLowerCase().trim();
        return rawTypes.some((pt: any) => {
          const pName = (pt.name || pt || "").toString().toLowerCase().trim();
          return pName.includes(selectedProp) || selectedProp.includes(pName);
        });
      }
      return attr.isUniversal ?? true;
    })
    .map((attr: any) => {
      let IconComp = Sparkles;
      if (attr.icon && (LucideIcons as any)[attr.icon]) {
        IconComp = (LucideIcons as any)[attr.icon];
      }
      return {
        id: attr.name,
        name: attr.name,
        icon: IconComp,
        desc: attr.description || `Custom ${attr.name} facility available.`,
      };
    });

  const currentConfig = useMemo(() => {
    let pose: KerbyPose = "pointing";
    if (currentSubGroupKey === "WIFI" || currentSubGroupKey === "STUDY_LOUNGE") pose = "studying";
    if (currentSubGroupKey === "PARKING") pose = "driving";

    return {
      title: currentSubGroup?.title || `Step 6-${subStep + 1}: ${label} Facilities`,
      subtitle: currentSubGroup?.subtitle || `Which ${label.toLowerCase()} facilities do you prefer for your ${propName}?`,
      speech: `Which ${label.toLowerCase()} amenities do you need at your ${propName}?`,
      pose,
      items: currentItems,
    };
  }, [currentSubGroup, currentSubGroupKey, subStep, label, propName, currentItems]);

  // Update Kerby Speech and Pose when subStep changes
  useEffect(() => {
    onUpdateKerbySpeech(currentConfig.speech, currentConfig.pose);
  }, [subStep, currentConfig.speech, currentConfig.pose, onUpdateKerbySpeech]);

  // Build dynamic breadcrumb tabs based on active database sub-groups
  const SUB_STEP_TABS = useMemo(() => {
    return activeSubGroups.map((sg: any, idx: number) => ({
      label: sg.tabLabel || sg.title || sg.key,
      index: idx,
    }));
  }, [activeSubGroups]);

  const hasCurrentSubStepSelections = currentConfig.items.some((item: any) =>
    amenitiesSelected.includes(item.id)
  );

  const handleClearSubStep = () => {
    currentConfig.items.forEach((item: any) => {
      if (amenitiesSelected.includes(item.id)) {
        toggleMulti("amenities", item.id);
      }
    });
  };

  const activeTabRef = React.useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [subStep]);

  const [maxUnlockedSubStep, setMaxUnlockedSubStep] = useState(0);

  useEffect(() => {
    setMaxUnlockedSubStep((prev) => Math.max(prev, subStep));
  }, [subStep]);

  useEffect(() => {
    setMaxUnlockedSubStep((prev) => Math.min(prev, Math.max(0, activeSubGroups.length - 1)));
  }, [activeSubGroups.length]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      {/* HEADING WITH RESPONSIVE CLEAR SELECTION & SKELETON */}
      {isLoading ? (
        <div className="space-y-2 py-1">
          <div className="h-7 w-72 rounded-xl bg-slate-200/70 dark:bg-slate-800/70" />
          <div className="h-4 w-[28rem] max-w-full rounded-lg bg-slate-200/50 dark:bg-slate-800/50" />
        </div>
      ) : (
        <Heading
          title={currentConfig.title}
          subtitle={currentConfig.subtitle}
          helpText="Tap any preference card to select or deselect options for your search filter."
          rightAction={
            hasCurrentSubStepSelections ? (
              <button
                type="button"
                onClick={handleClearSubStep}
                className="text-xs font-extrabold text-slate-500 hover:text-[#2f7d6d] dark:text-slate-400 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-all px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-[#2f7d6d]/10 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700 shrink-0"
              >
                <RotateCcw size={12} strokeWidth={2.5} />
                <span>Clear Selection</span>
              </button>
            ) : null
          }
        />
      )}

      {/* SUB-STEP BREADCRUMB PILLS SKELETON OR LIVE */}
      {isLoading ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-7 w-20 rounded-full bg-slate-200/70 dark:bg-slate-800/70 shrink-0" />
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar w-full">
          {SUB_STEP_TABS.map((tab: any) => {
            const isActive = subStep === tab.index;
            const isDone = subStep > tab.index;
            const isLocked = tab.index > maxUnlockedSubStep;

            return (
              <button
                key={tab.index}
                ref={isActive ? activeTabRef : null}
                type="button"
                disabled={isLocked}
                onClick={() => !isLocked && setSubStep(tab.index)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#2f7d6d] text-white shadow-md ring-2 ring-[#2f7d6d]/30"
                    : isDone
                    ? "bg-slate-200 dark:bg-slate-800 text-[#2f7d6d] dark:text-emerald-400 font-bold"
                    : isLocked
                    ? "bg-slate-100/60 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed border border-slate-200/50 dark:border-slate-800/50"
                    : "bg-slate-100 dark:bg-slate-800/50 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                }`}
                title={isLocked ? `${tab.label} (Locked - Complete previous tabs first)` : tab.label}
              >
                <span>{tab.label}</span>
                {isLocked ? (
                  <Lock size={10} className="text-slate-400 dark:text-slate-600 shrink-0" />
                ) : (
                  isDone && <Check size={12} strokeWidth={3} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* CARDS GRID SKELETON OR LIVE */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-200/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between h-20">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-200/70 dark:bg-slate-800/70 shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200/70 dark:bg-slate-800/70 rounded w-36" />
                  <div className="h-3 bg-slate-200/70 dark:bg-slate-800/70 rounded w-48" />
                </div>
              </div>
              <div className="w-5 h-5 rounded-md bg-slate-200/70 dark:bg-slate-800/70 shrink-0" />
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={subStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
          >
            {currentConfig.items.map((opt: any) => {
              const isSelected = amenitiesSelected.includes(opt.id);
              const Icon = opt.icon;

              return (
                <div
                  key={opt.id}
                  onClick={() => toggleMulti("amenities", opt.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 flex items-start justify-between ${
                    isSelected
                      ? "bg-[#2f7d6d]/10 border-[#2f7d6d] dark:border-emerald-400 shadow-md ring-2 ring-[#2f7d6d]/20"
                      : "bg-white hover:border-slate-300 dark:bg-slate-900/60 dark:hover:border-slate-700 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? "bg-[#2f7d6d] text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700"}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                        {opt.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">
                        {opt.desc}
                      </p>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-[#2f7d6d] bg-[#2f7d6d] text-white" : "border-slate-300 dark:border-slate-600"}`}>
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
