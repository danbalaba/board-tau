import React from "react";

interface SelectProps {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({
  id,
  label,
  options,
  value,
  onChange,
}) => {
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="
          text-sm
          font-semibold
          absolute
          text-text-secondary
          duration-150
          transform
          -translate-y-3
          top-5
          z-10
          origin-[0]
          left-4
          peer-placeholder-shown:scale-100
          peer-placeholder-shown:translate-y-0
          peer-focus:scale-75
          peer-focus:-translate-y-4
        "
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          peer
          w-full
          p-4
          pt-6
          font-light
          bg-white
          dark:bg-gray-800
          text-gray-900
          dark:text-gray-100
          border-[1px]
          border-border
          dark:border-gray-700
          rounded-input
          outline-none
          transition-all
          duration-200
          focus:border-primary
          focus:ring-2
          focus:ring-primary/10
          dark:focus:ring-primary/20
          disabled:opacity-70
          disabled:cursor-not-allowed
          pl-4
        "
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="dark:bg-gray-800 dark:text-gray-100">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
