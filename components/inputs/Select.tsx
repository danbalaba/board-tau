import React, { useState } from "react";
import ReactSelect, { StylesConfig, GroupBase, components, MenuListProps } from "react-select";
import { useTheme } from "next-themes";
import { FieldValues, FieldErrors } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/helper";

interface SelectProps {
  id: string;
  label?: string;
  options: { value: string; label: string }[];
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
  errors,
  disabled,
  value,
  onChange,
  validationRules,
  className,
}) => {
  const { theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get error for nested path
  const getError = (path: string) => {
    return path.split('.').reduce((obj: any, key: string) => obj && obj[key], errors);
  };
  const error = getError(id);

  // Custom styling for React Select to match BoardTAU Brand
  const customStyles: StylesConfig<{ value: string; label: string }, false, GroupBase<{ value: string; label: string }>> = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
      borderColor: error ? "#ef4444" : state.isFocused ? "#2F7D6D" : "#e5e7eb",
      borderRadius: "12px",
      padding: "4px 8px",
      boxShadow: state.isFocused ? (error ? "0 0 0 2px rgba(239, 68, 68, 0.1)" : "0 0 0 2px rgba(47, 125, 109, 0.1)") : "none",
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: error ? "#ef4444" : "#2F7D6D",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#f3f4f6" : "#111827",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#9ca3af" : "#6b7280",
    }),
    menu: (provided) => ({
      ...provided,
      // CRITICAL: Changing to static when open to push parent container height
      position: isMenuOpen ? "static" : "absolute",
      backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
      borderRadius: "12px",
      marginTop: "8px",
      padding: "8px",
      boxShadow: isMenuOpen ? "none" : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      border: theme === "dark" ? "1px solid #374151" : "1px solid #e5e7eb",
      zIndex: 50,
      width: "100%",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? "#2F7D6D" 
        : state.isFocused 
          ? (theme === "dark" ? "#374151" : "#f3f4f6") 
          : "transparent",
      color: state.isSelected 
        ? "#ffffff" 
        : (theme === "dark" ? "#f3f4f6" : "#111827"),
      borderRadius: "8px",
      cursor: "pointer",
      padding: "10px 12px",
      transition: "all 0.1s ease",
      "&:active": {
        backgroundColor: "#225d51",
      },
    }),
    input: (provided) => ({
        ...provided,
        color: theme === "dark" ? "#f3f4f6" : "#111827",
    }),
    // Hiding regular absolute menu list to avoid double gaps
    menuList: (provided) => ({
        ...provided,
        maxHeight: "250px",
    })
  };

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
        instanceId={id}
        isDisabled={disabled}
        isSearchable={isSearchable}
        placeholder={placeholder}
        options={options}
        value={options.find((opt) => opt.value === value)}
        onChange={(val) => {
            onChange?.(val?.value);
            // Auto-close menu on selection to revert size
            setIsMenuOpen(false);
        }}
        onMenuOpen={() => setIsMenuOpen(true)}
        onMenuClose={() => setIsMenuOpen(false)}
        styles={customStyles}
        components={{
          IndicatorSeparator: () => null,
          MenuList: (props) => (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <components.MenuList {...props}>{props.children}</components.MenuList>
            </motion.div>
          ),
        }}
      />

      {error && (
        <p className="text-red-500 text-sm mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          {(error as any).message || "Selection required"}
        </p>
      )}
    </motion.div>
  );
};

export default Select;
