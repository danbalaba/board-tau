import Heading from "@/components/common/Heading";
import Input from "@/components/inputs/Input";
import { FieldErrors, FieldValues, UseFormRegister, UseFormWatch } from "react-hook-form";
import { motion } from "framer-motion";

interface BudgetStepProps {
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  watch: UseFormWatch<FieldValues>;
  minPrice: string | number;
  maxPrice: string | number;
}

export default function BudgetStep({ register, errors, watch, minPrice, maxPrice }: BudgetStepProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      <Heading
        title="What is your monthly budget range?"
        subtitle="Price in Philippine Peso (₱)."
      />
      <div className="flex flex-col gap-4 p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <Input
          id="minPrice"
          label="Minimum (₱)"
          helpText="Set the absolute lowest price you are willing to pay. Leave blank for no minimum."
          type="number"
          register={register}
          errors={errors}
          watch={watch}
          required={false}
        />
        <Input
          id="maxPrice"
          label="Maximum (₱)"
          helpText="Set your absolute maximum budget. Our AI engine will try to find properties well below this price if possible."
          type="number"
          register={register}
          errors={errors}
          watch={watch}
          required={false}
        />
        {Number(minPrice) > Number(maxPrice) && maxPrice !== "" && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm font-medium p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800"
          >
            Minimum price cannot be greater than maximum price
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
