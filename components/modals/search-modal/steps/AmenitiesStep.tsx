import Heading from "@/components/common/Heading";
import MultiSelectGrid from "@/components/inputs/MultiSelectGrid";
import { amenities } from "@/data/amenities";
import { motion } from "framer-motion";

interface AmenitiesStepProps {
  amenitiesSelected: string[];
  toggleMulti: (id: "amenities", value: string) => void;
}

export default function AmenitiesStep({ amenitiesSelected, toggleMulti }: AmenitiesStepProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >

      <Heading
        title="Listing Amenities"
        subtitle="Select all that apply."
        helpText="These are strict requirements for the entire property. If you check 'WiFi', any boarding house without WiFi will be completely removed from your results."
      />
      <div className="mt-2">
        <MultiSelectGrid
          options={amenities.map((a) => ({ label: a.label, value: a.value, icon: a.icon, description: a.description }))}
          selected={amenitiesSelected}
          onToggle={(v) => toggleMulti("amenities", v)}
        />
      </div>
    </motion.div>
  );
}
