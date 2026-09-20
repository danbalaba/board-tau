import React, { useEffect, useState } from "react";
import Heading from "@/components/common/Heading";
import { motion } from "framer-motion";
import { Building, Home, RotateCcw, Sparkles, AlertCircle } from "lucide-react";
import { getDynamicIcon } from "@/lib/iconResolver";
import HelpTooltip from "@/components/common/HelpTooltip";
import axios from "axios";

const getSafeLucideIcon = (iconName: string) => {
  return getDynamicIcon(iconName, Building);
};

interface PropertyTypeStepProps {
  propertyTypeSelected: string[];
  setCustomValue: (id: string, value: unknown) => void;
  showValidationError?: boolean;
  onClearValidationError?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function PropertyTypeStep({
  propertyTypeSelected,
  setCustomValue,
  showValidationError = false,
  onClearValidationError,
  onLoadingChange,
}: PropertyTypeStepProps) {
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  }, [isLoading, onLoadingChange]);

  useEffect(() => {
    let isMounted = true;
    async function loadPropertyTypes() {
      try {
        setIsLoading(true);
        const res = await axios.get(`/api/property-types?t=${Date.now()}`);
        if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
          setPropertyTypes(res.data);
        } else if (isMounted) {
          setPropertyTypes([
            { id: "1", name: "Boarding House", icon: "Home", description: "Per-head sharing bedspace & solo rooms" },
            { id: "2", name: "Apartment", icon: "Building", description: "Whole unit flat rate, studio & multi-bedroom" },
            { id: "3", name: "Dormitory", icon: "Building2", description: "Student-focused communal accommodation" },
            { id: "4", name: "Transient House", icon: "Tent", description: "Short-term daily/weekly stays" },
            { id: "5", name: "Agri-Hostel", icon: "Trees", description: "Eco-friendly agricultural campus hostel" },
          ]);
        }
      } catch (err) {
        if (isMounted) {
          setPropertyTypes([
            { id: "1", name: "Boarding House", icon: "Home", description: "Per-head sharing bedspace & solo rooms" },
            { id: "2", name: "Apartment", icon: "Building", description: "Whole unit flat rate, studio & multi-bedroom" },
            { id: "3", name: "Dormitory", icon: "Building2", description: "Student-focused communal accommodation" },
            { id: "4", name: "Transient House", icon: "Tent", description: "Short-term daily/weekly stays" },
            { id: "5", name: "Agri-Hostel", icon: "Trees", description: "Eco-friendly agricultural campus hostel" },
          ]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPropertyTypes();
    return () => {
      isMounted = false;
    };
  }, []);

  const isNoneSelected = propertyTypeSelected.length === 0;

  const resetDependentFields = (newPropType?: string) => {
    setCustomValue("roomType", []);
    setCustomValue("bedType", "");
    setCustomValue("movingWithFriends", "");
    setCustomValue("availableSlots", 1);
    setCustomValue("occupants", 1);
    setCustomValue("capacity", newPropType === "Boarding House" ? 2 : 1);
    setCustomValue("kitchenChoice", "");
    setCustomValue("bathroomChoice", "");
    setCustomValue("kitchenSetup", "");
    setCustomValue("crSetup", "");
    setCustomValue("amenities", []);
    setCustomValue("roomAmenities", []);
    setCustomValue("rules", []);
    setCustomValue("genderPolicy", "");
    setCustomValue("petPolicy", "");
    setCustomValue("visitorPolicy", "");
    setCustomValue("advanced", []);
  };

  const handleSelect = (typeName: string) => {
    if (!propertyTypeSelected.includes(typeName)) {
      setCustomValue("propertyType", [typeName]);
      resetDependentFields(typeName);
    }
    if (onClearValidationError) onClearValidationError();
  };

  const handleClear = () => {
    setCustomValue("propertyType", []);
    resetDependentFields();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-4"
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="space-y-2 py-1">
            <div className="h-7 w-72 rounded-xl bg-slate-200/70 dark:bg-slate-800/70" />
            <div className="h-4 w-96 max-w-full rounded-lg bg-slate-200/50 dark:bg-slate-800/50" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-200/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between h-20">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-200/70 dark:bg-slate-800/70 shrink-0" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200/70 dark:bg-slate-800/70 rounded w-32" />
                    <div className="h-3 bg-slate-200/70 dark:bg-slate-800/70 rounded w-44" />
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-slate-200/70 dark:bg-slate-800/70 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <Heading 
            title="Property Type" 
            subtitle="What kind of place are you looking for?" 
            helpText="Select the general type of accommodation you want to stay in (e.g., Boarding House, Apartment)."
            rightAction={
              !isNoneSelected ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs font-extrabold text-slate-500 hover:text-[#2f7d6d] dark:text-slate-400 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-all px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-[#2f7d6d]/10 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700 shrink-0"
                >
                  <RotateCcw size={12} strokeWidth={2.5} />
                  <span>Clear Selection</span>
                </button>
              ) : null
            }
          />

          <div className={`p-4 rounded-2xl border transition-all flex flex-col gap-4 ${
            showValidationError && isNoneSelected
              ? "border-red-400 dark:border-red-600 bg-red-50/70 dark:bg-red-950/40"
              : "border-transparent"
          }`}>
            {showValidationError && isNoneSelected && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <Sparkles size={16} />
                  <span>Property Type Selection</span>
                </span>
                <span className="text-[11px] font-black text-white bg-red-600 dark:bg-red-700 px-2.5 py-0.5 rounded-lg border border-red-500 shrink-0 shadow-sm">
                  Selection Required
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
              {propertyTypes.map((pt) => {
                const isSelected = propertyTypeSelected.includes(pt.name);
                const Icon = getSafeLucideIcon(pt.icon);

                return (
                  <div
                    key={pt.name}
                    onClick={() => handleSelect(pt.name)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-[#2f7d6d] bg-[#2f7d6d]/10 dark:border-emerald-400 shadow-md"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        isSelected 
                          ? "bg-[#2f7d6d] text-white shadow-sm" 
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        <Icon size={22} />
                      </div>
                      <div className="flex flex-col justify-center h-full">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold text-sm ${
                            isSelected ? "text-[#2f7d6d] dark:text-emerald-400 font-extrabold" : "text-slate-900 dark:text-white"
                          }`}>
                            {pt.name}
                          </span>
                          {pt.description && <HelpTooltip text={pt.description} />}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                          {pt.description}
                        </span>
                      </div>
                    </div>
                    
                    {/* Radio Indicator */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      isSelected ? 'border-[#2f7d6d] bg-[#2f7d6d] text-white' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {showValidationError && isNoneSelected && (
              <p className="text-xs font-bold text-red-900 dark:text-red-200 bg-red-100 dark:bg-red-950/90 p-3 rounded-xl border border-red-300 dark:border-red-800 flex items-center gap-2 shadow-sm">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>Please select a property type option above before clicking Continue.</span>
              </p>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
