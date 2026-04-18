'use client';

import React from 'react';
import { 
  IconCalendar, 
  IconClock, 
  IconEye, 
  IconCheck, 
  IconX,
  IconPlayerPlay,
  IconArchive
} from '@tabler/icons-react';
import { cn } from '@/utils/helper';
import Button from "@/components/common/Button";
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Avatar from '@/components/common/Avatar';
import { ReservationRequest } from '../hooks/use-reservation-logic';

interface LandlordReservationCardProps {
  reservation: ReservationRequest;
  idx: number;
  viewMode: 'grid' | 'list';
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  isUpdating?: boolean;
  onViewDetails: (reservation: ReservationRequest) => void;
  onArchive: () => void;
}

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  RESERVED: 'bg-green-500/10 text-green-600 border-green-500/20',
  CONFIRMED: 'bg-green-500/10 text-green-600 border-green-500/20',
  CHECKED_IN: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  CANCELLED: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const paymentStatusColors: Record<string, string> = {
  unpaid: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
  paid: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
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
      title={reservation.isArchived ? "Unarchive" : "Archive"}
      className={cn(
        "flex items-center justify-center p-2 rounded-xl shadow-lg transition-all",
        reservation.isArchived 
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
        {reservation.listing.imageSrc ? (
          <img
            src={reservation.listing.imageSrc}
            alt={reservation.listing.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
            <IconCalendar size={isGrid ? 32 : 24} />
          </div>
        )}
        <div className="absolute top-3 left-3 z-20">
          <span className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md border",
            statusColors[reservation.status] || "bg-white/80 text-gray-800 border-gray-200"
          )}>
            {reservation.status.replace('_', ' ')}
          </span>
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
              {reservation.listing.title}
            </h3>
            
            <div className="flex items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-2xl border border-gray-100/50 dark:border-gray-800 w-fit">
              <Avatar 
                src={reservation.user.image} 
                name={reservation.user.name} 
                className="w-10 h-10 rounded-xl" 
              />
              <div>
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 leading-none">Perspective Tenant</p>
                <p className="text-sm font-black text-gray-900 dark:text-gray-100 max-w-[150px] sm:max-w-[200px] truncate leading-none">{reservation.user.name || 'Anonymous'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={cn("grid gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 mb-5", isGrid ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3")}>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Move In</span>
            <div className="flex items-center gap-1.5 text-xs font-black text-gray-900 dark:text-gray-100">
              <IconCalendar size={12} className="text-primary" />
              {new Date(reservation.moveInDate).toLocaleDateString()}
            </div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Stay Duration</span>
            <div className="flex items-center gap-1.5 text-xs font-black text-primary justify-end">
              <IconClock size={12} />
              {reservation.stayDuration} Days
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 mt-auto">
          <Button
            outline
            onClick={() => onViewDetails(reservation)}
            className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-[0.2em] border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="flex items-center justify-center gap-2">
              <IconEye size={14} />
              Details
            </span>
          </Button>
          
          {(reservation.status === 'RESERVED' || reservation.status === 'CONFIRMED') && (
            <Button
              onClick={() => onUpdateStatus(reservation.id, 'CHECKED_IN')}
              isLoading={isUpdating}
              className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest bg-blue-500 hover:bg-blue-600 text-white shadow-xl shadow-blue-500/20 group/btn"
            >
              <span className="flex items-center justify-center gap-2">
                <IconPlayerPlay size={14} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                Check In
              </span>
            </Button>
          )}

          {reservation.status === 'PENDING_PAYMENT' && (
             <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Awaiting Payment</span>
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
