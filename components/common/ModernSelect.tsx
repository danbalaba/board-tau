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
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {props.data.icon && <span className="shrink-0 text-primary opacity-80 scale-100">{props.data.icon}</span>}
          {props.data.color && (
            <div className="relative flex items-center justify-center">
              <span className={cn("w-2 h-2 rounded-full shrink-0", props.data.color)} />
            </div>
          )}
          <span className="truncate font-black tracking-tight text-[12px] sm:text-[14px]">{props.data.label}</span>
        </div>
        {props.isSelected && (
          <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Check size={12} className="text-primary" strokeWidth={4} />
          </div>
        )}
      </div>
    </components.Option>
  );
};

const CustomSingleValue = (props: SingleValueProps<Option, false>) => {
  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2.5">
        {props.data.icon && <span className="shrink-0 text-primary scale-100">{props.data.icon}</span>}
        {props.data.color && <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", props.data.color)} />}
        <span className="truncate font-black tracking-tight text-gray-900 dark:text-white uppercase text-[11px] sm:text-[13px]">{props.data.label}</span>
      </div>
    </components.SingleValue>
  );
};

const DropdownIndicator = (props: DropdownIndicatorProps<Option, false>) => {
  return (
    <components.DropdownIndicator {...props}>
      <div className={cn(
        "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300",
        props.selectProps.menuIsOpen 
          ? "bg-primary/20 text-primary rotate-180" 
          : "bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-primary dark:hover:text-primary"
      )}>
        <ChevronDown size={12} strokeWidth={3} />
      </div>
    </components.DropdownIndicator>
  );
};

const CustomMenu = (props: MenuProps<Option, false, GroupBase<Option>>) => {
  return (
    <components.Menu {...props}>
      <div className="animate-in fade-in zoom-in-95 duration-200 outline-none">
        {props.children}
      </div>
    </components.Menu>
  );
};

const CustomMenuList = (props: MenuListProps<Option, false, GroupBase<Option>>) => {
  return (
    <components.MenuList {...props}>
      <div className="py-2 px-1.5">
        {props.children}
      </div>
    </components.MenuList>
  );
};

const ModernSelect: React.FC<ModernSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select Option", 
  icon,
  label,
  className,
  instanceId,
  size = 'md',
  disabled = false,
}) => {
  const selectedOption = options.find((opt) => opt.value === value) || null;
  const isSmall = size === 'sm';
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={cn("relative w-full sm:w-auto", className)}>
         {label && (
          <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2 ml-1 opacity-0">
            {label}
          </label>
        )}
        <div className={cn(
          "flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm opacity-50",
          isSmall ? "rounded-xl pr-2 pl-3.5 py-1.5" : "rounded-2xl pr-3 pl-4.5 py-2.5",
          isSmall ? "min-w-[160px]" : "min-w-[220px]"
        )}>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full sm:w-auto", className)}>
      {label && (
        <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2 ml-1">
          {label}
        </label>
      )}
      <div className={cn(
        "flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary/40 dark:hover:border-primary/40 focus-within:border-primary dark:focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-300 shadow-sm",
        isSmall ? "rounded-xl pr-2 pl-3.5 py-0" : "rounded-2xl pr-3 pl-4.5 py-0",
        isSmall ? "min-w-[160px]" : "min-w-[220px]",
        disabled && "opacity-50 pointer-events-none",
      )}>
        {icon && <div className="shrink-0 text-primary/60">{icon}</div>}
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
              menu: (base) => ({ 
                ...base, 
                width: '100%',
                minWidth: 'max-content',
                marginTop: '6px',
              }),
            }}
            classNames={{
              control: () => cn(
                "cursor-pointer font-bold flex items-center w-full",
                isSmall ? "text-[12px] py-1.5" : "text-[14px] py-2.5",
              ),
              valueContainer: () => "flex-1 overflow-hidden py-0.5",
              singleValue: () => "text-gray-900 dark:text-white truncate",
              input: () => "m-0 p-0",
              indicatorsContainer: () => "shrink-0 ml-2",
              menu: () => cn(
                "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden",
                isSmall ? "rounded-xl" : "rounded-2xl",
              ),
              option: ({ isFocused, isSelected }) => cn(
                "cursor-pointer transition-all duration-150 rounded-lg mb-0.5 last:mb-0",
                isSmall ? "px-3.5 py-2" : "px-4.5 py-2.5",
                isFocused && !isSelected
                  ? "bg-primary/5 text-primary"
                  : "text-gray-600 dark:text-gray-300",
                isSelected && "bg-primary/10 text-primary font-bold",
                !isFocused && !isSelected && "hover:bg-primary/5"
              ),
              placeholder: () => "text-gray-300 dark:text-gray-700 truncate font-black tracking-widest uppercase text-[10px]",
              menuList: () => cn(
                "max-h-[300px] overflow-y-auto scrollbar-none",
                "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              ),
            }}
            menuPlacement="auto"
          />
        </div>
      </div>
    </div>
  );
};

export default ModernSelect;
