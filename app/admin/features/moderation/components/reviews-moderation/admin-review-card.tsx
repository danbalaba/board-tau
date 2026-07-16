import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, ChevronRight, MessageSquare, Star, Quote, ArchiveRestore, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/app/admin/components/ui/button';
import SafeImage from '@/components/common/SafeImage';

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  pending: { color: 'text-amber-500', bg: 'bg-amber-500/10 border border-amber-500/20', icon: Clock },
  approved: { color: 'text-emerald-500', bg: 'bg-emerald-500/10 border border-emerald-500/20', icon: CheckCircle2 },
  rejected: { color: 'text-rose-500', bg: 'bg-rose-500/10 border border-rose-500/20', icon: XCircle },
  archived: { color: 'text-gray-500', bg: 'bg-gray-500/10 border border-gray-500/20', icon: ArchiveRestore },
};

interface AdminReviewCardProps {
  review: any;
  idx: number;
  viewMode: 'grid' | 'list';
  onViewDetails: () => void;
  handleDecision: (id: string, action: 'approve' | 'reject') => void;
  isDeciding?: boolean;
  onArchive?: (review: any) => void;
  onDelete?: (review: any) => void;
  isArchived?: boolean;
  isSuperAdmin?: boolean;
  isDeleting?: boolean;
}

export function AdminReviewCard({
  review,
  idx,
  viewMode,
  onViewDetails,
  handleDecision,
  isDeciding,
  onArchive,
  onDelete,
  isArchived,
  isSuperAdmin,
  isDeleting
}: AdminReviewCardProps) {
  const actualStatus = isArchived ? 'archived' : review.status;
  const config = statusConfig[actualStatus] || statusConfig.pending;
  const StatusIcon = config.icon;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-4 flex items-center gap-6 hover:shadow-2xl hover:border-amber-500/20 transition-all duration-500"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/15 dark:from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity duration-500 pointer-events-none" />
        
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-md">
          {review.user?.image ? (
            <SafeImage src={review.user.image} alt={review.user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-xl">
              {review.user?.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-black text-gray-900 dark:text-white truncate">{review.user?.name || 'Anonymous User'}</h3>
            <span className={cn("px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1", config.bg, config.color)}>
              <StatusIcon size={10} /> {actualStatus}
            </span>
          </div>
          <p className="text-xs font-bold text-gray-400 truncate flex items-center gap-1">
            <MessageSquare size={12} /> {review.listing?.title || 'Unknown Property'}
          </p>
        </div>

        <div className="hidden md:flex flex-col items-end shrink-0 px-4 border-r border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1 text-amber-500 mb-1">
            <Star size={14} className="fill-amber-500" />
            <span className="text-sm font-black">{review.rating?.toFixed(1) || '0.0'}</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Rating</p>
        </div>

        <div className="hidden md:block text-right shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Posted</p>
          <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
            {format(new Date(review.createdAt), 'MMM d, yyyy')}
          </p>
        </div>

        <div className="flex gap-2 shrink-0 ml-2">
          {isArchived ? (
            isSuperAdmin && onDelete && (
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onDelete(review); }}
                disabled={isDeleting}
                className="group/btn h-12 w-12 rounded-2xl border-rose-100 text-rose-500 hover:bg-rose-50 dark:border-rose-900/30 transition-all shrink-0"
                title="Delete Permanently"
              >
                <Trash2 size={20} className="group-hover/btn:rotate-12 transition-transform" />
              </Button>
            )
          ) : (
            onArchive && (
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onArchive(review); }}
                disabled={isDeciding}
                className="group/btn h-12 w-12 rounded-2xl border-amber-100 text-amber-500 hover:bg-amber-50 dark:border-amber-900/30 transition-all shrink-0"
                title="Archive"
              >
                <ArchiveRestore size={20} className="group-hover/btn:scale-110 transition-transform" />
              </Button>
            )
          )}
          <Button
            onClick={onViewDetails}
            className="shrink-0 h-12 w-12 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-amber-500 hover:text-white text-gray-500 transition-all"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.05 }}
      className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-amber-500/20 dark:hover:shadow-amber-500/10 hover:border-amber-500/20 transition-all duration-500 flex flex-col"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-500/15 dark:to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Top Banner Area */}
      <div className="h-24 bg-gray-50 dark:bg-gray-800 relative flex justify-between items-start p-4">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
        
        <span className={cn("relative z-10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm backdrop-blur-md", config.bg, config.color)}>
          <StatusIcon size={12} /> {actualStatus}
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); onArchive?.(review); }}
          disabled={isDeciding}
          className="relative z-10 p-2 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur shadow-sm text-gray-400 hover:text-amber-600 hover:bg-white dark:hover:bg-gray-900 transition-all border border-gray-100 dark:border-gray-800"
          title="Archive"
        >
          <ArchiveRestore size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Avatar Overlap */}
      <div className="px-6 relative -mt-10 mb-2">
        <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden shadow-xl border-4 border-white dark:border-gray-900 bg-white">
          {review.user?.image ? (
            <SafeImage src={review.user.image} alt={review.user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-3xl">
              {review.user?.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 flex-1 flex flex-col">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-gray-900 dark:text-white truncate mb-1">{review.user?.name || 'Anonymous User'}</h3>
            <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
              <div className="flex items-center gap-1 truncate">
                <MessageSquare size={14} />
                <span className="truncate">{review.listing?.title || 'Unknown Listing'}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500 shrink-0">
                <Star size={14} className="fill-amber-500" />
                <span>{review.rating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </div>

        {/* Comment Snippet */}
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 mb-4 relative overflow-hidden mt-4">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 italic line-clamp-3 relative z-10">
            "{review.comment || 'No comment provided.'}"
          </p>
        </div>

        <div className="mt-auto mb-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl flex justify-between items-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Date Posted</p>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {format(new Date(review.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        {review.status === 'pending' ? (
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex gap-2">
              <Button
                onClick={() => handleDecision(review.id, "approve")}
                disabled={isDeciding}
                className="flex-1 rounded-2xl py-6 h-auto text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 group/btn"
              >
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 size={14} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                  Approve
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDecision(review.id, "reject")}
                disabled={isDeciding}
                className="flex-1 rounded-2xl py-6 h-auto text-[10px] font-black uppercase tracking-widest border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:text-rose-400 dark:border-rose-900/30 group/btn"
              >
                <span className="flex items-center justify-center gap-2">
                  <XCircle size={14} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                  Reject
                </span>
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={onViewDetails}
              className="w-full py-5 h-auto rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border-gray-200 dark:border-gray-800 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-200 dark:hover:border-amber-500/30"
            >
              <span className="flex items-center justify-center gap-2">
                <Eye size={14} />
                Details
              </span>
            </Button>
          </div>
        ) : isArchived ? (
          <div className="flex flex-col gap-2 mb-6 mt-auto">
            <Button
              onClick={onViewDetails}
              className="w-full py-6 h-auto rounded-[1.25rem] bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm"
            >
              <span className="flex items-center justify-center gap-2">
                <ChevronRight size={16} />
                View Review
              </span>
            </Button>
            {isSuperAdmin && onDelete && (
              <Button
                variant="outline"
                onClick={() => onDelete(review)}
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
          <div className="flex gap-2 mb-6 mt-auto">
            <Button
              onClick={onViewDetails}
              className="flex-1 py-6 h-auto rounded-[1.25rem] bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-amber-500/20"
            >
              <span className="flex items-center justify-center gap-2">
                <ChevronRight size={16} />
                View
              </span>
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
