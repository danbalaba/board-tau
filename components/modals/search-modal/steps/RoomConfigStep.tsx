import React, { useEffect, useState, useMemo } from "react";
import Heading from "@/components/common/Heading";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { 
  User, 
  Users, 
  Bed, 
  Building, 
  Check, 
  Plus, 
  Minus, 
  Sparkles, 
  RotateCcw,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { FieldErrors, FieldValues, UseFormRegister, UseFormWatch } from "react-hook-form";
import axios from "axios";
import { getDynamicIcon } from "@/lib/iconResolver";

interface RoomConfigStepProps {
  propertyTypeSelected: string[];
  roomTypeSelected: string[];
  bedType: string;
  setCustomValue: (id: string, value: any) => void;
  toggleMulti: (id: "roomType", value: string) => void;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  watch: UseFormWatch<FieldValues>;
  onUpdateKerbySpeech?: (speech: string) => void;
  subStep: number;
  setSubStep: (sub: number | ((prev: number) => number)) => void;
  showValidationError?: boolean;
  onClearValidationError?: () => void;
  onHasNoRoomTypesChange?: (hasNoRooms: boolean) => void;
  onIsBranchBChange?: (isBranchB: boolean) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

const globalRoomTypesCache: Record<string, any[]> = {};

export default function RoomConfigStep({
  propertyTypeSelected,
  roomTypeSelected,
  bedType,
  setCustomValue,
  watch,
  onUpdateKerbySpeech,
  subStep,
  setSubStep,
  showValidationError = false,
  onClearValidationError,
  onHasNoRoomTypesChange,
  onIsBranchBChange,
  onLoadingChange,
}: RoomConfigStepProps) {
  const selectedPropType = propertyTypeSelected[0] || "Boarding House";

  const [dbRoomTypes, setDbRoomTypes] = useState<any[]>(() => {
    return globalRoomTypesCache[selectedPropType] || [];
  });
  const [isFetchingDbRoomTypes, setIsFetchingDbRoomTypes] = useState<boolean>(() => {
    return !globalRoomTypesCache[selectedPropType];
  });

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isFetchingDbRoomTypes);
    }
  }, [isFetchingDbRoomTypes, onLoadingChange]);

  useEffect(() => {
    let isMounted = true;

    async function fetchRoomTypes() {
      try {
        if (!globalRoomTypesCache[selectedPropType]) {
          setIsFetchingDbRoomTypes(true);
        }
        const res = await axios.get(`/api/room-types?propertyType=${encodeURIComponent(selectedPropType)}&t=${Date.now()}`);
        if (isMounted) {
          const rawData = res.data;
          const list = Array.isArray(rawData)
            ? rawData
            : Array.isArray(rawData?.data)
            ? rawData.data
            : [];
          globalRoomTypesCache[selectedPropType] = list;
          setDbRoomTypes(list);
          const isZero = list.length === 0;
          if (onHasNoRoomTypesChange) onHasNoRoomTypesChange(isZero);
        }
      } catch (err) {
        if (isMounted) {
          setDbRoomTypes([]);
          if (onHasNoRoomTypesChange) onHasNoRoomTypesChange(true);
        }
      } finally {
        if (isMounted) setIsFetchingDbRoomTypes(false);
      }
    }

    fetchRoomTypes();

    return () => {
      isMounted = false;
    };
  }, [selectedPropType, onHasNoRoomTypesChange, onClearValidationError]);

  const currentRoomType = roomTypeSelected[0] || "";
  const capacityVal = Number(watch("capacity")) || 1;
  const slotsVal = Number(watch("availableSlots")) || 1;

  const selectedRoomTypeObj = useMemo(() => {
    return dbRoomTypes.find((rt) => rt.name === currentRoomType);
  }, [dbRoomTypes, currentRoomType]);

  // 100% Dynamic Branch B (Flat-Rate Unit) Detection:
  // Reads isFlatRate directly from database RoomTypeDefinition records!
  const isBranchB = useMemo(() => {
    if (selectedRoomTypeObj && typeof selectedRoomTypeObj.isFlatRate === "boolean") {
      return selectedRoomTypeObj.isFlatRate;
    }
    if (dbRoomTypes.length > 0) {
      const flatRateCount = dbRoomTypes.filter((rt) => rt.isFlatRate).length;
      if (flatRateCount > 0) {
        return true;
      }
    }
    if (currentRoomType === "Solo Room") return true;
    if (currentRoomType === "Bedspace") return false;
    const lowerProp = selectedPropType.toLowerCase();
    return (
      lowerProp.includes("apartment") ||
      lowerProp.includes("transient") ||
      lowerProp.includes("hostel") ||
      lowerProp.includes("whole house") ||
      lowerProp.includes("unit")
    );
  }, [selectedRoomTypeObj, dbRoomTypes, currentRoomType, selectedPropType]);

  // Maximum realistic occupants for unit pricing
  const maxUnitOccupants = useMemo(() => {
    if (selectedRoomTypeObj?.capacity && Number(selectedRoomTypeObj.capacity) > 0) {
      return Math.max(Number(selectedRoomTypeObj.capacity), 10);
    }
    return 10;
  }, [selectedRoomTypeObj]);

  // Sync isBranchB to parent modal
  useEffect(() => {
    if (onIsBranchBChange) {
      onIsBranchBChange(isBranchB);
    }
  }, [isBranchB, onIsBranchBChange]);

  // Clamp capacity if it exceeds maxUnitOccupants for Branch B units
  useEffect(() => {
    if (isBranchB && capacityVal > maxUnitOccupants) {
      setCustomValue("capacity", maxUnitOccupants);
    }
  }, [isBranchB, capacityVal, maxUnitOccupants, setCustomValue]);

  const [movingWithFriends, setMovingWithFriends] = useState<string>(watch("movingWithFriends") || "");

  // 100% Dynamic Auto-reset of stale room types when switching property types
  useEffect(() => {
    if (!currentRoomType || dbRoomTypes.length === 0) return;
    const isValidForCurrentProp = dbRoomTypes.some((rt) => rt.name === currentRoomType);
    if (!isValidForCurrentProp) {
      setCustomValue("roomType", []);
      setSubStep(0);
    }
  }, [selectedPropType, dbRoomTypes, currentRoomType, setCustomValue, setSubStep]);

  // Sync Kerby Speech dynamically per sub-step
  useEffect(() => {
    if (!onUpdateKerbySpeech) return;

    if (isBranchB) {
      if (subStep === 0) {
        onUpdateKerbySpeech(`Which unit layout do you prefer for your ${selectedPropType}?`);
      } else {
        onUpdateKerbySpeech(`How many total occupants or guests will be staying in your ${currentRoomType || selectedPropType}?`);
      }
    } else {
      if (subStep === 0) {
        onUpdateKerbySpeech(`Do you want a private Solo Room or budget Bedspace for your ${selectedPropType}?`);
      } else if (subStep === 1) {
        onUpdateKerbySpeech(`Are you moving into your bedspace alone, or moving in together with your friends/classmates?`);
      } else {
        if (currentRoomType === "Solo Room") {
          onUpdateKerbySpeech(`What bed setup do you prefer for your private Solo Room?`);
        } else if (movingWithFriends === "yes") {
          onUpdateKerbySpeech(`What bed setup do you and your friends prefer in your Bedspace room?`);
        } else {
          onUpdateKerbySpeech(`What bed setup do you prefer for your Bedspace slot?`);
        }
      }
    }
  }, [subStep, currentRoomType, movingWithFriends, selectedPropType, isBranchB, onUpdateKerbySpeech]);

  // Handle Room Type Selection (Sub-step 0)
  const handleRoomTypeSelect = (type: string) => {
    setCustomValue("roomType", [type]);
    const targetObj = dbRoomTypes.find((rt) => rt.name === type);
    const isFlat = targetObj ? targetObj.isFlatRate : (isBranchB || type === "Solo Room");

    if (isFlat) {
      setCustomValue("availableSlots", 1);
      setCustomValue("capacity", 1);
      setMovingWithFriends("");
      if (bedType === "BUNK") setCustomValue("bedType", "");
    } else {
      if (capacityVal < 2) setCustomValue("capacity", 2);
    }
    if (onClearValidationError) onClearValidationError();
  };

  const handleFriendsAnswer = (ans: string) => {
    setMovingWithFriends(ans);
    setCustomValue("movingWithFriends", ans);
    if (onClearValidationError) onClearValidationError();
    if (ans === "no") {
      setCustomValue("availableSlots", 1);
      if (capacityVal < 2) setCustomValue("capacity", 2);
    } else {
      const newSlots = Math.max(2, slotsVal);
      setCustomValue("availableSlots", newSlots);
      if (capacityVal < newSlots) {
        setCustomValue("capacity", newSlots);
      }
    }
  };

  // Dynamic Branch B unit layout fallbacks
  const getBranchBUnitOptions = () => {
    return [
      { name: `${selectedPropType} Unit`, desc: `Standard ${selectedPropType} layout` },
      { name: `Whole ${selectedPropType}`, desc: `Entire ${selectedPropType} property for your group` },
    ];
  };

  const hasRoomSelection =
    subStep === 0
      ? Boolean(currentRoomType)
      : subStep === 1
      ? (isBranchB ? capacityVal > 1 : Boolean(movingWithFriends))
      : Boolean(bedType) || slotsVal > 2 || capacityVal > 2;

  const handleClearRoomConfig = () => {
    if (subStep === 0) {
      setCustomValue("roomType", []);
      setCustomValue("bedType", "");
      setCustomValue("movingWithFriends", "");
      setMovingWithFriends("");
    } else if (subStep === 1) {
      if (isBranchB) {
        setCustomValue("capacity", 1);
      } else {
        setCustomValue("movingWithFriends", "");
        setMovingWithFriends("");
      }
    } else if (subStep === 2) {
      setCustomValue("bedType", "");
      setCustomValue("availableSlots", 2);
      setCustomValue("capacity", 2);
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-5"
    >
      <Heading
        title={isBranchB ? `${selectedPropType} Unit Layout` : "Room & Bed Setup"}
        subtitle={
          isBranchB 
            ? `Customize your ${selectedPropType} layout and guest capacity.`
            : `Choose between a private Solo Room or budget Bedspace for your ${selectedPropType}.`
        }
        helpText="Follow the guided options below to set your exact layout and bed preferences."
        rightAction={
          hasRoomSelection ? (
            <button
              type="button"
              onClick={handleClearRoomConfig}
              className="text-xs font-extrabold text-slate-500 hover:text-[#2f7d6d] dark:text-slate-400 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-all px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-[#2f7d6d]/10 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
            >
              <RotateCcw size={12} strokeWidth={2.5} />
              <span>Clear Selection</span>
            </button>
          ) : null
        }
      />

      {/* FULL-WIDTH SUB-STEP STEPPER BREADCRUMB INDICATOR */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
        <button
          type="button"
          ref={subStep === 0 ? activeTabRef : null}
          onClick={() => setSubStep(0)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            subStep === 0 
              ? "bg-[#2f7d6d] text-white shadow-sm" 
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          {isBranchB ? "1. Unit Layout" : "1. Room Type"}
        </button>
        <span className="text-slate-300 dark:text-slate-700 shrink-0">›</span>

        <button
          type="button"
          ref={subStep === 1 ? activeTabRef : null}
          disabled={!currentRoomType}
          onClick={() => currentRoomType && setSubStep(1)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            subStep === 1 
              ? "bg-[#2f7d6d] text-white shadow-sm cursor-pointer" 
              : !currentRoomType
              ? "bg-slate-100 dark:bg-slate-800/40 text-slate-300 dark:text-slate-700 cursor-not-allowed"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          }`}
        >
          {isBranchB ? "2. Occupants" : "2. Group Setup"}
        </button>

        {!isBranchB && (
          <>
            <span className="text-slate-300 dark:text-slate-700 shrink-0">›</span>
            <button
              type="button"
              ref={subStep === 2 ? activeTabRef : null}
              disabled={!currentRoomType || (!isBranchB && movingWithFriends === "")}
              onClick={() => setSubStep(2)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                subStep === 2 
                  ? "bg-[#2f7d6d] text-white shadow-sm cursor-pointer" 
                  : !currentRoomType || (!isBranchB && movingWithFriends === "")
                  ? "bg-slate-100 dark:bg-slate-800/40 text-slate-300 dark:text-slate-700 cursor-not-allowed"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              }`}
            >
              3. Bed Preference
            </button>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* SUB-STEP 0: ROOM CONCEPT / UNIT LAYOUT */}
        {subStep === 0 && (
          <motion.div
            key="substep-0"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="flex flex-col gap-4"
          >
            <div className={`p-4 rounded-2xl border transition-all flex flex-col gap-4 ${
              showValidationError && !currentRoomType
                ? "border-red-400 dark:border-red-600 bg-red-50/70 dark:bg-red-950/40"
                : "border-transparent"
            }`}>
              {showValidationError && !currentRoomType && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <Sparkles size={16} />
                    <span>{isBranchB ? "Unit Layout Selection" : "Room Concept Selection"}</span>
                  </span>
                  <span className="text-[11px] font-black text-white bg-red-600 dark:bg-red-700 px-2.5 py-0.5 rounded-lg border border-red-500 shrink-0 shadow-sm">
                    Selection Required
                  </span>
                </div>
              )}

              {/* Clean Inline Grid Skeleton Loader */}
              {isFetchingDbRoomTypes ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-200/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between h-28 animate-pulse">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-slate-200/70 dark:bg-slate-800/70 shrink-0" />
                        <div className="w-4 h-4 rounded-full bg-slate-200/70 dark:bg-slate-800/70 shrink-0" />
                      </div>
                      <div className="space-y-2 mt-3">
                        <div className="h-4 bg-slate-200/70 dark:bg-slate-800/70 rounded w-28" />
                        <div className="h-3 bg-slate-200/70 dark:bg-slate-800/70 rounded w-44" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : dbRoomTypes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dbRoomTypes.map((rt) => {
                    const isSelected = currentRoomType === rt.name;
                    const Icon = getDynamicIcon(rt.icon, Building);

                    return (
                      <div
                        key={rt.id || rt.name}
                        onClick={() => handleRoomTypeSelect(rt.name)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? "border-[#2f7d6d] bg-[#2f7d6d]/10 dark:border-emerald-400 shadow-md ring-2 ring-[#2f7d6d]/20"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className={`p-2.5 rounded-xl ${isSelected ? "bg-[#2f7d6d] text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                            <Icon size={20} />
                          </div>
                          {isSelected && <Check size={14} className="text-[#2f7d6d] dark:text-emerald-400" strokeWidth={3} />}
                        </div>
                        <div className="mt-3">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{rt.name}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">
                            {rt.description || (rt.isFlatRate ? "Flat-rate unit accommodation" : "Per-head bedspace accommodation")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-slate-800 dark:text-slate-200 flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-500 text-white shrink-0 shadow-sm mt-0.5">
                    <AlertCircle size={24} />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <span>No Room Types Configured</span>
                      <span className="text-[10px] font-black text-amber-800 dark:text-amber-200 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40 uppercase tracking-wider">
                        Unavailable
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      There are currently no room types or unit layouts configured in the database for <strong>{selectedPropType}</strong>. You cannot proceed to the next step with this selection.
                    </p>
                    <div className="pt-2">
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Lightbulb size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>Tip: Click <strong>Back</strong> below to choose a different Property Type (e.g. Boarding House, Apartment, or Dormitory).</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {showValidationError && !currentRoomType && dbRoomTypes.length > 0 && (
                <p className="text-xs font-bold text-red-900 dark:text-red-200 bg-red-100 dark:bg-red-950/90 p-3 rounded-xl border border-red-300 dark:border-red-800 flex items-center gap-2 shadow-sm">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span>Please select a {isBranchB ? "unit layout" : "room concept"} option above before clicking Continue.</span>
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* SUB-STEP 1: MOVING IN TOGETHER QUESTION (BEDSPACE) OR OCCUPANTS (BRANCH B) */}
        {subStep === 1 && (
          <motion.div
            key="substep-1"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="flex flex-col gap-5"
          >
            {!isBranchB ? (
              <div className={`p-5 rounded-2xl border transition-all flex flex-col gap-4 ${
                showValidationError && !movingWithFriends
                  ? "border-red-400 dark:border-red-600 bg-red-50/70 dark:bg-red-950/40"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60"
              }`}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 font-bold text-xs ${
                    showValidationError && !movingWithFriends
                      ? "text-red-600 dark:text-red-400"
                      : "text-[#2f7d6d] dark:text-emerald-400"
                  }`}>
                    <Sparkles size={16} />
                    <span>Moving-In Preferences</span>
                  </div>
                  {showValidationError && !movingWithFriends && (
                    <span className="text-[11px] font-black text-white bg-red-600 dark:bg-red-700 px-2.5 py-0.5 rounded-lg border border-red-500 shrink-0 shadow-sm">
                      Selection Required
                    </span>
                  )}
                </div>

                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                  Are you moving into your bedspace alone, or moving in together with your friends/classmates?
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div
                    onClick={() => handleFriendsAnswer("yes")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3.5 ${
                      movingWithFriends === "yes"
                        ? "border-[#2f7d6d] bg-[#2f7d6d]/15 text-[#2f7d6d] dark:text-emerald-400 font-extrabold shadow-sm ring-2 ring-[#2f7d6d]/20"
                        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-[#2f7d6d] text-white">
                      <Users size={18} />
                    </div>
                    <span className="text-xs font-bold">Yes, moving in with friends!</span>
                  </div>

                  <div
                    onClick={() => handleFriendsAnswer("no")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3.5 ${
                      movingWithFriends === "no"
                        ? "border-[#2f7d6d] bg-[#2f7d6d]/15 text-[#2f7d6d] dark:text-emerald-400 font-extrabold shadow-sm ring-2 ring-[#2f7d6d]/20"
                        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <User size={18} />
                    </div>
                    <span className="text-xs font-bold">No, just myself (solo bedspace)</span>
                  </div>
                </div>

                {showValidationError && !movingWithFriends && (
                  <p className="text-xs font-bold text-red-900 dark:text-red-200 bg-red-100 dark:bg-red-950/90 p-3 rounded-xl border border-red-300 dark:border-red-800 flex items-center gap-2 shadow-sm">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>Please select an option above before clicking Continue.</span>
                  </p>
                )}
              </div>
            ) : (
              /* BRANCH B OCCUPANTS COUNTER */
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Total Occupants / Guest Capacity</span>
                    <span className="text-[10px] bg-[#2f7d6d]/15 text-[#2f7d6d] dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-[#2f7d6d]/30">
                      Max {maxUnitOccupants} Pax
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    How many total guests will stay in your {currentRoomType || selectedPropType}?
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                  <button
                    type="button"
                    disabled={capacityVal <= 1}
                    onClick={() => setCustomValue("capacity", Math.max(1, capacityVal - 1))}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center font-extrabold text-sm text-slate-900 dark:text-white">
                    {capacityVal} Pax
                  </span>
                  <button
                    type="button"
                    disabled={capacityVal >= maxUnitOccupants}
                    onClick={() => setCustomValue("capacity", Math.min(maxUnitOccupants, capacityVal + 1))}
                    className="p-2 rounded-lg bg-[#2f7d6d] text-white hover:bg-[#256659] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* SUB-STEP 2: BED SETUP & COUNTERS (BRANCH A ONLY) */}
        {!isBranchB && subStep === 2 && (
          <motion.div
            key="substep-2"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-5">
              {/* 1. Bed Setup Preference Cards */}
              <div className={`p-5 rounded-2xl border transition-all flex flex-col gap-4 ${
                showValidationError && !bedType
                  ? "border-red-400 dark:border-red-600 bg-red-50/70 dark:bg-red-950/40"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60"
              }`}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 font-bold text-xs ${
                    showValidationError && !bedType
                      ? "text-red-600 dark:text-red-400"
                      : "text-[#2f7d6d] dark:text-emerald-400"
                  }`}>
                    <Sparkles size={16} />
                    <span className="uppercase tracking-wider">Bed Setup Preference</span>
                    {bedType === "BUNK" && (
                      <span className="text-[10px] text-[#2f7d6d] dark:text-emerald-400 font-extrabold normal-case bg-[#2f7d6d]/10 px-2 py-0.5 rounded-md border border-[#2f7d6d]/20 ml-2">
                        1 Bunk Frame = 2 Bed Slots
                      </span>
                    )}
                  </div>
                  {showValidationError && !bedType && (
                    <span className="text-[11px] font-black text-white bg-red-600 dark:bg-red-700 px-2.5 py-0.5 rounded-lg border border-red-500 shrink-0 shadow-sm">
                      Selection Required
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(() => {
                    const matchedRt = dbRoomTypes.find((r) => r.name === currentRoomType);
                    let bedOptions = matchedRt?.bedSetups && matchedRt.bedSetups.length > 0
                      ? matchedRt.bedSetups.map((b: any) => ({
                          value: b.code,
                          name: b.name,
                          desc: b.description || `Allowable ${b.name} setup`,
                        }))
                      : currentRoomType === "Solo Room"
                      ? [
                          { value: "SINGLE", name: "Single Bed Frame", desc: "Private 1-pax single mattress frame" },
                          { value: "DOUBLE", name: "Double Bed Frame", desc: "Spacious double mattress frame" },
                          { value: "QUEEN", name: "Queen Size Bed Frame", desc: "Deluxe queen size mattress frame" },
                          { value: "ANY", name: "Any Bed Setup", desc: "Open to any solo room bed configuration" },
                        ]
                      : [
                          { value: "BUNK", name: "Bunk Bed (Double Deck)", desc: "Double deck bunk bed slots (2 pax/frame)" },
                          { value: "SINGLE", name: "Single Bed Frame", desc: "Floor-level single bed frame (1 pax/frame)" },
                          { value: "ANY", name: "Any Bed Setup", desc: "Open to bunk or single deck beds" },
                        ];

                    // Separate specific bed options and force "ANY" to ALWAYS be strictly the LAST card
                    const specificOptions = bedOptions.filter((b: any) => b.value !== "ANY");
                    const anyOption = bedOptions.find((b: any) => b.value === "ANY") || {
                      value: "ANY",
                      name: "Any Bed Setup",
                      desc: "Open to any bed arrangement in this room type",
                    };
                    bedOptions = [...specificOptions, anyOption];

                    return bedOptions.map((b: any) => {
                      const isSelected = bedType === b.value;
                      return (
                        <div
                          key={b.value}
                          onClick={() => {
                            onClearValidationError?.();
                            setCustomValue("bedType", b.value);
                          }}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? "border-[#2f7d6d] bg-[#2f7d6d]/10 dark:border-emerald-400 shadow-md ring-2 ring-[#2f7d6d]/20"
                              : showValidationError && !bedType
                              ? "border-red-300 dark:border-red-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-red-400"
                              : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className={`p-2 rounded-lg ${isSelected ? "bg-[#2f7d6d] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                              <Bed size={18} />
                            </div>
                            {isSelected && <Check size={14} className="text-[#2f7d6d] dark:text-emerald-400" strokeWidth={3} />}
                          </div>
                          <div className="mt-3">
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{b.name}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug">{b.desc}</p>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {showValidationError && !bedType && (
                  <p className="text-xs font-bold text-red-900 dark:text-red-200 bg-red-100 dark:bg-red-950/90 p-3 rounded-xl border border-red-300 dark:border-red-800 flex items-center gap-2 shadow-sm">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>Please select a bed setup preference above (or select &apos;Any Bed Setup&apos; if undecided) before clicking Continue.</span>
                  </p>
                )}
              </div>

              {/* 2. Bed Slots Needed (If Friends) */}
              {movingWithFriends === "yes" && (
                <div className="p-4 sm:p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#2f7d6d] dark:text-emerald-400 shrink-0">
                      <Users size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                        <span>Bed Slots Needed Together</span>
                        {bedType === "BUNK" && (
                          <span className="text-[10px] bg-[#2f7d6d]/15 text-[#2f7d6d] dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-[#2f7d6d]/30 hidden sm:inline-block">
                            {Math.ceil(slotsVal / 2)} Bunk Frame{Math.ceil(slotsVal / 2) > 1 ? "s" : ""}
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-snug">
                        {bedType === "BUNK"
                          ? `${slotsVal} bed slots (${Math.ceil(slotsVal / 2)} bunk frames)`
                          : `Empty bed slots needed together`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 bg-slate-100/80 dark:bg-slate-800 p-1 sm:p-1.5 px-2.5 sm:px-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                    <button
                      type="button"
                      disabled={slotsVal <= 2}
                      onClick={() => setCustomValue("availableSlots", Math.max(2, slotsVal - 1))}
                      className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <Minus size={14} strokeWidth={2.5} />
                    </button>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white px-1 sm:px-2 whitespace-nowrap">
                      {slotsVal} Slots
                    </span>
                    <button
                      type="button"
                      disabled={slotsVal >= 8}
                      onClick={() => {
                        const nextSlots = Math.min(8, slotsVal + 1);
                        setCustomValue("availableSlots", nextSlots);
                        if (capacityVal < nextSlots) {
                          setCustomValue("capacity", nextSlots);
                        }
                      }}
                      className="p-1.5 sm:p-2 rounded-xl bg-[#2f7d6d] text-white hover:bg-[#256659] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors cursor-pointer"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Capacity Limit Counter (Bedspace & Per-Head Rooms) */}
              {!isBranchB && (
                <div className="p-4 sm:p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#2f7d6d] dark:text-emerald-400 shrink-0">
                      <User size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                        Maximum Room Capacity Limit
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-snug">
                        {movingWithFriends === "yes"
                          ? "Max room capacity limit preferred"
                          : "Max room crowd size limit preferred"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 bg-slate-100/80 dark:bg-slate-800 p-1 sm:p-1.5 px-2.5 sm:px-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                    <button
                      type="button"
                      disabled={capacityVal <= Math.max(2, slotsVal)}
                      onClick={() => setCustomValue("capacity", Math.max(2, slotsVal, capacityVal - 1))}
                      className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <Minus size={14} strokeWidth={2.5} />
                    </button>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white px-1 sm:px-2 whitespace-nowrap">
                      Max {Math.max(capacityVal, slotsVal, 2)} Pax
                    </span>
                    <button
                      type="button"
                      disabled={capacityVal >= 8}
                      onClick={() => setCustomValue("capacity", Math.min(8, Math.max(capacityVal, slotsVal) + 1))}
                      className="p-1.5 sm:p-2 rounded-xl bg-[#2f7d6d] text-white hover:bg-[#256659] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors cursor-pointer"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
