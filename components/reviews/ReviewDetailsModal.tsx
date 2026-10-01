"use client";
import React, { useState, useMemo, useCallback } from "react";
import Modal from "../modals/Modal";
import { 
  X, 
  Star, 
  Calendar, 
  MapPin, 
  Home, 
  Clock, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle,
  ShieldCheck,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationItem } from "@/context/NotificationContext";
import Avatar from "@/components/common/Avatar";
import SafeImage from "@/components/common/SafeImage";
import MediaPreviewOverlay from "@/components/common/MediaPreviewOverlay";
import { cn } from "@/utils/helper";
import { useRouter } from "next/navigation";

interface ReviewListing {
  id: string;
  title: string;
  imageSrc: string;
  region?: string;
  country?: string;
  user?: {
    name: string;
    image?: string | null;
  };
  images?: Array<{ url: string }>;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  response: string | null;
  respondedAt: any;
  createdAt: any;
  listing: ReviewListing;
  images: string[];
  videos?: string[];
  user?: {
    name: string;
    image?: string | null;
  };
  reservation?: {
    room?: {
      id: string;
      name: string;
      images?: Array<{ url: string }>;
    }
  }
}

interface ReviewDetailsModalProps {
  review: Review;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: () => void;
  notification?: NotificationItem;
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

const ReviewDetailsModal: React.FC<ReviewDetailsModalProps> = ({
  review,
  isOpen,
  onClose,
  onMarkAsRead,
  notification,
}) => {
  const router = useRouter();
  const [selectedMediaIdx, setSelectedMediaIdx] = useState<number | null>(null);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  const allMediaUrls = useMemo(() => [
    ...(review?.images || []),
    ...(review?.videos || [])
  ], [review?.images, review?.videos]);

  // Featured property/room images for showcase
  const featuredMedia = useMemo(() => {
    let imgs: string[] = [];
    if (review?.reservation?.room?.images && review.reservation.room.images.length > 0) {
      imgs = review.reservation.room.images.map(i => i.url);
    } else if (review?.listing?.images && review.listing.images.length > 0) {
      imgs = review.listing.images.map(i => typeof i === 'string' ? i : (i as any).url);
    } else if (review?.listing?.imageSrc) {
      imgs = [review.listing.imageSrc];
    }
    return imgs.length > 0 ? imgs : ["/images/placeholder.jpg"];
  }, [review]);

  const formatDate = useCallback((dateString: any) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  React.useEffect(() => {
    if (isOpen && notification) {
      if (onMarkAsRead) {
        onMarkAsRead();
      }
    }
  }, [isOpen, notification, onMarkAsRead]);

  if (!isOpen || !review) return null;

  const rawComment = cleanText(review.comment);
  const rawResponse = cleanText(review.response);
  const isReplied = !!review.response;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} width="xl" hasFixedFooter={true} fullOnMobile={true}>
        <div className="flex flex-col h-full sm:h-auto max-h-full sm:max-h-[82vh] overflow-hidden">
          
          {/* Header Bar */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center shrink-0 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Star size={20} className="fill-primary" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  Review Details
                </h2>
                <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate max-w-[180px] sm:max-w-none">
                  {review.listing.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className={cn(
                "px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold border shadow-sm",
                isReplied
                  ? "bg-primary/10 text-primary-dark dark:bg-primary/20 dark:text-primary-light border-primary/20"
                  : "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-800"
              )}>
                {isReplied ? "Landlord Replied" : "Awaiting Reply"}
              </span>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable Content Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-4 sm:space-y-6 bg-slate-50/70 dark:bg-gray-950 custom-scrollbar overscroll-contain [transform:translateZ(0)]">
            
            {/* Notification Alert (if any) */}
            {notification && (
              <div className="p-5 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-2xl flex items-start gap-3.5 shadow-sm">
                <div className="p-2 bg-primary text-white rounded-xl shrink-0 shadow-sm mt-0.5">
                  <MessageCircle size={18} />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-black uppercase tracking-wider text-primary-dark dark:text-primary-light">
                    {notification.title}
                  </h4>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                    {notification.description}
                  </p>
                </div>
              </div>
            )}

            {/* 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Property Showcase & Review Summary */}
              <div className="space-y-6">
                
                {/* Showcase Image Gallery Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  <div className="aspect-video w-full relative group/gallery bg-gray-100 dark:bg-gray-800">
                    <SafeImage
                      src={featuredMedia[currentImgIdx]}
                      alt={review.listing.title}
                      unoptimized={true}
                    />

                    {featuredMedia.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImgIdx((prev) => (prev === 0 ? featuredMedia.length - 1 : prev - 1));
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-black/80"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImgIdx((prev) => (prev === featuredMedia.length - 1 ? 0 : prev + 1));
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-black/80"
                        >
                          <ChevronRight size={18} />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {featuredMedia.map((_, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all",
                                idx === currentImgIdx ? "bg-white w-4" : "bg-white/50"
                              )}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    <div className="absolute top-3 left-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-md border border-gray-100 dark:border-gray-800">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-black text-gray-900 dark:text-white leading-none">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight line-clamp-1">
                        {review.listing.title}
                      </h3>
                      {review.reservation?.room?.name && (
                        <p className="text-xs font-bold text-primary flex items-center gap-1.5 mt-1">
                          <Home size={14} />
                          <span>{review.reservation.room.name}</span>
                        </p>
                      )}
                    </div>

                    {(review.listing.region || review.listing.country) && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                        <MapPin size={14} className="text-rose-500 shrink-0" />
                        <span className="truncate">
                          {[review.listing.region, review.listing.country].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Metadata & Status Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-primary" />
                    <span>Review Information</span>
                  </h4>

                  <div className="space-y-3.5 divide-y divide-gray-100 dark:divide-gray-800">
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Verified Stay</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Confirmed
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Reviewed On</span>
                      <span className="text-xs font-black text-gray-900 dark:text-white">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Landlord Response</span>
                      <span className={cn(
                        "text-xs font-black",
                        isReplied ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      )}>
                        {isReplied ? "Replied" : "Awaiting Reply"}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Tenant Feedback, Uploads & Host Reply */}
              <div className="space-y-6">
                
                {/* Tenant Review Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={review.user?.image}
                        name={review.user?.name}
                        className="w-10 h-10 rounded-xl"
                      />
                      <div>
                        <h4 className="text-sm font-black text-gray-900 dark:text-white leading-tight">
                          {review.user?.name || "Tenant"}
                        </h4>
                        <p className="text-[10px] font-bold text-gray-400">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                      <Star size={14} className="text-amber-500 fill-amber-500" />
                      <span className="text-xs font-black text-amber-900 dark:text-amber-200">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 italic leading-relaxed">
                      "{rawComment || "No written feedback provided."}"
                    </p>
                  </div>
                </div>

                {/* Uploaded Photos & Videos Section (if any) */}
                {allMediaUrls.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                        Uploaded Media
                      </h4>
                      <span className="text-[10px] font-bold text-gray-400">
                        {allMediaUrls.length} File{allMediaUrls.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {allMediaUrls.map((url, idx) => {
                        const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
                        return (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedMediaIdx(idx)}
                            className="aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer relative group bg-black shadow-sm"
                          >
                            {!isVideo ? (
                              <SafeImage src={url} alt="Review attachment" unoptimized={true} />
                            ) : (
                              <div className="relative w-full h-full">
                                <video src={url} className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                                    <Play size={16} fill="white" />
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Landlord Response Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <User size={14} className="text-primary" />
                    <span>Landlord Reply</span>
                  </h4>

                  {isReplied ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={review.listing.user?.image}
                          name={review.listing.user?.name}
                          className="w-10 h-10 rounded-xl"
                        />
                        <div>
                          <h4 className="text-sm font-black text-primary dark:text-primary-light leading-tight">
                            {review.listing.user?.name || "Landlord / Host"}
                          </h4>
                          <p className="text-[10px] font-bold text-gray-400">
                            {formatDate(review.respondedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-primary/5 dark:bg-primary/15 border border-primary/20 rounded-xl">
                        <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                          {rawResponse}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                          Awaiting Landlord Reply
                        </p>
                        <p className="text-[10px] font-medium text-amber-700/80 dark:text-amber-400/80">
                          The property owner has not responded to this review yet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Simple Timestamp */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 text-center">
              <p className="text-[11px] font-bold text-gray-400 flex items-center justify-center gap-1.5">
                <Clock size={12} />
                <span>Reviewed on {formatDate(review.createdAt)}</span>
              </p>
            </div>

          </div>

          {/* Action Footer */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-lg">
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 w-full sm:w-auto order-1 sm:order-2">
              <button
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary-dark rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
                onClick={() => router.push(`/listings/${review.listing.id}`)}
              >
                <Home size={14} />
                <span>View Property</span>
              </button>
            </div>

            <button
              className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors text-center order-2 sm:order-1"
              onClick={onClose}
            >
              Close
            </button>

          </div>

        </div>
      </Modal>

      {/* Media Fullscreen Preview Overlay */}
      <MediaPreviewOverlay 
        isOpen={selectedMediaIdx !== null}
        onClose={() => setSelectedMediaIdx(null)}
        images={allMediaUrls}
        currentIndex={selectedMediaIdx || 0}
        onNavigate={(idx) => setSelectedMediaIdx(idx)}
        title="Review Attachments"
      />
    </>
  );
};

export default ReviewDetailsModal;
