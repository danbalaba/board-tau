import React, { InputHTMLAttributes, useState } from "react";
import { IconType } from "react-icons";
import {
  UseFormRegister,
  FieldValues,
  FieldErrors,
  UseFormWatch,
} from "react-hook-form";
import { cn } from "@/utils/helper";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon?: IconType;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  watch: UseFormWatch<FieldValues>;
  autoFocus?: boolean;
  required?: boolean;
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
  ...props
}) => {
  const value = watch(id);
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordInput = type === "password";

  return (
    <div className="w-full relative">
      {Icon && <Icon size={20} className="absolute top-[13px] left-2 text-[#666] dark:text-gray-400" />}
      <input
        id={id}
        type={isPasswordInput ? (showPassword ? "text" : "password") : type}
        disabled={disabled}
        {...register(id, { required })}
        className={cn(
          `text-[15px] peer w-full px-4 py-3 font-light bg-white dark:bg-gray-800 border-[1px] rounded-input outline-none transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-1`,
          errors[id]
            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
            : "border-border dark:border-gray-700 focus:border-primary focus:ring-primary/10",
          Icon ? "pl-11" : "pl-4",
          isPasswordInput ? "pr-11" : "pr-4"
        )}
        autoFocus={autoFocus}
        {...props}
      />
      {isPasswordInput && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setShowPassword(!showPassword);
          }}
          disabled={disabled}
          className="absolute top-[13px] right-2 text-[#666] dark:text-gray-400 hover:text-[#333] dark:hover:text-gray-200 transition-colors duration-200 focus:outline-none"
        >
          {showPassword ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5 text-[#666] dark:text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5 text-[#666] dark:text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      )}
      <label
        className={cn(
          `absolute  text-[14px] duration-150  transform  top-[28px] scale-80 -translate-y-4 origin-[0] peer-placeholder-shown:scale-100  peer-placeholder-shown:translate-y-0  peer-focus:scale-80 peer-focus:-translate-y-[40px] peer-focus:bg-white dark:peer-focus:bg-gray-800 z-[20] px-1 `,
          errors[id] ? "text-primary" : "text-zinc-400 dark:text-gray-400",
          value && "-translate-y-[40px] bg-white dark:bg-gray-800",
          Icon ? "left-9" : "left-4"
        )}
        htmlFor={id}
      >
        {label}
      </label>
      {/* Error message */}
      {errors[id] && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          {typeof errors[id] === 'string'
            ? errors[id]
            : (errors[id] as any).message || "Please enter a valid value"}
        </p>
      )}
    </div>
  );
};

export default Input;
