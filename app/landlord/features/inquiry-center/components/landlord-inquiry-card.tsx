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
import Button from '@/components/common/Button';
import { Inquiry } from '../hooks/use-inquiry-logic';
import Avatar from '@/components/common/Avatar';

interface LandlordInquiryCardProps {
  inquiry: Inquiry;
  idx: number;
  viewMode: 'grid' | 'list';
  handleRespond: (id: string, status: "APPROVED" | "REJECTED") => void;
  isResponding?: boolean;
  onArchive: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: () => void;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  REJECTED: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

const statusIcons: Record<string, any> = {
  PENDING: IconClock,
  APPROVED: IconCircleCheck,
  REJECTED: IconCircleX,
};

export function LandlordInquiryCard({
  inquiry,
  idx,
  viewMode,
  handleRespond,
  isResponding,
  onArchive,
  onReject,
  onViewDetails
}: LandlordInquiryCardProps) {
  const StatusIcon = statusIcons[inquiry.status] || IconClock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className={cn(
        "group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all duration-300 shadow-sm",
        viewMode === "grid" ? "flex flex-col p-6 rounded-3xl hover:shadow-xl hover:-translate-y-1" : "flex flex-col sm:flex-row gap-6 p-6 rounded-2xl hover:shadow-xl"
      )}
    >
      <div className={cn(
        "relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 z-10",
        viewMode === "grid" ? "h-44 mb-6 w-full" : "w-full sm:w-48 h-40"
      )}>
        {inquiry.listing.imageSrc ? (
          <img
            src={inquiry.listing.imageSrc}
            alt={inquiry.listing.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <IconMail size={40} strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute top-3 left-3 z-20">
          <span className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[8px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md",
            statusColors[inquiry.status] || "bg-white text-gray-800 border-gray-200"
          )}>
            <StatusIcon size={10} strokeWidth={3} />
            {inquiry.status}
          </span>
        </div>

      </div>

      <div className="flex-1 min-w-0 w-full z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 pr-4">
            <h3 className={cn(
              "font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 truncate",
              viewMode === "grid" ? "text-xl mb-3" : "text-lg mb-1"
            )}>
              {inquiry.listing.title}
            </h3>

            <div className="flex items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-2xl border border-gray-100/50 dark:border-gray-800 w-fit">
              <Avatar 
                src={inquiry.user.image} 
                name={inquiry.user.name} 
                className="w-10 h-10 rounded-xl" 
              />
              <div>
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 leading-none">Perspective Tenant</p>
                <p className="text-sm font-black text-gray-900 dark:text-gray-100 max-w-[150px] sm:max-w-[200px] truncate leading-none">{inquiry.user.name || 'Anonymous User'}</p>
              </div>
            </div>
          </div>
        </div>

        {inquiry.room && (
          <div className="flex items-center gap-3 mb-5 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Room Interest</p>
              <p className="text-xs font-black text-gray-900 dark:text-white truncate">{inquiry.room.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Rate</p>
              <p className="text-xs font-black text-primary">₱{inquiry.room.price.toLocaleString()}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          <div className="flex items-center gap-1.5">
            <IconCalendarEvent size={12} className="text-gray-300 dark:text-gray-600" />
            {new Date(inquiry.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
          <Button
            outline
            onClick={onViewDetails}
            className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
          >
            <span className="flex items-center justify-center gap-2">
              <IconEye size={14} />
              Details
            </span>
          </Button>

          {inquiry.status === "PENDING" && (
            <div className="flex gap-3 basis-[100%] sm:basis-auto flex-1">
              <Button
                onClick={() => handleRespond(inquiry.id, "APPROVED")}
                isLoading={isResponding}
                className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 group/btn"
              >
                <span className="flex items-center justify-center gap-2">
                  <IconCheck size={14} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                  Approve
                </span>
              </Button>
              <Button
                outline
                onClick={() => onReject(inquiry.id)}
                isLoading={isResponding}
                className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest border-rose-100 text-rose-500 hover:bg-rose-50 dark:border-rose-900/30 group/btn"
              >
                <span className="flex items-center justify-center gap-2">
                  <IconX size={14} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                  Reject
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <ArchiveButton inquiry={inquiry} onArchive={onArchive} />
    </motion.div>
  );
}

function ArchiveButton({ inquiry, onArchive }: { inquiry: Inquiry, onArchive: (id: string) => void }) {
  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onArchive(inquiry.id);
      }}
      className={cn(
        "absolute top-6 right-6 z-[60] p-2 rounded-xl backdrop-blur-md transition-all duration-300 shadow-lg border",
        inquiry.isArchived 
          ? "bg-emerald-500/80 text-white border-emerald-400/50 hover:bg-emerald-600" 
          : "bg-white/80 dark:bg-gray-900/80 text-gray-500 hover:text-rose-500 border-gray-100 dark:border-gray-800 hover:border-rose-100"
      )}
      title={inquiry.isArchived ? "Restore Inquiry" : "Archive Inquiry"}
    >
      {inquiry.isArchived ? (
        <IconRestore size={16} strokeWidth={2.5} />
      ) : (
        <IconArchive size={16} strokeWidth={2.5} />
      )}
    </button>
  );
}
