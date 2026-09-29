'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { IconCalendarCheck, IconEye, IconCheck, IconCalendar, IconArchive, IconRestore } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helper';
import Button from '@/components/common/Button';
import { Booking } from '../hooks/use-booking-logic';
import Avatar from '@/components/common/Avatar';
import { LandlordBookingStatusBadge } from './landlord-booking-status-badge';
import SafeImage from '@/components/common/SafeImage';

interface LandlordBookingCardProps {
  booking: Booking;
  idx: number;
  viewMode: 'grid' | 'list';
  statusColors: Record<string, string>;
  paymentStatusColors: Record<string, string>;
  onUpdateStatus: (id: string, status: string) => void;
  isUpdatingStatus?: boolean;
  onViewDetails: (booking: Booking) => void;
  onArchive: () => void;
}

export function LandlordBookingCard({
  booking,
  idx,
  viewMode,
  statusColors,
  paymentStatusColors,
  onUpdateStatus,
  isUpdatingStatus,
  onViewDetails,
  onArchive
}: LandlordBookingCardProps) {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: idx * 0.05, duration: 0.3, ease: "easeOut" } as any
    }
  };

  const isGrid = viewMode === 'grid';

  const getBookingImage = () => {
    if (booking.room?.images && booking.room.images.length > 0) return booking.room.images[0].url;
    if (booking.listing?.images && booking.listing.images.length > 0) return booking.listing.images[0].url;
    return booking.listing?.imageSrc || "/images/placeholder.jpg";
  };

  const ArchiveButton = () => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onArchive();
      }}
      title={booking.isArchived ? "Unarchive" : "Archive"}
      className={cn(
        "absolute top-2.5 right-2.5 z-20 p-2 rounded-xl backdrop-blur-md transition-all duration-300 shadow-lg border",
        booking.isArchived 
          ? "bg-emerald-500/80 text-white border-emerald-400/50 hover:bg-emerald-600" 
          : "bg-white/80 dark:bg-gray-900/80 text-gray-500 hover:text-rose-500 border-gray-100 dark:border-gray-800 hover:border-rose-100"
      )}
    >
      {booking.isArchived ? (
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
            src={getBookingImage()}
            alt={booking.listing.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 scale-90 sm:scale-100 origin-top-left">
            <LandlordBookingStatusBadge status={booking.status} />
          </div>
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-20 scale-90 sm:scale-100 origin-bottom-right">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/20 shadow-xl">
              <p className="text-[8px] sm:text-[10px] font-black text-primary uppercase tracking-widest leading-none">₱{booking.totalPrice.toLocaleString()}</p>
            </div>
          </div>
          <ArchiveButton />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 w-full z-10 flex flex-col">
          <h3 className="font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 truncate text-xs sm:text-xl mb-1.5 sm:mb-3">
            {booking.listing.title}
          </h3>
          
          <div className="flex items-center gap-2 mb-2 sm:mb-5 bg-gray-50 dark:bg-gray-800/50 p-1.5 sm:p-2.5 rounded-lg sm:rounded-2xl border border-gray-100/50 dark:border-gray-800 w-fit">
            {booking.isWalkIn ? (
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-xs sm:text-base shrink-0">
                {booking.guestName?.charAt(0)?.toUpperCase() || 'W'}
              </div>
            ) : (
              <Avatar 
                src={booking.user?.image} 
                name={booking.user?.name} 
                className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl shrink-0" 
              />
            )}
            <div className="min-w-0">
              <p className="text-[7px] sm:text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 leading-none">
                {booking.isWalkIn ? 'Walk-in Guest' : 'Current Guest'}
              </p>
              <p className="text-[10px] sm:text-sm font-black text-gray-900 dark:text-gray-100 max-w-[100px] sm:max-w-[200px] truncate leading-none text-blue-600 dark:text-blue-400">
                {booking.isWalkIn ? booking.guestName : (booking.user?.name || 'Anonymous')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-4 bg-gray-50 dark:bg-gray-800/50 p-1.5 sm:p-3 rounded-lg sm:rounded-2xl border border-gray-100 dark:border-gray-800 mb-2.5 sm:mb-5 mt-auto">
            <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
              <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Start</span>
              <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[11px] font-black text-gray-900 dark:text-gray-100 truncate">
                <IconCalendar size={10} className="text-primary shrink-0 sm:w-3 sm:h-3" />
                <span>{new Date(booking.startDate).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 sm:gap-1 text-right min-w-0">
              <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">End</span>
              <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[11px] font-black text-primary justify-end truncate">
                <IconCalendarCheck size={10} className="shrink-0 sm:w-3 sm:h-3" />
                <span>{new Date(booking.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-2.5 sm:pt-4 border-t border-gray-100 dark:border-gray-800 w-full mt-auto">
            <Button
              onClick={() => onViewDetails(booking)}
              className={cn(
                "h-10 rounded-xl px-2 text-[10px] sm:text-xs font-black uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-700/60",
                booking.status === 'CHECKED_IN' ? "w-full sm:flex-1" : "w-full"
              )}
            >
              <IconEye size={14} />
              <span>Details</span>
            </Button>
            
            {booking.status === 'CHECKED_IN' && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(booking.id, 'COMPLETED');
                }}
                isLoading={isUpdatingStatus}
                className="hidden sm:flex flex-1 h-10 rounded-xl px-2 text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 group/btn cursor-pointer items-center justify-center gap-1.5"
              >
                <IconCheck size={14} className="group-hover:scale-110 transition-transform" />
                <span>Complete</span>
              </Button>
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
              src={getBookingImage()}
              alt={booking.listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute top-1 left-1 sm:top-2.5 sm:left-2.5 z-20 scale-90 sm:scale-100 origin-top-left">
              <LandlordBookingStatusBadge status={booking.status} />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-1 sm:space-y-3">
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                <span className="text-[8px] sm:text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 truncate max-w-[130px] sm:max-w-none">
                  ₱{booking.totalPrice.toLocaleString()} Total
                </span>
              </div>
              <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 truncate">
                {booking.listing.title}
              </h3>
            </div>

            {/* Guest info & dates line */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-xs text-gray-500">
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/60 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-800">
                {booking.isWalkIn ? (
                  <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 text-[9px] font-black flex items-center justify-center">
                    {booking.guestName?.charAt(0)?.toUpperCase() || 'W'}
                  </div>
                ) : (
                  <Avatar src={booking.user?.image} name={booking.user?.name} className="w-4 h-4 rounded-full" />
                )}
                <span className="text-[10px] font-black text-gray-800 dark:text-gray-200 truncate max-w-[100px] sm:max-w-[150px]">
                  {booking.isWalkIn ? booking.guestName : (booking.user?.name || 'Anonymous')}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold text-gray-500">
                <span className="flex items-center gap-1">
                  <IconCalendar size={12} className="text-primary" />
                  {new Date(booking.startDate).toLocaleDateString()}
                </span>
                <span>-</span>
                <span className="flex items-center gap-1 text-primary">
                  <IconCalendarCheck size={12} />
                  {new Date(booking.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Column */}
        <div className="flex sm:flex-col items-center gap-1.5 sm:gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 pt-2.5 sm:pt-0 sm:pl-6">
          <Button
            onClick={() => onViewDetails(booking)}
            className="flex-1 sm:w-36 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-3 text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-700/60 transition-all cursor-pointer"
          >
            <span className="flex items-center justify-center gap-1.5">
              <IconEye size={14} />
              <span>Details</span>
            </span>
          </Button>

          {booking.status === 'CHECKED_IN' && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(booking.id, 'COMPLETED');
              }}
              isLoading={isUpdatingStatus}
              className="flex-1 sm:w-36 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-3 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 group/btn transition-all cursor-pointer"
            >
              <span className="flex items-center justify-center gap-1.5">
                <IconCheck size={14} className="group-hover:scale-110 transition-transform" />
                <span>Complete</span>
              </span>
            </Button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchive();
            }}
            className={cn(
              "flex-1 sm:w-36 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer border shadow-xs",
              booking.isArchived 
                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" 
                : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
            )}
            title={booking.isArchived ? "Restore Booking" : "Archive Booking"}
          >
            {booking.isArchived ? (
              <>
                <IconRestore size={14} className="hover:-rotate-45 transition-transform" />
                <span>Restore</span>
              </>
            ) : (
              <>
                <IconArchive size={14} className="hover:scale-110 transition-transform" />
                <span>Archive</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
