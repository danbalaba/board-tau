'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconCalendarEvent, 
  IconCircleCheck,
  IconCircleX,
  IconEye,
  IconBuildingCommunity
} from '@tabler/icons-react';
import { ArchiveRestore, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/admin/components/ui/button';
import SafeImage from '@/components/common/SafeImage';

interface AdminListingCardProps {
  listing: any;
  idx: number;
  viewMode: 'grid' | 'list';
  onApprove: () => void;
  onReject: () => void;
  isDeciding?: boolean;
  onViewDetails: () => void;
  onArchive?: (listing: any) => void;
  onDelete?: (listing: any) => void;
  isArchived?: boolean;
  isSuperAdmin?: boolean;
  isDeleting?: boolean;
}

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  pending: { color: 'text-amber-500', bg: 'bg-amber-500/10 border border-amber-500/20', icon: Clock },
  approved: { color: 'text-emerald-500', bg: 'bg-emerald-500/10 border border-emerald-500/20', icon: CheckCircle2 },
  active: { color: 'text-emerald-500', bg: 'bg-emerald-500/10 border border-emerald-500/20', icon: CheckCircle2 },
  rejected: { color: 'text-rose-500', bg: 'bg-rose-500/10 border border-rose-500/20', icon: XCircle },
  archived: { color: 'text-gray-500', bg: 'bg-gray-500/10 border border-gray-500/20', icon: ArchiveRestore },
};

export function AdminListingCard({
  listing,
  idx,
  viewMode,
  onApprove,
  onReject,
  isDeciding,
  onViewDetails,
  onArchive,
  onDelete,
  isArchived,
  isSuperAdmin,
  isDeleting
}: AdminListingCardProps) {
  const actualStatus = isArchived ? 'archived' : listing.status;
  const config = statusConfig[actualStatus] || statusConfig.pending;
  const StatusIcon = config.icon;
  const imageUrl = listing.images?.[0] || listing.imageSrc;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className={cn(
        "group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all duration-500 shadow-sm overflow-hidden",
        viewMode === "grid"
          ? "flex flex-col p-6 rounded-[2rem] hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10 hover:border-blue-500/20 hover:-translate-y-1"
          : "flex flex-col lg:flex-row items-center gap-8 p-8 rounded-[2.5rem] hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10 hover:border-blue-500/20"
      )}
    >
      {/* Hover Gradient Overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0",
        viewMode === "grid" ? "bg-gradient-to-b from-transparent to-blue-500/15 dark:to-blue-500/10" : "bg-gradient-to-r from-blue-500/15 dark:from-blue-500/10 to-transparent"
      )} />

      {/* Image / Thumbnail */}
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

        {/* Status Badge — top left */}
        <div className="absolute top-4 left-4 z-20">
          <span className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md",
            config.bg, config.color
          )}>
            <StatusIcon size={12} strokeWidth={2} />
            {actualStatus}
          </span>
        </div>

        {/* Archive Button — top right */}
        {!isArchived && onArchive && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={(e) => { e.stopPropagation(); onArchive(listing); }}
              disabled={isDeciding}
              className="p-2 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur shadow-sm text-gray-500 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-900 transition-all border border-white/20 dark:border-gray-800"
              title="Archive"
            >
              <ArchiveRestore size={14} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
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

        {/* Grid View Actions */}
        {viewMode === "grid" && (
          <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
            {listing.status === "pending" ? (
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex gap-2">
                  <Button
                    onClick={onApprove}
                    disabled={isDeciding}
                    className="flex-1 rounded-2xl py-6 h-auto text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 group/btn"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <IconCircleCheck size={14} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                      Approve
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onReject}
                    disabled={isDeciding}
                    className="flex-1 rounded-2xl py-6 h-auto text-[10px] font-black uppercase tracking-widest border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:text-rose-400 dark:border-rose-900/30 group/btn"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <IconCircleX size={14} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                      Reject
                    </span>
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={onViewDetails}
                  className="w-full py-5 h-auto rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-500/30"
                >
                  <span className="flex items-center justify-center gap-2">
                    <IconEye size={14} />
                    Details
                  </span>
                </Button>
              </div>
            ) : isArchived ? (
              <div className="flex flex-col gap-2 mb-2 mt-auto">
                <Button
                  onClick={onViewDetails}
                  className="w-full py-6 h-auto rounded-[1.25rem] bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm"
                >
                  <span className="flex items-center justify-center gap-2">
                    <IconEye size={16} />
                    View Listing
                  </span>
                </Button>
                {isSuperAdmin && onDelete && (
                  <Button
                    variant="outline"
                    onClick={() => onDelete(listing)}
                    disabled={isDeleting}
                    className="group/btn w-full py-5 h-auto rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border-rose-200 dark:border-rose-900/30 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Trash2 size={16} className="group-hover/btn:rotate-12 transition-transform" />
                      Delete Permanently
                    </span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex gap-2 mb-2 mt-auto">
                <Button
                  onClick={onViewDetails}
                  className="flex-1 py-6 h-auto rounded-[1.25rem] bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/20"
                >
                  <span className="flex items-center justify-center gap-2">
                    <IconEye size={16} />
                    View
                  </span>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* List View Actions */}
        {viewMode === "list" && (
          <div className="flex sm:flex-col gap-4 w-full lg:w-44 mt-6 lg:mt-0 pt-8 lg:pt-0 lg:border-l border-gray-100 dark:border-gray-800 lg:pl-8 shrink-0">
            <Button
              onClick={onViewDetails}
              className="w-full rounded-2xl h-14 bg-blue-500 hover:bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-500/20 group/btn transition-all border-b-4 border-blue-600/30 active:border-b-0"
            >
              <span className="flex items-center justify-center gap-3">
                <IconEye size={16} className="group-hover/btn:scale-110 transition-transform" />
                Inspect
              </span>
            </Button>

            <div className="flex gap-2 w-full">
              {isArchived ? (
                isSuperAdmin && onDelete && (
                  <Button
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); onDelete(listing); }}
                    disabled={isDeleting}
                    className="group/btn flex-1 h-12 rounded-xl border-rose-100 text-rose-500 hover:bg-rose-50 dark:border-rose-900/30 transition-all shrink-0"
                    title="Delete Permanently"
                  >
                    <Trash2 size={16} className="group-hover/btn:rotate-12 transition-transform" />
                  </Button>
                )
              ) : (
                onArchive && (
                  <Button
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); onArchive(listing); }}
                    disabled={isDeciding}
                    className="group/btn flex-1 h-12 rounded-xl border-amber-100 text-amber-500 hover:bg-amber-50 dark:border-amber-900/30 transition-all shrink-0"
                    title="Archive"
                  >
                    <ArchiveRestore size={16} className="group-hover/btn:scale-110 transition-transform" />
                  </Button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
