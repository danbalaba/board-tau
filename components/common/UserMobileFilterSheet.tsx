'use client';

import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  X, 
  Check 
} from 'lucide-react';
import { cn } from '@/utils/helper';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/app/admin/components/ui/drawer';

interface UserMobileFilterSheetProps {
  activeFilterCount: number;
  onClearAll?: () => void;
  onApply?: () => void;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function UserMobileFilterSheet({
  activeFilterCount,
  onClearAll,
  onApply,
  onOpenChange,
  children
}: UserMobileFilterSheetProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply();
    }
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <button className={cn(
          "flex md:hidden items-center justify-center gap-2 px-3.5 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm shrink-0 cursor-pointer",
          activeFilterCount > 0 
            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
            : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:text-primary"
        )}>
          <SlidersHorizontal size={14} className="stroke-[2.5]" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[9px] font-black ml-0.5">
              {activeFilterCount}
            </span>
          )}
        </button>
      </DrawerTrigger>
      <DrawerContent className="z-[200] max-h-[85vh] rounded-t-[32px] sm:rounded-3xl bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col [&>.bg-muted]:!hidden">
        
        {/* Single Sleek Top Drag Handle Bar */}
        <div className="w-full pt-3.5 pb-1 flex items-center justify-center shrink-0 touch-none">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors" />
        </div>

        {/* Modal Header */}
        <div className="px-6 pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <DrawerTitle className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
                Filter & Sort Options
              </DrawerTitle>
              {activeFilterCount > 0 && (
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-primary/10 text-primary rounded-full">
                  {activeFilterCount} Active
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
              Select your filter criteria below and tap apply
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onClearAll && (
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setOpen(false);
                }}
                className="text-xs font-extrabold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1 cursor-pointer bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20 active:scale-95 transition-transform"
                title="Clear all filters"
              >
                <X size={14} strokeWidth={2.5} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-h-[60vh]">
          {children}
        </div>

        {/* Footer Apply CTA Button */}
        <div className="pt-3 pb-5 px-6 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900">
          <button
            type="button"
            onClick={handleApply}
            className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-primary/30 transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
          >
            <Check size={18} strokeWidth={2.5} />
            <span>Apply Filters</span>
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
