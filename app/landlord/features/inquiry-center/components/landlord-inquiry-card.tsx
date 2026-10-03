'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconUser, 
  IconCalendarEvent, 
  IconMessage, 
  IconCheck, 
  IconX, 
  IconMail,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconArchive,
  IconRestore,
  IconTrash,
  IconEye
} from '@tabler/icons-react';
import { cn } from '@/utils/helper';
import { formatDate } from '@/lib/utils';
import Button from '@/components/common/Button';
import { Inquiry } from '../hooks/use-inquiry-logic';
import Avatar from '@/components/common/Avatar';
import SafeImage from '@/components/common/SafeImage';

interface LandlordInquiryCardProps {
  inquiry: Inquiry;
  idx: number;
  viewMode: 'grid' | 'list';
  handleRespond: (id: string, status: "APPROVED" | "REJECTED") => void;
  isResponding?: boolean;
  onArchive: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (inquiry: Inquiry) => void;
  onViewDetails: () => void;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/90 text-white border-amber-400/50 shadow-amber-500/20",
  APPROVED: "bg-emerald-500/90 text-white border-emerald-400/50 shadow-emerald-500/20",
  REJECTED: "bg-rose-500/90 text-white border-rose-400/50 shadow-rose-500/20",
};

export function LandlordInquiryCard({
  inquiry,
  idx,
  viewMode,
  handleRespond,
  isResponding,
  onArchive,
  onReject,
  onDelete,
  onViewDetails
}: LandlordInquiryCardProps) {
  const isGrid = viewMode === 'grid';

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: idx * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] } as any
    }
  };

  const getInquiryImage = () => {
    if (inquiry.room?.images && inquiry.room.images.length > 0) return inquiry.room.images[0].url;
    if (inquiry.listing?.images && inquiry.listing.images.length > 0) {
      const img = inquiry.listing.images[0];
      return typeof img === 'string' ? img : (img as any).url;
    }
    return inquiry.listing?.imageSrc || "/images/placeholder.jpg";
  };

  const reservationStatus = (inquiry as any).reservations?.[0]?.status;

  const getDisplayBadge = () => {
    if (reservationStatus === "COMPLETED") {
      return { label: "COMPLETED", colorClass: "bg-purple-600 text-white border-white/30 shadow-md" };
    }
    if (reservationStatus === "CHECKED_IN") {
      return { label: "CHECKED IN", colorClass: "bg-emerald-600 text-white border-white/30 shadow-md" };
    }
    if (reservationStatus === "CANCELLED") {
      return { label: "CANCELLED", colorClass: "bg-gray-600 text-white border-white/30 shadow-md" };
    }
    return {
      label: inquiry.status,
      colorClass: statusColors[inquiry.status] || "bg-primary/90 text-white border-primary/40"
    };
  };

  const badge = getDisplayBadge();

  if (isGrid) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-2.5 sm:p-6 rounded-2xl sm:rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col h-full"
      >
        {/* Thumbnail Section */}
        <div className="relative h-28 sm:h-48 w-full rounded-xl sm:rounded-2xl overflow-hidden mb-2.5 sm:mb-6 bg-gray-100 dark:bg-gray-800 z-10 flex-shrink-0">
          <SafeImage
            src={getInquiryImage()}
            alt={inquiry.listing.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Dynamic Status Badge */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 scale-90 sm:scale-100 origin-top-left">
            <span className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] uppercase font-black tracking-wider shadow-lg backdrop-blur-md border",
              badge.colorClass
            )}>
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {badge.label}
            </span>
          </div>

          <ArchiveButton inquiry={inquiry} onArchive={onArchive} onDelete={onDelete} />
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col z-10">
          <div className="mb-2 sm:mb-4">
            <h3 className="text-xs sm:text-xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-1 tracking-tight mb-1.5 sm:mb-3">
              {inquiry.listing.title}
            </h3>

            <div className="flex items-center gap-2 mb-2 sm:mb-4 bg-gray-50 dark:bg-gray-800/50 p-1.5 sm:p-2.5 rounded-lg sm:rounded-2xl border border-gray-100/50 dark:border-gray-800 w-fit">
              <Avatar 
                src={inquiry.user.image} 
                name={inquiry.user.name} 
                className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl shrink-0" 
              />
              <div className="min-w-0">
                <p className="text-[7px] sm:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 leading-none">Perspective Tenant</p>
                <p className="text-[10px] sm:text-sm font-black text-gray-900 dark:text-gray-100 max-w-[100px] sm:max-w-[200px] truncate leading-none">{inquiry.user.name || 'Anonymous User'}</p>
              </div>
            </div>
          </div>

          {inquiry.room && (
            <div className="flex items-center gap-2 mb-2.5 sm:mb-4 bg-gray-50 dark:bg-gray-800/50 p-1.5 sm:p-3 rounded-lg sm:rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex-1 min-w-0">
                <p className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1 leading-none">Room Interest</p>
                <div className="flex items-center gap-1 flex-wrap">
                  <p className="text-[10px] sm:text-xs font-black text-gray-900 dark:text-white truncate leading-none">{inquiry.room.name}</p>
                  {inquiry.isSoloBuyout && (
                    <span className="px-1 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[6px] sm:text-[7px] font-black uppercase tracking-widest whitespace-nowrap">
                      Solo
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1 leading-none">Rate</p>
                <p className="text-xs sm:text-base font-black text-primary leading-none">₱{inquiry.room.price.toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 sm:mb-4 px-0.5">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <IconCalendarEvent size={10} className="text-gray-300 dark:text-gray-600 sm:w-3 sm:h-3" />
              <span>{formatDate(inquiry.createdAt)}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-2.5 sm:pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto w-full">
            <Button
              onClick={onViewDetails}
              className={cn(
                "h-10 rounded-xl px-2 text-[10px] sm:text-xs font-black uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-700/60",
                (inquiry.status === "PENDING" && !inquiry.isArchived) ? "w-full sm:flex-1" : "w-full"
              )}
            >
              <IconEye size={14} />
              <span>Details</span>
            </Button>

            {inquiry.status === "PENDING" && !inquiry.isArchived && (
              <div className="hidden sm:flex gap-1.5 sm:gap-2 flex-1 min-w-0">
                <Button
                  onClick={() => handleRespond(inquiry.id, "APPROVED")}
                  isLoading={isResponding}
                  className="flex-1 h-10 rounded-xl px-2 text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 group/btn cursor-pointer flex items-center justify-center gap-1"
                >
                  <IconCheck size={14} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                  <span>Approve</span>
                </Button>
                <button
                  onClick={() => onReject(inquiry.id)}
                  title="Reject Inquiry"
                  className="h-10 px-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-500 hover:text-white transition-all group/btn cursor-pointer flex items-center justify-center shrink-0"
                >
                  <IconX size={15} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>
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
              src={getInquiryImage()}
              alt={inquiry.listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute top-1 left-1 sm:top-2.5 sm:left-2.5 z-20">
              <span className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 sm:px-2 rounded-md sm:rounded-lg text-[7px] sm:text-[8px] uppercase font-black tracking-wider shadow-lg backdrop-blur-md border",
                statusColors[inquiry.status] || "bg-primary/90 text-white border-primary/40"
              )}>
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current animate-pulse" />
                {inquiry.status}
              </span>
            </div>
          </div>

          {/* Main Details */}
          <div className="flex-1 min-w-0 space-y-1 sm:space-y-3">
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                <span className="text-[8px] sm:text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 truncate max-w-[130px] sm:max-w-none">
                  <IconMail size={10} className="shrink-0" /> Inquiry #{inquiry.id.slice(-5)}
                </span>
                <span className="hidden sm:inline-block w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <span className="hidden sm:inline-block text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  Received: {formatDate(inquiry.createdAt)}
                </span>
              </div>
              <h3 className="text-sm sm:text-xl font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate tracking-tight">
                {inquiry.listing.title}
              </h3>
            </div>

            {/* Tenant info & Room interest row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] sm:text-xs font-black text-gray-900 dark:text-gray-100">
                {inquiry.user.name || 'Anonymous Tenant'}
              </span>
              {inquiry.room && (
                <span className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-wider">
                  • {inquiry.room.name} (₱{inquiry.room.price.toLocaleString()}/mo)
                </span>
              )}
            </div>

            {/* Desktop Specs Pills */}
            <div className="hidden sm:flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50/60 dark:bg-blue-500/10 rounded-xl border border-blue-100/60 dark:border-blue-500/20 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase">
                <IconUser size={12} /> 
                <span>{inquiry.user.name || 'Tenant'}</span>
              </div>
              {inquiry.room && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 dark:bg-primary/20 rounded-xl border border-primary/20 text-[9px] font-black text-primary dark:text-primary-400 uppercase">
                  <span>Room: {inquiry.room.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right / Actions Row */}
        <div className="flex sm:flex-col items-center gap-1.5 sm:gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 pt-2.5 sm:pt-0 sm:pl-6">
          <button 
            onClick={onViewDetails} 
            className="flex-1 sm:w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-primary transition-all flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest cursor-pointer"
          >
            <IconEye size={13} />
            <span>Details</span>
          </button>

          <button
            onClick={() => onArchive(inquiry.id)}
            className={cn(
              "flex-1 sm:w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer border shadow-xs",
              inquiry.isArchived
                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
            )}
            title={inquiry.isArchived ? "Restore Inquiry" : "Archive Inquiry"}
          >
            {inquiry.isArchived ? (
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

          {inquiry.isArchived && (
            <button
              onClick={() => onDelete(inquiry)}
              className="flex-1 sm:w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest cursor-pointer border border-rose-100 dark:border-rose-900/30"
              title="Delete Permanently"
            >
              <IconTrash size={13} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ArchiveButton({ 
  inquiry, 
  onArchive,
  onDelete
}: { 
  inquiry: Inquiry, 
  onArchive: (id: string) => void,
  onDelete: (inquiry: Inquiry) => void 
}) {
  return (
    <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onArchive(inquiry.id);
        }}
        className={cn(
          "p-2 rounded-xl backdrop-blur-md transition-all duration-300 shadow-lg border",
          inquiry.isArchived 
            ? "bg-primary/90 text-white border-primary/40 hover:bg-primary" 
            : "bg-white/80 dark:bg-gray-900/80 text-gray-500 hover:text-amber-500 border-gray-100 dark:border-gray-800 hover:border-amber-100"
        )}
        title={inquiry.isArchived ? "Restore Inquiry" : "Archive Inquiry"}
      >
        {inquiry.isArchived ? (
          <IconRestore size={14} strokeWidth={2.5} />
        ) : (
          <IconArchive size={14} strokeWidth={2.5} />
        )}
      </button>

      {inquiry.isArchived && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(inquiry);
          }}
          className="p-2 rounded-xl bg-rose-500/90 text-white border-rose-400/50 hover:bg-rose-600 backdrop-blur-md transition-all duration-300 shadow-lg border"
          title="Permanently Delete"
        >
          <IconTrash size={14} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

