'use client';

import React from 'react';
import Link from 'next/link';
import {
  MoreHorizontal,
  ArrowUpRight,
  Building2,
  Bed,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import { Button } from '@/app/admin/components/ui/button';
import { PropertyLeaderboardItem } from '@/services/landlord/analytics';

interface CellActionProps {
  item: PropertyLeaderboardItem;
  isSelected?: boolean;
  onSelectProperty?: (id: string) => void;
}

export function CellAction({
  item,
  isSelected = false,
  onSelectProperty,
}: CellActionProps) {
  return (
    <div className="flex items-center justify-end">
      {/* 3-dots Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
            <span className="sr-only">Open property menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-52 p-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-1 z-50"
        >
          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1">
            Property Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />

          {/* Inspect in Analytics */}
          <DropdownMenuItem
            onClick={() => onSelectProperty?.(item.id)}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#2f7d6d]/10 hover:text-[#2f7d6d] dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4 text-[#2f7d6d] dark:text-emerald-400" />
            <span>{isSelected ? 'Currently Inspected' : 'Filter Analytics to Property'}</span>
            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-[#2f7d6d]" />}
          </DropdownMenuItem>

          {/* Manage in Property Management */}
          <DropdownMenuItem asChild>
            <Link
              href={`/landlord/properties?id=${item.id}`}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-blue-500" />
              <span>Manage Listing</span>
            </Link>
          </DropdownMenuItem>

          {/* View Rooms */}
          <DropdownMenuItem asChild>
            <Link
              href={`/landlord/rooms?listingId=${item.id}`}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Bed className="w-4 h-4 text-teal-500" />
              <span>View Rooms ({item.totalRooms})</span>
            </Link>
          </DropdownMenuItem>

          {/* View Bookings */}
          <DropdownMenuItem asChild>
            <Link
              href="/landlord/bookings"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-purple-500" />
              <span>View Bookings ({item.totalBookings})</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
