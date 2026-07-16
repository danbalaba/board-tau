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
import Button from "@/components/common/Button";
import { useRouter } from 'next/navigation';
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
        "absolute top-3 right-3 z-20 p-2 rounded-xl backdrop-blur-md transition-all duration-300 shadow-lg border",
        reservation.isArchived 
          ? "bg-emerald-500/80 text-white border-emerald-400/50 hover:bg-emerald-600" 
          : "bg-white/80 dark:bg-gray-900/80 text-gray-500 hover:text-rose-500 border-gray-100 dark:border-gray-800 hover:border-rose-100"
      )}
    >
      {reservation.isArchived ? (
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
          src={(reservation.room?.images && reservation.room.images.length > 0) 
            ? reservation.room.images[0].url 
            : (reservation.listing?.images && reservation.listing.images.length > 0)
              ? reservation.listing.images[0].url
              : reservation.listing?.imageSrc || "/images/placeholder.jpg"
          }
          alt={reservation.listing.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 z-20">
          <span className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md border",
            statusColors[reservation.status] || "bg-white/80 text-gray-800 border-gray-200"
          )}>
            {reservation.status.replace('_', ' ')}
          </span>
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
              {reservation.listing.title}
            </h3>
            
            <div className="flex items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-2xl border border-gray-100/50 dark:border-gray-800 w-fit">
              {reservation.isWalkIn ? (
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
                  {reservation.guestName?.charAt(0)?.toUpperCase() || 'W'}
                </div>
              ) : (
                <Avatar 
                  src={reservation.user?.image} 
                  name={reservation.user?.name} 
                  className="w-10 h-10 rounded-xl" 
                />
              )}
              <div>
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 leading-none">
                  {reservation.isWalkIn ? 'Walk-in Guest' : 'Perspective Tenant'}
                </p>
                <p className="text-sm font-black text-gray-900 dark:text-gray-100 max-w-[150px] sm:max-w-[200px] truncate leading-none">
                  {reservation.isWalkIn ? reservation.guestName : (reservation.user?.name || 'Anonymous')}
                </p>
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

        {isGrid && (
          <div className="flex items-center gap-2 pt-6 border-t border-gray-100 dark:border-gray-800 mt-auto w-full">
            <Button
              outline
              onClick={() => onViewDetails(reservation)}
              className="flex-1 rounded-2xl py-3 px-1 text-[10px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="flex items-center justify-center gap-1.5">
                <IconEye size={14} />
                <span className="hidden sm:inline">Details</span>
              </span>
            </Button>
            
            {(reservation.status === 'RESERVED' || reservation.status === 'CONFIRMED') && (
              <Button
                onClick={() => onUpdateStatus(reservation.id, 'CHECKED_IN')}
                isLoading={isUpdating}
                className="flex-1 rounded-2xl py-3 px-1 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 group/btn"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <IconPlayerPlay size={14} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                  Check In
                </span>
              </Button>
            )}

            {reservation.status === 'PENDING_PAYMENT' && (
              reservation.isWalkIn ? (
                <Button
                  onClick={() => onUpdateStatus(reservation.id, 'RESERVED')}
                  isLoading={isUpdating}
                  className="flex-1 rounded-2xl py-3 px-1 text-[10px] font-black uppercase tracking-widest bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/20 group/btn"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <IconCheck size={14} className="group-hover:scale-110 transition-transform" />
                    Confirm Payment
                  </span>
                </Button>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-1.5 px-1 py-3 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                   <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest text-center leading-none">Awaiting Payment</span>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {!isGrid && (
        <div className="flex sm:flex-col gap-4 w-full lg:w-44 mt-6 lg:mt-0 pt-8 lg:pt-0 lg:border-l border-gray-100 dark:border-gray-800 lg:pl-8 shrink-0">
          <Button
            onClick={() => onViewDetails(reservation)}
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
                reservation.isArchived 
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white" 
                  : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 hover:bg-amber-600 hover:text-white"
              )}
              title={reservation.isArchived ? "Restore Reservation" : "Archive Reservation"}
            >
              {reservation.isArchived ? (
                <IconRestore size={18} className="group-hover/btn:-rotate-45 transition-transform" />
              ) : (
                <IconArchive size={18} className="group-hover/btn:scale-110 transition-transform" />
              )}
            </button>

            {(reservation.status === 'RESERVED' || reservation.status === 'CONFIRMED') && (
              <button
                onClick={() => onUpdateStatus(reservation.id, 'CHECKED_IN')}
                className="flex-1 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center group/btn shadow-sm border border-blue-100 dark:border-blue-900/30"
                title="Check In"
              >
                <IconPlayerPlay size={18} fill="currentColor" className="group-hover/btn:scale-110 transition-transform" />
              </button>
            )}

            {reservation.status === 'PENDING_PAYMENT' && reservation.isWalkIn && (
              <button
                onClick={() => onUpdateStatus(reservation.id, 'RESERVED')}
                className="flex-1 rounded-2xl bg-amber-500/10 text-amber-600 hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center group/btn shadow-sm border border-amber-500/30"
                title="Confirm Payment"
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
