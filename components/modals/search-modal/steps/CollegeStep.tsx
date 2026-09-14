import Heading from "@/components/common/Heading";
import ModernSelect from "@/components/common/ModernSelect";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import SearchLandmarkCard from "../components/SearchLandmarkCard";
import { useColleges } from "@/hooks/useColleges";
import { RotateCcw } from "lucide-react";
import MapLoadingState from "@/components/common/MapLoadingState";
import { isStepCached, markStepCached } from "@/lib/searchStepCache";

const Map = dynamic(() => import("@/components/common/Map"), {
  ssr: false,
  loading: () => <MapLoadingState label="TAU Campus Map" height="h-full min-h-[260px]" />
});

interface CollegeStepProps {
  college: string;
  setCustomValue: (id: string, value: any) => void;
  mapCenter?: number[];
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function CollegeStep({ college, setCustomValue, mapCenter, onLoadingChange }: CollegeStepProps) {
  const [activeLandmark, setActiveLandmark] = useState<any>(null);
  const [colleges, setColleges] = useState<any[]>([{ value: "any", label: "Any / Not Sure" }]);
  const [mapLandmarks, setMapLandmarks] = useState<any[]>([]);
  const [isShimmering, setIsShimmering] = useState(() => !isStepCached("COLLEGE"));

  const { data: fetchedColleges, isLoading: isFetchingColleges } = useColleges();

  useEffect(() => {
    if (isStepCached("COLLEGE")) {
      setIsShimmering(false);
      return;
    }

    const timer = setTimeout(() => {
      markStepCached("COLLEGE");
      setIsShimmering(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const isLoading = isFetchingColleges || isShimmering;

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  }, [isLoading, onLoadingChange]);

  const formattedColleges = useMemo(() => {
    if (!fetchedColleges) return [];
    return fetchedColleges.map((c: any) => ({
      value: c.code,
      label: c.name,
      latlng: [c.latitude, c.longitude],
      logo: c.logoUrl
    }));
  }, [fetchedColleges]);

  useEffect(() => {
    if (formattedColleges.length > 0) {
      setColleges([{ value: "any", label: "Any / Not Sure" }, ...formattedColleges]);
      setMapLandmarks(formattedColleges.map((c: any) => ({
        id: c.value,
        name: c.label,
        coords: c.latlng as [number, number],
        logo: c.logo,
      })));
    }
  }, [formattedColleges]);

  // Sync dropdown with active landmark
  useEffect(() => {
    if (college && college !== "any") {
      const found = mapLandmarks.find(l => l.id === college);
      if (found) setActiveLandmark(found);
    } else {
      setActiveLandmark(null);
    }
  }, [college, mapLandmarks]);

  const handleLandmarkClick = (landmark: any) => {
    setActiveLandmark(landmark);
    setCustomValue("college", landmark.id);
    setCustomValue("originLat", landmark.coords[0]);
    setCustomValue("originLng", landmark.coords[1]);
  };

  const handleClearCollege = () => {
    setCustomValue("college", "any");
    setCustomValue("originLat", undefined);
    setCustomValue("originLng", undefined);
    setActiveLandmark(null);
  };

  const hasCollegeSelection = college && college !== "any";

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
          <div className="h-12 w-full rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
          <div className="h-[220px] sm:h-[260px] md:h-[380px] rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center p-4">
            <MapLoadingState label="TAU Campus Map" />
          </div>
        </div>
      ) : (
        <>
          <Heading
            title="Which college are you affiliated with?"
            subtitle="We'll use this to show distance from campus."
            helpText="Select your college to automatically center the map on your campus and measure distances accurately."
            rightAction={
              hasCollegeSelection ? (
                <button
                  type="button"
                  onClick={handleClearCollege}
                  className="text-xs font-extrabold text-[#2f7d6d] hover:text-[#256659] dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1.5 transition-all px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                >
                  <RotateCcw size={12} strokeWidth={2.5} />
                  <span>Clear Selection</span>
                </button>
              ) : null
            }
          />
          <div className="w-full">
            <ModernSelect
              options={colleges.map((c) => ({ value: c.value, label: c.label }))}
              value={college || "any"}
              onChange={(v) => {
                setCustomValue("college", v);
                const found = mapLandmarks.find(l => l.id === v);
                if (found) {
                  setCustomValue("originLat", found.coords[0]);
                  setCustomValue("originLng", found.coords[1]);
                } else {
                  setCustomValue("originLat", undefined);
                  setCustomValue("originLng", undefined);
                }
              }}
              label="College Landmark"
              placeholder="Select College"
              className="w-full"
            />
          </div>
          <div 
            className="h-[220px] sm:h-[260px] md:h-[380px] rounded-2xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 relative mt-1 transition-all duration-300"
          >
            <Map 
              center={activeLandmark ? activeLandmark.coords : mapCenter} 
              allowPinDrop={false}
              scrollWheelZoom={true}
              landmarks={mapLandmarks}
              activeLandmarkId={activeLandmark?.id}
              onLandmarkClick={handleLandmarkClick}
            />
            
            {/* Floating Landmark Card Overlay */}
            <div className="absolute bottom-3 left-3 right-3 z-[1000] pointer-events-none">
              <div className="pointer-events-auto w-full max-w-sm mx-auto flex justify-center">
                <SearchLandmarkCard 
                  landmark={activeLandmark} 
                  onClose={() => setActiveLandmark(null)} 
                />
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
