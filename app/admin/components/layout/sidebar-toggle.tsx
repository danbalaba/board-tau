'use client';

import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface SidebarToggleProps {
  isOpen: boolean | undefined;
  setIsOpen?: () => void;
}

export function SidebarToggle({ isOpen, setIsOpen }: SidebarToggleProps) {
  return (
    <div className="invisible md:visible absolute top-[22px] -right-[18px] z-50">
      <Button
        onClick={() => setIsOpen?.()}
        className="rounded-lg w-9 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/10 shadow-sm transition-all"
        variant="outline"
        size="icon"
      >
        <ChevronLeft
          className={cn(
            "h-4.5 w-4.5 transition-transform ease-in-out duration-700",
            isOpen === false ? "rotate-180" : "rotate-0"
          )}
        />
      </Button>
    </div>
  );
}
