"use client";
import React from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Calendar, MapPin, Eye } from "lucide-react";
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
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"');
};

const getRatingLabel = (rating: number) => {
  if (rating >= 4.8) return "Excellent!";
  if (rating >= 4.0) return "Very Good";
  if (rating >= 3.0) return "Good";
  if (rating >= 2.0) return "Fair";
  return "Needs Improvement";
};

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onViewDetails,
  hasNotification,
}) => {
  const formatDate = (date: any) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const rawComment = cleanText(review.comment);
  const ratingText = getRatingLabel(review.rating);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={hasNotification ? { 
        opacity: 1, 
        y: 0,
        scale: [1, 1.02, 1],
        boxShadow: [
          "0 0 0 rgba(47, 125, 109, 0)",
          "0 15px 30px rgba(47, 125, 109, 0.2)",
          "0 0 0 rgba(47, 125, 109, 0)"
        ]
      } : { 
        opacity: 1, 
        y: 0,
        scale: 1,
      }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm hover:shadow-2xl border border-gray-100 dark:border-gray-800/80 relative group flex flex-col h-full overflow-hidden transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />

      {/* Card Image Header */}
      <div className="relative h-52 overflow-hidden z-10 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />
        <SafeImage
          src={(review.reservation?.room?.images && review.reservation.room.images.length > 0)
            ? review.reservation.room.images[0].url
            : (review.listing?.images && review.listing.images.length > 0)
              ? (typeof review.listing.images[0] === 'string' ? review.listing.images[0] : (review.listing.images[0] as any).url)
              : review.listing?.imageSrc || "/images/placeholder.jpg"
          }
          alt={review.listing.title}
          className="group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Status Badges */}
        <div className="absolute top-3.5 left-3.5 z-20 flex flex-wrap gap-2">
          {hasNotification && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg border border-white/20 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              New Reply
            </motion.div>
          )}
          
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md bg-white/90 dark:bg-gray-900/90 text-primary border border-primary/20 shadow-sm leading-none flex items-center gap-1">
            Verified Stay
          </span>

          {review.response && (
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md bg-emerald-500/90 text-white shadow-sm leading-none flex items-center gap-1">
              Landlord Replied
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3.5 right-3.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-xl border border-gray-100 dark:border-gray-800 z-20">
          <Star size={15} className="text-amber-400 fill-amber-400 drop-shadow-xs" />
          <span className="text-sm font-black text-gray-900 dark:text-white leading-none">
            {review.rating.toFixed(1)}
          </span>
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-1.5">
            {ratingText}
          </span>
        </div>

        {/* Media count overlay */}
        {review.images && review.images.length > 0 && (
          <div className="absolute bottom-3.5 left-3.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl text-white text-[10px] font-black uppercase tracking-wider border border-white/15 flex items-center gap-1.5 z-20">
            <Eye size={12} /> {review.images.length} Photo{review.images.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col z-10 relative">
        <div className="mb-4">
          <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white truncate tracking-tight mb-2 group-hover:text-primary transition-colors">
            {review.listing.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-primary shrink-0" />
              <span className="truncate">{review.listing.region}, {review.listing.country}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-primary/70 shrink-0" />
              <span>Reviewed {formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Comment Quote Box */}
        <div className="bg-slate-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 mb-5 relative flex-1">
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed font-medium italic">
            "{rawComment || "No written feedback provided."}"
          </p>
        </div>

        {/* Footer Details Button */}
        <button
          onClick={onViewDetails}
          className="w-full py-3 px-4 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:text-white flex items-center justify-center gap-2 group/btn cursor-pointer"
        >
          <Eye size={15} className="group-hover/btn:scale-110 transition-transform" />
          View Review Details
        </button>
      </div>
    </motion.div>
  );
};

export default ReviewCard;
