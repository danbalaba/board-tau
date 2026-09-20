"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchTaxonomyData, getTaxonomyDataSync } from "@/lib/taxonomyCache";
import Heading from "@/components/common/Heading";
import { motion, AnimatePresence } from "framer-motion";
import { getDynamicIcon } from "@/lib/iconResolver";
import {
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Lock,
} from "lucide-react";
import { FieldValues, UseFormRegister, UseFormWatch } from "react-hook-form";
import { KerbyPose } from "../KerbyMascot";

interface RulesStepProps {
  propertyTypeSelected: string[];
  rulesSelected: string[];
  setCustomValue: (id: string, value: any) => void;
  toggleMulti: (id: "amenities" | "rules" | "advanced" | "roomAmenities" | "propertyType" | "roomType", value: string) => void;
  register: UseFormRegister<FieldValues>;
  watch: UseFormWatch<FieldValues>;
  subStep: number;
  setSubStep: (val: number | ((prev: number) => number)) => void;
  onUpdateKerbySpeech?: (speech: string, pose?: KerbyPose) => void;
  onTotalSubStepsChange?: (count: number) => void;
  showValidationError?: boolean;
  onClearValidationError?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function RulesStep({
  propertyTypeSelected = [],
  rulesSelected = [],
  setCustomValue,
  toggleMulti,
  watch,
  subStep,
  setSubStep,
  onUpdateKerbySpeech,
  onTotalSubStepsChange,
  showValidationError = false,
  onClearValidationError,
  onLoadingChange,
}: RulesStepProps) {
  const propName = propertyTypeSelected[0] || "Boarding House";

  const tenantType = watch("tenantType");
  const genderPolicy = watch("genderPolicy");
  const visitorPolicy = watch("visitorPolicy");
  const petPolicy = watch("petPolicy");

  const [dynamicAttributes, setDynamicAttributes] = useState<any[]>(() => {
    const syncData = getTaxonomyDataSync("RULE");
    return syncData ? syncData.attributes : [];
  });
  const [dynamicSubGroups, setDynamicSubGroups] = useState<any[]>(() => {
    const syncData = getTaxonomyDataSync("RULE");
    return syncData ? syncData.subGroups : [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !getTaxonomyDataSync("RULE");
  });

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  }, [isLoading, onLoadingChange]);

