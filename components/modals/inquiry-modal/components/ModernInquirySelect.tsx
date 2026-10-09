'use client';

import React from 'react';
import Select, { components, SingleValueProps, OptionProps, DropdownIndicatorProps, MenuProps, GroupBase, MenuListProps, ControlProps } from "react-select";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from '@/utils/helper';

export interface InquiryOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ModernInquirySelectProps {
  options: InquiryOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  instanceId?: string;
}

const CustomControl = (props: ControlProps<InquiryOption, false>) => {
  const selectedOption = props.getValue()?.[0];
  const selectIcon = (props.selectProps as any).icon;

  return (
    <components.Control {...props}>
      <div className="shrink-0 text-primary mr-3 flex items-center justify-center">
        {selectedOption?.icon || selectIcon || <Search size={18} />}
      </div>
      <div className="flex-1 min-w-0 flex items-center justify-between">
        {props.children}
      </div>
    </components.Control>
  );
};

const CustomOption = (props: OptionProps<InquiryOption, false>) => {
  return (
    <components.Option {...props}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5 min-w-0">
          {props.data.icon && <span className="shrink-0 text-primary">{props.data.icon}</span>}
          <span className="font-extrabold tracking-wide text-xs uppercase text-gray-900 dark:text-gray-100">{props.data.label}</span>
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

const CustomSingleValue = (props: SingleValueProps<InquiryOption, false>) => {
  return (
    <components.SingleValue {...props}>
      <span className="truncate font-extrabold tracking-wide text-gray-900 dark:text-white uppercase text-xs">
        {props.data.label}
      </span>
    </components.SingleValue>
  );
};

const DropdownIndicator = (props: DropdownIndicatorProps<InquiryOption, false>) => {
  return (
    <components.DropdownIndicator {...props}>
      <div className={cn(
        "w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 mr-0.5",
        props.selectProps.menuIsOpen
          ? "bg-primary text-white rotate-180 shadow-sm"
          : "bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-primary"
      )}>
        <ChevronDown size={14} strokeWidth={3} />
      </div>
    </components.DropdownIndicator>
  );
};

const CustomMenu = (props: MenuProps<InquiryOption, false, GroupBase<InquiryOption>>) => {
  const placement = (props.selectProps as any).menuPlacement || 'bottom';
  return (
    <components.Menu {...props}>
      <div className={cn(
        "duration-200 outline-none animate-in fade-in",
        placement === 'top' ? "slide-in-from-bottom-2" : "slide-in-from-top-2"
      )}>
        {props.children}
      </div>
    </components.Menu>
  );
};

const CustomMenuList = (props: MenuListProps<InquiryOption, false, GroupBase<InquiryOption>>) => {
  return (
    <components.MenuList {...props}>
      <div className="p-1.5 space-y-1">
        {props.children}
      </div>
    </components.MenuList>
  );
};

export function ModernInquirySelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  label,
  error,
  icon,
  instanceId
}: ModernInquirySelectProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(null);
  const [dynamicPlacement, setDynamicPlacement] = React.useState<'top' | 'bottom'>('bottom');
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setIsMounted(true);
    setPortalTarget(document.body);
  }, []);

  const handleMenuOpen = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If less than 240px remaining below the input, flip UPWARDS ('top'), else open DOWNWARDS ('bottom')
      setDynamicPlacement(spaceBelow < 240 ? 'top' : 'bottom');
    }
  };

  const selectedOption = options.find((opt) => opt.value === value) || null;

  if (!isMounted) return null;

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-gray-100 mb-2 ml-1">
          {label}
        </label>
      )}

      <Select<InquiryOption, false>
        instanceId={instanceId || label}
        value={selectedOption}
        onChange={(option) => {
          if (option) onChange(option.value);
        }}
        onMenuOpen={handleMenuOpen}
        placeholder={placeholder}
        options={options}
        {...({ icon, error } as any)}
        components={{
          Control: CustomControl,
          Option: CustomOption,
          SingleValue: CustomSingleValue,
          DropdownIndicator,
          Menu: CustomMenu,
          MenuList: CustomMenuList,
          IndicatorSeparator: () => null,
        }}
        unstyled
        isSearchable={false}
        menuPortalTarget={portalTarget}
        styles={{
          menuPortal: (base) => ({
            ...base,
            zIndex: 999999
          }),
          menu: (base) => ({
            ...base,
            width: '100%',
            marginTop: '6px',
            marginBottom: '6px',
            zIndex: 999999
          }),
        }}
        classNames={{
          control: ({ isFocused }) => cn(
            "cursor-pointer font-extrabold flex items-center justify-between w-full rounded-[2rem] px-4 py-1.5 min-h-[50px] border-2 transition-all duration-300 group",
            error
              ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5 dark:bg-rose-950/20"
              : isFocused
                ? "bg-white dark:bg-gray-900 border-primary ring-4 ring-primary/10 shadow-sm"
                : "bg-white dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-sm"
          ),
          valueContainer: () => "flex-1 overflow-hidden py-0 flex items-center",
          singleValue: () => "text-gray-900 dark:text-white truncate font-extrabold uppercase tracking-wider text-xs",
          input: () => "m-0 p-0 text-gray-900 dark:text-white font-extrabold text-xs uppercase tracking-wider",
          indicatorsContainer: () => "shrink-0 flex items-center",
          menu: () => "absolute z-[999999] w-full min-w-[200px] bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 shadow-2xl rounded-[1.8rem] overflow-hidden backdrop-blur-xl",
          option: ({ isFocused, isSelected }) => cn(
            "cursor-pointer transition-all duration-150 rounded-xl px-3.5 py-2.5 text-xs uppercase tracking-wider mb-1 last:mb-0",
            isSelected
              ? "bg-primary/10 text-primary font-black border border-primary/20"
              : isFocused
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-extrabold"
                : "bg-transparent text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800/50"
          ),
          placeholder: () => "text-gray-400 dark:text-gray-500 truncate font-extrabold tracking-wider text-xs",
          menuList: () => "max-h-[220px] overflow-y-auto custom-scrollbar p-1.5",
          noOptionsMessage: () => "text-[10px] font-black uppercase tracking-widest text-gray-400 py-4 text-center",
        }}
        menuPlacement={dynamicPlacement}
        menuShouldScrollIntoView={false}
      />

      {error && (
        <p className="mt-1.5 text-xs font-bold text-rose-500 px-1 animate-in fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
