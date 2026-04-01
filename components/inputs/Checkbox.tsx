import React from "react";
import {
  UseFormRegister,
  FieldValues,
  UseFormWatch,
} from "react-hook-form";
import { cn } from "@/utils/helper";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CheckboxProps {
  id: string;
  label: string;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  value?: string; // Optional specific value for array-based checkboxes
  required?: boolean;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  register,
  watch,
  value: choiceValue,
  required = false,
  className,
}) => {
  // Check if it's checked by watching either the boolean id or if choiceValue exists in the array
  const watchedValue = watch(id);
  const isChecked = Array.isArray(watchedValue) 
    ? watchedValue.includes(choiceValue) 
    : !!watchedValue;

  return (
    <label 
      htmlFor={choiceValue ? `${id}-${choiceValue}` : id}
      className="flex items-center space-x-3 cursor-pointer group select-none"
    >
      <div className="relative">
        <input
          type="checkbox"
          id={choiceValue ? `${id}-${choiceValue}` : id}
          value={choiceValue}
          {...register(id)}
          className="sr-only" // Hide the native checkbox but keep it functional for RHF
        />
        
        {/* Custom Checkbox Box */}
        <motion.div
          className={cn(
            "w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center",
            isChecked 
              ? "bg-primary border-primary shadow-sm" 
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 group-hover:border-primary/50"
          )}
          initial={false}
          animate={{
            scale: isChecked ? 1 : 0.95,
          }}
          whileTap={{ scale: 0.85 }}
        >
          <AnimatePresence>
            {isChecked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.15 }}
              >
                <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <span
        className={cn(
          "text-[14px] font-medium transition-colors duration-200",
          isChecked ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300",
          className
        )}
      >
        {label}
      </span>
    </label>
  );
};

export default Checkbox;
