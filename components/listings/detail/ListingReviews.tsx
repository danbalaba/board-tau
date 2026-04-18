"use client";

import React, { useState, useMemo } from "react";
import { AiOutlineStar, AiFillStar } from "react-icons/ai";
import { CheckCircle, Play, X, ChevronLeft, ChevronRight, ChevronDown, ThumbsUp } from "lucide-react";
import { IconHome } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/common/Avatar";
import { cn } from "@/utils/helper";
import axios from "axios";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";

interface Review {
  id: string;
  rating: number;
  comment: string;
  cleanliness?: number;
  accuracy?: number;
  communication?: number;
  location?: number;
  value?: number;
  reservationId?: string;
  images?: string[];
  videos?: string[];
  response?: string;
  respondedAt?: Date | string;
  createdAt: Date;
  likedIds?: string[];
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

interface ListingReviewsProps {
  reviews: Review[];
  listingRating?: number;
  listingReviewCount?: number;
  ownerName?: string;
  currentUser?: any;
  listing?: {
    title: string;
    imageSrc: string;
    region?: string;
    country?: string;
  };
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <div key={i}>
          {i < Math.round(rating) ? (
            <AiFillStar className="text-yellow-400 text-sm" />
          ) : (
            <AiOutlineStar className="text-gray-300 dark:text-gray-600 text-sm" />
          )}
        </div>
      ))}
      <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

