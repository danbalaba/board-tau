'use client';

import React from 'react';
import { 
  IconCalendar, 
  IconClock, 
  IconEye, 
  IconCheck, 
  IconX,
  IconPlayerPlay,
  IconArchive,
  IconRestore
} from '@tabler/icons-react';
import { cn } from '@/utils/helper';
import { formatDate } from '@/lib/utils';
import Button from "@/components/common/Button";
import { motion } from 'framer-motion';
import Avatar from '@/components/common/Avatar';
import { ReservationRequest } from '../hooks/use-reservation-logic';
import SafeImage from '@/components/common/SafeImage';

interface LandlordReservationCardProps {
  reservation: ReservationRequest;
  idx: number;
  viewMode: 'grid' | 'list';
  onUpdateStatus: (id: string, status: string, reason?: string) => Promise<void>;
  isUpdating?: boolean;
  onViewDetails: (reservation: ReservationRequest) => void;
  onArchive: () => void;
}

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-amber-500/90 text-white border-amber-400/50 shadow-amber-500/20',
  RESERVED: 'bg-emerald-500/90 text-white border-emerald-400/50 shadow-emerald-500/20',
  CONFIRMED: 'bg-emerald-500/90 text-white border-emerald-400/50 shadow-emerald-500/20',
  CHECKED_IN: 'bg-blue-500/90 text-white border-blue-400/50 shadow-blue-500/20',
  CANCELLED: 'bg-rose-500/90 text-white border-rose-400/50 shadow-rose-500/20',
};

