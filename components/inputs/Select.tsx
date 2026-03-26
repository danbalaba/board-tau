import React from "react";
import {
  UseFormRegister,
  FieldValues,
  FieldErrors,
} from "react-hook-form";
import { cn } from "@/utils/helper";

interface SelectProps {
  id: string;
  label?: string;
  options: { value: string; label: string }[];
  register?: UseFormRegister<FieldValues>;
  errors?: FieldErrors;
  required?: boolean;
  disabled?: boolean;
  value?: any;
  onChange?: (value: any) => void;
  validationRules?: any;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  id,
  label,
  options,
  register,
  errors,
  required = true,
  disabled,
  value,
  onChange,
  validationRules,
  className,
}) => {
  // Get error for nested path (e.g., 'contactInfo.fullName')
  const getError = (path: string) => {
    return path.split('.').reduce((obj: any, key: string) => obj && obj[key], errors);
  };

  const error = getError(id);

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "block text-sm font-medium mb-2 transition-all duration-200",
            error ? "text-red-500" : "text-gray-700 dark:text-gray-300"
          )}
        >
          {label}
        </label>
      )}
      <select
        id={id}
        {...(register ? register(id, {
          required: required ? "This field is required" : false,
          ...validationRules
        }) : {})}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-3 font-light bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-[1px] border-border dark:border-gray-700 rounded-input outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-1",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
            : "border-border dark:border-gray-700 focus:border-primary focus:ring-primary/10"
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="dark:bg-gray-800 dark:text-gray-100">
            {option.label}
          </option>
        ))}
      </select>
      {/* Error message */}
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          {typeof error === 'string'
            ? error
            : (error as any).message || "Please select a valid option"}
        </p>
      )}
    </div>
  );
};

export default Select;
