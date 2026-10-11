'use client';

import React from 'react';
import { Star, CheckCircle2, TrendingUp, DollarSign, Bed } from 'lucide-react';
import SafeImage from '@/components/common/SafeImage';
import { PropertyLeaderboardItem } from '@/services/landlord/analytics';
import { CellAction } from './cell-action';
import { cn } from '@/lib/utils';

interface PropertyComparisonCardProps {
  item: PropertyLeaderboardItem;
  rank: number;
  isSelected?: boolean;
  onSelectProperty?: (id: string) => void;
}

export function PropertyComparisonCard({
  item,
  rank,
  isSelected = false,
  onSelectProperty,
}: PropertyComparisonCardProps) {
  return (
    <div
      onClick={() => onSelectProperty?.(item.id)}
      className={cn(
        'group relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none',
        isSelected
          ? 'bg-[#2f7d6d]/5 dark:bg-emerald-500/10 border-[#2f7d6d]/40 dark:border-emerald-500/40 shadow-sm ring-1 ring-[#2f7d6d]/20 dark:ring-emerald-500/20'
          : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
      )}
    >
      {/* Top Header Row: Rank + Thumbnail + Title + Status + Action Menu */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Rank Badge */}
          <span
            className={cn(
              'w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-xs font-black',
              rank === 1
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold shadow-xs'
                : rank === 2
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-extrabold'
                : rank === 3
                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold'
            )}
          >
            {rank}
          </span>

          {/* Property Image */}
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-slate-700 shadow-xs">
            <SafeImage
              src={item.imageSrc}
              alt={item.title}
              fill
              className="object-cover"
              sizes="44px"
            />
          </div>

          {/* Title & Type */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[170px]">
                {item.title}
              </p>
              {isSelected && (
                <span className="inline-flex items-center gap-0.5 text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#2f7d6d] text-white shrink-0">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Active
                </span>
              )}
            </div>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {item.propertyType}
              </span>
              <span className="mx-1">•</span>
              <span>
                {item.totalRooms} rooms ({item.totalCapacity} beds)
              </span>
            </p>
          </div>
        </div>

        {/* Action Menu (stop propagation so tapping menu doesn't trigger card selection) */}
        <div onClick={(e) => e.stopPropagation()} className="shrink-0 -mr-1">
          <CellAction
            item={item}
            isSelected={isSelected}
            onSelectProperty={onSelectProperty}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="my-2.5 border-t border-slate-100 dark:border-slate-800/80" />

      {/* 2x2 Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Earnings */}
        <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
              Earnings
            </span>
            <DollarSign className="w-3 h-3 text-emerald-500" />
          </div>
          <p className="text-xs font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
            ₱{item.monthlyRevenue.toLocaleString()}
          </p>
          <p className="text-[9.5px] font-semibold text-slate-400 mt-0.5">
            {item.totalBookings} booked
          </p>
        </div>

        {/* Rooms Filled (Occupancy) */}
        <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
              Occupancy
            </span>
            <Bed className="w-3 h-3 text-teal-500" />
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">
              {item.occupiedSlots}/{item.totalCapacity} Beds
            </span>
            <span className="text-[10px] font-extrabold text-[#2f7d6d] dark:text-emerald-400 tabular-nums">
              {item.occupancyRate}%
            </span>
          </div>
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
              style={{ width: `${Math.min(100, item.occupancyRate)}%` }}
            />
          </div>
        </div>

        {/* Booking Rate */}
        <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
              Booking Rate
            </span>
            <TrendingUp className="w-3 h-3 text-indigo-500" />
          </div>
          <p className="text-xs font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
            {item.conversionRate}%
          </p>
          <p className="text-[9.5px] font-semibold text-slate-400 mt-0.5">
            {item.totalBookings} of {item.inquiriesCount} inq
          </p>
        </div>

        {/* Rating */}
        <div className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
              Rating
            </span>
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-black text-slate-900 dark:text-white">
              {item.averageRating > 0 ? item.averageRating.toFixed(1) : 'New'}
            </span>
            {item.totalReviews > 0 && (
              <span className="text-[9.5px] font-semibold text-slate-400">
                ({item.totalReviews})
              </span>
            )}
          </div>
          <p className="text-[9.5px] font-semibold text-slate-400 mt-0.5">
            {item.totalReviews > 0
              ? `${item.totalReviews} student reviews`
              : 'No reviews yet'}
          </p>
        </div>
      </div>
    </div>
  );
}