export function LandlordReservationCard({
  reservation,
  idx,
  viewMode,
  onUpdateStatus,
  isUpdating,
  onViewDetails,
  onArchive
}: LandlordReservationCardProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: idx * 0.05, duration: 0.4, ease: "easeOut" } as any
    }
  };

  const isGrid = viewMode === 'grid';

  const getReservationImage = () => {
    if (reservation.room?.images && reservation.room.images.length > 0) return reservation.room.images[0].url;
    if (reservation.listing?.images && reservation.listing.images.length > 0) {
      const img = reservation.listing.images[0];
      return typeof img === 'string' ? img : (img as any).url;
    }
    return reservation.listing?.imageSrc || "/images/placeholder.jpg";
  };

  const ArchiveButton = () => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onArchive();
      }}
      title={reservation.isArchived ? "Restore Reservation" : "Archive Reservation"}
      className={cn(
        "absolute top-3 right-3 z-20 p-2 rounded-xl backdrop-blur-md transition-all duration-300 shadow-lg border",
        reservation.isArchived 
          ? "bg-primary/90 text-white border-primary/40 hover:bg-primary" 
          : "bg-white/80 dark:bg-gray-900/80 text-gray-500 hover:text-amber-500 border-gray-100 dark:border-gray-800 hover:border-amber-100"
      )}
    >
      {reservation.isArchived ? (
        <IconRestore size={14} strokeWidth={2.5} className="group-hover:-rotate-45 transition-transform" />
      ) : (
        <IconArchive size={14} strokeWidth={2.5} className="hover:scale-110 transition-transform" />
      )}
    </button>
  );

  if (isGrid) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-2.5 sm:p-6 rounded-2xl sm:rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col h-full"
      >
        {/* Top Image Section */}
        <div className="relative h-28 sm:h-48 w-full rounded-xl sm:rounded-2xl overflow-hidden mb-2.5 sm:mb-6 bg-gray-100 dark:bg-gray-800 z-10 flex-shrink-0">
          <SafeImage
            src={getReservationImage()}
            alt={reservation.listing.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Dynamic Status Badge */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 scale-90 sm:scale-100 origin-top-left">
            <span className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] uppercase font-black tracking-wider shadow-lg backdrop-blur-md border",
              statusColors[reservation.status] || "bg-primary/90 text-white border-primary/40"
            )}>
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {reservation.status.replace('_', ' ')}
            </span>
          </div>

          <ArchiveButton />
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col z-10">
          <div className="mb-2 sm:mb-4">
            <h3 className="text-xs sm:text-xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-1 tracking-tight mb-1.5 sm:mb-3">
              {reservation.listing.title}
            </h3>
            
            <div className="flex items-center gap-2 mb-2 sm:mb-4 bg-gray-50 dark:bg-gray-800/50 p-1.5 sm:p-2.5 rounded-lg sm:rounded-2xl border border-gray-100/50 dark:border-gray-800 w-fit">
              {reservation.isWalkIn ? (
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-xs sm:text-sm shrink-0">
                  {reservation.guestName?.charAt(0)?.toUpperCase() || 'W'}
                </div>
              ) : (
                <Avatar 
                  src={reservation.user?.image} 
                  name={reservation.user?.name} 
                  className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl shrink-0" 
                />
              )}
              <div className="min-w-0">
                <p className="text-[7px] sm:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 leading-none">
                  {reservation.isWalkIn ? 'Walk-in Guest' : 'Perspective Tenant'}
                </p>
                <p className="text-[10px] sm:text-sm font-black text-gray-900 dark:text-gray-100 max-w-[100px] sm:max-w-[200px] truncate leading-none">
                  {reservation.isWalkIn ? reservation.guestName : (reservation.user?.name || 'Anonymous')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-3 bg-gray-50 dark:bg-gray-800/50 p-1.5 sm:p-3 rounded-lg sm:rounded-2xl border border-gray-100 dark:border-gray-800 mb-2.5 sm:mb-4">
            <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
              <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-gray-400">Check-In</span>
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-black text-gray-900 dark:text-gray-100 truncate">
                <IconCalendar size={10} className="text-primary shrink-0 sm:w-3 sm:h-3" />
                <span>{formatDate(reservation.moveInDate)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 sm:gap-1 text-right min-w-0">
              <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-gray-400">Duration</span>
              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-black text-primary justify-end truncate">
                <IconClock size={10} className="shrink-0 sm:w-3 sm:h-3" />
                <span>{reservation.stayDuration} Days</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-2.5 sm:pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto w-full">
            <Button
              onClick={() => onViewDetails(reservation)}
              className={cn(
                "h-10 rounded-xl px-2 text-[10px] sm:text-xs font-black uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-700/60",
                ((reservation.status === 'RESERVED' || reservation.status === 'CONFIRMED' || reservation.status === 'PENDING_PAYMENT') && !reservation.isArchived)
                  ? "w-full sm:flex-1"
                  : "w-full"
              )}
            >
              <IconEye size={14} />
              <span>Details</span>
            </Button>
            
            {(reservation.status === 'RESERVED' || reservation.status === 'CONFIRMED') && (
              <Button
                onClick={() => onUpdateStatus(reservation.id, 'CHECKED_IN')}
                isLoading={isUpdating}
                className="hidden sm:flex flex-1 h-10 rounded-xl px-2 text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 group/btn cursor-pointer items-center justify-center gap-1.5"
              >
                <IconPlayerPlay size={14} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                <span>Check In</span>
              </Button>
            )}

            {reservation.status === 'PENDING_PAYMENT' && (
              reservation.isWalkIn ? (
                <Button
                  onClick={() => onUpdateStatus(reservation.id, 'RESERVED')}
                  isLoading={isUpdating}
                  className="hidden sm:flex flex-1 h-10 rounded-xl px-2 text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 group/btn cursor-pointer items-center justify-center gap-1.5"
                >
                  <IconCheck size={14} className="group-hover:scale-110 transition-transform" />
                  <span>Confirm</span>
                </Button>
              ) : (
                <div className="hidden sm:flex flex-1 items-center justify-center gap-1.5 h-10 px-2 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                   <span className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-wider text-center leading-none">Awaiting Payment</span>
                </div>
              )
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  /* List UI Mode */
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="group relative bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[2rem] border border-gray-100 dark:border-gray-800 p-3 sm:p-6 hover:shadow-xl transition-all duration-300 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6">
        {/* Left Row on Mobile: Image + Details */}
        <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
          {/* Thumbnail */}
          <div className="relative w-20 h-20 sm:w-56 sm:h-36 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm flex-shrink-0 bg-gray-100 dark:bg-gray-800">
            <SafeImage
              src={getReservationImage()}
              alt={reservation.listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute top-1 left-1 sm:top-2.5 sm:left-2.5 z-20">
              <span className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 sm:px-2 rounded-md sm:rounded-lg text-[7px] sm:text-[8px] uppercase font-black tracking-wider shadow-lg backdrop-blur-md border",
                statusColors[reservation.status] || "bg-primary/90 text-white border-primary/40"
              )}>
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current animate-pulse" />
                {reservation.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-1 sm:space-y-3">
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                <span className="text-[8px] sm:text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 truncate max-w-[130px] sm:max-w-none">
                  <IconCalendar size={10} className="shrink-0" /> Check-in: {formatDate(reservation.moveInDate)}
                </span>
                <span className="hidden sm:inline-block w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <span className="hidden sm:inline-block text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Duration: {reservation.stayDuration} Days
                </span>
              </div>
              <h3 className="text-sm sm:text-xl font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate tracking-tight">
                {reservation.listing.title}
              </h3>
            </div>

            {/* Guest & Room Info Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] sm:text-xs font-black text-gray-900 dark:text-gray-100">
                {reservation.isWalkIn ? reservation.guestName : (reservation.user?.name || 'Anonymous')}
              </span>
              {reservation.room && (
                <span className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-wider">
                  • {reservation.room.name}
                </span>
              )}
            </div>

            {/* Desktop Specs Pills */}
            <div className="hidden sm:flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50/60 dark:bg-blue-500/10 rounded-xl border border-blue-100/60 dark:border-blue-500/20 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase">
                <IconCalendar size={12} /> 
                <span>Check-in: {formatDate(reservation.moveInDate)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 dark:bg-primary/20 rounded-xl border border-primary/20 text-[9px] font-black text-primary dark:text-primary-400 uppercase">
                <IconClock size={12} /> 
                <span>{reservation.stayDuration} Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right / Actions Row */}
        <div className="flex sm:flex-col items-center gap-1.5 sm:gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 pt-2.5 sm:pt-0 sm:pl-6">
          <button 
            onClick={() => onViewDetails(reservation)} 
            className="flex-1 sm:w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-primary transition-all flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest cursor-pointer"
          >
            <IconEye size={13} />
            <span>Details</span>
          </button>

          {(reservation.status === 'RESERVED' || reservation.status === 'CONFIRMED') && (
            <Button
              onClick={() => onUpdateStatus(reservation.id, 'CHECKED_IN')}
              isLoading={isUpdating}
              className="flex-1 sm:w-full rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest shadow-md group/btn transition-all cursor-pointer"
            >
              <span className="flex items-center justify-center gap-1.5">
                <IconPlayerPlay size={13} fill="currentColor" />
                <span>Check In</span>
              </span>
            </Button>
          )}

          {reservation.status === 'PENDING_PAYMENT' && reservation.isWalkIn && (
            <Button
              onClick={() => onUpdateStatus(reservation.id, 'RESERVED')}
              isLoading={isUpdating}
              className="flex-1 sm:w-full rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase tracking-widest shadow-md transition-all cursor-pointer"
            >
              <span className="flex items-center justify-center gap-1.5">
                <IconCheck size={13} />
                <span>Confirm</span>
              </span>
            </Button>
          )}

          <button 
            onClick={onArchive}
            className={cn(
              "flex-1 sm:w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer border shadow-xs",
              reservation.isArchived
                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
            )}
            title={reservation.isArchived ? "Restore Reservation" : "Archive Reservation"}
          >
            {reservation.isArchived ? (
              <>
                <IconRestore size={13} />
                <span>Restore</span>
              </>
            ) : (
              <>
                <IconArchive size={13} />
                <span>Archive</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
