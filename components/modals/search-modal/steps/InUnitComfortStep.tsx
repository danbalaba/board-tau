"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { fetchTaxonomyData, getTaxonomyDataSync } from "@/lib/taxonomyCache";
import Heading from "@/components/common/Heading";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import {
  UtensilsCrossed,
  Flame,
  Refrigerator,
  Microwave,
  Coffee,
  CookingPot,
  Utensils,
  Grid,
  Droplets,
  Wind,
  CheckCircle,
  Database,
  Fan,
  ThermometerSnowflake,
  Tv,
  Sofa,
  Armchair,
  Check,
  ChefHat,
  Bath,
  Lamp,
  ShowerHead,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Lock,
} from "lucide-react";
import { FieldValues, UseFormRegister, UseFormWatch } from "react-hook-form";
import { KerbyPose } from "../KerbyMascot";

interface InUnitComfortStepProps {
  propertyTypeSelected: string[];
  roomTypeSelected: string[];
  roomAmenitiesSelected: string[];
  setCustomValue: (id: string, value: any) => void;
  toggleMulti: (id: "amenities" | "rules" | "advanced" | "roomAmenities" | "propertyType" | "roomType", value: string) => void;
  register: UseFormRegister<FieldValues>;
  watch: UseFormWatch<FieldValues>;
  subStep: number;
  setSubStep: (val: number | ((prev: number) => number)) => void;
  onUpdateKerbySpeech: (speech: string, pose?: KerbyPose) => void;
  onTotalSubStepsChange?: (count: number) => void;
  showValidationError?: boolean;
  onClearValidationError?: () => void;
  isBranchB?: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function InUnitComfortStep({
  propertyTypeSelected = [],
  roomTypeSelected = [],
  roomAmenitiesSelected = [],
  setCustomValue,
  toggleMulti,
  watch,
  subStep,
  setSubStep,
  onUpdateKerbySpeech,
  onTotalSubStepsChange,
  showValidationError = false,
  onClearValidationError,
  isBranchB: isBranchBProp = false,
  onLoadingChange,
}: InUnitComfortStepProps) {
  const propName = propertyTypeSelected[0] || "Boarding House";
  const roomName = roomTypeSelected[0] || "";

  const isUnitPricing =
    Boolean(isBranchBProp) ||
    propName.toLowerCase().includes("apartment") ||
    propName.toLowerCase().includes("transient") ||
    propName.toLowerCase().includes("hostel") ||
    propName.toLowerCase().includes("unit");

  const kitchenChoice = watch("kitchenChoice") || (isUnitPricing ? "Private In-Room Kitchenette" : "");
  const bathroomChoice = watch("bathroomChoice") || (isUnitPricing ? "Private Bathroom (CR) Inside Room" : "");

  const [dynamicAttributes, setDynamicAttributes] = useState<any[]>(() => {
    const syncData = getTaxonomyDataSync("ROOM_AMENITY");
    return syncData ? syncData.attributes : [];
  });
  const [dynamicSubGroups, setDynamicSubGroups] = useState<any[]>(() => {
    const syncData = getTaxonomyDataSync("ROOM_AMENITY");
    return syncData ? syncData.subGroups : [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !getTaxonomyDataSync("ROOM_AMENITY");
  });

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  }, [isLoading, onLoadingChange]);