const MediaGallery = ({ 
  media, 
  initialIndex, 
  onClose 
}: { 
  media: { url: string; type: 'image' | 'video' }[], 
  initialIndex: number, 
  onClose: () => void 
}) => {
  const [index, setIndex] = useState(initialIndex);

  const next = () => setIndex((i) => (i + 1) % media.length);
  const prev = () => setIndex((i) => (i - 1 + media.length) % media.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center pt-20"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[110]"
      >
        <X size={24} />
      </button>

      <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full h-full flex items-center justify-center p-4"
          >
            {media[index].type === 'image' ? (
              <img src={media[index].url} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" alt="Enlarged" />
            ) : (
              <video src={media[index].url} className="max-w-full max-h-full rounded-2xl shadow-2xl" controls autoPlay />
            )}
          </motion.div>
        </AnimatePresence>

        {media.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 p-4 bg-black/40 hover:bg-black/60 rounded-2xl text-white backdrop-blur-md transition-all border border-white/10">
              <ChevronLeft size={32} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 p-4 bg-black/40 hover:bg-black/60 rounded-2xl text-white backdrop-blur-md transition-all border border-white/10">
              <ChevronRight size={32} />
            </button>
          </>
        )}
      </div>

      <div className="w-full max-w-2xl px-4 py-8 overflow-x-auto flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
        {media.map((item, i) => (
          <button key={i} onClick={() => setIndex(i)} className={cn("relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0", i === index ? "border-primary scale-110" : "border-transparent opacity-50 hover:opacity-100")}>
            {item.type === 'image' ? (
              <img src={item.url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center"><Play size={12} fill="white" /></div>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

const MediaGrid = ({ media, onMediaClick }: { media: { url: string; type: 'image' | 'video' }[], onMediaClick: (index: number) => void }) => {
  if (media.length === 0) return null;
  const displayMedia = media.slice(0, 4);
  const remainingCount = media.length - 4;

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {displayMedia.map((item, idx) => {
        const isLast = idx === 3 && remainingCount > 0;
        return (
          <div key={idx} className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 cursor-pointer group transition-all shrink-0 shadow-sm hover:shadow-md" onClick={() => onMediaClick(idx)}>
            {item.type === 'image' ? <img src={item.url} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="Review media" /> : (
              <div className="relative w-full h-full bg-black/10">
                <video src={item.url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white"><Play size={16} fill="white" /></div>
                </div>
              </div>
            )}
            {isLast && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] z-10">
                <span className="text-xl font-black text-white">+{remainingCount}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        );
      })}
    </div>
  );
};

export default function ListingReviews({
  reviews: initialReviews,
  listingRating = 4.8,
  listingReviewCount = 0,
  ownerName = "Property Owner",
  currentUser,
}: ListingReviewsProps) {
  const { error } = useResponsiveToast();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [galleryState, setGalleryState] = useState<{ media: { url: string; type: 'image' | 'video' }[], index: number } | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [likingId, setLikingId] = useState<string | null>(null);

  const sortedReviews = useMemo(() => {
    // ... same
    const list = [...reviews];
    if (sortBy === 'newest') return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sortBy === 'highest') return list.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'lowest') return list.sort((a, b) => a.rating - b.rating);
    return list;
  }, [reviews, sortBy]);

  const toggleLike = async (reviewId: string) => {
    if (!currentUser) {
      error("Please log in to like a review");
      return;
    }

    if (likingId) return;

    setLikingId(reviewId);

    // Optimistic Update
    const originalReviews = [...reviews];
    const updatedReviews = reviews.map(r => {
      if (r.id === reviewId) {
        const likedIds = r.likedIds || [];
        const isLiked = likedIds.includes(currentUser.id);
        return {
          ...r,
          likedIds: isLiked 
            ? likedIds.filter(id => id !== currentUser.id)
            : [...likedIds, currentUser.id]
        };
      }
      return r;
    });

    setReviews(updatedReviews);

    try {
      await axios.post(`/api/reviews/${reviewId}/like`);
    } catch (err) {
      setReviews(originalReviews);
      error("Something went wrong");
    } finally {
      setLikingId(null);
    }
  };

  const openGallery = (review: Review, initialIndex: number) => {
     const allMedia = [
       ...(review.images || []).map(url => ({ url, type: 'image' as const })),
       ...(review.videos || []).map(url => ({ url, type: 'video' as const }))
     ];
     setGalleryState({ media: allMedia, index: initialIndex });
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="border-t dark:border-gray-700 pt-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 uppercase tracking-tight">Reviews</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium font-outfit">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="border-t dark:border-gray-700 pt-8">
      {/* Header with Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Guest Reviews</h2>
           <div className="px-2 py-1 bg-primary/10 rounded-lg text-primary text-xs font-black">
             {listingReviewCount} TOTAL
           </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition-colors"
          >
            Sort By: {sortBy === 'newest' ? 'Newest' : sortBy === 'highest' ? 'Highest' : 'Lowest'}
            <ChevronDown size={14} className={cn("transition-transform duration-300", isSortOpen ? "rotate-180" : "")} />
          </button>

          <AnimatePresence>
            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-20 overflow-hidden">
                  <div className="p-1">
                    {[{ id: 'newest', label: 'Newest First' }, { id: 'highest', label: 'Highest Rated' }, { id: 'lowest', label: 'Lowest Rated' }].map((opt) => (
                      <button key={opt.id} onClick={() => { setSortBy(opt.id as any); setIsSortOpen(false); }} className={cn("w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors", sortBy === opt.id ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800")}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Summaries Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
             <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3"><AiFillStar className="text-primary" />{listingRating.toFixed(1)}</h2>
             <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Overall Guest Rating • ({listingReviewCount} reviews)</p>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter(r => r.rating === star).length;
              const percentage = (count / (reviews.length || 1)) * 100;
              return (
                <div key={star} className="flex items-center gap-4 text-[10px] font-black text-gray-400">
                  <span className="w-3">{star}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 py-2">
          {['cleanliness', 'accuracy', 'communication', 'location', 'value'].map((cat) => {
            const avg = reviews.reduce((acc, curr) => acc + (curr[cat as keyof Review] as number || 0), 0) / (reviews.length || 1);
            return (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  <span>{cat}</span><span className="text-gray-900 dark:text-white font-black">{avg.toFixed(1)}</span>
                </div>
                <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} whileInView={{ width: `${avg * 20}%` }} viewport={{ once: true }} className="h-full bg-primary" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-10">
        {sortedReviews.map((review, index) => {
          const isLiked = currentUser && review.likedIds?.includes(currentUser.id);
          const likeCount = review.likedIds?.length || 0;

          return (
            <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }} className="border-b dark:border-gray-700 pb-10 last:border-0 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar src={review.user.image} name={review.user.name} className="w-10 h-10 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm" />
                   <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{review.user.name}</p>
                      {review.reservationId && <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-[8px] font-black text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-100 dark:border-emerald-500/20 uppercase tracking-tighter"><CheckCircle size={10} strokeWidth={3} /> Verified</span>}
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString("en-US")}</p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic">"{review.comment}"</p>
              
              <MediaGrid media={[...(review.images || []).map(url => ({ url, type: 'image' as const })), ...(review.videos || []).map(url => ({ url, type: 'video' as const }))]} onMediaClick={(idx) => openGallery(review, idx)} />
              
              {/* Like Button */}
              <div className="mt-4 flex items-center gap-4">
                 <button 
                  onClick={() => toggleLike(review.id)}
                  disabled={likingId === review.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all scale-100 active:scale-95",
                    isLiked 
                      ? "bg-primary text-white shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" 
                      : "bg-gray-50 dark:bg-gray-800/50 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  )}
                 >
                   <ThumbsUp size={14} fill={isLiked ? "white" : "none"} className="transition-transform" />
                   Helpful {likeCount > 0 && <span className="ml-1 opacity-70">{likeCount}</span>}
                 </button>
              </div>

              {review.response && (
                <div className="mt-6 ml-6 p-5 bg-gray-50/50 dark:bg-gray-800/20 rounded-3xl border border-gray-100 dark:border-gray-700/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><IconHome size={40} /></div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm"><IconHome size={16} /></div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Reply from</span>
                      <span className="text-xs font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">{ownerName}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed pl-11">"{review.response}"</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {galleryState && (
          <MediaGallery 
            media={galleryState.media}
            initialIndex={galleryState.index}
            onClose={() => setGalleryState(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
