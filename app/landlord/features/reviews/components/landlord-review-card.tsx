'use client';

import React from 'react';
import { 
  IconStar, 
  IconEye, 
  IconMessage, 
  IconStarFilled,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPlay,
  IconCalendar,
  IconUser
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import Button from "@/components/common/Button";
import Avatar from '@/components/common/Avatar';
import { Review } from '../hooks/use-review-logic';

interface LandlordReviewCardProps {
  review: Review;
  idx: number; // For entrance animation sync
  viewMode: 'grid' | 'list';
  setRespondModal: (data: { isOpen: boolean; reviewId: string; reviewTitle: string }) => void;
  onViewDetails: (id: string) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  approved: 'bg-green-500/10 text-green-600 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export function LandlordReviewCard({
  review,
  idx,
  viewMode,
  setRespondModal,
  onViewDetails,
}: LandlordReviewCardProps) {
  const [selectedMediaIdx, setSelectedMediaIdx] = React.useState<number | null>(null);

  const isGrid = viewMode === 'grid';

  const allMedia = [
    ...(review.images || []).map(url => ({ url, type: 'image' as const })),
    ...(review.videos || []).map(url => ({ url, type: 'video' as const }))
  ];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedMediaIdx === null) return;
    setSelectedMediaIdx((selectedMediaIdx + 1) % allMedia.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedMediaIdx === null) return;
    setSelectedMediaIdx((selectedMediaIdx - 1 + allMedia.length) % allMedia.length);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05, duration: 0.3 }}
      className={cn(
        "group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-all duration-300 shadow-sm",
        isGrid ? "flex flex-col p-6 rounded-[2rem] hover:shadow-xl hover:-translate-y-1" : "flex flex-col sm:flex-row gap-6 p-6 rounded-2xl hover:shadow-xl"
      )}
    >
      {/* Listing Image Thumbnail */}
      <div className={cn(
        "relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 z-10 shadow-inner",
        isGrid ? "h-40 mb-6 w-full" : "w-full sm:w-48 h-40"
      )}>
        {review.listing.imageSrc ? (
          <img
            src={review.listing.imageSrc}
            alt={review.listing.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 grayscale-[40%] group-hover:grayscale-0 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
            <IconStar size={isGrid ? 32 : 24} />
          </div>
        )}
        <div className="absolute top-3 left-3 z-20">
          <span className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md border",
            statusColors[review.status] || "bg-white/80 text-gray-800 border-gray-200"
          )}>
            {review.status}
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0 w-full z-10 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1">
            <h3 className={cn(
              "font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 truncate uppercase tracking-tighter",
              isGrid ? "text-xl mb-3" : "text-lg mb-1"
            )}>
              {review.listing.title}
            </h3>
            
            {/* Guest Identifier (Parity with Reservation Card) */}
            <div className="flex items-center gap-3 mb-5 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-2xl border border-gray-100/50 dark:border-gray-800 w-fit group-hover:bg-primary/5 transition-colors">
              <Avatar 
                src={review.user.image} 
                name={review.user.name} 
                className="w-10 h-10 rounded-xl shadow-lg border-2 border-white dark:border-gray-700" 
              />
              <div>
                <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 leading-none">Verified Reviewer</p>
                <p className="text-sm font-black text-gray-900 dark:text-gray-100 max-w-[150px] sm:max-w-[200px] truncate leading-none">{review.user.name || 'Anonymous'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Stats Grid (Parity with Reservation Card) */}
        <div className={cn("grid gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 mb-5", isGrid ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3")}>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Guest Rating</span>
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-500">
              <IconStarFilled size={12} />
              {review.rating.toFixed(1)} / 5.0
            </div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Timestamp</span>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-gray-900 dark:text-gray-100 justify-end">
              <IconCalendar size={12} className="text-primary" />
              {new Date(review.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Comment Preview */}
        <div className="mb-5 px-1">
           <p className="text-sm text-gray-600 dark:text-gray-400 italic font-medium leading-relaxed line-clamp-2">
             "{review.comment || 'No comment provided.'}"
           </p>
        </div>

        {/* Guest Media Strip */}
        {allMedia.length > 0 && (
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
            {allMedia.slice(0, 4).map((item, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedMediaIdx(i)}
                className="w-14 h-14 rounded-xl overflow-hidden border-2 border-gray-100 dark:border-gray-800 flex-shrink-0 shadow-sm transition-all hover:scale-110 hover:-rotate-3 cursor-zoom-in relative group/thumb"
              >
                {item.type === 'image' ? (
                  <img src={item.url} alt="Guest" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
                    <video src={item.url} className="w-full h-full object-cover opacity-60" />
                    <IconPlayerPlay size={12} className="absolute text-white drop-shadow-xl" />
                  </div>
                )}
                {i === 3 && allMedia.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="text-white text-[10px] font-black">+{allMedia.length - 3}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Management Actions (Primary Parity) */}
        <div className="flex items-center gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 mt-auto">
          <Button
            outline
            onClick={() => onViewDetails(review.id)}
            className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-[0.2em] border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95"
          >
            <span className="flex items-center justify-center gap-2">
              <IconEye size={14} />
              Details
            </span>
          </Button>
          
          {!review.response && (
            <Button
              onClick={() => setRespondModal({ isOpen: true, reviewId: review.id, reviewTitle: review.listing.title })}
              className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 group/btn transition-all active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                <IconMessage size={14} className="group-hover/btn:scale-110 transition-transform" />
                Respond
              </span>
            </Button>
          )}

          {review.response && (
             <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <IconMessage size={14} className="text-blue-500" />
                <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Responded</span>
             </div>
          )}
        </div>
      </div>
      
      {/* Fullscreen Media Preview - Retained current high-fidelity behavior */}
      <AnimatePresence>
        {selectedMediaIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl"
            onClick={() => setSelectedMediaIdx(null)}
          >
            <motion.button
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors z-[100000] bg-white/10 p-2 rounded-full"
              onClick={() => setSelectedMediaIdx(null)}
            >
              <IconX size={32} strokeWidth={1.5} />
            </motion.button>

            {allMedia.length > 1 && (
              <>
                <button 
                  onClick={handlePrev}
                  className="absolute left-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[100000] backdrop-blur-md"
                >
                  <IconChevronLeft size={32} />
                </button>
                <button 
                  onClick={handleNext}
                  className="absolute right-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[100000] backdrop-blur-md"
                >
                   <IconChevronRight size={32} />
                </button>
              </>
            )}

            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="relative max-w-6xl w-full h-full flex items-center justify-center p-4 sm:p-12"
              onClick={(e) => e.stopPropagation()}
            >
              {allMedia[selectedMediaIdx].type === 'image' ? (
                <img
                  src={allMedia[selectedMediaIdx].url}
                  alt="Enlarged review photo"
                  className="max-w-full max-h-[90vh] object-contain rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5"
                />
              ) : (
                <video
                  src={allMedia[selectedMediaIdx].url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[90vh] rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
