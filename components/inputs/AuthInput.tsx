"use client";

import React, { InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
} from "react-hook-form";
import { cn } from "@/utils/helper";
import { motion } from "framer-motion";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon?: any;
  register?: UseFormRegister<any>;
  errors?: FieldErrors;
  watch?: UseFormWatch<any>;
  autoFocus?: boolean;
  required?: boolean;
}

const AuthInput: React.FC<AuthInputProps> = ({
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
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordInput = type === "password";

  // Get error for nested path
  const getError = (path: string) => {
    if (!errors) return undefined;
    const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
    return normalizedPath.split('.').reduce((obj: any, key: string) => obj && obj[key], errors);
  };

  const error = getError(id);

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
              size={18}
              className={cn(
                error ? "text-red-500" : "text-gray-400 group-focus-within:text-primary transition-colors duration-300"
              )}
            />
          </div>
        )}

        <input
          id={id}
          type={isPasswordInput ? (showPassword ? "text" : "password") : type}
          disabled={disabled}
          placeholder={props.placeholder || " "}
          {...(register 
            ? register(id, { required: required ? "This field is required" : false })
            : {}
          )}
          {...props}
          className={cn(
            "peer w-full text-sm font-medium bg-white dark:bg-gray-800 border-2 rounded-2xl outline-none transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed",
            "px-4 py-4",
            error
              ? "border-red-500/50 focus:border-red-500 ring-red-500/10"
              : "border-gray-100 dark:border-gray-700/50 focus:border-primary dark:focus:border-primary/60 shadow-sm hover:border-gray-200 dark:hover:border-gray-600",
            Icon ? "pl-11" : "pl-4",
            isPasswordInput ? "pr-11" : "pr-4",
            "focus:ring-4 focus:ring-primary/5 group-focus-within:shadow-xl group-focus-within:shadow-primary/5",
            // 🛡️ SPECIAL AUTH EFFECT: Placeholder reveals only on focus
            "placeholder:opacity-0 focus:placeholder:opacity-100 placeholder:transition-opacity placeholder:duration-300"
          )}
          autoFocus={autoFocus}
        />

        <label
          htmlFor={id}
          className={cn(
            "absolute font-bold duration-300 transform scale-75 z-10 origin-[0] px-2 rounded-md transition-all cursor-text",
            "text-sm -top-2.5",
            "bg-white dark:bg-gray-800",
            Icon ? "left-9" : "left-2.5",
            "peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-4 peer-placeholder-shown:bg-transparent",
            "peer-focus:scale-75 peer-focus:-translate-y-0.5 peer-focus:text-primary peer-focus:bg-white dark:peer-focus:bg-gray-800",
            "peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-0.5 peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-800",
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

export default AuthInput;
