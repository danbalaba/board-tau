"use client";
import React, { useEffect, useRef } from "react";
import { FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form";
import { cn } from "@/utils/helper";

interface OtpInputProps {
  id: string;
  label: string;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  watch: UseFormWatch<any>;
  disabled?: boolean;
  required?: boolean;
  length?: number;
}

const OtpInput: React.FC<OtpInputProps> = ({
  id,
  label,
  register,
  errors,
  watch,
  disabled = false,
  required = true,
  length = 6,
}) => {
  const value = watch(id) || "";
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d$/.test(digit) && digit !== "") return;

    const newOtp = value.split("");
    newOtp[index] = digit;
    register(id).onChange({
      target: { name: id, value: newOtp.join("").slice(0, length) },
    } as React.ChangeEvent<HTMLInputElement>);

    // Auto focus next input
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").slice(0, length);
    if (/^\d+$/.test(pastedText)) {
      register(id).onChange({
        target: { name: id, value: pastedText },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  useEffect(() => {
    // Auto-focus first input when component mounts or becomes visible
    inputsRef.current[0]?.focus();
  }, []);

  return (
    <div className="w-full">
      <label
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        htmlFor={id}
      >
        {label}
      </label>
      <div
        className="flex gap-2 items-center justify-center"
        onPaste={handlePaste}
      >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={disabled}
            className={cn(
              "w-12 h-14 text-center text-2xl font-black border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 ease-out",
              disabled
                ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                : errors[id]
                ? "bg-white dark:bg-gray-900 border-rose-500 text-rose-600 focus:ring-rose-500/20 shadow-lg shadow-rose-500/10"
                : value[index]
                ? "bg-white dark:bg-gray-900 border-blue-500 text-blue-600 dark:text-blue-400 focus:ring-blue-500/20 shadow-lg shadow-blue-500/10"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500/20"
            )}
          />
        ))}
      </div>
      {errors[id] && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          {typeof errors[id] === "string"
            ? errors[id]
            : (errors[id] as any).message || "Please enter a valid OTP"}
        </p>
      )}
    </div>
  );
};

export default OtpInput;
