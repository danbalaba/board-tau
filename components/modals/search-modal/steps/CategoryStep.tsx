import Heading from "@/components/common/Heading";
import MultiSelectGrid from "@/components/inputs/MultiSelectGrid";
import { categories } from "@/utils/constants";
import { motion } from "framer-motion";

interface CategoryStepProps {
  categoriesSelected: string[];
  toggleMulti: (id: "categories", value: string) => void;
}

export default function CategoryStep({ categoriesSelected, toggleMulti }: CategoryStepProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >

      <Heading
        title="Listing Categories"
        subtitle="Select all that apply."
        helpText="Select the specific type of property you want. 'Student-Friendly' properties are usually close to campus with study rules."
      />
      <div className="mt-2">
        <MultiSelectGrid
          options={categories.map((c) => ({ label: c.label, value: c.value, icon: c.icon, description: c.description }))}
          selected={categoriesSelected}
          onToggle={(v) => toggleMulti("categories", v)}
        />
      </div>
    </motion.div>
  );
}
