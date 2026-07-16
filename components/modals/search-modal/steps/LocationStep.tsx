import Heading from "@/components/common/Heading";
import Slider from "@/components/inputs/Slider";
import Checkbox from "@/components/inputs/Checkbox";
import { UseFormRegister, UseFormWatch } from "react-hook-form";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { colleges } from "@/data/colleges";
import { Car, Footprints, Bus } from "lucide-react";

const Map = dynamic(() => import("@/components/common/Map"), {
  ssr: false,
  loading: () => <div className="h-[240px] rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">Loading map...</div>
});

interface LocationStepProps {
  distance: number;
  college: string;
  setCustomValue: (id: string, value: any) => void;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
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

export default function LocationStep({
  distance,
  college,
  setCustomValue,
  register,
  watch,
  mapCenter
}: LocationStepProps) {
  const collegeLabel = colleges.find(c => c.value === college)?.label || "Tarlac Agricultural University";
  const isUnlimited = watch("isUnlimitedDistance");

  const handleSliderChange = (v: number) => {
    setCustomValue("distance", v);
    if (isUnlimited) {
      setCustomValue("isUnlimitedDistance", false);
    }
  };

  const setQuickFilter = (km: number) => {
    setCustomValue("distance", km);
    setCustomValue("isUnlimitedDistance", false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      <Heading
        title="Where should the boarding house be located?"
        subtitle="Distance from your selected college. Map centers on campus."
        helpText="Set how far you are willing to commute. If you want to see everything, check the 'Ignore distance cap' box below."
      />
      <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-5 rounded-xl flex flex-col gap-5">
        <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl transition-all hover:bg-primary/10 mb-2">
          <Checkbox
            id="isUnlimitedDistance"
            label="Show all listings (Ignore distance cap)"
            register={register}
            watch={watch}
          />
        </div>
        <div className={isUnlimited ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
          <Slider
            id="distance"
            label="Distance from college"
            subtitle="Maximum distance in km"
            min={0}
            max={20}
            step={0.5}
            value={Number(distance)}
            onChange={handleSliderChange}
            unit="km"
          />
          
          <div className="grid grid-cols-3 gap-3 mt-6">
            <button
              type="button"
              onClick={() => setQuickFilter(1)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${Number(distance) === 1 && !isUnlimited ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
            >
              <Footprints size={20} className="mb-1" />
              <span className="font-bold">1 km</span>
              <span className="text-[10px] uppercase tracking-wider opacity-70">Walking</span>
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter(3)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${Number(distance) === 3 && !isUnlimited ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
            >
              <Bus size={20} className="mb-1" />
              <span className="font-bold">3 km</span>
              <span className="text-[10px] uppercase tracking-wider opacity-70">Commute</span>
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter(5)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${Number(distance) === 5 && !isUnlimited ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
            >
              <Car size={20} className="mb-1" />
              <span className="font-bold">5 km</span>
              <span className="text-[10px] uppercase tracking-wider opacity-70">Drive</span>
            </button>
          </div>
        </div>
      </div>
      <div className="h-[240px] rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
        <Map 
          center={mapCenter} 
          allowPinDrop={false}
          scrollWheelZoom={true}
          landmarks={mapLandmarks}
          activeLandmarkId={college !== "any" ? college : undefined}
          radiusKm={isUnlimited ? undefined : Number(distance)}
        />
      </div>
    </motion.div>
  );
}
