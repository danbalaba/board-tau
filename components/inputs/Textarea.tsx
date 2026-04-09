import React, { TextareaHTMLAttributes } from "react";
import {
  UseFormRegister,
  FieldValues,
  FieldErrors,
  UseFormWatch,
} from "react-hook-form";
import { cn } from "@/utils/helper";

interface TextareaProps<T extends FieldValues = FieldValues> extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  register?: UseFormRegister<T>;
  errors?: FieldErrors<T>;
  watch?: UseFormWatch<T>;
  autoFocus?: boolean;
  required?: boolean;
  rows?: number;
  validationRules?: any;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const Textarea: React.FC<TextareaProps> = ({
  id,
  label,
  register,
  errors,
  watch,
  autoFocus = false,
  required = true,
  rows = 3,
  disabled,
  validationRules,
  value: externalValue,
  onChange: externalOnChange,
  ...props
}) => {
  const internalValue = watch && watch(id);
  const value = externalValue !== undefined ? externalValue : internalValue;

  // Get error for nested path (e.g., 'contactInfo.fullName' or 'rooms[0].description')
  const getError = (path: string) => {
    if (!errors) return undefined;
    const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
    return normalizedPath.split('.').reduce((obj: any, key: string) => obj && obj[key], errors);
  };

  const error = getError(id);

  return (
    <div className="w-full relative">
      <label
        htmlFor={id}
        className={cn(
          "block text-sm font-medium mb-2",
          error ? "text-red-500" : "text-gray-700 dark:text-gray-300"
        )}
      >
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <textarea
        id={id}
        disabled={disabled}
        {...(!register && {
          value: value || '',
          onChange: (e) => {
            if (externalOnChange) {
              externalOnChange(e);
            }
          }
        })}
        {...(register && {
          ...register(id, {
            required: required ? "This field is required" : false,
            ...validationRules
          })
        })}
        className={cn(
          `text-[15px] peer w-full px-4 py-3 font-light bg-white dark:bg-gray-800 border-[1px] rounded-input outline-none transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-1`,
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
            : "border-border dark:border-gray-700 focus:border-primary focus:ring-primary/10",
          "min-h-[100px]"
        )}
        autoFocus={autoFocus}
        rows={rows}
        {...props}
      />

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          {typeof error === 'string'
            ? error
            : (error as any).message || "Please enter a valid value"}
        </p>
      )}
    </div>
  );
};

export default Textarea;
