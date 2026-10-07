'use client';

import type { Column } from '@tanstack/react-table';
import { EyeOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../dropdown-menu";
import { cn } from "../../../lib/utils";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CaretSortIcon,
  Cross2Icon,
  CheckIcon
} from '@radix-ui/react-icons';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.ComponentProps<typeof DropdownMenuTrigger> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const isSorted = column.getIsSorted();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'hover:bg-slate-100/80 dark:hover:bg-slate-800/80 focus:ring-slate-200 dark:focus:ring-slate-700 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800 -ml-1.5 flex h-8 items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-extrabold text-xs text-slate-800 dark:text-slate-200 transition-all focus:outline-none cursor-pointer select-none',
          className
        )}
        {...props}
      >
        <span>{title}</span>
        {column.getCanSort() &&
          (isSorted === 'desc' ? (
            <ChevronDownIcon className="w-4 h-4 text-primary dark:text-emerald-400 font-bold" />
          ) : isSorted === 'asc' ? (
            <ChevronUpIcon className="w-4 h-4 text-primary dark:text-emerald-400 font-bold" />
          ) : (
            <CaretSortIcon className="w-4 h-4 opacity-50" />
          ))}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-36 p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-1 z-[100]">
        {column.getCanSort() && (
          <>
            <DropdownMenuItem
              onClick={() => column.toggleSorting(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                isSorted === 'asc'
                  ? "bg-primary/10 dark:bg-emerald-500/10 text-primary dark:text-emerald-400"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <ChevronUpIcon className="w-4 h-4 shrink-0" />
              <span>Asc</span>
              {isSorted === 'asc' && (
                <div className="ml-auto w-4 h-4 rounded-full bg-primary/20 dark:bg-emerald-500/20 flex items-center justify-center">
                  <CheckIcon className="w-3 h-3 text-primary dark:text-emerald-400 font-bold" />
                </div>
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => column.toggleSorting(true)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                isSorted === 'desc'
                  ? "bg-primary/10 dark:bg-emerald-500/10 text-primary dark:text-emerald-400"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <ChevronDownIcon className="w-4 h-4 shrink-0" />
              <span>Desc</span>
              {isSorted === 'desc' && (
                <div className="ml-auto w-4 h-4 rounded-full bg-primary/20 dark:bg-emerald-500/20 flex items-center justify-center">
                  <CheckIcon className="w-3 h-3 text-primary dark:text-emerald-400 font-bold" />
                </div>
              )}
            </DropdownMenuItem>

            {isSorted && (
              <DropdownMenuItem
                onClick={() => column.clearSorting()}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
              >
                <Cross2Icon className="w-4 h-4 shrink-0" />
                <span>Reset</span>
              </DropdownMenuItem>
            )}
          </>
        )}

        {column.getCanHide() && (
          <DropdownMenuItem
            onClick={() => column.toggleVisibility(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer border-t border-slate-100 dark:border-slate-800/60 pt-2 mt-1"
          >
            <EyeOff className="w-4 h-4 shrink-0" />
            <span>Hide</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
