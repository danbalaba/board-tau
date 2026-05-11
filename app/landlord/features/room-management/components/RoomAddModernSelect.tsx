"use client";

import React from "react";
import Select, { components, SingleValueProps, OptionProps, DropdownIndicatorProps, MenuProps, GroupBase, MenuListProps } from "react-select";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/utils/helper";

interface Option {
  value: string;
  label: string;
  color?: string;
  icon?: React.ReactNode;
}

interface RoomAddModernSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
  instanceId?: string;
}

const CustomOption = (props: OptionProps<Option, false>) => {
  return (
    <components.Option {...props}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {props.data.icon && <span className="shrink-0 text-primary opacity-80 scale-100">{props.data.icon}</span>}
          <span className="truncate font-black tracking-tight text-[12px] sm:text-[13px]">{props.data.label}</span>
        </div>
        {props.isSelected && (
          <div className="shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check size={10} className="text-white" strokeWidth={4} />
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
        {props.data.icon && <span className="shrink-0 text-primary scale-110">{props.data.icon}</span>}
        <span className="truncate font-black tracking-tight text-gray-900 dark:text-white uppercase text-[11px] sm:text-[13px]">{props.data.label}</span>
      </div>
    </components.SingleValue>
  );
};

const DropdownIndicator = (props: DropdownIndicatorProps<Option, false>) => {
  return (
    <components.DropdownIndicator {...props}>
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 mr-1",
        props.selectProps.menuIsOpen
          ? "bg-primary text-white rotate-180"
          : "bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-primary"
      )}>
        <ChevronDown size={14} strokeWidth={3} />
      </div>
    </components.DropdownIndicator>
  );
};

const CustomMenu = (props: MenuProps<Option, false, GroupBase<Option>>) => {
  return (
    <components.Menu {...props}>
      <div className="animate-in fade-in slide-in-from-top-2 duration-300 outline-none">
        {props.children}
      </div>
    </components.Menu>
  );
};

const CustomMenuList = (props: MenuListProps<Option, false, GroupBase<Option>>) => {
  return (
    <components.MenuList {...props}>
      <div className="py-3 px-2">
        {props.children}
      </div>
    </components.MenuList>
  );
};

const RoomAddModernSelect: React.FC<RoomAddModernSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select Building...",
  icon,
  label,
  className,
  instanceId,
}) => {
  const [isMounted, setIsMounted] = React.useState(false);
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setIsMounted(true);
    setPortalTarget(document.body);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || null;

  if (!isMounted) return null;

  return (
    <div className={cn("relative w-full", className)}>
      {label && (
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1">
          {label}
        </label>
      )}
      <div className={cn(
        "flex items-center gap-4 bg-gray-50/50 dark:bg-gray-800/40 border-2 border-gray-100 dark:border-white/5 focus-within:border-primary/40 focus-within:ring-8 focus-within:ring-primary/5 transition-all duration-500 rounded-[2rem] px-6 py-1",
      )}>
        <div className="shrink-0 text-primary/60">
           {icon || <Search size={20} />}
        </div>
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
              Menu: CustomMenu,
              MenuList: CustomMenuList,
              IndicatorSeparator: () => null,
            }}
            unstyled
            isSearchable={true}
            menuPortalTarget={portalTarget}
            styles={{
              menuPortal: (base) => ({
                ...base,
                zIndex: 999999
              }),
              menu: (base) => ({
                ...base,
                width: '100%',
                minWidth: 'max-content',
                marginTop: '12px',
                zIndex: 999999
              }),
            }}
            classNames={{
              control: () => "cursor-pointer font-bold flex items-center w-full py-4",
              valueContainer: () => "flex-1 overflow-hidden py-0",
              singleValue: () => "text-gray-900 dark:text-white truncate",
              input: () => "m-0 p-0 text-gray-900 dark:text-white font-bold",
              indicatorsContainer: () => "shrink-0",
              menu: () => "absolute z-50 w-full bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2rem] overflow-hidden",
              option: ({ isFocused, isSelected }) => cn(
                "cursor-pointer transition-all duration-200 rounded-2xl mb-1 last:mb-0 px-4 py-3.5",
                isFocused && !isSelected ? "bg-primary/5 text-primary" : "text-gray-600 dark:text-gray-400",
                isSelected && "bg-primary text-white font-black",
                !isFocused && !isSelected && "hover:bg-primary/5 hover:text-primary"
              ),
              placeholder: () => "text-gray-300 dark:text-gray-600 truncate font-black tracking-[0.15em] uppercase text-[11px]",
              menuList: () => "max-h-[350px] overflow-y-auto custom-scrollbar",
              noOptionsMessage: () => "text-[10px] font-black uppercase tracking-widest text-gray-400 py-6",
            }}
            menuPlacement="bottom"
          />
        </div>
      </div>
    </div>
  );
};

export default RoomAddModernSelect;
