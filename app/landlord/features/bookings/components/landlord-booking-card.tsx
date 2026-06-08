'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { IconCalendarCheck, IconEye, IconCheck, IconX, IconCalendar, IconArchive, IconRestore } from '@tabler/icons-react';
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
      transition: { delay: idx * 0.05, duration: 0.4, ease: "easeOut" } as any
    }
  };

  const isGrid = viewMode === 'grid';

  const ArchiveButton = () => (
    <button
      onClick={onArchive}
      title={booking.isArchived ? "Unarchive" : "Archive"}
      className={cn(
        "absolute top-3 right-3 z-20 p-2 rounded-xl backdrop-blur-md transition-all duration-300 shadow-lg border",
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05, duration: 0.3 }}
      className={cn(
        "group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all duration-300 shadow-sm",
        isGrid ? "flex flex-col p-6 rounded-[2rem] hover:shadow-xl hover:-translate-y-1" : "flex flex-col lg:flex-row items-center gap-8 p-8 rounded-[2.5rem] hover:shadow-xl"
      )}
    >
      <div className={cn(
        "relative rounded-[2rem] overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 z-10",
        isGrid ? "h-44 mb-6 w-full" : "w-full lg:w-64 h-48"
      )}>
        <SafeImage
          src={(booking.room?.images && booking.room.images.length > 0) 
            ? booking.room.images[0].url 
            : (booking.listing?.images && booking.listing.images.length > 0)
              ? booking.listing.images[0].url
              : booking.listing?.imageSrc || "/images/placeholder.jpg"
          }
          alt={booking.listing.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 z-20">
          <LandlordBookingStatusBadge status={booking.status} />
        </div>
        <div className="absolute bottom-3 right-3 z-20">
           <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-xl">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">₱{booking.totalPrice.toLocaleString()}</p>
           </div>
        </div>
        {isGrid && <ArchiveButton />}
      </div>



      <div className="flex-1 min-w-0 w-full z-10 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 pr-4">
            <h3 className={cn(
              "font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 truncate",
              isGrid ? "text-xl mb-3" : "text-lg mb-1 pr-10"
            )}>
              {booking.listing.title}
            </h3>
            
            <div className="flex items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-2xl border border-gray-100/50 dark:border-gray-800 w-fit">
              <Avatar 
                src={booking.user.image} 
                name={booking.user.name} 
                className="w-10 h-10 rounded-xl" 
              />
              <div>
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 leading-none">Current Guest</p>
                <p className="text-sm font-black text-gray-900 dark:text-gray-100 max-w-[150px] sm:max-w-[200px] truncate leading-none text-blue-600 dark:text-blue-400">
                  {booking.user.name || 'Anonymous'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={cn(
          "grid gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 mb-5", 
          isGrid ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
        )}>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Stay Period</span>
            <div className="flex items-center gap-1.5 text-[11px] font-black text-gray-900 dark:text-gray-100">
              <IconCalendar size={12} className="text-primary" />
              {new Date(booking.startDate).toLocaleDateString()}
            </div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">End Date</span>
            <div className="flex items-center gap-1.5 text-[11px] font-black text-primary justify-end">
              <IconCalendarCheck size={12} />
              {new Date(booking.endDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {isGrid && (
          <div className="flex items-center gap-2 pt-6 border-t border-gray-100 dark:border-gray-800 mt-auto w-full">
            <Button
              outline
              onClick={() => onViewDetails(booking)}
              className="flex-1 rounded-2xl py-3 px-1 text-[10px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="flex items-center justify-center gap-1.5">
                <IconEye size={14} />
                <span className="hidden sm:inline">Details</span>
              </span>
            </Button>
            
            {booking.status === 'CHECKED_IN' && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(booking.id, 'COMPLETED');
                }}
                isLoading={isUpdatingStatus}
                className="flex-1 rounded-2xl py-3 px-1 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 group/btn"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <IconCheck size={14} className="group-hover:scale-110 transition-transform" />
                  Complete
                </span>
              </Button>
            )}
          </div>
        )}
      </div>

      {!isGrid && (
        <div className="flex sm:flex-col gap-4 w-full lg:w-44 mt-6 lg:mt-0 pt-8 lg:pt-0 lg:border-l border-gray-100 dark:border-gray-800 lg:pl-8 shrink-0">
          <Button
            onClick={() => onViewDetails(booking)}
            className="w-full rounded-2xl h-14 bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 group/btn transition-all border-b-4 border-primary/30 active:border-b-0"
          >
            <span className="flex items-center justify-center gap-3">
              <IconEye size={16} className="group-hover/btn:scale-110 transition-transform" />
              Manage
            </span>
          </Button>

          <div className="flex gap-2 w-full h-12">
            <button
              onClick={onArchive}
              className={cn(
                "flex-1 rounded-2xl transition-all flex items-center justify-center group/btn shadow-sm border",
                booking.isArchived 
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white" 
                  : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 hover:bg-amber-600 hover:text-white"
              )}
              title={booking.isArchived ? "Restore Booking" : "Archive Booking"}
            >
              {booking.isArchived ? (
                <IconRestore size={18} className="group-hover/btn:-rotate-45 transition-transform" />
              ) : (
                <IconArchive size={18} className="group-hover/btn:scale-110 transition-transform" />
              )}
            </button>

            {booking.status === 'CHECKED_IN' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(booking.id, 'COMPLETED');
                }}
                className="flex-1 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center group/btn shadow-sm border border-purple-100 dark:border-purple-900/30"
                title="Complete Booking"
              >
                <IconCheck size={18} className="group-hover/btn:scale-110 transition-transform" />
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
