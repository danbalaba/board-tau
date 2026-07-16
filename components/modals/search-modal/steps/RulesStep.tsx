import Heading from "@/components/common/Heading";
import MultiSelectGrid from "@/components/inputs/MultiSelectGrid";
import { rulesPreferences } from "@/data/rulesPreferences";
import { motion } from "framer-motion";

interface RulesStepProps {
  rulesSelected: string[];
  toggleMulti: (id: "rules", value: string) => void;
}

export default function RulesStep({ rulesSelected, toggleMulti }: RulesStepProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >

      <Heading
        title="Rules / Preferences"
        subtitle="Select all that apply."
        helpText="These are strict dealbreakers. If you select 'Visitors Allowed', boarding houses that ban visitors will be completely removed."
      />
      <div className="mt-2">
        <MultiSelectGrid
          options={rulesPreferences.map((r) => ({ label: r.label, value: r.value, icon: r.icon, description: r.description }))}
          selected={rulesSelected}
          onToggle={(v) => toggleMulti("rules", v)}
        />
      </div>
    </motion.div>
  );
}
