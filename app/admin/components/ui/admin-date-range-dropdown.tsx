'use client';

import React from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/app/admin/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';

export interface DateRangeOption {
  value: string;
  label: string;
  badge: string;
}

export const ADMIN_DATE_RANGES: DateRangeOption[] = [
  { value: '7d', label: 'Last 7 Days', badge: '7D' },
  { value: '30d', label: 'Last 30 Days', badge: '30D' },
  { value: '90d', label: 'Last 90 Days', badge: '90D' },
  { value: '1y', label: 'Past Year', badge: '1Y' },
];

interface AdminDateRangeDropdownProps {
  range: string;
  onRangeChange: (range: string) => void;
  options?: DateRangeOption[];
  className?: string;
  buttonClassName?: string;
  size?: 'default' | 'sm';
  align?: 'start' | 'center' | 'end';
}

export function AdminDateRangeDropdown({
  range,
  onRangeChange,
  options = ADMIN_DATE_RANGES,
  className,
  buttonClassName,
  size = 'default',
  align = 'end',
}: AdminDateRangeDropdownProps) {
  const currentOption = options.find((r) => r.value === range) ?? options[1] ?? options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'group gap-2.5 rounded-2xl border border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20 text-slate-800 dark:text-slate-100 shadow-sm transition-all duration-200 cursor-pointer font-semibold tracking-normal',
            size === 'sm' ? 'h-9 px-3.5 text-xs' : 'h-11 px-4 text-xs',
            buttonClassName
          )}
        >
          <Calendar size={size === 'sm' ? 14 : 15} className="text-primary dark:text-primary-light shrink-0 transition-transform duration-200 group-hover:scale-105" />
          <span>{currentOption?.label ?? 'Last 30 Days'}</span>
          <ChevronDown
            size={14}
            className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-200 opacity-70 group-data-[state=open]:rotate-180"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className={cn(
          'w-60 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl p-1.5 shadow-2xl shadow-slate-950/20 dark:shadow-black/60 z-[150]',
          className
        )}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-800/80 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Filter Timeframe
          </span>
          <span className="text-[10px] text-primary dark:text-primary-light font-bold">
            {currentOption?.badge}
          </span>
        </div>
        {options.map((item) => {
          const isSelected = range === item.value;
          return (
            <DropdownMenuItem
              key={item.value}
              onClick={() => onRangeChange(item.value)}
              className={cn(
                'group/item cursor-pointer flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-150 outline-none mb-0.5',
                isSelected
                  ? 'bg-primary/10 text-primary dark:text-primary-light font-semibold shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all duration-200',
                    isSelected
                      ? 'bg-primary scale-125'
                      : 'bg-gray-300 dark:bg-gray-700 group-hover/item:bg-gray-400'
                  )}
                />
                <span className="font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md transition-colors',
                    isSelected
                      ? 'bg-primary/20 text-primary dark:text-primary-light'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                  )}
                >
                  {item.badge}
                </span>
                {isSelected && (
                  <Check size={14} className="text-primary dark:text-primary-light shrink-0" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
