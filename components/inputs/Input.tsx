"use client";

import React, { InputHTMLAttributes, useState } from "react";
import { LucideIcon, Eye, EyeOff, AlertCircle } from "lucide-react";
import {
  UseFormRegister,
  FieldValues,
  FieldErrors,
  UseFormWatch,
} from "react-hook-form";
import { cn } from "@/utils/helper";
import { motion } from "framer-motion";
import HelpTooltip from "@/components/common/HelpTooltip";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon?: any;
  register?: UseFormRegister<any>;
  errors?: FieldErrors | Record<string, any>;
  watch?: UseFormWatch<any>;
  autoFocus?: boolean;
  required?: boolean;
  useStaticLabel?: boolean;
  validationRules?: any;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputSize?: "default" | "small";
  helpText?: string;
  focusColor?: "primary" | "amber";
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  icon: Icon,
  register,
  errors,
  watch,
  autoFocus = false,
  type = "text",
  disabled,
  required = true,
  useStaticLabel = false,
  validationRules,
  value: externalValue,
  onChange: externalOnChange,
  inputSize = "default",
  helpText,
  focusColor = "primary",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordInput = type === "password";

  const isAmber = focusColor === "amber";
  const focusBorderClass = isAmber ? "focus:border-amber-500 dark:focus:border-amber-400" : "focus:border-primary dark:focus:border-primary/60";
  const focusTextClass = isAmber ? "group-focus-within:text-amber-600 dark:group-focus-within:text-amber-400" : "group-focus-within:text-primary";
  const focusRingClass = isAmber ? "focus:ring-4 focus:ring-amber-500/10" : "focus:ring-4 focus:ring-primary/5";
  const focusLabelClass = isAmber ? "peer-focus:text-amber-600 dark:peer-focus:text-amber-400" : "peer-focus:text-primary";

  // Get value from watch or external
  const internalValue = watch && watch(id);
  const value = externalValue !== undefined ? externalValue : internalValue;

  // Get error for nested path
  const getError = (path: string) => {
    if (!errors) return undefined;
    const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
    const raw = normalizedPath.split('.').reduce((obj: any, key: string) => obj && obj[key], errors);
    if (!raw) return undefined;
    if (typeof raw === "string") return raw;
    return raw.message || raw;
  };

  const error = getError(id);
  const isSmall = inputSize === "small";

  const regProps = register
    ? register(id, {
        required: required ? "This field is required" : false,
        ...validationRules,
      })
    : null;

  const inputBindingProps = regProps
    ? {
        ...regProps,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          regProps.onChange(e);
          if (externalOnChange) externalOnChange(e);
        },
      }
    : {
        ...(value !== undefined ? { value } : {}),
        onChange: externalOnChange,
      };

  // Floating Label Design
  if (!useStaticLabel) {
    return (
      <motion.div 
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.998 }}
        className="w-full relative group transition-all duration-300"
      >
        <div className="relative mt-2">
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 z-10 flex items-center justify-center">
              <Icon
                size={isSmall ? 14 : 18}
                className={cn(
                  error ? "text-red-500" : cn("text-gray-400 transition-colors duration-300", focusTextClass)
                )}
              />
            </div>
          )}

          <input
            id={id}
            type={isPasswordInput ? (showPassword ? "text" : "password") : type}
            disabled={disabled}
            placeholder=" "
            {...inputBindingProps}
            onWheel={(e) => (e.target as HTMLElement).blur()}
            {...props}
            className={cn(
              "peer w-full text-sm font-medium bg-white dark:bg-gray-800 border-2 rounded-2xl outline-none transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed",
              isSmall ? "px-3 py-2.5 rounded-xl" : "px-4 py-4",
              error
              ? "border-red-500 focus:border-red-500 ring-4 ring-red-500/20 bg-red-50/30 dark:bg-red-950/30"
              : cn("border-gray-200 dark:border-gray-700/50 shadow-sm hover:border-gray-200 dark:hover:border-gray-600", focusBorderClass),
              Icon ? (isSmall ? "pl-9" : "pl-11") : "pl-4",
              isPasswordInput ? "pr-11" : "pr-4",
              focusRingClass
            )}
            autoFocus={autoFocus}
          />

          <label
            htmlFor={id}
            className={cn(
              "absolute font-bold duration-300 transform scale-75 z-10 origin-[0] px-2 rounded-md transition-all cursor-text",
              isSmall ? "text-xs -top-2" : "text-sm -top-2.5",
              "bg-white dark:bg-gray-800",
              Icon ? (isSmall ? "left-7" : "left-9") : "left-2.5",
              "peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-4 peer-placeholder-shown:bg-transparent",
              isSmall && "peer-placeholder-shown:translate-y-2",
              "peer-focus:scale-75 peer-focus:-translate-y-0.5 peer-focus:bg-white dark:peer-focus:bg-gray-800",
              focusLabelClass,
              value && "scale-75 -translate-y-0.5 bg-white dark:bg-gray-800",
              error ? "text-red-500" : "text-slate-700 dark:text-gray-300"
            )}
          >
            {label} {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          
          {helpText && !useStaticLabel && (
            <div className={cn("absolute z-20", isSmall ? "right-2 top-2" : "right-4 top-3.5")}>
              <HelpTooltip text={helpText} />
            </div>
          )}

          {isPasswordInput && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowPassword(!showPassword);
              }}
              disabled={disabled}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors duration-200 focus:outline-none flex items-center justify-center p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-[10px] font-black mt-1.5 ml-2 flex items-center gap-1 uppercase tracking-[0.1em]"
          >
            <AlertCircle size={10} />
            {typeof error === 'string' ? error : (error as any).message || "Required"}
          </motion.p>
        )}
      </motion.div>
    );
  }

  // Static Label Design
  return (
    <motion.div 
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.998 }}
      className="w-full relative group transition-all duration-300"
    >
      <label
        htmlFor={id}
        className={cn(
          "block font-extrabold uppercase tracking-wider mb-2 ml-1 transition-all duration-300",
          isSmall ? "text-[9px]" : "text-xs",
          error ? "text-red-500" : cn("text-gray-900 dark:text-gray-100 font-extrabold", focusTextClass)
        )}
      >
        <div className="flex items-center">
          <span>{label} {required && <span className="text-red-500 ml-0.5">*</span>}</span>
          {helpText && <HelpTooltip text={helpText} />}
        </div>
      </label>

      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 z-10 flex items-center justify-center">
            <Icon
              size={isSmall ? 14 : 18}
              className={cn(
                error ? "text-red-500" : cn("text-gray-400 transition-colors duration-300", focusTextClass)
              )}
            />
          </div>
        )}

        <input
          id={id}
          type={isPasswordInput ? (showPassword ? "text" : "password") : type}
          disabled={disabled}
          {...inputBindingProps}
          onWheel={(e) => (e.target as HTMLElement).blur()}
          {...props}
          className={cn(
            "peer w-full text-sm font-medium bg-white dark:bg-gray-800 border-2 rounded-2xl outline-none transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed",
            isSmall ? "px-3 py-2.5 rounded-xl" : "px-4 py-3.5",
            error
              ? "border-red-500 focus:border-red-500 ring-4 ring-red-500/20 bg-red-50/30 dark:bg-red-950/30"
              : cn("border-gray-100 dark:border-gray-700/50 shadow-sm hover:border-gray-200 dark:hover:border-gray-600", focusBorderClass),
            Icon ? (isSmall ? "pl-9" : "pl-11") : "pl-4",
            isPasswordInput ? "pr-11" : "pr-4",
            focusRingClass
          )}
          autoFocus={autoFocus}
        />

        {isPasswordInput && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowPassword(!showPassword);
            }}
            disabled={disabled}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors duration-200 focus:outline-none flex items-center justify-center p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-[10px] font-black mt-1.5 ml-2 flex items-center gap-1 uppercase tracking-[0.1em]"
        >
          <AlertCircle size={10} />
          {typeof error === 'string' ? error : (error as any).message || "Required"}
        </motion.p>
      )}
    </motion.div>
  );
};

export default Input;
