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
          <span className="font-semibold text-xs whitespace-nowrap">{props.data.label}</span>
        </div>
        {props.isSelected && (
          <div className="shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center ml-2">
            <Check size={12} className="text-primary" strokeWidth={2.5} />
          </div>
        )}
      </div>
    </components.Option>
  );
};

const CustomSingleValue = (props: SingleValueProps<Option, false>) => {
  return (
    <components.SingleValue {...props}>
      <span className="truncate font-semibold text-slate-800 dark:text-slate-100 text-xs sm:text-[13px]">{props.data.label}</span>
    </components.SingleValue>
  );
};

const DropdownIndicator = (props: DropdownIndicatorProps<Option, false>) => {
  return (
    <components.DropdownIndicator {...props}>
      <div className={cn(
        "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 mr-0.5",
        props.selectProps.menuIsOpen
          ? "bg-primary/20 text-primary rotate-180"
          : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-primary"
      )}>
        <ChevronDown size={13} strokeWidth={2.5} />
      </div>
    </components.DropdownIndicator>
  );
};

const CustomMenu = (props: MenuProps<Option, false, GroupBase<Option>>) => {
  return (
    <components.Menu {...props}>
      <div className="animate-in fade-in slide-in-from-top-2 duration-150 outline-none">
        {props.children}
      </div>
    </components.Menu>
  );
};

const CustomMenuList = (props: MenuListProps<Option, false, GroupBase<Option>>) => {
  return (
    <components.MenuList {...props}>
      <div className="p-1.5 space-y-0.5">
        {props.children}
      </div>
    </components.MenuList>
  );
};

const RoomAddModernSelect: React.FC<RoomAddModernSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select property or building...",
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
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2 ml-1">
          {label}
        </label>
      )}
      <div className={cn(
        "flex items-center gap-2.5 sm:gap-3 border transition-all duration-200 rounded-2xl px-3.5 sm:px-4 py-1 min-h-[48px]",
        hasError
          ? "border-rose-500 ring-2 ring-rose-500/10 bg-rose-500/5 dark:bg-rose-950/20"
          : "bg-white/80 dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800 hover:border-primary/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10"
      )}>
        <div className="shrink-0 text-primary">
           {selectedOption?.icon || icon || <Search size={16} />}
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
                marginTop: '6px',
                zIndex: 999999
              }),
            }}
            classNames={{
              control: () => "cursor-pointer font-semibold flex items-center w-full py-2",
              valueContainer: () => "flex-1 overflow-hidden py-0",
              singleValue: () => "text-slate-800 dark:text-slate-100 truncate font-semibold text-xs sm:text-[13px]",
              input: () => "m-0 p-0 text-slate-800 dark:text-slate-100 font-medium text-xs sm:text-[13px]",
              indicatorsContainer: () => "shrink-0",
              menu: () => "absolute z-[999999] min-w-full w-max max-w-[340px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl rounded-2xl overflow-hidden",
              option: ({ isFocused, isSelected }) => cn(
                "cursor-pointer transition-all duration-150 rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] mb-0.5 last:mb-0",
                isSelected
                  ? "bg-primary/10 text-primary font-semibold"
                  : isFocused
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    : "bg-transparent text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50"
              ),
              placeholder: () => "text-slate-400 dark:text-slate-500 truncate font-medium text-xs",
              menuList: () => "max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 p-1.5",
              noOptionsMessage: () => "text-xs font-medium text-slate-400 py-6 text-center",
            }}
            menuPlacement="bottom"
          />
        </div>
      </div>
    </div>
  );
};

export default RoomAddModernSelect;
