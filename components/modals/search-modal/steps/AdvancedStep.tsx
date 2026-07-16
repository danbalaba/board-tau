import Heading from "@/components/common/Heading";
import MultiSelectGrid from "@/components/inputs/MultiSelectGrid";
import { advancedFilters } from "@/data/advancedFilters";
import { motion } from "framer-motion";

interface AdvancedStepProps {
  advancedSelected: string[];
  toggleMulti: (id: "advanced", value: string) => void;
}

export default function AdvancedStep({ advancedSelected, toggleMulti }: AdvancedStepProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >

      <Heading
        title="Looking for advanced features?"
        subtitle="These give bonus points to properties but won't strictly filter them out."
        helpText="These features are not strictly required, but our AI uses them as 'Bonus Points' to push better properties to the top of your search results."
      />
      <div className="mt-2">
        <MultiSelectGrid
          options={advancedFilters.map((a) => ({ label: a.label, value: a.value, icon: a.icon, description: a.description }))}
          selected={advancedSelected}
          onToggle={(v) => toggleMulti("advanced", v)}
        />
      </div>
    </motion.div>
  );
}
