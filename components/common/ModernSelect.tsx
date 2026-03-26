"use client";

import React from "react";
import Select, { components, SingleValueProps, OptionProps, DropdownIndicatorProps } from "react-select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/helper";

interface Option {
  value: string;
  label: string;
  color?: string;
  icon?: React.ReactNode;
}

interface ModernSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  instanceId?: string;
}

const CustomOption = (props: OptionProps<Option, false>) => {
  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2">
        {props.data.icon && <span className="shrink-0">{props.data.icon}</span>}
        {props.data.color && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", props.data.color)} />}
        <span className="truncate">{props.data.label}</span>
      </div>
    </components.Option>
  );
};

const CustomSingleValue = (props: SingleValueProps<Option, false>) => {
  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2">
        {props.data.icon && <span className="shrink-0 scale-90">{props.data.icon}</span>}
        {props.data.color && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", props.data.color)} />}
        <span className="truncate">{props.data.label}</span>
      </div>
    </components.SingleValue>
  );
};

const DropdownIndicator = (props: DropdownIndicatorProps<Option, false>) => {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown className={cn("text-gray-400 transition-transform duration-200", props.selectProps.menuIsOpen && "rotate-180")} size={14} />
    </components.DropdownIndicator>
  );
};

const ModernSelect: React.FC<ModernSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...", 
  icon,
  className,
  instanceId
}) => {
  const selectedOption = options.find((opt) => opt.value === value) || null;

  return (
    <div className={cn(
      "flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-3 py-0 shadow-sm border border-transparent hover:border-primary/30 transition-all duration-300 min-w-[130px]",
      className
    )}>
      {icon && <div className="shrink-0 text-primary opacity-80 scale-90">{icon}</div>}
      <div className="flex-1 min-w-0">
        <Select<Option, false>
          instanceId={instanceId}
          value={selectedOption}
          onChange={(option) => {
            if (option) onChange(option.value);
          }}
          placeholder={placeholder}
          options={options}
          components={{
            Option: CustomOption,
            SingleValue: CustomSingleValue,
            DropdownIndicator,
            IndicatorSeparator: () => null,
          }}
          unstyled
          isSearchable={false}
          classNames={{
            control: () => "cursor-pointer text-[13px] font-medium py-1.5",
            menu: () => "mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50",
            option: ({ isFocused, isSelected }) => cn(
              "px-3 py-2 cursor-pointer transition-colors text-[13px]",
              isFocused ? "bg-primary/10 text-primary dark:text-primary-light" : "text-gray-700 dark:text-gray-300",
              isSelected && "font-bold bg-primary/5 text-primary"
            ),
            singleValue: () => "text-gray-900 dark:text-gray-100",
            placeholder: () => "text-gray-400",
          }}
          menuPlacement="auto"
        />
      </div>
    </div>
  );
};

export default ModernSelect;
