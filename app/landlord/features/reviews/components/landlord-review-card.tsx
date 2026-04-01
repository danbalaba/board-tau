'use client';

import React from 'react';
import { 
  IconStarFilled, 
  IconEye, 
  IconMessage, 
  IconStar 
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helper';
import Button from "@/components/common/Button";
import { useRouter } from 'next/navigation';
import { Review } from '../hooks/use-review-logic';

interface LandlordReviewCardProps {
  review: Review;
  idx: number;
  viewMode: 'grid' | 'list';
  setRespondModal: (data: { isOpen: boolean; reviewId: string; reviewTitle: string }) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  approved: 'bg-green-500/10 text-green-600 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const renderStars = (rating: number) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <IconStarFilled
        key={star}
        size={14}
        className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
      />
    ))}
  </div>
);

export function LandlordReviewCard({
  review,
  idx,
  viewMode,
  setRespondModal
}: LandlordReviewCardProps) {
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
        isGrid ? "flex-col p-6 rounded-3xl hover:shadow-xl" : "flex-row p-6 rounded-2xl hover:shadow-xl gap-6 items-start"
      )}
    >
      <div className={cn("relative rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-gray-800 group-hover:shadow-md transition-all duration-300", isGrid ? "w-16 h-16 mb-4" : "w-20 h-20")}>
        {review.listing.imageSrc ? (
          <img src={review.listing.imageSrc} alt={review.listing.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300"><IconStar size={20} /></div>
        )}
      </div>

      <div className="flex-1 min-w-0 w-full">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-widest", statusColors[review.status])}>{review.status}</span>
              {isGrid && (
                <div className="bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-500/20 flex items-center gap-1.5 ml-auto">
                  <IconStarFilled size={10} className="text-amber-500" />
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">{review.rating}</span>
                </div>
              )}
            </div>
            <h3 className={cn("font-black text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors", isGrid ? "text-lg" : "text-xl mb-1")}>
              {review.listing.title}
            </h3>
          </div>
          {!isGrid && (
            <div className="bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 flex items-center gap-2 shadow-sm">
              {renderStars(review.rating)}
              <span className="text-xs font-black text-primary">{review.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black uppercase">{review.user.name?.charAt(0) || 'U'}</div>
          <p className="text-sm font-medium text-gray-500 truncate">
            <span className="font-bold text-gray-900 dark:text-gray-100">{review.user.name || 'Anonymous User'}</span> 
            <span className="mx-1.5 opacity-50 hidden sm:inline">•</span> 
            <span className="hidden sm:inline">{new Date(review.createdAt).toLocaleDateString()}</span>
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic relative mb-4">
          <p className="relative z-10 whitespace-pre-line line-clamp-3">{review.comment || 'No comment provided.'}</p>
        </div>

        {review.response && !isGrid && (
          <div className="ml-4 bg-emerald-50 dark:bg-emerald-500/5 border-l-4 border-emerald-500 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 mb-4 opacity-80 scale-95 origin-left">
            <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Your Response</p>
            {review.response}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
          <Button outline onClick={() => router.push(`/landlord/reviews/${review.id}`)} className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-700">
            <span className="flex items-center gap-2"><IconEye size={12} />View Details</span>
          </Button>
          {!review.response && (
            <div className="flex items-center gap-2 border-l border-gray-100 dark:border-gray-800 pl-3">
              <Button onClick={() => setRespondModal({ isOpen: true, reviewId: review.id, reviewTitle: review.listing.title })} className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                <span className="flex items-center gap-2"><IconMessage size={12} />Respond</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
