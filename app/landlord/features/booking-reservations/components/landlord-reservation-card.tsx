'use client';

import React from 'react';
import { 
  IconCalendar, 
  IconClock, 
  IconEye, 
  IconCheck, 
  IconX 
} from '@tabler/icons-react';
import { cn } from '@/utils/helper';
import Button from "@/components/common/Button";
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ReservationRequest } from '../hooks/use-reservation-logic';

interface LandlordReservationCardProps {
  reservation: ReservationRequest;
  idx: number;
  viewMode: 'grid' | 'list';
  handleRespond: (id: string, status: 'approved' | 'rejected') => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  approved: 'bg-green-500/10 text-green-600 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const paymentStatusColors: Record<string, string> = {
  unpaid: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
  paid: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
};

export function LandlordReservationCard({
  reservation,
  idx,
  viewMode,
  handleRespond
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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-primary/20 transition-all duration-300 shadow-sm flex",
        isGrid ? "flex-col p-6 rounded-3xl hover:shadow-xl" : "flex-row p-6 rounded-2xl hover:shadow-xl"
      )}
    >
      <div className={cn("hidden md:block", isGrid ? "w-full mb-6" : "w-auto")}>
        <div className={cn(
          "relative rounded-2xl overflow-hidden",
          isGrid ? "h-44" : "w-20 h-20 flex-shrink-0"
        )}>
          {reservation.listing.imageSrc ? (
            <img
              src={reservation.listing.imageSrc}
              alt={reservation.listing.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
              <IconCalendar size={isGrid ? 32 : 24} />
            </div>
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            <span className={cn("px-2 py-0.5 rounded-lg text-[8px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md", statusColors[reservation.status])}>
              {reservation.status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className={cn("flex flex-col", !isGrid && "md:flex-row md:items-center justify-between gap-6")}>
          <div className="flex-1 min-w-0">
            <h3 className={cn("font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 truncate", isGrid ? "text-xl mb-3" : "text-lg mb-1")}>
              {reservation.listing.title}
            </h3>
            
            <div className={cn("flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50", isGrid ? "mb-6 p-3" : "mb-2")}>
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black shrink-0">
                {reservation.user.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 overflow-hidden">
                <p className="text-xs font-black text-gray-900 dark:text-gray-100 truncate">{reservation.user.name || 'Anonymous'}</p>
                {isGrid && <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{reservation.user.email}</p>}
              </div>
            </div>

            <div className={cn("grid gap-4", isGrid ? "grid-cols-2 mb-6" : "flex flex-wrap items-center text-xs font-bold text-gray-500 dark:text-gray-400 mb-2")}>
              <div className="flex flex-col gap-1">
                {isGrid && <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Move In</span>}
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                  <IconCalendar size={12} className="text-primary" />
                  {new Date(reservation.moveInDate).toLocaleDateString()}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {isGrid && <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Stay</span>}
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                  <IconClock size={12} className="text-primary" />
                  {reservation.stayDuration} days
                </div>
              </div>
            </div>
          </div>

          <div className={cn("flex", isGrid ? "flex-col gap-2 pt-4 border-t border-gray-100 dark:border-gray-800" : "md:items-center p-0 pt-0 border-none")}>
            <Button
              outline
              onClick={() => router.push(`/landlord/reservations/${reservation.id}`)}
              className={cn("rounded-xl py-2 text-[10px] font-black uppercase tracking-widest px-4", isGrid ? "w-full" : "")}
            >
              {isGrid ? "Manage Request" : <IconEye size={16} />}
            </Button>
            
            {reservation.status === 'pending' && (
              <div className={cn("grid gap-2", isGrid ? "grid-cols-2" : "flex")}>
                <Button
                  onClick={() => handleRespond(reservation.id, 'approved')}
                  className="rounded-xl py-2 px-4 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                >
                  {isGrid ? "Approve" : <IconCheck size={16} />}
                </Button>
                <Button
                  outline
                  onClick={() => handleRespond(reservation.id, 'rejected')}
                  className="rounded-xl py-2 px-4 border-red-200 text-red-500"
                >
                  {isGrid ? "Reject" : <IconX size={16} />}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
