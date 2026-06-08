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
  onDelete,
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
        viewMode === "grid" ? "flex flex-col p-6 rounded-[2rem] hover:shadow-xl hover:-translate-y-1" : "flex flex-col lg:flex-row items-center gap-8 p-8 rounded-[2.5rem] hover:shadow-xl"
      )}
    >


      <div className={cn(
        "relative rounded-[2rem] overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 z-10",
        viewMode === "grid" ? "h-44 mb-6 w-full" : "w-full lg:w-64 h-48"
      )}>
        <SafeImage
          src={(inquiry.room?.images && inquiry.room.images.length > 0) 
            ? inquiry.room.images[0].url 
            : (inquiry.listing?.images && inquiry.listing.images.length > 0)
              ? inquiry.listing.images[0].url
              : inquiry.listing?.imageSrc || "/images/placeholder.jpg"
          }
          alt={inquiry.listing.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute top-4 left-4 z-20">
          <span className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[8px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md",
            statusColors[inquiry.status] || "bg-white text-gray-800 border-gray-200"
          )}>
            <StatusIcon size={10} strokeWidth={3} />
            {inquiry.status}
          </span>
        </div>

        {viewMode === "grid" && <ArchiveButton inquiry={inquiry} onArchive={onArchive} onDelete={onDelete} />}
      </div>

      <div className="flex-1 min-w-0 w-full z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 pr-4">
            <h3 className={cn(
              "font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 truncate",
              viewMode === "grid" ? "text-xl mb-3" : "text-2xl mb-1"
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
          <div className="flex items-center gap-4 mb-5 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-800">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Room Interest</p>
              <p className="text-sm font-black text-gray-900 dark:text-white truncate">{inquiry.room.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rate</p>
              <p className="text-lg font-black text-primary leading-none">₱{inquiry.room.price.toLocaleString()}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          <div className="flex items-center gap-1.5">
            <IconCalendarEvent size={12} className="text-gray-300 dark:text-gray-600" />
            Received: {new Date(inquiry.createdAt).toLocaleDateString()}
          </div>
        </div>

        {viewMode === "grid" && (
          <div className="flex items-center gap-2 pt-6 border-t border-gray-100 dark:border-gray-800 mt-auto w-full">
            <Button
              outline
              onClick={onViewDetails}
              className="flex-1 rounded-2xl py-3 px-1 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <span className="flex items-center justify-center gap-1.5">
                <IconEye size={14} />
                <span className="hidden sm:inline">Details</span>
              </span>
            </Button>

            {inquiry.status === "PENDING" && !inquiry.isArchived && (
              <div className="flex gap-2 flex-[2]">
                <Button
                  onClick={() => handleRespond(inquiry.id, "APPROVED")}
                  isLoading={isResponding}
                  className="flex-1 rounded-2xl py-3 px-1 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 group/btn"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <IconCheck size={14} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                    Approve
                  </span>
                </Button>
                <Button
                  outline
                  onClick={() => onReject(inquiry.id)}
                  isLoading={isResponding}
                  className="flex-1 rounded-2xl py-3 px-1 text-[10px] font-black uppercase tracking-widest border-rose-100 text-rose-500 hover:bg-rose-50 dark:border-rose-900/30 group/btn"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <IconX size={14} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                    Reject
                  </span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {viewMode === "list" && (
        <div className="flex sm:flex-col gap-4 w-full lg:w-44 mt-6 lg:mt-0 pt-8 lg:pt-0 lg:border-l border-gray-100 dark:border-gray-800 lg:pl-8 shrink-0">
          <Button
            onClick={onViewDetails}
            className="w-full rounded-2xl h-14 bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 group/btn transition-all border-b-4 border-primary/30 active:border-b-0"
          >
            <span className="flex items-center justify-center gap-3">
              <IconEye size={16} className="group-hover/btn:scale-110 transition-transform" />
              Manage
            </span>
          </Button>

          <div className="flex gap-2 w-full h-12">
            <button
              onClick={() => onArchive(inquiry.id)}
              className={cn(
                "flex-1 rounded-2xl transition-all flex items-center justify-center group/btn shadow-sm border",
                inquiry.isArchived 
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white" 
                  : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 hover:bg-amber-600 hover:text-white"
              )}
              title={inquiry.isArchived ? "Restore Inquiry" : "Archive Inquiry"}
            >
              {inquiry.isArchived ? (
                <IconRestore size={18} className="group-hover/btn:-rotate-45 transition-transform" />
              ) : (
                <IconArchive size={18} className="group-hover/btn:scale-110 transition-transform" />
              )}
            </button>

            {inquiry.isArchived && (
              <button
                onClick={() => onDelete(inquiry)}
                className="flex-1 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center group/btn shadow-sm border border-rose-100 dark:border-rose-900/30"
                title="Permanently Delete (Purge Files)"
              >
                <IconTrash size={18} className="group-hover/btn:rotate-12 transition-transform" />
              </button>
            )}
          </div>
        </div>
      )}
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
            ? "bg-emerald-500/80 text-white border-emerald-400/50 hover:bg-emerald-600" 
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
          className="p-2 rounded-xl bg-rose-500/80 text-white border-rose-400/50 hover:bg-rose-600 backdrop-blur-md transition-all duration-300 shadow-lg border"
          title="Permanently Delete"
        >
          <IconTrash size={14} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
