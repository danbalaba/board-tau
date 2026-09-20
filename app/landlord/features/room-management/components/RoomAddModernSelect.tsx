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
  hasError?: boolean;
}

const CustomOption = (props: OptionProps<Option, false>) => {
  return (
    <components.Option {...props}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5 min-w-0">
          {props.data.icon && <span className="shrink-0 text-primary">{props.data.icon}</span>}
          <span className="font-black tracking-wider text-[11px] sm:text-xs uppercase whitespace-nowrap">{props.data.label}</span>
        </div>
        {props.isSelected && (
          <div className="shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center ml-2">
            <Check size={12} className="text-primary" strokeWidth={3.5} />
          </div>
        )}
      </div>
    </components.Option>
  );
};

const CustomSingleValue = (props: SingleValueProps<Option, false>) => {
  return (
    <components.SingleValue {...props}>
      <span className="truncate font-black tracking-wider text-gray-900 dark:text-white uppercase text-[11px] sm:text-xs">{props.data.label}</span>
    </components.SingleValue>
  );
};

const DropdownIndicator = (props: DropdownIndicatorProps<Option, false>) => {
  return (
    <components.DropdownIndicator {...props}>
      <div className={cn(
        "w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 mr-0.5",
        props.selectProps.menuIsOpen
          ? "bg-primary/20 text-primary rotate-180"
          : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-primary"
      )}>
        <ChevronDown size={14} strokeWidth={3} />
      </div>
    </components.DropdownIndicator>
  );
};

const CustomMenu = (props: MenuProps<Option, false, GroupBase<Option>>) => {
  return (
    <components.Menu {...props}>
      <div className="animate-in fade-in slide-in-from-top-2 duration-200 outline-none">
        {props.children}
      </div>
    </components.Menu>
  );
};

const CustomMenuList = (props: MenuListProps<Option, false, GroupBase<Option>>) => {
  return (
    <components.MenuList {...props}>
      <div className="p-1.5 space-y-1">
        {props.children}
      </div>
    </components.MenuList>
  );
};

const RoomAddModernSelect: React.FC<RoomAddModernSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "SELECT PROPERTY / BUILDING...",
  icon,
  label,
  className,
  instanceId,
  hasError = false,
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
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-gray-100 mb-3 ml-1">
          {label}
        </label>
      )}
      <div className={cn(
        "flex items-center gap-2.5 sm:gap-3 border-2 transition-all duration-300 rounded-[2rem] px-3.5 sm:px-4 py-1 min-h-[52px]",
        hasError
          ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5 dark:bg-rose-950/20"
          : "bg-gray-50/80 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/80 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
      )}>
        <div className="shrink-0 text-primary">
           {selectedOption?.icon || icon || <Search size={18} />}
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
                minWidth: '100%',
                width: 'max-content',
                maxWidth: '340px',
                marginTop: '8px',
                zIndex: 999999
              }),
            }}
            classNames={{
              control: () => "cursor-pointer font-extrabold flex items-center w-full py-2.5",
              valueContainer: () => "flex-1 overflow-hidden py-0",
              singleValue: () => "text-gray-900 dark:text-white truncate font-black uppercase tracking-wider text-xs",
              input: () => "m-0 p-0 text-gray-900 dark:text-white font-extrabold text-xs uppercase tracking-wider",
              indicatorsContainer: () => "shrink-0",
              menu: () => "absolute z-[999999] min-w-full w-max max-w-[340px] bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-2xl rounded-[1.8rem] overflow-hidden",
              option: ({ isFocused, isSelected }) => cn(
                "cursor-pointer transition-all duration-150 rounded-xl px-3.5 py-2.5 text-xs uppercase tracking-wider mb-1 last:mb-0",
                isSelected
                  ? "bg-primary/10 text-primary font-black border border-primary/20"
                  : isFocused
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-extrabold"
                    : "bg-transparent text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700/50"
              ),
              placeholder: () => "text-gray-400 dark:text-gray-500 truncate font-black tracking-widest uppercase text-[10px] sm:text-[11px]",
              menuList: () => "max-h-[280px] overflow-y-auto custom-scrollbar p-1.5",
              noOptionsMessage: () => "text-[10px] font-black uppercase tracking-widest text-gray-400 py-6 text-center",
            }}
            menuPlacement="bottom"
          />
        </div>
      </div>
    </div>
  );
};

export default RoomAddModernSelect;
