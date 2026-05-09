import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Shield, ChevronRight, MessageSquare, Star, Quote } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/app/admin/components/ui/button';
import SafeImage from '@/components/common/SafeImage';

const statusConfig: Record<string, { color: string; icon: any; bg: string }> = {
  pending: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: ShieldAlert },
  approved: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: ShieldCheck },
  rejected: { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: Shield },
};

interface AdminReviewCardProps {
  review: any;
  idx: number;
  viewMode: 'grid' | 'list';
  onViewDetails: () => void;
  handleDecision: (id: string, action: 'approve' | 'reject') => void;
  isDeciding?: boolean;
}

export function AdminReviewCard({
  review,
  idx,
  viewMode,
  onViewDetails,
  handleDecision,
  isDeciding
}: AdminReviewCardProps) {
  const config = statusConfig[review.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-4 flex items-center gap-6 hover:shadow-2xl hover:border-amber-500/20 transition-all duration-500"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity duration-500 pointer-events-none" />
        
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
              <StatusIcon size={10} /> {review.status}
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

        <Button
          onClick={onViewDetails}
          className="shrink-0 h-12 w-12 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-amber-500 hover:text-white text-gray-500 transition-all ml-2"
        >
          <ChevronRight size={20} />
        </Button>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.05 }}
      className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-amber-500/5 hover:border-amber-500/20 transition-all duration-500 flex flex-col"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Top Banner Area */}
      <div className="h-24 bg-gray-50 dark:bg-gray-800 relative flex justify-between items-start p-4">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
        
        <div className="relative z-10 flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur px-3 py-1.5 rounded-xl shadow-sm">
          <Star size={14} className="text-amber-500 fill-amber-500" />
          <span className="text-sm font-black text-gray-900 dark:text-white">{review.rating?.toFixed(1) || '0.0'}</span>
        </div>

        <span className={cn("relative z-10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm backdrop-blur-md", config.bg, config.color)}>
          <StatusIcon size={12} /> {review.status}
        </span>
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
        <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-1 truncate">
          {review.user?.name || 'Anonymous User'}
        </h3>
        <p className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-1.5 truncate">
          <MessageSquare size={14} /> {review.listing?.title || 'Unknown Property'}
        </p>

        {/* Comment Snippet */}
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 mb-4 relative overflow-hidden">
          <Quote className="absolute -bottom-2 -right-2 w-12 h-12 text-amber-500/10" />
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

        <Button
          onClick={onViewDetails}
          className="w-full mb-6 py-6 h-auto rounded-[1.25rem] bg-gray-900 hover:bg-amber-500 dark:bg-white dark:text-gray-900 dark:hover:bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all"
        >
          Review Content
        </Button>
      </div>
    </motion.div>
  );
}