  useEffect(() => {
    fetchTaxonomyData("RULE")
      .then((data) => {
        setDynamicAttributes(data.attributes || []);
        setDynamicSubGroups(data.subGroups || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const isSingleGenderProperty = useMemo(() => {
    if (!genderPolicy) return false;
    const lower = (genderPolicy || "").toLowerCase();
    return lower.includes("female-only") || lower.includes("female only") || lower.includes("male-only") || lower.includes("male only");
  }, [genderPolicy]);

  const isVisitorAttrVisible = React.useCallback((attr: any) => {
    if ((attr.subGroupKey || "").toUpperCase().trim() !== "VISITOR_POLICY") return true;
    if (!isSingleGenderProperty) return true;
    const nameLower = (attr.name || "").toLowerCase();
    if (nameLower.includes("restricted")) return false;
    return true;
  }, [isSingleGenderProperty]);

  const isAttrMatchingPropertyType = React.useCallback(
    (attr: any) => {
      if (!attr || !attr.isActive) return false;
      const selectedProp = (propertyTypeSelected[0] || "Boarding House").toLowerCase().trim();
      const rawTypes = attr.propertyTypeNames || attr.propertyTypes || attr.propertyTypeIds || [];

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

  const getSubGroupItems = React.useCallback(
    (subGroupKey: string, defaultIconName: string = "Sparkles") => {
      const keyUpper = (subGroupKey || "").toUpperCase().trim();
      const dbAttrs = dynamicAttributes.filter(
        (attr) =>
          attr.isActive &&
          (attr.subGroupKey || "").toUpperCase().trim() === keyUpper &&
          isVisitorAttrVisible(attr) &&
          isAttrMatchingPropertyType(attr)
      );

      return dbAttrs.map((attr) => ({
        id: attr.name,
        name: attr.name,
        title: attr.name,
        desc: attr.description || `${attr.name} rule.`,
        icon: getDynamicIcon(attr.icon, defaultIconName),
      }));
    },
    [dynamicAttributes, isVisitorAttrVisible, isAttrMatchingPropertyType]
  );

  const genderPolicyItems = useMemo(() => {
    return getSubGroupItems("GENDER_POLICY", "Users");
  }, [getSubGroupItems]);

  const ruleSubGroupsList = useMemo(() => {
    const dbGroups = dynamicSubGroups.filter(
      (sg: any) =>
        sg.type === "RULE" &&
        sg.isActive &&
        sg.key !== "GENDER_POLICY" &&
        sg.key !== "SMOKE_ALCOHOL" &&
        sg.key !== "SMOKE" &&
        sg.key !== "ALCOHOL"
    );

    const standardOrder = ["CURFEW", "VISITOR_POLICY", "PET_POLICY", "SMOKING_POLICY", "ALCOHOL_POLICY"];
    const groups: { key: string; label: string; icon: any; items: any[] }[] = [];
    const processedKeys = new Set<string>();

    const sortedDbGroups = [...dbGroups].sort((a: any, b: any) => {
      const idxA = standardOrder.indexOf((a.key || "").toUpperCase());
      const idxB = standardOrder.indexOf((b.key || "").toUpperCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return (a.displayOrder || 99) - (b.displayOrder || 99);
    });

    sortedDbGroups.forEach((sg: any) => {
      const keyUpper = (sg.key || "").toUpperCase().trim();
      const items = getSubGroupItems(keyUpper, sg.icon || "Sparkles");

      if (items.length > 0 && !processedKeys.has(keyUpper)) {
        processedKeys.add(keyUpper);
        groups.push({
          key: sg.key,
          label: sg.tabLabel || sg.title || sg.key.replace(/_/g, " "),
          icon: getDynamicIcon(sg.icon, "Sparkles"),
          items,
        });
      }
    });

    return groups;
  }, [dynamicSubGroups, getSubGroupItems]);

  const totalSubSteps = 1 + ruleSubGroupsList.length;

  useEffect(() => {
    if (onTotalSubStepsChange) {
      onTotalSubStepsChange(totalSubSteps);
    }
  }, [totalSubSteps, onTotalSubStepsChange]);

  const getSubStepConfig = (index: number) => {
    if (index === 0) {
      return {
        title: "Step 8-1: Property Gender Policy",
        subtitle: `What gender occupancy rule do you prefer for your ${propName}?`,
        speech: `What gender occupancy rule do you prefer for your ${propName}?`,
        pose: "pointing" as KerbyPose,
        type: "gender_policy",
        key: "GENDER_POLICY",
        items: genderPolicyItems,
      };
    }

    const sgIndex = index - 1;
    const sg = ruleSubGroupsList[sgIndex];
    const label = sg?.label || "House Rule";

    return {
      title: `Step 8-${index + 1}: ${label}`,
      subtitle: `What ${label.toLowerCase()} preferences do you have for your ${propName}?`,
      speech: `What ${label.toLowerCase()} preferences do you have for your ${propName}?`,
      pose: (index % 2 === 0 ? "thinking" : "pointing") as KerbyPose,
      type: "rule_items",
      key: sg?.key || "",
      items: sg?.items || [],
    };
  };

  const currentConfig = getSubStepConfig(subStep);

  useEffect(() => {
    if (onUpdateKerbySpeech) {
      onUpdateKerbySpeech(currentConfig.speech, currentConfig.pose);
    }
  }, [subStep, currentConfig.speech, currentConfig.pose, onUpdateKerbySpeech]);

  const SUB_STEP_TABS = useMemo(() => {
    const base = [
      { label: "Gender Policy", index: 0 },
    ];

    const ruleTabs = ruleSubGroupsList.map((sg, idx) => ({
      label: sg.label,
      index: 1 + idx,
    }));

    return [...base, ...ruleTabs];
  }, [ruleSubGroupsList]);

  const hasCurrentSubStepSelections =
    subStep === 0
      ? Boolean(genderPolicy)
      : currentConfig.items
      ? currentConfig.items.some((item: any) => rulesSelected.includes(item.id))
      : false;

  const handleClearSubStep = () => {
    if (subStep === 0) {
      setCustomValue("genderPolicy", "");
      if (rulesSelected.includes("female-only")) toggleMulti("rules", "female-only");
      if (rulesSelected.includes("male-only")) toggleMulti("rules", "male-only");
    } else if (currentConfig.items) {
      currentConfig.items.forEach((item: any) => {
        if (rulesSelected.includes(item.id)) toggleMulti("rules", item.id);
      });
      if (currentConfig.key === "PET_POLICY") setCustomValue("petPolicy", "");
      if (currentConfig.key === "VISITOR_POLICY") setCustomValue("visitorPolicy", "");
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

  const handleGenderPolicyChoice = (choice: string) => {
    setCustomValue("genderPolicy", choice);
    if (choice === "Female-Only Property") toggleMulti("rules", "female-only");
    else if (choice === "Male-Only Property") toggleMulti("rules", "male-only");
    if (onClearValidationError) onClearValidationError();
  };

  const [maxUnlockedSubStep, setMaxUnlockedSubStep] = useState(0);

  useEffect(() => {
    setMaxUnlockedSubStep((prev) => Math.max(prev, subStep));
  }, [subStep]);

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
          helpText="Select your lifestyle and house rule preferences."
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
          {SUB_STEP_TABS.map((tab) => {
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
                    ? "bg-[#2f7d6d]" + " text-white shadow-md ring-2 ring-[#2f7d6d]/30"
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
        {/* SUB-STEP 8-1: GENDER POLICY (Index 0) */}
        {subStep === 0 && (
          <motion.div
            key="gender_policy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            <div className={`p-4 rounded-2xl border transition-all flex flex-col gap-4 ${
              showValidationError && !genderPolicy
                ? "border-red-400 dark:border-red-600 bg-red-50/70 dark:bg-red-950/40"
                : "border-transparent"
            }`}>
              {showValidationError && !genderPolicy && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <Sparkles size={16} />
                    <span>Gender Policy Preference</span>
                  </span>
                  <span className="text-[11px] font-black text-white bg-red-600 dark:bg-red-700 px-2.5 py-0.5 rounded-lg border border-red-500 shrink-0 shadow-sm">
                    Selection Required
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {genderPolicyItems.map((c: any) => {
                  const isSelected = genderPolicy === c.id;
                  const Icon = c.icon;

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleGenderPolicyChoice(c.id)}
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
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{c.title || c.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">{c.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {showValidationError && !genderPolicy && (
                <p className="text-xs font-bold text-red-900 dark:text-red-200 bg-red-100 dark:bg-red-950/90 p-3 rounded-xl border border-red-300 dark:border-red-800 flex items-center gap-2 shadow-sm">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span>Please select a gender policy preference above before clicking Continue.</span>
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* DYNAMIC TAXONOMY HOUSE RULES SUB-STEPS (Index 1+) */}
        {subStep >= 1 && (
          <motion.div
            key={`rule_substep_${subStep}_${currentConfig.key}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            <div className={`p-4 rounded-2xl border transition-all flex flex-col gap-4 ${
              showValidationError && !hasCurrentSubStepSelections
                ? "border-red-400 dark:border-red-600 bg-red-50/70 dark:bg-red-950/40"
                : "border-transparent"
            }`}>
              {showValidationError && !hasCurrentSubStepSelections && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <Sparkles size={16} />
                    <span>{currentConfig.title}</span>
                  </span>
                  <span className="text-[11px] font-black text-white bg-red-600 dark:bg-red-700 px-2.5 py-0.5 rounded-lg border border-red-500 shrink-0 shadow-sm">
                    Selection Required
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentConfig.items?.map((opt: any) => {
                  const isSelected = rulesSelected.includes(opt.id) || (currentConfig.key === "PET_POLICY" && petPolicy === opt.id);
                  const Icon = opt.icon;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        if (currentConfig.key === "PET_POLICY") {
                          setCustomValue("petPolicy", opt.id);
                        }
                        if (currentConfig.key === "VISITOR_POLICY") {
                          setCustomValue("visitorPolicy", opt.id);
                        }
                        toggleMulti("rules", opt.id);
                        if (onClearValidationError) onClearValidationError();
                      }}
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
              </div>

              {showValidationError && !hasCurrentSubStepSelections && (
                <p className="text-xs font-bold text-red-900 dark:text-red-200 bg-red-100 dark:bg-red-950/90 p-3 rounded-xl border border-red-300 dark:border-red-800 flex items-center gap-2 shadow-sm">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span>Please select a preference above before clicking Continue.</span>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      )}
    </motion.div>
  );
}

