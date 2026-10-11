'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';
import { cn } from '@/utils/helper';

export interface AnalyticsOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

interface AnalyticsSelectProps {
  options: AnalyticsOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
  searchable?: boolean;
  size?: 'sm' | 'md';
}

export function AnalyticsSelect({
  options,
  value,
  onChange,
  placeholder = 'Select option',
  icon,
  label,
  className,
  searchable = false,
  size = 'md',
}: AnalyticsSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = Math.max(rect.width, 240);
      const maxLeft = typeof window !== 'undefined' ? window.innerWidth + window.scrollX - menuWidth - 12 : rect.left;
      const left = Math.max(12, Math.min(rect.left + window.scrollX, maxLeft));
      setCoords({
        top: rect.bottom + window.scrollY + 6,
        left,
        width: menuWidth,
      });
    }
  };

  // Close on outside click (checking both trigger button and portal menu)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle position tracking on scroll and resize
  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
    }
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, searchable]);

  const filteredOptions = searchable && searchQuery.trim()
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {label && (
        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 ml-1">
          {label}
        </label>
      )}

      {/* Pill Trigger Button with Visible Border Outline */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          updateCoords();
          setIsOpen((prev) => !prev);
        }}
        className={cn(
          'w-full flex items-center justify-between gap-2.5 transition-all duration-200 select-none cursor-pointer',
          size === 'sm'
            ? 'h-9 px-3 rounded-xl'
            : 'h-10 sm:h-11 px-3.5 sm:px-4 rounded-2xl',
          'bg-white dark:bg-slate-800/90 backdrop-blur-xl',
          'border border-slate-200 dark:border-slate-700/80',
          'shadow-2xs hover:shadow-xs',
          isOpen
            ? 'border-[#2f7d6d] dark:border-emerald-500 ring-2 ring-[#2f7d6d]/15 shadow-sm'
            : 'hover:border-[#2f7d6d]/50 dark:hover:border-emerald-500/50'
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {icon && (
            <div className={cn(
              'shrink-0 transition-colors',
              isOpen ? 'text-[#2f7d6d] dark:text-emerald-400' : 'text-slate-400 dark:text-slate-400'
            )}>
              {icon}
            </div>
          )}
          <span className={cn(
            'truncate font-semibold tracking-tight text-slate-800 dark:text-slate-100 text-left',
            size === 'sm' ? 'text-xs' : 'text-xs sm:text-[13px]'
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <div className={cn(
          'shrink-0 text-slate-400 dark:text-slate-400 transition-transform duration-200 ml-1',
          isOpen && 'rotate-180 text-[#2f7d6d] dark:text-emerald-400'
        )}>
          <ChevronDown size={14} strokeWidth={2.4} />
        </div>
      </button>

      {/* Dropdown Floating Menu Portal: Always on top of all cards (z-[999999]) */}
      {isMounted && isOpen && coords && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: coords.top,
            left: coords.left,
            width: coords.width,
            zIndex: 999999,
          }}
          className={cn(
            'bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl',
            'border border-slate-200 dark:border-slate-700/90',
            'shadow-2xl rounded-2xl p-1.5',
            'animate-in fade-in-0 zoom-in-95 duration-150'
          )}
        >
          {/* Optional Quick Search */}
          {searchable && options.length > 5 && (
            <div className="p-1 mb-1 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-xs">
                <Search size={13} className="text-slate-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search listings..."
                  className="bg-transparent border-none outline-none text-xs w-full text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* Options List with Smooth Scrollbar */}
          <div className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 space-y-0.5 p-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs font-medium text-slate-400">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-2.5 text-left transition-all duration-150 cursor-pointer select-none',
                      isSelected
                        ? 'bg-[#2f7d6d]/10 dark:bg-emerald-500/15 text-[#2f7d6d] dark:text-emerald-400 font-semibold shadow-2xs'
                        : 'text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100/90 dark:hover:bg-slate-800/90 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {opt.icon && (
                        <div className={cn(
                          'shrink-0',
                          isSelected ? 'text-[#2f7d6d] dark:text-emerald-400' : 'text-slate-400'
                        )}>
                          {opt.icon}
                        </div>
                      )}
                      <div className="truncate flex-1 min-w-0">
                        <span className="block truncate text-xs sm:text-[13px] tracking-tight">
                          {opt.label}
                        </span>
                        {opt.sublabel && (
                          <span className="block truncate text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-normal">
                            {opt.sublabel}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="shrink-0 w-5 h-5 rounded-full bg-[#2f7d6d]/15 dark:bg-emerald-500/20 flex items-center justify-center">
                        <Check size={12} className="text-[#2f7d6d] dark:text-emerald-400" strokeWidth={2.6} />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default AnalyticsSelect;
