import Heading from "@/components/common/Heading";
import Slider from "@/components/inputs/Slider";
import Checkbox from "@/components/inputs/Checkbox";
import { UseFormRegister, UseFormWatch } from "react-hook-form";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Car, Footprints, Navigation, MapPin, RotateCcw, AlertCircle, Sparkles } from "lucide-react";
import { useColleges } from "@/hooks/useColleges";
import MapLoadingState from "@/components/common/MapLoadingState";
import { isStepCached, markStepCached } from "@/lib/searchStepCache";

const Map = dynamic(() => import("@/components/common/Map"), {
  ssr: false,
  loading: () => <MapLoadingState label="TAU Campus Location Map" height="h-full min-h-[220px]" />
});

interface LocationStepProps {
  distance: number | string;
  college: string;
  setCustomValue: (id: string, value: any) => void;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  mapCenter?: number[];
  isUnlimitedDistance?: boolean;
  propertyTypeSelected?: string[];
  showValidationError?: boolean;
  onClearValidationError?: () => void;
}

export default function LocationStep({
  distance,
  college,
  setCustomValue,
  register,
  watch,
  mapCenter,
  propertyTypeSelected = [],
  showValidationError = false,
  onClearValidationError,
}: LocationStepProps) {
  const [collegeName, setCollegeName] = useState<string>("TAU Main Campus");
  const [mapLandmarks, setMapLandmarks] = useState<any[]>([]);
  const [isShimmering, setIsShimmering] = useState(() => !isStepCached("LOCATION"));
  const isUnlimited = watch("isUnlimitedDistance");

  const { data: collegesData, isLoading: isFetchingColleges } = useColleges();

  useEffect(() => {
    if (isStepCached("LOCATION")) {
      setIsShimmering(false);
      return;
    }

    const timer = setTimeout(() => {
      markStepCached("LOCATION");
      setIsShimmering(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const isLoading = isFetchingColleges || isShimmering;

  const propName = propertyTypeSelected[0] || "Boarding House";

  useEffect(() => {
    if (collegesData) {
      const formatted = collegesData.map((c: any) => ({
        id: c.code,
        name: c.name,
        coords: [c.latitude, c.longitude],
        logo: c.logoUrl
      }));
      setMapLandmarks(formatted);
      
      if (college && college !== "any") {
        const found = collegesData.find((c: any) => c.code === college);
        if (found) setCollegeName(found.name);
      }
    }
  }, [college, collegesData]);

  const handleSliderChange = (v: number) => {
    setCustomValue("distance", v);
    if (isUnlimited) {
      setCustomValue("isUnlimitedDistance", false);
    }
    if (onClearValidationError) onClearValidationError();
  };

  const setQuickFilter = (km: number) => {
    setCustomValue("distance", km);
    setCustomValue("isUnlimitedDistance", false);
    if (onClearValidationError) onClearValidationError();
  };

  const handleClearLocation = () => {
    setCustomValue("distance", "");
    setCustomValue("isUnlimitedDistance", true);
    setCustomValue("transportProximity", []);
    if (onClearValidationError) onClearValidationError();
  };

  const hasLocationFilter = !isUnlimited || (distance !== "" && distance !== undefined);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-5"
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="space-y-2 py-1">
            <div className="h-7 w-72 rounded-xl bg-slate-200/70 dark:bg-slate-800/70" />
            <div className="h-4 w-96 max-w-full rounded-lg bg-slate-200/50 dark:bg-slate-800/50" />
          </div>
          <div className="h-44 w-full rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
          <div className="h-[220px] rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center p-4">
            <MapLoadingState label="TAU Campus Location Map" />
          </div>
        </div>
      ) : (
        <>
          <Heading
            title={`Campus Proximity & Commute Radius for ${propName}`}
            subtitle={`Set how close to ${collegeName} your ${propName} should be.`}
            helpText="Use the slider or quick presets below to adjust your preferred commute distance radius."
            rightAction={
              hasLocationFilter ? (
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="text-xs font-extrabold text-slate-500 hover:text-[#2f7d6d] dark:text-slate-400 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-all px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-[#2f7d6d]/10 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700 shrink-0"
                >
                  <RotateCcw size={12} strokeWidth={2.5} />
                  <span>Clear Selection</span>
                </button>
              ) : null
            }
          />

          {/* RADIUS SLIDER, QUICK CHIPS & MAP CONTAINER */}
          <div className={`p-5 sm:p-6 rounded-2xl border-2 transition-all flex flex-col gap-5 ${
            showValidationError && !isUnlimited && (!distance || Number(distance) === 0)
              ? "border-red-400 dark:border-red-600 bg-red-50/70 dark:bg-red-950/40"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm"
          }`}>
            {showValidationError && !isUnlimited && (!distance || Number(distance) === 0) && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <Sparkles size={16} />
                  <span>Distance Radius Selection</span>
                </span>
                <span className="text-[11px] font-black text-white bg-red-600 dark:bg-red-700 px-2.5 py-0.5 rounded-lg border border-red-500 shrink-0 shadow-sm">
                  Selection Required
                </span>
              </div>
            )}

            {/* Checkbox Header */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
              <Checkbox
                id="isUnlimitedDistance"
                label="Show all properties regardless of distance from campus"
                register={register}
                watch={watch}
              />
            </div>

            <div className={isUnlimited ? "opacity-40 pointer-events-none transition-opacity" : "transition-opacity flex flex-col gap-5"}>
              {/* SELECTED CAMPUS LANDMARK CARD */}
              {(() => {
                const activeLandmarkObj = mapLandmarks.find((l) => l.id === college);

                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#2f7d6d]/10 via-[#2f7d6d]/5 to-transparent border-2 border-[#2f7d6d]/30 dark:border-emerald-500/30 flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white dark:bg-slate-800 p-1.5 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
                        {activeLandmarkObj?.logo ? (
                          <Image
                            src={activeLandmarkObj.logo}
                            alt={collegeName}
                            width={40}
                            height={40}
                            className="object-contain w-full h-full rounded-lg"
                          />
                        ) : (
                          <MapPin className="w-6 h-6 text-[#2f7d6d] dark:text-emerald-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#2f7d6d] dark:text-emerald-400 bg-[#2f7d6d]/15 px-2 py-0.5 rounded-md border border-[#2f7d6d]/30">
                            Selected Landmark ({college !== "any" && college ? college : "TAU"})
                          </span>
                        </div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate mt-0.5">
                          {collegeName}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                          {distance ? `Proximity radius set to ${distance} km from campus center.` : "Select your preferred commute distance radius below."}
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-[#2f7d6d] text-[#ffffff] font-extrabold text-xs shrink-0 shadow-sm flex items-center gap-1.5">
                      <MapPin size={12} />
                      <span>{distance ? `${distance} km` : "Select Radius"}</span>
                    </div>
                  </div>
                );
              })()}

              <Slider
                id="distance"
                label="Commute Distance Radius"
                subtitle="Maximum distance in km from campus"
                min={0.5}
                max={20}
                step={0.5}
                value={Number(distance)}
                onChange={handleSliderChange}
                unit="km"
              />
              
              {/* Quick Proximity Chips */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setQuickFilter(1)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                    Number(distance) === 1 && !isUnlimited
                      ? "border-[#2f7d6d] bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-emerald-400 font-extrabold shadow-sm"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                  }`}
                >
                  <Footprints size={18} className="mb-1" />
                  <span className="font-extrabold text-xs">1 km</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Walking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuickFilter(3)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                    Number(distance) === 3 && !isUnlimited
                      ? "border-[#2f7d6d] bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-emerald-400 font-extrabold shadow-sm"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                  }`}
                >
                  <Navigation size={18} className="mb-1" />
                  <span className="font-extrabold text-xs">3 km</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Trike Commute</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuickFilter(5)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                    Number(distance) === 5 && !isUnlimited
                      ? "border-[#2f7d6d] bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-emerald-400 font-extrabold shadow-sm"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                  }`}
                >
                  <Car size={18} className="mb-1" />
                  <span className="font-extrabold text-xs">5 km</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Town Drive</span>
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div className="h-[220px] rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
              {(() => {
                const activeLandmarkObj = mapLandmarks.find((l) => l.id === college);
                const effectiveCenter = activeLandmarkObj ? activeLandmarkObj.coords : mapCenter;

                return (
                  <Map 
                    center={effectiveCenter} 
                    allowPinDrop={false}
                    scrollWheelZoom={true}
                    landmarks={mapLandmarks}
                    activeLandmarkId={college !== "any" ? college : undefined}
                    radiusKm={isUnlimited ? undefined : Number(distance)}
                  />
                );
              })()}
            </div>
            {showValidationError && !isUnlimited && (!distance || Number(distance) === 0) && (
              <p className="text-xs font-bold text-red-900 dark:text-red-200 bg-red-100 dark:bg-red-950/90 p-3 rounded-xl border border-red-300 dark:border-red-800 flex items-center gap-2 shadow-sm">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>Please select a commute distance radius option or quick filter below before clicking Continue.</span>
              </p>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