  useEffect(() => {
    fetchTaxonomyData("ROOM_AMENITY")
      .then((data) => {
        setDynamicAttributes(data.attributes);
        setDynamicSubGroups(data.subGroups);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const isAttrMatchingPropertyType = useCallback(
    (attr: any) => {
      if (!attr || !attr.isActive) return false;
      const selectedProp = (propertyTypeSelected[0] || "Boarding House").toLowerCase().trim();
      const rawTypes = attr.propertyTypeNames || attr.propertyTypes || [];

      if (!attr.isUniversal && rawTypes && rawTypes.length > 0) {
        return rawTypes.some((pt: any) => {
          const pName = (pt.name || pt || "").toString().toLowerCase().trim();
          return pName.includes(selectedProp) || selectedProp.includes(pName);
        });
      }

      return attr.isUniversal ?? true;
    },
    [propertyTypeSelected]
  );

  const isAnyKitchen = useMemo(() => {
    if (!kitchenChoice) return false;
    const lower = kitchenChoice.toLowerCase();
    return lower.includes("any") || lower.includes("no preference") || lower.includes("no kitchen");
  }, [kitchenChoice]);

  const isAnyBathroom = useMemo(() => {
    if (!bathroomChoice) return false;
    const lower = bathroomChoice.toLowerCase();
    return lower.includes("any") || lower.includes("no preference");
  }, [bathroomChoice]);

  // Dynamically compute active sub-steps combining interactive choice steps + database sub-groups!
  const SUB_STEP_TABS = useMemo(() => {
    const baseTabs: any[] = [];

    if (!isUnitPricing) {
      baseTabs.push({ type: "kitchen_choice", label: "Kitchen Setup", subGroupKey: null });
    }
    
    // Include Kitchen Features ONLY if user did NOT select "Any Kitchen Setup"
    if (!isAnyKitchen) {
      baseTabs.push({ type: "kitchen_items", label: "Kitchen Features", subGroupKey: "KITCHEN_APP" });
    }

    if (!isUnitPricing) {
      baseTabs.push({ type: "bathroom_choice", label: "Bathroom Setup", subGroupKey: null });
    }

    // Include CR Features ONLY if user did NOT select "Any Bathroom Setup"
    if (!isAnyBathroom) {
      baseTabs.push({ type: "bathroom_items", label: "CR Features", subGroupKey: "BATHROOM_FIX" });
    }

    // Append all other dynamic sub-groups from MongoDB (COOLING, FURNITURE, plus ANY new Admin sub-groups!)
    const processedKeys = new Set(["KITCHEN_APP", "BATHROOM_FIX"]);

    dynamicSubGroups.forEach((sg: any) => {
      if (!processedKeys.has(sg.key)) {
        // Verify at least 1 active attribute in this subGroup matches the user's selected property type!
        const matchingAttrs = dynamicAttributes.filter(
          (attr: any) => attr.subGroupKey === sg.key && isAttrMatchingPropertyType(attr)
        );

        if (matchingAttrs.length > 0 || dynamicAttributes.length === 0) {
          processedKeys.add(sg.key);
          baseTabs.push({
            type: "dynamic_attribute_subgroup",
            label: sg.tabLabel || sg.title || sg.key,
            subGroupKey: sg.key,
            subGroupObj: sg,
          });
        }
      }
    });

    // Fallback if dynamicSubGroups hasn't loaded yet
    if (!processedKeys.has("COOLING")) {
      const coolingAttrs = dynamicAttributes.filter(
        (attr: any) => attr.subGroupKey === "COOLING" && isAttrMatchingPropertyType(attr)
      );
      if (coolingAttrs.length > 0 || dynamicAttributes.length === 0) {
        baseTabs.push({ type: "dynamic_attribute_subgroup", label: "Aircon & Cooling", subGroupKey: "COOLING" });
      }
    }
    if (!processedKeys.has("FURNITURE")) {
      const furnitureAttrs = dynamicAttributes.filter(
        (attr: any) => attr.subGroupKey === "FURNITURE" && isAttrMatchingPropertyType(attr)
      );
      if (furnitureAttrs.length > 0 || dynamicAttributes.length === 0) {
        baseTabs.push({ type: "dynamic_attribute_subgroup", label: "Furniture", subGroupKey: "FURNITURE" });
      }
    }

    return baseTabs.map((tab, idx) => ({
      ...tab,
      index: idx,
    }));
  }, [isUnitPricing, dynamicSubGroups, dynamicAttributes, isAttrMatchingPropertyType, isAnyKitchen, isAnyBathroom]);

  const totalSubSteps = SUB_STEP_TABS.length;

  useEffect(() => {
    if (!isLoading && totalSubSteps > 0 && onTotalSubStepsChange) {
      onTotalSubStepsChange(totalSubSteps);
    }
  }, [isLoading, totalSubSteps, onTotalSubStepsChange]);

  // Auto-set default choices for Apartment / Hostel / Unit Pricing
  useEffect(() => {
    if (isUnitPricing) {
      if (!watch("kitchenChoice")) setCustomValue("kitchenChoice", "Private In-Room Kitchenette");
      if (!watch("bathroomChoice")) setCustomValue("bathroomChoice", "Private Bathroom (CR) Inside Room");
    }
  }, [isUnitPricing, setCustomValue, watch]);

  const currentTab = SUB_STEP_TABS[subStep] || SUB_STEP_TABS[0];

  const currentConfig = useMemo(() => {
    if (currentTab.type === "kitchen_choice") {
      return {
        title: `Step 7-${subStep + 1}: Kitchen Setup Arrangement`,
        subtitle: `Which kitchen & cooking arrangement do you prefer for your ${propName}?`,
        speech: `How do you plan to handle your daily meals and cooking at your ${propName}?`,
        pose: "thinking" as KerbyPose,
      };
    }

    if (currentTab.type === "kitchen_items") {
      return {
        title: `Step 7-${subStep + 1}: ${kitchenChoice === "Shared Common Kitchen" ? "Shared Kitchen Amenities" : "In-Unit Kitchen Features"}`,
        subtitle: kitchenChoice === "Shared Common Kitchen"
          ? `Which shared kitchen items do you need in the common area?`
          : `Which kitchen appliances do you want inside your ${roomName || propName}?`,
        speech: kitchenChoice === "Shared Common Kitchen"
          ? `Which shared kitchen items do you need available in the common kitchen?`
          : `What kitchen appliances or cooking gear do you want inside your unit?`,
        pose: "thinking" as KerbyPose,
      };
    }

    if (currentTab.type === "bathroom_choice") {
      return {
        title: `Step 7-${subStep + 1}: Bathroom (CR) Setup Choice`,
        subtitle: `Which bathroom (CR) arrangement do you prefer for your ${propName}?`,
        speech: `Do you prefer a private CR inside your room, or is a shared hallway CR okay?`,
        pose: "loving" as KerbyPose,
      };
    }

    if (currentTab.type === "bathroom_items") {
      return {
        title: `Step 7-${subStep + 1}: Bathroom (CR) Fixtures & Features`,
        subtitle: `Which bathroom fixtures do you want inside your ${roomName || propName} CR?`,
        speech: `What extra bathroom features like a shower heater or bidet do you prefer in your CR?`,
        pose: "loving" as KerbyPose,
      };
    }

    // Dynamic Database Sub-Group (COOLING, FURNITURE, or any new Admin created Sub-Group!)
    const sgObj = currentTab.subGroupObj;
    const sgLabel = currentTab.label;

    let pose: KerbyPose = "loving";
    if (currentTab.subGroupKey === "FURNITURE") pose = "studying";

    return {
      title: sgObj?.title || `Step 7-${subStep + 1}: ${sgLabel}`,
      subtitle: sgObj?.subtitle || `What ${sgLabel.toLowerCase()} amenities do you need inside your ${roomName || propName}?`,
      speech: `What ${sgLabel.toLowerCase()} features do you prefer inside your ${roomName || propName}?`,
      pose,
    };
  }, [currentTab, subStep, propName, kitchenChoice, roomName]);

  useEffect(() => {
    onUpdateKerbySpeech(currentConfig.speech, currentConfig.pose);
  }, [subStep, currentConfig.speech, currentConfig.pose, onUpdateKerbySpeech]);

  const handleKitchenChoice = (choice: string) => {
    setCustomValue("kitchenChoice", choice);
    if (onClearValidationError) onClearValidationError();
  };

  const handleBathroomChoice = (choice: string) => {
    setCustomValue("bathroomChoice", choice);
    if (onClearValidationError) onClearValidationError();
  };

  // Dynamically query Kitchen Features from MongoDB based on setupContext (IN_UNIT vs SHARED) & Property Scoping
  const kitchenItems = useMemo(() => {
    const isShared = kitchenChoice === "Shared Common Kitchen";
    const isPrivate = kitchenChoice === "Private In-Room Kitchenette";
    const selectedProp = (propertyTypeSelected[0] || "Boarding House").toLowerCase();

    return dynamicAttributes
      .filter((attr) => attr.isActive && attr.subGroupKey === "KITCHEN_APP")
      .filter((attr) => {
        // Property Scoping Filter
        if (!attr.isUniversal && attr.propertyTypeNames && attr.propertyTypeNames.length > 0) {
          const match = attr.propertyTypeNames.some((pt: string) => {
            const pName = pt.toLowerCase().trim();
            return pName.includes(selectedProp) || selectedProp.includes(pName);
          });
          if (!match) return false;
        }

        // Setup Context Filter
        if (!attr.setupContext || attr.setupContext === "UNIVERSAL") return true;
        if (isShared && attr.setupContext === "SHARED") return true;
        if (isPrivate && attr.setupContext === "IN_UNIT") return true;
        if (!isShared && !isPrivate) return true;
        return false;
      })
      .map((attr) => {
        let IconComp = Sparkles;
        if (attr.icon && (LucideIcons as any)[attr.icon]) {
          IconComp = (LucideIcons as any)[attr.icon];
        }
        return {
          id: attr.name,
          name: attr.name,
          icon: IconComp,
          desc: attr.description || `Custom ${attr.name} kitchen feature.`,
        };
      });
  }, [dynamicAttributes, kitchenChoice, propertyTypeSelected]);

  // Dynamically query CR Features from MongoDB based on setupContext (PRIVATE vs COMMON_CR) & Property Scoping
  const crItems = useMemo(() => {
    const isPrivateCR = bathroomChoice === "Private Bathroom (CR) Inside Room";
    const isCommonCR = bathroomChoice === "Common Hallway Bathroom (CR)";
    const selectedProp = (propertyTypeSelected[0] || "Boarding House").toLowerCase();

    return dynamicAttributes
      .filter((attr) => attr.isActive && attr.subGroupKey === "BATHROOM_FIX")
      .filter((attr) => {
        // Property Scoping Filter
        if (!attr.isUniversal && attr.propertyTypeNames && attr.propertyTypeNames.length > 0) {
          const match = attr.propertyTypeNames.some((pt: string) => {
            const pName = pt.toLowerCase().trim();
            return pName.includes(selectedProp) || selectedProp.includes(pName);
          });
          if (!match) return false;
        }

        // Setup Context Filter
        if (!attr.setupContext || attr.setupContext === "UNIVERSAL") return true;
        if (isPrivateCR && (attr.setupContext === "PRIVATE" || attr.setupContext === "IN_UNIT")) return true;
        if (isCommonCR && (attr.setupContext === "COMMON_CR" || attr.setupContext === "SHARED")) return true;
        if (!isPrivateCR && !isCommonCR) return true;
        return false;
      })
      .map((attr) => {
        let IconComp = Sparkles;
        if (attr.icon && (LucideIcons as any)[attr.icon]) {
          IconComp = (LucideIcons as any)[attr.icon];
        }
        return {
          id: attr.name,
          name: attr.name,
          icon: IconComp,
          desc: attr.description || `Custom ${attr.name} CR feature.`,
        };
      });
  }, [dynamicAttributes, bathroomChoice, propertyTypeSelected]);

  const currentItems = useMemo(() => {
    if (currentTab.type === "kitchen_items") return kitchenItems;
    if (currentTab.type === "bathroom_items") return crItems;

    const sgKey = currentTab.subGroupKey;
    if (!sgKey) return [];

    const selectedProp = (propertyTypeSelected[0] || "Boarding House").toLowerCase();

    return dynamicAttributes
      .filter((attr) => attr.isActive && attr.subGroupKey === sgKey)
      .filter((attr) => {
        if (!attr.isUniversal && attr.propertyTypeNames && attr.propertyTypeNames.length > 0) {
          return attr.propertyTypeNames.some((pt: string) => {
            const pName = pt.toLowerCase().trim();
            return pName.includes(selectedProp) || selectedProp.includes(pName);
          });
        }
        return true;
      })
      .map((attr) => {
        let IconComp = Sparkles;
        if (attr.icon && (LucideIcons as any)[attr.icon]) {
          IconComp = (LucideIcons as any)[attr.icon];
        }
        return {
          id: attr.name,
          name: attr.name,
          icon: IconComp,
          desc: attr.description || `Custom ${attr.name} amenity.`,
        };
      });
  }, [currentTab, kitchenItems, crItems, dynamicAttributes, propertyTypeSelected]);

  const hasCurrentSubStepSelections =
    currentTab.type === "kitchen_choice"
      ? Boolean(kitchenChoice)
      : currentTab.type === "bathroom_choice"
      ? Boolean(bathroomChoice)
      : currentItems.some((item: any) => roomAmenitiesSelected.includes(item.id));

  const handleClearSubStep = () => {
    if (currentTab.type === "kitchen_choice") {
      setCustomValue("kitchenChoice", "");
      ["Private Kitchenette", "Shared Kitchen"].forEach((val) => {
        if (roomAmenitiesSelected.includes(val)) toggleMulti("roomAmenities", val);
      });
    } else if (currentTab.type === "bathroom_choice") {
      setCustomValue("bathroomChoice", "");
      ["Private CR", "Common CR"].forEach((val) => {
        if (roomAmenitiesSelected.includes(val)) toggleMulti("roomAmenities", val);
      });
    } else {
      currentItems.forEach((item: any) => {
        if (roomAmenitiesSelected.includes(item.id)) {
          toggleMulti("roomAmenities", item.id);
        }
      });
    }
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
    setMaxUnlockedSubStep((prev) => Math.min(prev, Math.max(0, SUB_STEP_TABS.length - 1)));
  }, [SUB_STEP_TABS.length]);

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
          helpText="Select your preferred setup and in-unit comfort features."
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
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
        {/* SUB-STEP: KITCHEN CHOICE */}
        {currentTab.type === "kitchen_choice" && (
          <motion.div
            key="kitchen_choice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            <div className={`p-4 rounded-2xl border transition-all flex flex-col gap-4 ${
              showValidationError && !kitchenChoice
                ? "border-red-400 dark:border-red-600 bg-red-50/70 dark:bg-red-950/40"
                : "border-transparent"
            }`}>
              {showValidationError && !kitchenChoice && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <Sparkles size={16} />
                    <span>Kitchen Setup Preference</span>
                  </span>
                  <span className="text-[11px] font-black text-white bg-red-600 dark:bg-red-700 px-2.5 py-0.5 rounded-lg border border-red-500 shrink-0 shadow-sm">
                    Selection Required
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "Private In-Room Kitchenette", title: "Private Kitchenette", desc: "Cook inside your own room/unit", icon: UtensilsCrossed },
                  { id: "Shared Common Kitchen", title: "Shared Kitchen", desc: "Cook in shared common hallway/ground floor kitchen", icon: ChefHat },
                  { id: "Any Kitchen Setup / No Preference", title: "Any Kitchen Setup", desc: "Either private kitchenette or shared kitchen is fine", icon: Utensils },
                ].map((c) => {
                  const isSelected = kitchenChoice === c.id;
                  const Icon = c.icon;

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleKitchenChoice(c.id)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-[#2f7d6d] bg-[#2f7d6d]/10 dark:border-emerald-400 shadow-md ring-2 ring-[#2f7d6d]/20"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-xl ${isSelected ? "bg-[#2f7d6d] text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700"}`}>
                          <Icon size={22} />
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-[#2f7d6d] bg-[#2f7d6d] text-white" : "border-slate-300 dark:border-slate-600"}`}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{c.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">{c.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {showValidationError && !kitchenChoice && (
                <p className="text-xs font-bold text-red-900 dark:text-red-200 bg-red-100 dark:bg-red-950/90 p-3 rounded-xl border border-red-300 dark:border-red-800 flex items-center gap-2 shadow-sm">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span>Please select a kitchen setup option above before clicking Continue.</span>
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* SUB-STEP: BATHROOM CR CHOICE */}
        {currentTab.type === "bathroom_choice" && (
          <motion.div
            key="bathroom_choice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            <div className={`p-4 rounded-2xl border transition-all flex flex-col gap-4 ${
              showValidationError && !bathroomChoice
                ? "border-red-400 dark:border-red-600 bg-red-50/70 dark:bg-red-950/40"
                : "border-transparent"
            }`}>
              {showValidationError && !bathroomChoice && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <Sparkles size={16} />
                    <span>Bathroom Setup Preference</span>
                  </span>
                  <span className="text-[11px] font-black text-white bg-red-600 dark:bg-red-700 px-2.5 py-0.5 rounded-lg border border-red-500 shrink-0 shadow-sm">
                    Selection Required
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "Private Bathroom (CR) Inside Room", title: "Private CR Inside Room", desc: "En Suite CR inside your room/unit", icon: Bath },
                  { id: "Common Hallway Bathroom (CR)", title: "Common CR", desc: "Shared CR outside room/unit", icon: CheckCircle },
                  { id: "Any Bathroom Setup", title: "Any CR Setup", desc: "Either private or shared CR is fine", icon: Droplets },
                ].map((c) => {
                  const isSelected = bathroomChoice === c.id;
                  const Icon = c.icon;

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleBathroomChoice(c.id)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-[#2f7d6d] bg-[#2f7d6d]/10 dark:border-emerald-400 shadow-md ring-2 ring-[#2f7d6d]/20"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-xl ${isSelected ? "bg-[#2f7d6d] text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700"}`}>
                          <Icon size={22} />
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-[#2f7d6d] bg-[#2f7d6d] text-white" : "border-slate-300 dark:border-slate-600"}`}>
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{c.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">{c.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {showValidationError && !bathroomChoice && (
                <p className="text-xs font-bold text-red-900 dark:text-red-200 bg-red-100 dark:bg-red-950/90 p-3 rounded-xl border border-red-300 dark:border-red-800 flex items-center gap-2 shadow-sm">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span>Please select a bathroom setup option above before clicking Continue.</span>
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* DYNAMIC AMENITIES GRID FOR ALL OTHER SUB-GROUPS */}
        {currentTab.type !== "kitchen_choice" && currentTab.type !== "bathroom_choice" && (
          <motion.div
            key={subStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
          >
            {currentItems.map((opt: any) => {
              const isSelected = roomAmenitiesSelected.includes(opt.id);
              const Icon = opt.icon;

              return (
                <div
                  key={opt.id}
                  onClick={() => toggleMulti("roomAmenities", opt.id)}
                  className={`p-4 rounded-2xl cursor-pointer border-2 transition-all flex items-start justify-between ${
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
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{opt.name}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">{opt.desc}</p>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-[#2f7d6d] bg-[#2f7d6d] text-white" : "border-slate-300 dark:border-slate-600"}`}>
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      )}
    </motion.div>
  );
}
