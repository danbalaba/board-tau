"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Heading from "@/components/common/Heading";
import { useColleges } from "@/hooks/useColleges";
import {
  MapPin,
  Banknote,
  BedDouble,
  Building,
  ShieldCheck,
  Pencil,
  Sparkles,
  Home,
  Check,
  Shield,
  Maximize2,
  X,
  Utensils,
  Shirt,
  Droplets,
  Wifi,
  Zap,
  ShoppingBag,
  Car,
  Bike,
  BookOpen,
  Sofa,
  UserCheck,
  Tv,
  Fan,
  ShowerHead,
  Refrigerator,
  Lock,
  Clock,
  VolumeX,
  PawPrint,
  Ban,
  Wine,
  UserX,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { STEPS } from "../useSearchLogic";

interface SummaryStepProps {
  college?: string;
  propertyTypeSelected?: string[];
  roomTypeSelected?: string[];
  roomType?: string;
  isUnlimitedDistance?: boolean;
  distance?: number;
  minPrice?: string | number;
  maxPrice?: string | number;
  bedType?: string;
  capacity?: string | number;
  availableSlots?: string | number;
  occupants?: string | number;
  movingWithFriends?: string;
  roomAmenitiesSelected?: string[];
  amenitiesSelected?: string[];
  rulesSelected?: string[];
  advancedSelected?: string[];
  isBranchB?: boolean;
  onStepClick?: (stepId: number) => void;
}

// Master display name mapping dictionary for clean human-readable titles
const DISPLAY_NAME_MAP: Record<string, string> = {
  "male-only": "Male-Only Property",
  "female-only": "Female-Only Property",
  "coed": "Male & Female Allowed (Mixed)",
  "students": "Students Only",
  "faculty": "Faculty / Staff Preferred",
  "all": "Open to All Tenants",
  "Curtains": "Curtains & Window Blinds",
  "Utensils & Dishware": "Complete Utensils & Dishware Provided",
  "Smart TV": "Smart TV / Cable TV",
  "Furnished Living Room": "Furnished Living Room & Sofa Set",
  "Water Drum Tabo": "Water Storage Drum & Tabo",
  "Shower Heater": "Hot & Cold Shower Heater",
  "Toilet Flush": "Flush Toilet Bowl",
  "Bidet": "Toilet Bidet",
  "Exhaust Fan": "Bathroom Exhaust Fan",
  "Laundry Drying Area": "Laundry Drying Area (Sampayan)",
};

const formatDisplayName = (id: string): string => {
  if (DISPLAY_NAME_MAP[id]) return DISPLAY_NAME_MAP[id];
  return id;
};

const formatBedType = (bed?: string): string => {
  if (!bed) return "";
  switch (bed) {
    case "BUNK": return "Bunk Bed (Double Deck)";
    case "SINGLE": return "Single Bed Frame";
    case "DOUBLE": return "Double Bed Frame";
    case "QUEEN": return "Queen Size Bed Frame";
    case "ANY": return "Any Bed Setup / No Preference";
    default: return bed;
  }
};

const getItemIcon = (name: string) => {
  const n = name.toLowerCase();

  // Rules & Policies Specific Icon Mapping
  if (n.includes("curfew") || n.includes("gate lock") || n.includes("8:00 pm") || n.includes("9:00 pm") || n.includes("10:00 pm")) return Lock;
  if (n.includes("24/7 open gate") || n.includes("no curfew")) return Clock;
  if (n.includes("quiet hours") || n.includes("noise")) return VolumeX;
  if (n.includes("pet")) return PawPrint;
  if (n.includes("smoke") || n.includes("smoking")) return Ban;
  if (n.includes("drink") || n.includes("alcohol")) return Wine;
  if (n.includes("female-only") || n.includes("male-only") || n.includes("no visitors")) return UserX;
  if (n.includes("visitors") || n.includes("guests") || n.includes("mixed") || n.includes("coed")) return Users;

  // Amenities & Features Icon Mapping
  if (n.includes("eatery") || n.includes("carinderia") || n.includes("dining") || n.includes("utensils")) return Utensils;
  if (n.includes("laundry") || n.includes("washing") || n.includes("sampayan")) return Shirt;
  if (n.includes("water") || n.includes("poso") || n.includes("drum") || n.includes("tank")) return Droplets;
  if (n.includes("wifi") || n.includes("internet")) return Wifi;
  if (n.includes("generator") || n.includes("electric") || n.includes("pump")) return Zap;
  if (n.includes("sari-sari") || n.includes("store") || n.includes("convenience") || n.includes("shop")) return ShoppingBag;
  if (n.includes("parking") || n.includes("garage") || n.includes("car") || n.includes("motorcycle")) return Car;
  if (n.includes("bike") || n.includes("bicycle")) return Bike;
  if (n.includes("study") || n.includes("book")) return BookOpen;
  if (n.includes("lounge") || n.includes("sofa") || n.includes("living")) return Sofa;
  if (n.includes("caretaker") || n.includes("maintenance") || n.includes("repairs") || n.includes("housekeeping")) return UserCheck;
  if (n.includes("tv") || n.includes("smart tv")) return Tv;
  if (n.includes("aircon") || n.includes("fan") || n.includes("exhaust")) return Fan;
  if (n.includes("shower") || n.includes("bidet") || n.includes("toilet") || n.includes("bath")) return ShowerHead;
  if (n.includes("kitchen") || n.includes("cook") || n.includes("stove") || n.includes("fridge") || n.includes("refrigerator")) return Refrigerator;
  if (n.includes("cctv") || n.includes("camera") || n.includes("security") || n.includes("guard") || n.includes("gate")) return ShieldCheck;
  if (n.includes("flood") || n.includes("fire") || n.includes("emergency") || n.includes("first aid")) return ShieldCheck;
  
  return Shield;
};

export default function SummaryStep({
  college,
  propertyTypeSelected = [],
  roomTypeSelected = [],
  roomType,
  isUnlimitedDistance,
  distance = 5,
  minPrice,
  maxPrice,
  bedType,
  capacity,
  availableSlots,
  occupants,
  movingWithFriends,
  roomAmenitiesSelected = [],
  amenitiesSelected = [],
  rulesSelected = [],
  advancedSelected = [],
  isBranchB: isBranchBProp = false,
  onStepClick,
}: SummaryStepProps) {
  const { data: colleges } = useColleges();
  const [collegeName, setCollegeName] = useState<string>("TAU Campus");
  const [activeModalCategory, setActiveModalCategory] = useState<{
    title: string;
    icon: any;
    items: string[];
    iconColorClass: string;
    itemType: "check" | "shieldCheck" | "shield";
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (college && college !== "any" && colleges) {
      const found = colleges.find((c: any) => c.code === college);
      setCollegeName(found ? found.name : "TAU Campus");
    } else {
      setCollegeName("Any / Not Sure");
    }
  }, [college, colleges]);

  const selectedPropType = propertyTypeSelected[0] || "Boarding House";
  const selectedRoomType = roomTypeSelected[0] || roomType || "";

  const selectedPropLower = selectedPropType.toLowerCase();
  const isBranchB = 
    Boolean(isBranchBProp) ||
    selectedPropLower.includes("apartment") ||
    selectedPropLower.includes("transient") ||
    selectedPropLower.includes("hostel") ||
    selectedPropLower.includes("house") ||
    selectedPropLower.includes("unit");

  // Helper for budget range formatting
  const budgetDisplay =
    minPrice || maxPrice
      ? `${minPrice ? `₱${Number(minPrice).toLocaleString()}` : "₱0"} – ${
          maxPrice ? `₱${Number(maxPrice).toLocaleString()}` : "Any"
        } / month`
      : "Any Monthly Rate";

  // Helper for distance formatting
  const distanceDisplay = isUnlimitedDistance
    ? "All Locations in Camiling & Tarlac (Unlimited Radius)"
    : `Within ${distance} km of ${collegeName}`;

  // Count total active criteria
  const totalCriteria =
    (college && college !== "any" ? 1 : 0) +
    (selectedPropType ? 1 : 0) +
    (selectedRoomType ? 1 : 0) +
    (bedType ? 1 : 0) +
    (capacity ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (!isUnlimitedDistance ? 1 : 0) +
    amenitiesSelected.length +
    roomAmenitiesSelected.length +
    rulesSelected.length +
    advancedSelected.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6 pb-4"
    >
      {/* Header with Active Filters Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Heading
          title="Match Review & Summary"
          subtitle={`Here is a summary of your ideal ${selectedPropType} preferences near TAU.`}
          helpText="Review all your selected filters before searching available listings."
        />

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 px-3.5 py-1.5 rounded-full bg-[#2f7d6d]/15 text-[#2f7d6d] dark:text-emerald-400 border border-[#2f7d6d]/30 text-xs font-black">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{totalCriteria} Filters Applied</span>
        </div>
      </div>

      {/* DASHBOARD GRID OF SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD 1: COLLEGE & LOCATION */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-xs">
              <div className="p-1.5 rounded-lg bg-[#2f7d6d]/15 text-[#2f7d6d] dark:text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
              <span>1. College & Location Radius</span>
            </div>
            {onStepClick && (
              <button
                type="button"
                onClick={() => onStepClick(STEPS.COLLEGE)}
                className="text-[11px] font-bold text-slate-500 hover:text-[#2f7d6d] dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">College Landmark:</span>
              <span className="font-bold text-slate-900 dark:text-white">{collegeName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Distance Radius:</span>
              <span className="font-bold text-[#2f7d6d] dark:text-emerald-400 text-right">{distanceDisplay}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: PROPERTY & ROOM CONFIG */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-xs">
              <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <Home className="w-4 h-4" />
              </div>
              <span>2. Property Style & Layout</span>
            </div>
            {onStepClick && (
              <button
                type="button"
                onClick={() => onStepClick(STEPS.PROPERTY_TYPE)}
                className="text-[11px] font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Property Style:</span>
              <span className="px-2 py-0.5 rounded-md bg-[#2f7d6d] text-white font-bold text-[11px]">
                {selectedPropType}
              </span>
            </div>

            {selectedRoomType && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {isBranchB ? "Unit Layout:" : "Room Concept:"}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedRoomType}</span>
              </div>
            )}

            {isBranchB ? (
              occupants && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Target Occupants:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{occupants} Pax</span>
                </div>
              )
            ) : (
              movingWithFriends && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Group Setup:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {movingWithFriends === "yes"
                      ? `Moving with friends (${availableSlots || 1} bed slots)`
                      : "Solo (Just myself)"}
                  </span>
                </div>
              )
            )}

            {bedType && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Bed Setup:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {formatBedType(bedType)}
                </span>
              </div>
            )}

            {capacity && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Max Room Capacity:</span>
                <span className="font-extrabold text-[#2f7d6d] dark:text-emerald-400">Max {capacity} Pax</span>
              </div>
            )}
          </div>
        </div>

        {/* CARD 3: BUDGET RANGE */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-xs">
              <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Banknote className="w-4 h-4" />
              </div>
              <span>3. Monthly Budget Range</span>
            </div>
            {onStepClick && (
              <button
                type="button"
                onClick={() => onStepClick(STEPS.BUDGET)}
                className="text-[11px] font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-sm font-extrabold text-slate-900 dark:text-white">
            <span>Monthly Rate:</span>
            <span className="text-[#2f7d6d] dark:text-emerald-400 font-mono text-base">{budgetDisplay}</span>
          </div>
        </div>

        {/* CARD 4: PROPERTY FACILITIES (STEP 6) */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-xs">
              <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400">
                <Building className="w-4 h-4" />
              </div>
              <span>4. Property Facilities ({amenitiesSelected.length})</span>
            </div>
            <div className="flex items-center gap-2">
              {amenitiesSelected.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveModalCategory({
                      title: "Property Facilities",
                      icon: Building,
                      items: amenitiesSelected,
                      iconColorClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
                      itemType: "check",
                    })
                  }
                  className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#2f7d6d] dark:hover:text-emerald-400 flex items-center gap-1.5 transition-all px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm shrink-0"
                  title="View all in full modal"
                >
                  <Maximize2 className="w-3 h-3 text-[#2f7d6d] dark:text-emerald-400" />
                  <span>View All</span>
                </button>
              )}
              {onStepClick && (
                <button
                  type="button"
                  onClick={() => onStepClick(STEPS.AMENITIES)}
                  className="text-[11px] font-bold text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {amenitiesSelected.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
              {amenitiesSelected.map((item) => {
                const ItemIcon = getItemIcon(item);
                return (
                  <span
                    key={item}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                  >
                    <ItemIcon className="w-3.5 h-3.5 text-[#2f7d6d] dark:text-emerald-400 shrink-0" />
                    <span>{formatDisplayName(item)}</span>
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No specific property facilities filtered</span>
          )}
        </div>

        {/* CARD 5: ROOM AMENITIES (STEP 7) */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-xs">
              <div className="p-1.5 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400">
                <BedDouble className="w-4 h-4" />
              </div>
              <span>5. Room Amenities ({roomAmenitiesSelected.length})</span>
            </div>
            <div className="flex items-center gap-2">
              {roomAmenitiesSelected.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveModalCategory({
                      title: "Room Amenities",
                      icon: BedDouble,
                      items: roomAmenitiesSelected,
                      iconColorClass: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
                      itemType: "check",
                    })
                  }
                  className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#2f7d6d] dark:hover:text-emerald-400 flex items-center gap-1.5 transition-all px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm shrink-0"
                  title="View all in full modal"
                >
                  <Maximize2 className="w-3 h-3 text-[#2f7d6d] dark:text-emerald-400" />
                  <span>View All</span>
                </button>
              )}
              {onStepClick && (
                <button
                  type="button"
                  onClick={() => onStepClick(STEPS.ROOM_AMENITIES)}
                  className="text-[11px] font-bold text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {roomAmenitiesSelected.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
              {roomAmenitiesSelected.map((item) => {
                const ItemIcon = getItemIcon(item);
                return (
                  <span
                    key={item}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                  >
                    <ItemIcon className="w-3.5 h-3.5 text-[#2f7d6d] dark:text-emerald-400 shrink-0" />
                    <span>{formatDisplayName(item)}</span>
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No specific room amenities filtered</span>
          )}
        </div>

        {/* CARD 6: HOUSE RULES & POLICIES (STEP 8) - DEDICATED SEPARATE CARD */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-xs">
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>6. House Rules ({rulesSelected.length})</span>
            </div>
            <div className="flex items-center gap-2">
              {rulesSelected.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveModalCategory({
                      title: "House Rules & Tenant Policies",
                      icon: ShieldCheck,
                      items: rulesSelected,
                      iconColorClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                      itemType: "shieldCheck",
                    })
                  }
                  className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#2f7d6d] dark:hover:text-emerald-400 flex items-center gap-1.5 transition-all px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm shrink-0"
                  title="View all in full modal"
                >
                  <Maximize2 className="w-3 h-3 text-[#2f7d6d] dark:text-emerald-400" />
                  <span>View All</span>
                </button>
              )}
              {onStepClick && (
                <button
                  type="button"
                  onClick={() => onStepClick(STEPS.RULES)}
                  className="text-[11px] font-bold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {rulesSelected.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
              {rulesSelected.map((item) => {
                const ItemIcon = getItemIcon(item);
                return (
                  <span
                    key={item}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-900/50 flex items-center gap-1.5"
                  >
                    <ItemIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{formatDisplayName(item)}</span>
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">Open to all house rules</span>
          )}
        </div>

        {/* CARD 7: SAFETY & SECURITY FEATURES (STEP 9) - DEDICATED SEPARATE CARD */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-col justify-between gap-3 col-span-1 md:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-xs">
              <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
                <Shield className="w-4 h-4" />
              </div>
              <span>7. Safety & Security Features ({advancedSelected.length})</span>
            </div>
            <div className="flex items-center gap-2">
              {advancedSelected.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveModalCategory({
                      title: "Safety & Security Features",
                      icon: Shield,
                      items: advancedSelected,
                      iconColorClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                      itemType: "shield",
                    })
                  }
                  className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#2f7d6d] dark:hover:text-emerald-400 flex items-center gap-1.5 transition-all px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm shrink-0"
                  title="View all in full modal"
                >
                  <Maximize2 className="w-3 h-3 text-[#2f7d6d] dark:text-emerald-400" />
                  <span>View All</span>
                </button>
              )}
              {onStepClick && (
                <button
                  type="button"
                  onClick={() => onStepClick(STEPS.ADVANCED_FEATURES)}
                  className="text-[11px] font-bold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {advancedSelected.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
              {advancedSelected.map((item) => {
                const ItemIcon = getItemIcon(item);
                return (
                  <span
                    key={item}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-[11px] font-bold border border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5"
                  >
                    <ItemIcon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{formatDisplayName(item)}</span>
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">Standard security & safety level</span>
          )}
        </div>
      </div>

      {/* FULL VIEW DETAILS MODAL POPUP (RENDERED VIA PORTAL DIRECTLY ON DOCUMENT.BODY ON TOP OF SEARCHMODAL) */}
      {mounted && typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {activeModalCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-5 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[85vh] overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 ${activeModalCategory.iconColorClass}`}>
                      <activeModalCategory.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-tight truncate">
                        {activeModalCategory.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {activeModalCategory.items.length} selected preference{activeModalCategory.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveModalCategory(null)}
                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Ultra-Wide 4-Column Grid of Feature Cards with Dynamic Icons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 overflow-y-auto custom-scrollbar max-h-[60vh] pr-1.5 py-1">
                  {activeModalCategory.items.map((item) => {
                    const ItemIcon = getItemIcon(item);
                    const displayName = formatDisplayName(item);

                    return (
                      <div
                        key={item}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-sm hover:border-[#2f7d6d]/40 dark:hover:border-emerald-500/40 transition-all"
                      >
                        <div className="p-2.5 rounded-xl bg-[#2f7d6d]/15 text-[#2f7d6d] dark:text-emerald-400 border border-[#2f7d6d]/20 shrink-0">
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {displayName}
                          </h4>
                          <span className="text-[10px] font-extrabold text-[#2f7d6d] dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                            <Check className="w-3 h-3" />
                            <span>Selected Preference</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Modal Footer */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveModalCategory(null)}
                    className="px-5 py-2.5 rounded-xl bg-[#2f7d6d] hover:bg-[#256659] text-white font-extrabold text-xs shadow-md transition-all"
                  >
                    Close Preview
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}
