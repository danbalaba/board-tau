'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { IconCalendarCheck, IconEye, IconCheck, IconX, IconCalendar } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helper';
import Button from '@/components/common/Button';
import { Booking } from '../hooks/use-booking-logic';

interface LandlordBookingCardProps {
  booking: Booking;
  idx: number;
  viewMode: 'grid' | 'list';
  statusColors: Record<string, string>;
  paymentStatusColors: Record<string, string>;
  onUpdateStatus: (id: string, status: 'pending' | 'confirmed' | 'cancelled') => void;
}

export function LandlordBookingCard({
  booking,
  idx,
  viewMode,
  statusColors,
  paymentStatusColors,
  onUpdateStatus
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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-primary/20 transition-all duration-300 shadow-sm flex",
        isGrid ? "flex-col p-6 rounded-3xl hover:shadow-xl" : "flex-row p-6 rounded-2xl hover:shadow-xl items-center gap-6"
      )}
    >
      <div className={cn("relative rounded-2xl overflow-hidden", isGrid ? "h-44 mb-6 w-full" : "w-24 h-24 flex-shrink-0")}>
        {booking.listing.imageSrc ? (
          <img src={booking.listing.imageSrc} alt={booking.listing.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
            <IconCalendarCheck size={isGrid ? 32 : 24} />
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          <span className={cn("px-2 py-0.5 rounded-lg text-[8px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md border border-white/10", statusColors[booking.status] || 'bg-gray-500/10 text-gray-600')}>
            {booking.status}
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className={cn("flex flex-col", !isGrid && "md:flex-row md:items-center justify-between gap-6")}>
          <div className="flex-1 min-w-0">
            <h3 className={cn("font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 truncate", isGrid ? "text-xl mb-2" : "text-lg mb-1")}>
              {booking.listing.title}
            </h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black ring-2 ring-primary/5">{booking.user.name?.charAt(0) || 'U'}</div>
                <div className="min-w-0 overflow-hidden">
                  <p className="text-xs font-black text-gray-900 dark:text-gray-100 truncate">{booking.user.name || 'Anonymous'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("font-black text-primary", isGrid ? "text-lg" : "text-base")}>
                  ₱{booking.totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
            <div className={cn("flex flex-wrap items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-100 dark:border-gray-700/50", isGrid ? "mb-6" : "mb-0 border-none bg-transparent p-0 flex-row")}>
              <IconCalendar size={12} className="text-primary shrink-0" />
              <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className={cn("flex", isGrid ? "flex-col gap-2 pt-4 border-t border-gray-100 dark:border-gray-800" : "md:items-center md:pl-6 md:border-l")}>
            <Button
              outline
              onClick={() => router.push(`/landlord/bookings/${booking.id}`)}
              className={cn("rounded-xl py-2 px-4 text-[10px] font-black uppercase tracking-widest", isGrid ? "w-full" : "")}
            >
              {isGrid ? "Manage Booking" : <IconEye size={18} />}
            </Button>
            
            {booking.status === 'pending' && (
              <div className={cn("grid gap-2", isGrid ? "grid-cols-2 mt-0" : "flex ml-2")}>
                <Button
                  onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                  className="rounded-xl py-2 px-4 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                >
                  {isGrid ? "Confirm" : <IconCheck size={18} />}
                </Button>
                <Button
                  outline
                  onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                  className="rounded-xl py-2 px-4 border-red-200 text-red-500"
                >
                  {isGrid ? "Cancel" : <IconX size={18} />}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
