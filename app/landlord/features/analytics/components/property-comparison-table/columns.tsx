'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Star, CheckCircle2 } from 'lucide-react';
import SafeImage from '@/components/common/SafeImage';
import { DataTableColumnHeader } from '@/app/admin/components/ui/table/data-table-column-header';
import { PropertyLeaderboardItem } from '@/services/landlord/analytics';
import { CellAction } from './cell-action';

export interface PropertyTableContext {
  selectedPropertyId?: string;
  onSelectProperty?: (id: string) => void;
}

export function getPropertyColumns({
  selectedPropertyId = 'all',
  onSelectProperty,
}: PropertyTableContext): ColumnDef<PropertyLeaderboardItem, unknown>[] {
  return [
    {
      id: 'rank',
      header: () => (
        <div className="flex items-center justify-center w-full">
          <span className="text-[10px] sm:text-[11px] font-black uppercase text-slate-400">#</span>
        </div>
      ),
      cell: ({ row, table }) => {
        // Calculate true rank taking pagination into account
        const pagination = table.getState().pagination;
        const rank = pagination.pageIndex * pagination.pageSize + row.index + 1;

        return (
          <div className="flex items-center justify-center w-full">
            <span
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                rank === 1
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold shadow-xs'
                  : rank === 2
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-extrabold'
                  : rank === 3
                  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold'
                  : 'text-slate-400 font-bold'
              }`}
            >
              {rank}
            </span>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'property',
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Property" />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const isSelected = selectedPropertyId === item.id;

        return (
          <div className="flex items-center gap-3 py-1">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-slate-700 shadow-xs">
              <SafeImage
                src={item.imageSrc}
                alt={item.title}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-[240px]">
                  {item.title}
                </p>
                {isSelected && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#2f7d6d] text-white shrink-0">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold">{item.propertyType}</span>
                <span>•</span>
                <span>
                  {item.totalRooms} rooms ({item.totalCapacity} beds)
                </span>
              </div>
            </div>
          </div>
        );
      },
      enableColumnFilter: true,
      meta: {
        label: 'Property',
        placeholder: 'Search properties...',
        variant: 'text',
      },
    },
    {
      id: 'occupancyRate',
      accessorKey: 'occupancyRate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rooms Filled" />
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="space-y-1 min-w-[130px] max-w-[170px]">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>
                {item.occupiedSlots}/{item.totalCapacity} Beds
              </span>
              <span className="text-[#2f7d6d] dark:text-emerald-400 tabular-nums">
                {item.occupancyRate}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, item.occupancyRate)}%` }}
              />
            </div>
          </div>
        );
      },
      meta: {
        label: 'Rooms Filled',
      },
    },
    {
      id: 'monthlyRevenue',
      accessorKey: 'monthlyRevenue',
      header: ({ column }) => (
        <div className="flex items-center justify-end w-full">
          <DataTableColumnHeader column={column} title="Earnings" className="-mr-1.5" />
        </div>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="text-right w-full">
            <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tabular-nums">
              ₱{item.monthlyRevenue.toLocaleString()}
            </p>
            <p className="text-[10px] font-bold text-slate-400">
              {item.totalBookings} booked
            </p>
          </div>
        );
      },
      meta: {
        label: 'Earnings',
      },
    },
    {
      id: 'conversionRate',
      accessorKey: 'conversionRate',
      header: ({ column }) => (
        <div className="flex items-center justify-center w-full">
          <DataTableColumnHeader column={column} title="Booking Rate" />
        </div>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col items-center justify-center w-full">
            <span className="text-xs font-black text-slate-700 dark:text-slate-200 tabular-nums">
              {item.conversionRate}%
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {item.totalBookings} of {item.inquiriesCount} inq
            </span>
          </div>
        );
      },
      meta: {
        label: 'Booking Rate',
      },
    },
    {
      id: 'averageRating',
      accessorKey: 'averageRating',
      header: ({ column }) => (
        <div className="flex items-center justify-center w-full">
          <DataTableColumnHeader column={column} title="Rating" />
        </div>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col items-center justify-center w-full">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-extrabold border border-amber-500/20">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{item.averageRating > 0 ? item.averageRating.toFixed(1) : 'New'}</span>
            </div>
            {item.totalReviews > 0 && (
              <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                {item.totalReviews} reviews
              </p>
            )}
          </div>
        );
      },
      meta: {
        label: 'Rating',
      },
    },
    {
      id: 'actions',
      header: () => (
        <div className="flex items-center justify-end w-full pr-1">
          <span className="sr-only">Actions</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-end w-full pr-1">
          <CellAction
            item={row.original}
            isSelected={selectedPropertyId === row.original.id}
            onSelectProperty={onSelectProperty}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
