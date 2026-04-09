"use client";

import React, { InputHTMLAttributes, useState } from "react";
import { LucideIcon, Eye, EyeOff } from "lucide-react";
import {
  UseFormRegister,
  FieldValues,
  FieldErrors,
  UseFormWatch,
} from "react-hook-form";
import { cn } from "@/utils/helper";
import { motion } from "framer-motion";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon?: LucideIcon;
  register?: UseFormRegister<any>;
  errors?: FieldErrors;
  watch?: UseFormWatch<any>;
  autoFocus?: boolean;
  required?: boolean;
  useStaticLabel?: boolean;
  validationRules?: any;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputSize?: "default" | "small";
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
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordInput = type === "password";

  // Get value from watch or external
  const internalValue = watch && watch(id);
  const value = externalValue !== undefined ? externalValue : internalValue;

  // Get error for nested path
  const getError = (path: string) => {
    if (!errors) return undefined;
    const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
    return normalizedPath.split('.').reduce((obj: any, key: string) => obj && obj[key], errors);
  };

  const error = getError(id);
  const isSmall = inputSize === "small";

  // Floating Label Design
  if (!useStaticLabel) {
    return (
      <div className="w-full relative group">
        <div className="relative mt-2">
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 z-10 flex items-center justify-center">
              <Icon
                size={isSmall ? 14 : 18}
                className={cn(
                  error ? "text-red-500" : "text-gray-400 group-focus-within:text-primary"
                )}
              />
            </div>
          )}

          <input
            id={id}
            type={isPasswordInput ? (showPassword ? "text" : "password") : type}
            disabled={disabled}
            placeholder=" "
            {...(register && {
              ...register(id, {
                required: required ? "This field is required" : false,
                ...validationRules
              })
            })}
            {...props}
            value={value || ''}
            onChange={(e) => {
              // Priority 1: Handle registration if it exists
              if (register) {
                const r = register(id);
                if (r && r.onChange) {
                  r.onChange(e);
                }
              }
              
              // Priority 2: Handle external onChange if it exists
              if (externalOnChange) {
                externalOnChange(e);
              }
            }}
            className={cn(
              "peer w-full text-sm font-medium bg-white dark:bg-gray-800 border-2 rounded-2xl outline-none transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed",
              isSmall ? "px-3 py-2.5 rounded-xl" : "px-4 py-4",
              error
                ? "border-red-500/50 focus:border-red-500 ring-red-500/10"
                : "border-gray-100 dark:border-gray-700/50 focus:border-primary dark:focus:border-primary/60 shadow-sm",
              Icon ? (isSmall ? "pl-9" : "pl-11") : "pl-4",
              isPasswordInput ? "pr-11" : "pr-4",
              "focus:ring-4 focus:ring-primary/5"
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
              "peer-focus:scale-75 peer-focus:-translate-y-0.5 peer-focus:text-primary peer-focus:bg-white dark:peer-focus:bg-gray-800",
              value && "scale-75 -translate-y-0.5 bg-white dark:bg-gray-800",
              error ? "text-red-500" : "text-gray-400"
            )}
          >
            {label} {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-red-500 text-[10px] font-bold mt-1.5 ml-2 flex items-center gap-1 uppercase tracking-[0.1em]"
          >
            {typeof error === 'string' ? error : (error as any).message || "Required"}
          </motion.p>
        )}
      </div>
    );
  }

  // Static Label Design
  return (
    <div className="w-full relative group">
      <label
        htmlFor={id}
        className={cn(
          "block font-black uppercase tracking-widest mb-2 ml-1 transition-all duration-200",
          isSmall ? "text-[9px]" : "text-xs",
          error ? "text-red-500" : "text-gray-500 dark:text-gray-400 group-focus-within:text-primary"
        )}
      >
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 z-10 flex items-center justify-center">
            <Icon
              size={isSmall ? 14 : 18}
              className={cn(
                error ? "text-red-500" : "text-gray-400 group-focus-within:text-primary"
              )}
            />
          </div>
        )}

        <input
          id={id}
          type={isPasswordInput ? (showPassword ? "text" : "password") : type}
          disabled={disabled}
          {...(register && {
            ...register(id, {
              required: required ? "This field is required" : false,
              ...validationRules
            })
          })}
          {...props}
          value={value || ''}
          onChange={(e) => {
            // Priority 1: Handle registration if it exists
            if (register) {
              const r = register(id);
              if (r && r.onChange) {
                r.onChange(e);
              }
            }
            
            // Priority 2: Handle external onChange if it exists
            if (externalOnChange) {
              externalOnChange(e);
            }
          }}
          className={cn(
            "peer w-full text-sm font-medium bg-white dark:bg-gray-800 border-2 rounded-2xl outline-none transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed",
            isSmall ? "px-3 py-2.5 rounded-xl" : "px-4 py-3.5",
            error
              ? "border-red-500/50 focus:border-red-500 ring-red-500/10"
              : "border-gray-100 dark:border-gray-700/50 focus:border-primary dark:focus:border-primary/60 shadow-sm",
            Icon ? (isSmall ? "pl-9" : "pl-11") : "pl-4",
            isPasswordInput ? "pr-11" : "pr-4",
            "focus:ring-4 focus:ring-primary/5"
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
        <p className="text-red-500 text-[10px] font-bold mt-1.5 ml-2 flex items-center gap-1 uppercase tracking-[0.1em]">
          {typeof error === 'string' ? error : (error as any).message || "Required"}
        </p>
      )}
    </div>
  );
};

export default Input;
