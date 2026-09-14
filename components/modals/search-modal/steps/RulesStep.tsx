"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { fetchTaxonomyData, getTaxonomyDataSync } from "@/lib/taxonomyCache";
import Heading from "@/components/common/Heading";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import {
  GraduationCap,
  Briefcase,
  Users,
  UserX,
  Clock,
  Lock,
  VolumeX,
  AlertTriangle,
  PawPrint,
  Ban,
  Wine,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
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

const STATIC_CURFEW_OPTIONS = [
  { id: "24/7 Open Gate Access (No Curfew)", name: "24/7 Open Gate Access (No Curfew)", desc: "Entry permitted at any time via key/RFID.", icon: Clock },
  { id: "Night Curfew Enforced (10:00 PM)", name: "Night Curfew Enforced (10:00 PM)", desc: "Main gate locked at 10:00 PM.", icon: Lock },
  { id: "Early Night Curfew Enforced (9:00 PM)", name: "Early Night Curfew Enforced (9:00 PM)", desc: "Main gate locked at 9:00 PM.", icon: Lock },
  { id: "Strict Curfew with Gate Lock (8:00 PM)", name: "Strict Curfew with Gate Lock (8:00 PM)", desc: "Main gate locked early at 8:00 PM for maximum security.", icon: Lock },
  { id: "Quiet Hours Enforced (10:00 PM - 6:00 AM)", name: "Quiet Hours Enforced (10:00 PM - 6:00 AM)", desc: "Quiet study environment strictly enforced late night.", icon: VolumeX },
];

const STATIC_SMOKE_OPTIONS = [
  { id: "No Smoking Inside Property", name: "No Smoking Inside Property", desc: "Strict non-smoking policy inside rooms and indoor areas.", icon: Ban },
  { id: "No Drinking / Alcohol Allowed", name: "No Drinking / Alcohol Allowed", desc: "Alcoholic beverages prohibited on property grounds.", icon: Wine },
];

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

  // Merge dynamic attributes with static options for Curfew & Smoke/Alcohol to ensure rich fallback
  const curfewItems = useMemo(() => {
    const dbCurfews = dynamicAttributes
      .filter((attr) => attr.isActive && attr.subGroupKey === "CURFEW")
      .map((attr) => ({
        id: attr.name,
        name: attr.name,
        desc: attr.description || `Custom ${attr.name} rule.`,
        icon: (attr.icon && (LucideIcons as any)[attr.icon]) ? (LucideIcons as any)[attr.icon] : Clock,
      }));

    if (dbCurfews.length === 0) return STATIC_CURFEW_OPTIONS;

    // Merge static options that aren't in DB yet
    const existingNames = new Set(dbCurfews.map((i) => i.name));
    const extraStatics = STATIC_CURFEW_OPTIONS.filter((s) => !existingNames.has(s.name));
    return [...dbCurfews, ...extraStatics];
  }, [dynamicAttributes]);

  const smokeItems = useMemo(() => {
    const dbSmokes = dynamicAttributes
      .filter((attr) => attr.isActive && (attr.subGroupKey === "SMOKE_ALCOHOL" || attr.subGroupKey === "SMOKING_POLICY" || attr.subGroupKey === "ALCOHOL_POLICY"))
      .map((attr) => ({
        id: attr.name,
        name: attr.name,
        desc: attr.description || `Custom ${attr.name} rule.`,
        icon: (attr.icon && (LucideIcons as any)[attr.icon]) ? (LucideIcons as any)[attr.icon] : Ban,
      }));

    if (dbSmokes.length === 0) return STATIC_SMOKE_OPTIONS;

    const existingNames = new Set(dbSmokes.map((i) => i.name));
    const extraStatics = STATIC_SMOKE_OPTIONS.filter((s) => !existingNames.has(s.name));
    return [...dbSmokes, ...extraStatics];
  }, [dynamicAttributes]);

  const totalSubSteps = 6;

  useEffect(() => {
    if (onTotalSubStepsChange) {
      onTotalSubStepsChange(totalSubSteps);
    }
  }, [totalSubSteps, onTotalSubStepsChange]);

  const getSubStepConfig = (index: number) => {
    if (index === 0) {
      return {
        title: "Step 8-1: Tenant Type Preference",
        subtitle: `Who should the ${propName} be tailored for?`,
        speech: `Who should your ${propName} be tailored for?`,
        pose: "thinking" as KerbyPose,
        type: "tenant_type",
        items: [],
      };
    }

    if (index === 1) {
      return {
        title: "Step 8-2: Property Gender Policy",
        subtitle: `What gender occupancy rule do you prefer for your ${propName}?`,
        speech: `What gender occupancy rule do you prefer for your ${propName}?`,
        pose: "pointing" as KerbyPose,
        type: "gender_policy",
        items: [],
      };
    }

    if (index === 2) {
      return {
        title: "Step 8-3: Gate & Curfew Rules",
        subtitle: `What curfew requirements fit your preferences for your ${propName}?`,
        speech: `What curfew requirements fit your preferences for your ${propName}?`,
        pose: "sleeping" as KerbyPose,
        type: "curfew",
        items: curfewItems,
      };
    }

    if (index === 3) {
      return {
        title: "Step 8-4: Visitor & Guest Policy",
        subtitle: `What visitor rules fit your preferences for your ${propName}?`,
        speech: `What visitor rules fit your preferences for your ${propName}?`,
        pose: "pointing" as KerbyPose,
        type: "visitor_policy",
        items: [],
      };
    }

    if (index === 4) {
      return {
        title: "Step 8-5: Pet Policy",
        subtitle: `Are pets allowed at your ${propName}?`,
        speech: `Are pets allowed at your ${propName}?`,
        pose: "thinking" as KerbyPose,
        type: "pet_policy",
        items: [],
      };
    }

    return {
      title: "Step 8-6: Smoke & Alcohol Restrictions",
      subtitle: `What smoking and alcohol restrictions fit your preferences for your ${propName}?`,
      speech: `What smoking and alcohol restrictions fit your preferences for your ${propName}?`,
      pose: "studying" as KerbyPose,
      type: "smoke_alcohol",
      items: smokeItems,
    };
  };

  const currentConfig = getSubStepConfig(subStep);

  useEffect(() => {
    if (onUpdateKerbySpeech) {
      onUpdateKerbySpeech(currentConfig.speech, currentConfig.pose);
    }
  }, [subStep, currentConfig.speech, currentConfig.pose, onUpdateKerbySpeech]);

  const SUB_STEP_TABS = [
    { label: "Tenant Type", index: 0 },
    { label: "Gender Policy", index: 1 },
    { label: "Curfew", index: 2 },
    { label: "Visitor Policy", index: 3 },
    { label: "Pet Policy", index: 4 },
    { label: "Smoke & Alcohol", index: 5 },
  ];

  const hasCurrentSubStepSelections =
    subStep === 0
      ? Boolean(tenantType)
      : subStep === 1
      ? Boolean(genderPolicy)
      : subStep === 3
      ? Boolean(visitorPolicy)
      : subStep === 4
      ? Boolean(petPolicy)
      : currentConfig.items
      ? currentConfig.items.some((item: any) => rulesSelected.includes(item.id))
      : false;

  const handleClearSubStep = () => {
    if (subStep === 0) setCustomValue("tenantType", "");
    else if (subStep === 1) {
      setCustomValue("genderPolicy", "");
      if (rulesSelected.includes("female-only")) toggleMulti("rules", "female-only");
      if (rulesSelected.includes("male-only")) toggleMulti("rules", "male-only");
    } else if (subStep === 3) {
      setCustomValue("visitorPolicy", "");
      ["Visitors Allowed", "Male Guests Restricted from Female Rooms", "Strictly No Outside Visitors"].forEach((v: string) => {
        if (rulesSelected.includes(v)) toggleMulti("rules", v);
      });
    } else if (subStep === 4) {
      setCustomValue("petPolicy", "");
      if (rulesSelected.includes("Pets Allowed")) toggleMulti("rules", "Pets Allowed");
    } else if (currentConfig.items) {
      currentConfig.items.forEach((item: any) => {
        if (rulesSelected.includes(item.id)) toggleMulti("rules", item.id);
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

  const handleTenantTypeChoice = (choice: string) => {
    setCustomValue("tenantType", choice);
    if (onClearValidationError) onClearValidationError();
  };

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
          {[1, 2, 3, 4, 5].map((i) => (
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
        {/* SUB-STEP 8-1: TENANT TYPE */}
        {subStep === 0 && (
          <motion.div
            key="tenant_type"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            <div className={`p-4 rounded-2xl border transition-all flex flex-col gap-4 ${
              showValidationError && !tenantType
                ? "border-red-400 dark:border-red-600 bg-red-50/70 dark:bg-red-950/40"
                : "border-transparent"
            }`}>
              {showValidationError && !tenantType && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <Sparkles size={16} />
                    <span>Tenant Type Preference</span>
                  </span>
                  <span className="text-[11px] font-black text-white bg-red-600 dark:bg-red-700 px-2.5 py-0.5 rounded-lg border border-red-500 shrink-0 shadow-sm">
                    Selection Required
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "Students Only", title: "Students Only", desc: "Strictly enrolled college students for a quiet study environment", icon: GraduationCap },
                  { id: "Faculty / Staff Preferred", title: "Faculty & Staff", desc: "Tailored for teachers and TAU university employees", icon: Briefcase },
                  { id: "Open to Everyone", title: "Open to Everyone", desc: "Open to students, faculty, and general boarders", icon: Users },
                ].map((c) => {
                  const isSelected = tenantType === c.id;
                  const Icon = c.icon;

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleTenantTypeChoice(c.id)}
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

              {showValidationError && !tenantType && (
                <p className="text-xs font-bold text-red-900 dark:text-red-200 bg-red-100 dark:bg-red-950/90 p-3 rounded-xl border border-red-300 dark:border-red-800 flex items-center gap-2 shadow-sm">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span>Please select a tenant type preference above before clicking Continue.</span>
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* SUB-STEP 8-2: GENDER POLICY */}
        {subStep === 1 && (
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
                {[
                  { id: "Female-Only Property", title: "Female-Only Property", desc: "Entire building is 100% female boarders only", icon: UserX },
                  { id: "Male-Only Property", title: "Male-Only Property", desc: "Entire building is 100% male boarders only", icon: UserX },
                  { id: "Male & Female Allowed (Mixed)", title: "Mixed (Male & Female)", desc: "Mixed male & female boarders in separate rooms/floors", icon: Users },
                ].map((c) => {
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
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{c.title}</h4>
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

        {/* SUB-STEP 8-3: CURFEW & GATE ACCESS */}
        {subStep === 2 && (
          <motion.div
            key="curfew_rules"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
          >
            {currentConfig.items?.map((opt: any) => {
              const isSelected = rulesSelected.includes(opt.id);
              const Icon = opt.icon;

              return (
                <div
                  key={opt.id}
                  onClick={() => toggleMulti("rules", opt.id)}
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

        {/* SUB-STEP 8-4: VISITOR & GUEST POLICY (DYNAMIC BRANCHING) */}
        {subStep === 3 && (
          <motion.div
            key="visitor_policy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {(genderPolicy === "Male & Female Allowed (Mixed)"
              ? [
                  { id: "Visitors Allowed", title: "Visitors Allowed", desc: "Outside guests permitted on property", icon: Users },
                  { id: "Male Guests Restricted from Female Rooms", title: "Restricted Guest Boundaries", desc: "Male guests restricted from female bedrooms", icon: AlertTriangle },
                  { id: "Strictly No Outside Visitors", title: "No Outside Visitors", desc: "Outside guests prohibited past main gate", icon: UserX },
                ]
              : [
                  { id: "Visitors Allowed", title: "Visitors Allowed", desc: "Outside guests permitted on property", icon: Users },
                  { id: "Strictly No Outside Visitors", title: "No Outside Visitors", desc: "Outside guests prohibited past main gate", icon: UserX },
                ]
            ).map((c) => {
              const isSelected = visitorPolicy === c.id;
              const Icon = c.icon;

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setCustomValue("visitorPolicy", c.id);
                    toggleMulti("rules", c.id);
                  }}
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
          </motion.div>
        )}

        {/* SUB-STEP 8-5: PET POLICY */}
        {subStep === 4 && (
          <motion.div
            key="pet_policy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {[
              { id: "Yes, bringing a pet!", title: "Yes, bringing a pet!", desc: "Filters listings that explicitly allow pets on property", icon: PawPrint, value: "Pets Allowed" },
              { id: "No pet", title: "No pet", desc: "Show all available listings regardless of pet rules", icon: Users, value: "" },
            ].map((c) => {
              const isSelected = petPolicy === c.id;
              const Icon = c.icon;

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setCustomValue("petPolicy", c.id);
                    if (c.value) toggleMulti("rules", c.value);
                  }}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-[#2f7d6d] bg-[#2f7d6d]/10 dark:border-emerald-400 shadow-md ring-2 ring-[#2f7d6d]/20"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-3.5 rounded-xl ${isSelected ? "bg-[#2f7d6d] text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700"}`}>
                      <Icon size={24} />
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-[#2f7d6d] bg-[#2f7d6d] text-white" : "border-slate-300 dark:border-slate-600"}`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">{c.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">{c.desc}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* SUB-STEP 8-6: SMOKE & ALCOHOL RESTRICTIONS */}
        {subStep === 5 && (
          <motion.div
            key="smoke_alcohol"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
          >
            {currentConfig.items?.map((opt: any) => {
              const isSelected = rulesSelected.includes(opt.id);
              const Icon = opt.icon;

              return (
                <div
                  key={opt.id}
                  onClick={() => toggleMulti("rules", opt.id)}
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
