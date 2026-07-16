import Heading from "@/components/common/Heading";
import Select from "@/components/inputs/Select";
import { colleges } from "@/data/colleges";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import SearchLandmarkCard from "../components/SearchLandmarkCard";

const Map = dynamic(() => import("@/components/common/Map"), {
  ssr: false,
  loading: () => <div className="h-[240px] rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">Loading map...</div>
});

interface CollegeStepProps {
  college: string;
  setCustomValue: (id: string, value: any) => void;
  mapCenter?: number[];
}

const mapLandmarks = colleges
  .filter(c => c.value !== "any")
  .map(c => ({
    id: c.value,
    name: c.label,
    coords: c.latlng as [number, number],
    logo: c.logo,
  }));

export default function CollegeStep({ college, setCustomValue, mapCenter }: CollegeStepProps) {
  const [activeLandmark, setActiveLandmark] = useState<any>(null);

  // Sync dropdown with active landmark
  useEffect(() => {
    if (college && college !== "any") {
      const found = mapLandmarks.find(l => l.id === college);
      if (found) setActiveLandmark(found);
    } else {
      setActiveLandmark(null);
    }
  }, [college]);

  const handleLandmarkClick = (landmark: any) => {
    setActiveLandmark(landmark);
    setCustomValue("college", landmark.id);
  };
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      <Heading
        title="Which college are you affiliated with?"
        subtitle="We'll use this to show distance from campus."
        helpText="Select your college to automatically center the map on your campus and measure distances accurately."
      />
      <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4 rounded-xl mt-2">
        <Select
          id="college"
          label="College"
          options={colleges.map((c) => ({ value: c.value, label: c.label }))}
          value={college}
          onChange={(v) => setCustomValue("college", v)}
        />
      </div>
      <div className="h-[240px] rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 relative">
        <Map 
          center={activeLandmark ? activeLandmark.coords : mapCenter} 
          allowPinDrop={false}
          scrollWheelZoom={true}
          landmarks={mapLandmarks}
          activeLandmarkId={activeLandmark?.id}
          onLandmarkClick={handleLandmarkClick}
        />
        
        {/* Floating Landmark Card Overlay */}
        <div className="absolute bottom-2 left-2 right-2 z-[1000] pointer-events-none">
          <div className="pointer-events-auto w-full max-w-sm mx-auto flex justify-center">
            <SearchLandmarkCard 
              landmark={activeLandmark} 
              onClose={() => setActiveLandmark(null)} 
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
