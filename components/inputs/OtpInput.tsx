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
              "w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200",
              disabled
                ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                : errors[id]
                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
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
