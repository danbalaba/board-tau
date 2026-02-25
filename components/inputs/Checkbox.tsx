import React from "react";
import {
  UseFormRegister,
  FieldValues,
  UseFormWatch,
} from "react-hook-form";
import { cn } from "@/utils/helper";

interface CheckboxProps {
  id: string;
  label: string;
  register: UseFormRegister<FieldValues>;
  watch: UseFormWatch<FieldValues>;
  required?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  register,
  watch,
  required = false,
}) => {
  const value = watch(id);

  return (
    <div className="flex items-center space-x-3">
      <input
        type="checkbox"
        id={id}
        {...register(id)}
        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
      />
      <label
        htmlFor={id}
        className={cn(
          "text-sm font-medium cursor-pointer",
          value ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"
        )}
      >
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
