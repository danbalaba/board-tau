"use client";

import React from "react";
import Select, { components, SingleValueProps, OptionProps, DropdownIndicatorProps, MenuProps, GroupBase, MenuListProps } from "react-select";
import { ChevronDown, Check } from "lucide-react";
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
  label?: string;
  className?: string;
  instanceId?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

const CustomOption = (props: OptionProps<Option, false>) => {
  return (
    <components.Option {...props}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {props.data.icon && <span className="shrink-0 opacity-80">{props.data.icon}</span>}
          {props.data.color && <span className={cn("w-2 h-2 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-800", props.data.color)} />}
          <span className="truncate">{props.data.label}</span>
        </div>
        {props.isSelected && (
          <Check size={14} className="shrink-0 text-primary opacity-90" />
        )}
      </div>
    </components.Option>
  );
};

const CustomSingleValue = (props: SingleValueProps<Option, false>) => {
  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2">
        {props.data.icon && <span className="shrink-0 scale-90 opacity-80">{props.data.icon}</span>}
        {props.data.color && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", props.data.color)} />}
        <span className="truncate">{props.data.label}</span>
      </div>
    </components.SingleValue>
  );
};

const DropdownIndicator = (props: DropdownIndicatorProps<Option, false>) => {
  return (
    <components.DropdownIndicator {...props}>
      <div className={cn(
        "w-5 h-5 rounded-md flex items-center justify-center transition-all duration-300",
        props.selectProps.menuIsOpen 
          ? "bg-primary/10 text-primary rotate-180" 
          : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      )}>
        <ChevronDown size={13} strokeWidth={2.5} />
      </div>
    </components.DropdownIndicator>
  );
};

const CustomMenu = (props: MenuProps<Option, false, GroupBase<Option>>) => {
  return (
    <components.Menu {...props}>
      <div className="animate-in fade-in slide-in-from-top-1 duration-200">
        {props.children}
      </div>
    </components.Menu>
  );
};

const CustomMenuList = (props: MenuListProps<Option, false, GroupBase<Option>>) => {
  return (
    <components.MenuList {...props}>
      <div className="py-1">
        {props.children}
      </div>
    </components.MenuList>
  );
};

const ModernSelect: React.FC<ModernSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...", 
  icon,
  label,
  className,
  instanceId,
  size = 'md',
  disabled = false,
}) => {
  const selectedOption = options.find((opt) => opt.value === value) || null;

  const isSmall = size === 'sm';

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
          {label}
        </label>
      )}
      <div className={cn(
        "flex items-center gap-2 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 hover:border-primary/40 dark:hover:border-primary/40 focus-within:border-primary dark:focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-300",
        isSmall ? "rounded-lg px-2.5 py-0" : "rounded-xl px-3 py-0",
        isSmall ? "min-w-[140px]" : "min-w-[160px]",
        disabled && "opacity-50 pointer-events-none",
      )}>
        {icon && <div className="shrink-0 text-primary/70 scale-90">{icon}</div>}
        <div className="flex-1 min-w-0">
          <Select<Option, false>
            instanceId={instanceId}
            value={selectedOption}
            onChange={(option) => {
              if (option) onChange(option.value);
            }}
            placeholder={placeholder}
            options={options}
            isDisabled={disabled}
            components={{
              Option: CustomOption,
              SingleValue: CustomSingleValue,
              DropdownIndicator,
              Menu: CustomMenu,
              MenuList: CustomMenuList,
              IndicatorSeparator: () => null,
            }}
            unstyled
            isSearchable={false}
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
            classNames={{
              control: () => cn(
                "cursor-pointer font-semibold flex items-center",
                isSmall ? "text-[12px] py-1.5" : "text-[13px] py-2",
              ),
              valueContainer: () => "flex-1 overflow-hidden",
              singleValue: () => "text-gray-900 dark:text-gray-100 truncate",
              input: () => "m-0 p-0",
              indicatorsContainer: () => "shrink-0 ml-1",
              menu: () => cn(
                "mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 shadow-2xl shadow-gray-200/50 dark:shadow-black/30 overflow-hidden",
                isSmall ? "rounded-lg" : "rounded-xl",
              ),
              option: ({ isFocused, isSelected }) => cn(
                "cursor-pointer transition-all duration-150",
                isSmall ? "px-3 py-2 text-[12px]" : "px-3.5 py-2.5 text-[13px]",
                isFocused && !isSelected
                  ? "bg-primary/5 text-primary dark:text-primary"
                  : "text-gray-600 dark:text-gray-300",
                isSelected && "bg-primary/8 text-primary font-bold dark:text-primary",
                !isFocused && !isSelected && "hover:bg-gray-50 dark:hover:bg-gray-700/50"
              ),
              placeholder: () => "text-gray-400 dark:text-gray-500 truncate",
              menuList: () => "max-h-[220px] overflow-y-auto custom-scrollbar",
              menuPortal: () => "",
            }}
            menuPlacement="auto"
          />
        </div>
      </div>
    </div>
  );
};

export default ModernSelect;
