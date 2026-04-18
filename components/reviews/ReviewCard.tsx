"use client";
import React from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Calendar, MapPin, Eye } from "lucide-react";

interface ReviewListing {
  id: string;
  title: string;
  imageSrc: string;
  region?: string;
  country?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  response: string | null;
  createdAt: any;
  listing: ReviewListing;
  images: string[];
}

interface ReviewCardProps {
  review: Review;
  onViewDetails: () => void;
  hasNotification?: boolean;
}

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

  return (
    <motion.div 
      initial={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 relative group flex flex-col h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />

      <div className="relative h-48 overflow-hidden z-10 shrink-0">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 z-10" />
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
          src={review.listing.imageSrc || "/images/placeholder.jpg"}
          alt={review.listing.title}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          {hasNotification && (
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: ["0 0 0px rgba(16, 185, 129, 0)", "0 0 20px rgba(16, 185, 129, 0.4)", "0 0 0px rgba(16, 185, 129, 0)"]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center border border-white/20"
            >
              NEW MESSAGE
            </motion.div>
          )}
          
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black shadow-lg backdrop-blur-md bg-emerald-100/90 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 border border-emerald-200/50 dark:border-emerald-800/50 leading-none flex items-center gap-1">
              Verified
            </span>
            {review.response && (
               <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black shadow-lg backdrop-blur-md bg-blue-100/90 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border border-blue-200/50 dark:border-blue-800/50 leading-none flex items-center gap-1">
                  Responded
               </span>
            )}
          </div>
        </div>

        <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-xl border border-gray-100/50 dark:border-gray-700/50 z-20">
          <Star size={14} className="text-amber-500 fill-amber-500" />
          <span className="text-sm font-black text-gray-900 dark:text-white leading-none">{review.rating.toFixed(1)}</span>
        </div>

        {review.images && review.images.length > 0 && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 flex items-center gap-2 z-20">
            <Eye size={12} /> {review.images.length} Photos
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col z-10 relative">
        <div className="mb-4 border-b border-gray-100 dark:border-gray-800/50 pb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate drop-shadow-sm mb-2">
            {review.listing.title}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest pl-0.5 mb-1.5">
            <MapPin size={12} className="text-primary/60" />
            <span className="truncate">{review.listing.region}, {review.listing.country}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase tracking-widest pl-0.5">
            <Calendar size={12} className="text-primary/60" />
            <span>Reviewed on {formatDate(review.createdAt)}</span>
          </div>
        </div>

        <div className="bg-gray-50/80 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/50 mb-6 relative">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed font-medium italic">
            "{review.comment || "No comment provided."}"
          </p>
          <div className="absolute -top-2 -left-1 text-primary/10">
            <Star size={24} className="fill-current" />
          </div>
        </div>

        <div className="flex gap-3 mt-auto">
          <button
            onClick={onViewDetails}
            className="flex-1 py-2.5 px-4 font-bold text-sm rounded-xl transition-all shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 group/btn"
          >
            <Eye size={14} className="text-primary group-hover/btn:scale-110 transition-transform" />
            Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewCard;
