"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Calendar, MapPin, Eye, Home, Check, ChevronLeft, ChevronRight } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";

interface ReviewListing {
  id: string;
  title: string;
  imageSrc: string;
  region?: string;
  country?: string;
  images?: Array<{ url: string }>;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  response: string | null;
  createdAt: any;
  listing: ReviewListing;
  images: string[];
  reservation?: {
    room?: {
      id: string;
      name: string;
      images?: Array<{ url: string }>;
    }
  }
}

interface ReviewCardProps {
  review: Review;
  onViewDetails: () => void;
  hasNotification?: boolean;
}

const cleanText = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
};

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onViewDetails,
  hasNotification,
}) => {
  const [imgIdx, setImgIdx] = React.useState(0);

  const cardImages = React.useMemo(() => {
    if (review.reservation?.room?.images && review.reservation.room.images.length > 0) {
      return review.reservation.room.images.map((img: any) => (typeof img === 'string' ? img : img.url));
    }
    if (review.listing?.images && review.listing.images.length > 0) {
      return review.listing.images.map((img: any) => (typeof img === 'string' ? img : img.url));
    }
    return [review.listing?.imageSrc || "/images/placeholder.jpg"];
  }, [review]);

  const formatDate = (date: any) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const displayLocation = [
    review.listing?.region,
    review.listing?.country
  ].filter(Boolean).join(", ");

  const rawComment = cleanText(review.comment);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={hasNotification ? { 
        opacity: 1, 
        y: 0,
        scale: [1, 1.02, 1],
        boxShadow: [
          "0 0 0 rgba(47, 125, 109, 0)",
          "0 12px 30px rgba(47, 125, 109, 0.25)",
          "0 0 0 rgba(47, 125, 109, 0)"
        ]
      } : { 
        opacity: 1, 
        y: 0,
        scale: 1,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" 
      }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ 
        opacity: { duration: 0.3 },
        y: { duration: 0.2, ease: "easeOut" },
        scale: { 
          duration: 2, 
          repeat: hasNotification ? Infinity : 0, 
          ease: "easeInOut",
          repeatDelay: 1
        }
      }}
      className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-md hover:shadow-xl border border-gray-200/80 dark:border-gray-700/60 relative group flex flex-col h-full overflow-hidden transition-all duration-300"
    >
      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />

      {/* Card Image Header */}
      <div className="relative h-44 overflow-hidden shrink-0 z-10 group/cardgallery">
        <SafeImage
          src={cardImages[imgIdx] || cardImages[0]}
          alt={review.listing.title}
          unoptimized={true}
        />

        {cardImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setImgIdx((prev) => (prev === 0 ? cardImages.length - 1 : prev - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white opacity-100 sm:opacity-0 sm:group-hover/cardgallery:opacity-100 transition-opacity hover:bg-black/80 z-30 cursor-pointer shadow-md"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setImgIdx((prev) => (prev === cardImages.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white opacity-100 sm:opacity-0 sm:group-hover/cardgallery:opacity-100 transition-opacity hover:bg-black/80 z-30 cursor-pointer shadow-md"
              aria-label="Next image"
            >
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
              {cardImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all ${idx === imgIdx ? "w-4 bg-white" : "w-1 bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Status Badges on Top Left */}
        <div className="absolute top-3 left-3 z-20 flex flex-col items-start gap-1.5">
          <AnimatePresence>
            {hasNotification && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-primary text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md border border-white/20 flex items-center justify-center"
              >
                New Reply
              </motion.div>
            )}
          </AnimatePresence>

          <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black shadow-lg backdrop-blur-md bg-[#2f7d6d] text-white border border-white/30 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Verified Stay
          </span>
        </div>

        {/* Rating Badge on Top Right */}
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
          <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black shadow-lg backdrop-blur-md bg-amber-500 text-white border border-white/30 flex items-center gap-1">
            <Star size={11} className="text-white fill-white" />
            <span>{review.rating.toFixed(1)}</span>
          </span>

          {review.response && (
            <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black shadow-lg backdrop-blur-md bg-purple-600 text-white border border-white/30 flex items-center gap-1">
              <Check size={10} />
              <span>Replied</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col z-10 relative">
        <div className="mb-3">
          <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 truncate tracking-tight mb-1">
            {review.listing.title}
          </h3>
          {review.reservation?.room?.name && (
            <p className="text-xs text-primary font-extrabold flex items-center gap-1.5 mb-1.5 truncate">
              <Home size={13} className="shrink-0 text-primary" />
              <span className="truncate">{review.reservation.room.name}</span>
            </p>
          )}
          <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
            <MapPin size={11} className="text-rose-500 shrink-0" />
            <span className="truncate">{displayLocation || "Location Not Specified"}</span>
          </div>
        </div>

        {/* Date Summary Card */}
        <div className="flex items-center justify-between mb-4 text-xs font-semibold bg-gray-50 dark:bg-gray-900/60 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-primary shrink-0" />
            <span className="text-[11px] text-gray-700 dark:text-gray-300 font-bold">
              Reviewed on {formatDate(review.createdAt)}
            </span>
          </div>
          {review.images && review.images.length > 0 && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-wider">
              {review.images.length} {review.images.length === 1 ? "Photo" : "Photos"}
            </span>
          )}
        </div>

        {/* Comment Quote Box */}
        <div className="bg-gray-50 dark:bg-gray-900/60 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700/60 mb-5 flex-1">
          <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed font-medium italic">
            "{rawComment || "No written feedback provided."}"
          </p>
        </div>

        {/* Single-Row Action Button */}
        <div className="flex items-center gap-2 mt-auto w-full">
          <button
            onClick={onViewDetails}
            className="w-full py-2.5 px-3 font-bold text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1.5 transition-all shadow-sm min-w-0"
          >
            <Eye size={14} className="text-primary shrink-0" />
            <span className="truncate">View Review Details</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewCard;
