'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconUser, 
  IconCalendarEvent, 
  IconCheck, 
  IconX, 
  IconMail,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconEye,
  IconBuildingCommunity
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/admin/components/ui/button';
import SafeImage from '@/components/common/SafeImage';

interface AdminListingCardProps {
  listing: any;
  idx: number;
  viewMode: 'grid' | 'list';
  handleDecision: (id: string, action: "approve" | "reject") => void;
  isDeciding?: boolean;
  onViewDetails: () => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

const statusIcons: Record<string, any> = {
  pending: IconClock,
  approved: IconCircleCheck,
  active: IconCircleCheck,
  rejected: IconCircleX,
};

export function AdminListingCard({
  listing,
  idx,
  viewMode,
  handleDecision,
  isDeciding,
  onViewDetails
}: AdminListingCardProps) {
  const StatusIcon = statusIcons[listing.status] || IconClock;
  const imageUrl = listing.images?.[0] || listing.imageSrc;

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
        {imageUrl ? (
          <SafeImage
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <IconBuildingCommunity size={40} strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute top-4 left-4 z-20">
          <span className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[8px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md",
            statusColors[listing.status] || "bg-white text-gray-800 border-gray-200"
          )}>
            <StatusIcon size={10} strokeWidth={3} />
            {listing.status}
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0 w-full z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 pr-4">
            <h3 className={cn(
              "font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 truncate",
              viewMode === "grid" ? "text-xl mb-3" : "text-2xl mb-1"
            )}>
              {listing.title}
            </h3>

            <div className="flex items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-2xl border border-gray-100/50 dark:border-gray-800 w-fit">
              {listing.user?.image ? (
                <SafeImage 
                  src={listing.user.image} 
                  alt={listing.user.name} 
                  className="w-10 h-10 rounded-xl object-cover" 
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {listing.user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 leading-none">Property Owner</p>
                <p className="text-sm font-black text-gray-900 dark:text-gray-100 max-w-[150px] sm:max-w-[200px] truncate leading-none">{listing.user?.name || 'Unknown User'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-5 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-800">
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Category</p>
            <p className="text-sm font-black text-gray-900 dark:text-white truncate uppercase">{listing.category || 'Standard'}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Starting Rate</p>
            <p className="text-lg font-black text-primary leading-none">₱{listing.price?.toLocaleString() || '0'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          <div className="flex items-center gap-1.5">
            <IconCalendarEvent size={12} className="text-gray-300 dark:text-gray-600" />
            Submitted: {new Date(listing.createdAt).toLocaleDateString()}
          </div>
        </div>

        {viewMode === "grid" && (
          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 mt-auto">
            <Button
              variant="outline"
              onClick={onViewDetails}
              className="flex-1 rounded-2xl py-6 h-auto text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <span className="flex items-center justify-center gap-2">
                <IconEye size={14} />
                Details
              </span>
            </Button>

            {listing.status === "pending" && (
              <div className="flex gap-3 basis-[100%] sm:basis-auto flex-1">
                <Button
                  onClick={() => handleDecision(listing.id, "approve")}
                  disabled={isDeciding}
                  className="flex-1 rounded-2xl py-6 h-auto text-[10px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 group/btn"
                >
                  <span className="flex items-center justify-center gap-2">
                    <IconCheck size={14} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                    Authorize
                  </span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDecision(listing.id, "reject")}
                  disabled={isDeciding}
                  className="flex-1 rounded-2xl py-6 h-auto text-[10px] font-black uppercase tracking-widest border-rose-100 text-rose-500 hover:bg-rose-50 dark:border-rose-900/30 group/btn"
                >
                  <span className="flex items-center justify-center gap-2">
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
              Inspect
            </span>
          </Button>
        </div>
      )}
    </motion.div>
  );
}
