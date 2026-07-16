'use client';

import type { Column, Table } from '@tanstack/react-table';
import * as React from 'react';

import { DataTableDateFilter } from "./data-table-date-filter";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableSliderFilter } from "./data-table-slider-filter";
import { DataTableViewOptions } from "./data-table-view-options";
import { Button } from "../button";
import { Input } from "../input";
import { cn } from "../../../lib/utils";
import { SearchIcon, X } from 'lucide-react';

interface DataTableToolbarProps<TData> extends React.ComponentProps<'div'> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
  children,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const columns = React.useMemo(
    () => table.getAllColumns().filter((column) => column.getCanFilter()),
    [table]
  );

  const onReset = React.useCallback(() => {
    table.resetColumnFilters();
  }, [table]);

  return (
    <div
      role='toolbar'
      aria-orientation='horizontal'
      className={cn(
        'flex w-full items-center justify-between gap-2 p-2 px-4 mb-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-sm min-h-12',
        className
      )}
      {...props}
    >
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        {columns.map((column) => (
          <DataTableToolbarFilter key={column.id} column={column} />
        ))}
        {isFiltered && (
          <Button
            aria-label='Reset filters'
            variant='ghost'
            size='sm'
            className='h-8 px-2 text-xs font-semibold hover:bg-rose-50 hover:text-rose-600 transition-colors'
            onClick={onReset}
          >
            <X className="w-3 h-3 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>
      <div className='flex items-center gap-2'>
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}

interface DataTableToolbarFilterProps<TData> {
  column: Column<TData>;
}

function DataTableToolbarFilter<TData>({
  column
}: DataTableToolbarFilterProps<TData>) {
  const columnMeta = column.columnDef.meta;

  // Local state so text inputs feel instant while debouncing the actual API call
  const [inputValue, setInputValue] = React.useState<string>(
    (column.getFilterValue() as string) ?? ''
  );

  // Sync external resets (e.g., "Clear Filters" button) back to local input state
  const externalValue = (column.getFilterValue() as string) ?? '';
  React.useEffect(() => {
    if (columnMeta?.variant === 'text' && externalValue !== inputValue) {
      setInputValue(externalValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalValue]);

  // 500ms debounce before pushing the filter value to the table (and to the server)
  React.useEffect(() => {
    if (columnMeta?.variant !== 'text') return;
    const timer = setTimeout(() => {
      column.setFilterValue(inputValue || undefined);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue, column, columnMeta?.variant]);

  const onFilterRender = React.useCallback(() => {
    if (!columnMeta?.variant) return null;

    switch (columnMeta.variant) {
      case 'text':
        return (
          <div className="relative group">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
            <Input
              placeholder={columnMeta.placeholder ?? columnMeta.label}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              className='h-9 w-40 lg:w-56 pl-9 pr-8 text-[13px] bg-white/50 dark:bg-gray-900/50 backdrop-blur-md rounded-full shadow-sm border-gray-200 dark:border-gray-800 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 focus-visible:ring-2 transition-all duration-200 text-gray-700 dark:text-gray-200'
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => {
                  setInputValue('');
                  column.setFilterValue(undefined);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        );

      case 'number':
        return (
          <div className='relative'>
            <Input
              type='number'
              inputMode='numeric'
              placeholder={columnMeta.placeholder ?? columnMeta.label}
              value={(column.getFilterValue() as string) ?? ''}
              onChange={(event) => column.setFilterValue(event.target.value)}
              className={cn('h-8 w-[120px]', columnMeta.unit && 'pr-8')}
            />
            {columnMeta.unit && (
              <span className='bg-accent text-muted-foreground absolute top-0 right-0 bottom-0 flex items-center rounded-r-md px-2 text-sm'>
                {columnMeta.unit}
              </span>
            )}
          </div>
        );

      case 'range':
        return (
          <DataTableSliderFilter
            column={column}
            title={columnMeta.label ?? column.id}
          />
        );

      case 'date':
      case 'dateRange':
        return (
          <DataTableDateFilter
            column={column}
            title={columnMeta.label ?? column.id}
            multiple={columnMeta.variant === 'dateRange'}
          />
        );

      case 'select':
      case 'multiSelect':
        return (
          <DataTableFacetedFilter
            column={column}
            title={columnMeta.label ?? column.id}
            options={columnMeta.options ?? []}
            multiple={columnMeta.variant === 'multiSelect'}
          />
        );

      default:
        return null;
    }
  }, [column, columnMeta, inputValue]);

  return onFilterRender();
}
