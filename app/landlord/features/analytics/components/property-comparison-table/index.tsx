'use client';

import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  VisibilityState,
  flexRender,
} from '@tanstack/react-table';
import { Trophy, Search, X, Building2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/admin/components/ui/table';
import { DataTablePagination } from '@/app/admin/components/ui/table/data-table-pagination';
import { DataTableViewOptions } from '@/app/admin/components/ui/table/data-table-view-options';
import { Input } from '@/app/admin/components/ui/input';
import { Button } from '@/app/admin/components/ui/button';
import Skeleton from '@/components/common/Skeleton';
import { cn } from '@/lib/utils';
import { PropertyLeaderboardItem } from '@/services/landlord/analytics';
import { getPropertyColumns } from './columns';
import { PropertyComparisonCard } from './property-comparison-card';

const getColumnAlignmentClass = (columnId: string) => {
  switch (columnId) {
    case 'rank':
      return 'w-12 text-center px-1';
    case 'monthlyRevenue':
      return 'text-right px-3 min-w-[130px]';
    case 'conversionRate':
      return 'text-center px-3 min-w-[120px]';
    case 'averageRating':
      return 'text-center px-3 min-w-[110px]';
    case 'actions':
      return 'w-12 text-right pr-3';
    case 'occupancyRate':
      return 'text-left px-3 min-w-[150px]';
    case 'property':
    default:
      return 'text-left px-3';
  }
};

interface PropertyComparisonTableProps {
  propertyLeaderboard: PropertyLeaderboardItem[];
  selectedPropertyId?: string;
  onSelectProperty?: (id: string) => void;
  isLoading?: boolean;
}

export function PropertyComparisonTable({
  propertyLeaderboard = [],
  selectedPropertyId = 'all',
  onSelectProperty,
  isLoading = false,
}: PropertyComparisonTableProps) {
  // TanStack Table states
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'monthlyRevenue', desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useMemo(
    () =>
      getPropertyColumns({
        selectedPropertyId,
        onSelectProperty,
      }),
    [selectedPropertyId, onSelectProperty]
  );

  // Global search filtering by property name or type
  const table = useReactTable({
    data: propertyLeaderboard,
    columns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    globalFilterFn: (row, columnId, filterValue) => {
      const search = String(filterValue).toLowerCase().trim();
      if (!search) return true;
      const title = String(row.original.title || '').toLowerCase();
      const type = String(row.original.propertyType || '').toLowerCase();
      return title.includes(search) || type.includes(search);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Skeleton state
  if (isLoading) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 rounded-[26px] sm:rounded-[30px] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48 rounded-lg" variant="text" />
              <Skeleton className="h-3.5 w-64 rounded-md opacity-60" variant="text" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-850/50 border border-slate-200/60 dark:border-slate-800"
            >
              <div className="flex items-center gap-3.5">
                <Skeleton className="w-6 h-6 rounded-lg" />
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              </div>
              <Skeleton className="h-5 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 rounded-[26px] sm:rounded-[30px] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Property Comparison
            </h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Compare earnings, room occupancy, and student bookings across your{' '}
              {propertyLeaderboard.length} listings
            </p>
          </div>
        </div>

        {selectedPropertyId !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectProperty?.('all')}
            className="text-xs font-bold text-[#2f7d6d] hover:text-[#256658] dark:text-emerald-400 transition-colors self-start sm:self-auto cursor-pointer"
          >
            ← Reset to All Properties
          </button>
        )}
      </div>

      {/* 2. Toolbar Section (Search & View Filter) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 px-3.5 bg-slate-100/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
        <div className="flex flex-1 items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 max-w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search properties or type..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-9 pl-9 pr-8 text-xs bg-white dark:bg-slate-900/90 rounded-xl border-slate-200/90 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-xs focus-visible:ring-[#2f7d6d]/30 focus-visible:border-[#2f7d6d]"
            />
            {globalFilter && (
              <button
                type="button"
                onClick={() => setGlobalFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Reset Filters button */}
          {globalFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGlobalFilter('')}
              className="h-8 px-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <X className="w-3 h-3 mr-1" />
              Clear Search
            </Button>
          )}
        </div>

        {/* View Options (Toggle columns - Desktop only) */}
        <div className="hidden sm:flex items-center gap-2">
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* 3. Mobile Card View (< md) */}
      <div className="block md:hidden space-y-3">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const pagination = table.getState().pagination;
            const rank = pagination.pageIndex * pagination.pageSize + row.index + 1;
            const isSelected = selectedPropertyId === row.original.id;

            return (
              <PropertyComparisonCard
                key={row.id}
                item={row.original}
                rank={rank}
                isSelected={isSelected}
                onSelectProperty={onSelectProperty}
              />
            );
          })
        ) : (
          <div className="py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center">
            <Building2 className="w-8 h-8 opacity-40 mb-2 text-slate-400" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              No properties found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {globalFilter
                ? `No listings matching "${globalFilter}".`
                : 'No property records available.'}
            </p>
          </div>
        )}
      </div>

      {/* 4. Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-b border-slate-200/80 dark:border-slate-800"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "py-3 text-xs font-bold text-slate-600 dark:text-slate-400 select-none",
                        getColumnAlignmentClass(header.column.id)
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const isSelected = selectedPropertyId === row.original.id;

                  return (
                    <TableRow
                      key={row.id}
                      className={`group transition-colors border-b border-slate-100 dark:border-slate-800/60 ${
                        isSelected
                          ? 'bg-[#2f7d6d]/5 dark:bg-emerald-500/5'
                          : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "py-3 text-sm",
                            getColumnAlignmentClass(cell.column.id)
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-44 text-center"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <Building2 className="w-8 h-8 opacity-40 mb-1" />
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        No properties found
                      </p>
                      <p className="text-xs text-slate-400">
                        {globalFilter
                          ? `No listings matching "${globalFilter}".`
                          : 'No property records available.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 5. Table Pagination Section */}
      <div className="pt-2">
        <DataTablePagination
          table={table}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>
    </div>
  );
}

export default PropertyComparisonTable;
