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
  IconCalendar
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import { formatDate } from '@/lib/utils';
import Button from "@/components/common/Button";
import Avatar from '@/components/common/Avatar';
import { Review } from '../hooks/use-review-logic';
import SafeImage from '@/components/common/SafeImage';

interface LandlordReviewCardProps {
  review: Review;
  idx: number;
  viewMode: 'grid' | 'list';
  setRespondModal: (data: { isOpen: boolean; reviewId: string; reviewTitle: string }) => void;
  onViewDetails: (id: string) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/90 text-white border-amber-400/40',
  approved: 'bg-emerald-500/90 text-white border-emerald-400/40',
  rejected: 'bg-rose-500/90 text-white border-rose-400/40',
};

const cleanText = (str: string | null) => {
  if (!str) return '';
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
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

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: idx * 0.05, duration: 0.3, ease: "easeOut" } as any
    }
  };

  const getReviewImage = () => {
    if (review.reservation?.room?.images && review.reservation.room.images.length > 0) return review.reservation.room.images[0].url;
    if (review.listing?.images && review.listing.images.length > 0) {
      return typeof review.listing.images[0] === 'string' ? review.listing.images[0] : (review.listing.images[0] as any).url;
    }
    return review.listing?.imageSrc || "/images/placeholder.jpg";
  };

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

  const renderStatusBadge = (small = false) => {
    const isResponded = Boolean(review.response);
    const label = isResponded ? 'RESPONDED' : 'NEEDS RESPONSE';
    const badgeColorClass = isResponded
      ? 'bg-emerald-500/90 text-white border-emerald-400/40'
      : 'bg-amber-500/90 text-white border-amber-400/40';

    return (
      <span className={cn(
        "flex items-center gap-1.5 rounded-xl uppercase font-black tracking-wider shadow-lg backdrop-blur-md border",
        small ? "px-1.5 py-0.5 text-[7px] sm:text-[8px]" : "px-2.5 py-1 text-[9px]",
        badgeColorClass
      )}>
        <div className={cn("rounded-full bg-current animate-pulse", small ? "w-1 h-1" : "w-1.5 h-1.5")} />
        {label}
      </span>
    );
  };

  if (isGrid) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 sm:p-6 rounded-2xl sm:rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col h-full"
      >
        {/* Top Cover Image */}
        <div className="relative h-36 sm:h-48 w-full rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-5 bg-gray-100 dark:bg-gray-800 z-10 flex-shrink-0">
          <SafeImage
            src={getReviewImage()}
            alt={review.listing.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20">
            {renderStatusBadge()}
          </div>
        </div>

        {/* Card Content Section */}
        <div className="flex-1 min-w-0 w-full z-10 flex flex-col">
          <h3 className="font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate text-sm sm:text-xl mb-2 sm:mb-3 tracking-tight">
            {review.listing.title}
          </h3>
          
          {/* Mobile & Desktop Reviewer Header */}
          <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-4 bg-gray-50 dark:bg-gray-800/50 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Avatar 
                src={review.user.image} 
                name={review.user.name} 
                className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <p className="text-[7px] sm:text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-0.5">Verified Reviewer</p>
                <p className="text-[10px] sm:text-sm font-black text-gray-900 dark:text-gray-100 truncate leading-none">{review.user.name || 'Anonymous'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-black text-amber-500 shrink-0 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              <IconStarFilled size={12} className="shrink-0" />
              <span>{review.rating.toFixed(1)} / 5.0</span>
            </div>
          </div>

          {/* Comment text with HTML entity decoding */}
          <div className="mb-3 sm:mb-4 px-0.5 flex-1">
            <p className="text-[11px] sm:text-sm text-gray-600 dark:text-gray-300 italic font-medium leading-relaxed line-clamp-3 sm:line-clamp-2">
              "{cleanText(review.comment) || 'No comment provided.'}"
            </p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 flex items-center gap-1">
              <IconCalendar size={11} className="text-primary shrink-0" />
              <span>{formatDate(review.createdAt)}</span>
            </p>
          </div>

          {/* Guest Media Strip */}
          {allMedia.length > 0 && (
            <div className="flex gap-1.5 mb-3 sm:mb-4 overflow-x-auto pb-0.5 [scrollbar-width:none]">
              {allMedia.slice(0, 4).map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedMediaIdx(i)}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex-shrink-0 shadow-xs transition-all hover:scale-105 cursor-zoom-in relative group/thumb"
                >
                  {item.type === 'image' ? (
                    <SafeImage src={item.url} alt="Guest media" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
                      <video src={item.url} className="w-full h-full object-cover opacity-60" />
                      <IconPlayerPlay size={10} className="absolute text-white drop-shadow-xl" />
                    </div>
                  )}
                  {i === 3 && allMedia.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="text-white text-[8px] sm:text-[10px] font-black">+{allMedia.length - 3}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2.5 sm:pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto w-full">
            <Button
              onClick={() => onViewDetails(review.id)}
              className="flex-1 h-10 rounded-xl px-2 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-700/60 cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <IconEye size={14} />
              <span>Details</span>
            </Button>
            
            {!review.response ? (
              <Button
                onClick={() => setRespondModal({ isOpen: true, reviewId: review.id, reviewTitle: review.listing.title })}
                className="flex-1 h-10 rounded-xl px-2 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 group/btn cursor-pointer flex items-center justify-center gap-1.5"
              >
                <IconMessage size={14} className="group-hover/btn:scale-110 transition-transform" />
                <span>Respond</span>
              </Button>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-1.5 h-10 px-2 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <IconMessage size={14} className="text-blue-500 shrink-0" />
                <span className="text-[10px] sm:text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider text-center leading-none">Responded</span>
              </div>
            )}
          </div>
        </div>

        {/* Fullscreen Media Modal */}
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
                className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors z-[100000] bg-white/10 p-2 rounded-full cursor-pointer"
                onClick={() => setSelectedMediaIdx(null)}
              >
                <IconX size={32} strokeWidth={1.5} />
              </motion.button>

              {allMedia.length > 1 && (
                <>
                  <button 
                    onClick={handlePrev}
                    className="absolute left-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[100000] backdrop-blur-md cursor-pointer"
                  >
                    <IconChevronLeft size={32} />
                  </button>
                  <button 
                    onClick={handleNext}
                    className="absolute right-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[100000] backdrop-blur-md cursor-pointer"
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
                  <SafeImage
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
        <div className="flex items-start sm:items-center gap-3 sm:gap-6 flex-1 min-w-0">
          {/* Thumbnail */}
          <div className="relative w-20 h-20 sm:w-56 sm:h-36 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm flex-shrink-0 bg-gray-100 dark:bg-gray-800">
            <SafeImage
              src={getReviewImage()}
              alt={review.listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute top-1 left-1 sm:top-2.5 sm:left-2.5 z-20 scale-90 sm:scale-100 origin-top-left">
              {renderStatusBadge(true)}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
            <div>
              <div className="flex items-center justify-between gap-2 mb-0.5 sm:mb-1">
                <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 truncate">
                  {review.listing.title}
                </h3>
                <div className="flex items-center gap-1 text-xs font-black text-amber-500 shrink-0">
                  <IconStarFilled size={12} />
                  <span>{review.rating.toFixed(1)} / 5.0</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 mb-1.5">
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/60 px-2 py-0.5 rounded-lg border border-gray-100 dark:border-gray-800">
                  <Avatar src={review.user.image} name={review.user.name} className="w-4 h-4 rounded-full" />
                  <span className="text-[10px] font-black text-gray-800 dark:text-gray-200 truncate max-w-[100px] sm:max-w-[150px]">
                    {review.user.name || 'Anonymous'}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-300 italic font-medium leading-tight line-clamp-2">
                "{cleanText(review.comment) || 'No comment provided.'}"
              </p>
            </div>

            {/* Guest Media Strip */}
            {allMedia.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto pt-1 [scrollbar-width:none]">
                {allMedia.slice(0, 4).map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedMediaIdx(i)}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 flex-shrink-0 cursor-zoom-in relative group/thumb"
                  >
                    {item.type === 'image' ? (
                      <SafeImage src={item.url} alt="Guest media" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
                        <video src={item.url} className="w-full h-full object-cover opacity-60" />
                        <IconPlayerPlay size={10} className="absolute text-white drop-shadow-xl" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Column */}
        <div className="flex sm:flex-col items-center gap-1.5 sm:gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 pt-2.5 sm:pt-0 sm:pl-6">
          <Button
            onClick={() => onViewDetails(review.id)}
            className="flex-1 sm:w-36 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-3 text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-700/60 transition-all cursor-pointer"
          >
            <span className="flex items-center justify-center gap-1.5">
              <IconEye size={14} />
              <span>Details</span>
            </span>
          </Button>

          {!review.response ? (
            <Button
              onClick={() => setRespondModal({ isOpen: true, reviewId: review.id, reviewTitle: review.listing.title })}
              className="flex-1 sm:w-36 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-3 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all cursor-pointer"
            >
              <span className="flex items-center justify-center gap-1.5">
                <IconMessage size={14} />
                <span>Respond</span>
              </span>
            </Button>
          ) : (
            <div className="flex-1 sm:w-36 flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl sm:rounded-2xl border border-blue-100 dark:border-blue-900/30">
              <IconMessage size={14} className="text-blue-500 shrink-0" />
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest text-center leading-none">Responded</span>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Media Modal */}
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
              className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors z-[100000] bg-white/10 p-2 rounded-full cursor-pointer"
              onClick={() => setSelectedMediaIdx(null)}
            >
              <IconX size={32} strokeWidth={1.5} />
            </motion.button>

            {allMedia.length > 1 && (
              <>
                <button 
                  onClick={handlePrev}
                  className="absolute left-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[100000] backdrop-blur-md cursor-pointer"
                >
                  <IconChevronLeft size={32} />
                </button>
                <button 
                  onClick={handleNext}
                  className="absolute right-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[100000] backdrop-blur-md cursor-pointer"
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
                <SafeImage
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
