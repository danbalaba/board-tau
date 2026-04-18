'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { IconCalendarCheck, IconEye, IconCheck, IconX, IconCalendar, IconArchive } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helper';
import Button from '@/components/common/Button';
import { Booking } from '../hooks/use-booking-logic';
import Avatar from '@/components/common/Avatar';
import { LandlordBookingStatusBadge } from './landlord-booking-status-badge';

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
        "flex items-center justify-center p-2 rounded-xl shadow-lg transition-all",
        booking.isArchived 
          ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30"
          : isGrid 
            ? "bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 backdrop-blur-md"
            : "bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
      )}
    >
      <IconArchive size={16} />
    </button>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05, duration: 0.3 }}
      className={cn(
        "group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all duration-300 shadow-sm",
        isGrid ? "flex flex-col p-6 rounded-3xl hover:shadow-xl hover:-translate-y-1" : "flex flex-col sm:flex-row gap-6 p-6 rounded-2xl hover:shadow-xl"
      )}
    >
      <div className={cn(
        "relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 z-10",
        isGrid ? "h-44 mb-6 w-full" : "w-full sm:w-48 h-40"
      )}>
        {booking.listing.imageSrc ? (
          <img
            src={booking.listing.imageSrc}
            alt={booking.listing.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
            <IconCalendarCheck size={isGrid ? 32 : 24} />
          </div>
        )}
        <div className="absolute top-3 left-3 z-20">
          <LandlordBookingStatusBadge status={booking.status} />
        </div>
        <div className="absolute bottom-3 right-3 z-20">
           <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-xl">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">₱{booking.totalPrice.toLocaleString()}</p>
           </div>
        </div>
        {isGrid && (
          <div className="absolute top-3 right-3 z-20">
            <ArchiveButton />
          </div>
        )}
      </div>

      {!isGrid && (
        <div className="absolute top-6 right-6 z-20">
          <ArchiveButton />
        </div>
      )}

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

        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 mt-auto">
          <Button
            outline
            onClick={() => onViewDetails(booking)}
            className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-[0.2em] border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="flex items-center justify-center gap-2">
              <IconEye size={14} />
              Details
            </span>
          </Button>
          
          {booking.status === 'CHECKED_IN' && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(booking.id, 'COMPLETED');
              }}
              isLoading={isUpdatingStatus}
              className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-600/20 group/btn"
            >
              <span className="flex items-center justify-center gap-2">
                <IconCheck size={14} className="group-hover:scale-110 transition-transform" />
                Complete
              </span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
