'use client';

import type { Table } from '@tanstack/react-table';
import { Settings2, SearchX } from 'lucide-react';

import { Button } from "../button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "../command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "../popover";
import { cn } from "../../../lib/utils";
import * as React from 'react';
import { CheckIcon, CaretSortIcon } from '@radix-ui/react-icons';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export function DataTableViewOptions<TData>({
  table
}: DataTableViewOptionsProps<TData>) {
  const columns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            typeof column.accessorFn !== 'undefined' && column.getCanHide()
        ),
    [table]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label='Toggle columns'
          role='combobox'
          variant='outline'
          size='sm'
          className='ml-auto hidden h-9 lg:flex hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 rounded-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-md shadow-sm border-gray-200 dark:border-gray-800 transition-all duration-200 text-[13px] font-medium'
        >
          <Settings2 className="w-4 h-4 mr-2" />
          View
          <CaretSortIcon className='ml-auto opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-56 p-1.5 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 shadow-2xl'>
        <Command filter={(value, search) => {
          if (value.toLowerCase().includes(search.toLowerCase())) return 1;
          return 0;
        }}>
          <CommandInput placeholder='Search columns...' />
          <CommandList>
            <CommandEmpty className="py-6 text-center text-sm">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 dark:bg-white/10">
                  <SearchX className="h-5 w-5 text-muted-foreground dark:text-gray-400" />
                </div>
                <div className="font-semibold text-muted-foreground dark:text-gray-200">No columns found</div>
                <p className="text-xs text-muted-foreground/70 dark:text-gray-400">Try a different search term.</p>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {columns.map((column) => (
                <CommandItem
                  key={column.id}
                  value={column.columnDef.meta?.label ?? column.id}
                  onSelect={() =>
                    column.toggleVisibility(!column.getIsVisible())
                  }
                  className="group"
                >
                  <span className='truncate'>
                    {column.columnDef.meta?.label ?? column.id}
                  </span>
                  <div className={cn(
                    "ml-auto shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                    column.getIsVisible() ? 'bg-emerald-500/20 opacity-100 scale-100' : 'opacity-0 scale-75'
                  )}>
                    <CheckIcon className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 font-bold' />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
