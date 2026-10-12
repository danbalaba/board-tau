'use client';

import React from 'react';
import Link from 'next/link';
import { BedDouble, Users, AlertCircle, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import Skeleton from '@/components/common/Skeleton';
import { RoomOccupancyDetail } from '@/services/landlord/analytics';

interface LandlordAnalyticsRoomGridProps {
  rooms: RoomOccupancyDetail[];
  propertyName?: string;
  isLoading?: boolean;
}

export function LandlordAnalyticsRoomGrid({
  rooms = [],
  propertyName = 'Property',
  isLoading = false,
}: LandlordAnalyticsRoomGridProps) {
  if (isLoading) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 rounded-[26px] sm:rounded-[30px] border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48 rounded-lg" variant="text" />
              <Skeleton className="h-3.5 w-64 rounded-md opacity-60" variant="text" />
            </div>
          </div>
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (rooms.length === 0) return null;

  const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = rooms.reduce((acc, r) => acc + r.occupiedSlots, 0);
  const vacantBeds = Math.max(0, totalBeds - occupiedBeds);

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-7 rounded-[26px] sm:rounded-[30px] border border-slate-200/90 dark:border-slate-800 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
            <BedDouble className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Room & Bed Availability
            </h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {propertyName} • {rooms.length} Rooms • {occupiedBeds}/{totalBeds} Beds Filled ({vacantBeds} Open)
            </p>
          </div>
        </div>

        <Link
          href="/landlord/rooms"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#2f7d6d] hover:text-[#256658] dark:text-emerald-400 transition-colors self-start sm:self-auto"
        >
          <span>Manage Rooms</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid of Room Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {rooms.map((room) => {
          const isFull = room.isFull;
          const hasExpiring = room.hasExpiringLease;

          let badgeText = 'Available';
          let badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';

          if (isFull) {
            badgeText = '100% Full';
            badgeColor = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
          } else if (hasExpiring) {
            badgeText = 'Expiring Soon';
            badgeColor = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse';
          }

          return (
            <div
              key={room.id}
              className="group bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Top Row: Room Name & Status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-[#2f7d6d] dark:group-hover:text-emerald-400 transition-colors">
                    {room.name}
                  </h4>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    ₱{room.price.toLocaleString()}/mo
                  </p>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeColor} shrink-0`}>
                  {badgeText}
                </span>
              </div>

              {/* Middle: Occupancy Bar & Slot Counts */}
              <div className="my-3">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{room.occupiedSlots} of {room.capacity} Beds</span>
                  </span>
                  <span className="font-extrabold text-[#2f7d6d] dark:text-emerald-400">
                    {room.occupancyRate}%
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isFull
                        ? 'bg-purple-500'
                        : hasExpiring
                        ? 'bg-amber-500'
                        : 'bg-[#2f7d6d]'
                    }`}
                    style={{ width: `${room.occupancyRate}%` }}
                  />
                </div>
              </div>

              {/* Bottom: Available slot detail */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {room.availableSlots > 0 ? `${room.availableSlots} slots ready` : 'No open slots'}
                </span>
                {room.reservationFee > 0 && (
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    ₱{room.reservationFee} dep
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LandlordAnalyticsRoomGrid;
