'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '@/components/modals/Modal';
import Avatar from '@/components/common/Avatar';
import { 
  IconStarFilled, 
  IconX, 
  IconMessage, 
  IconCalendar, 
  IconHome, 
  IconCircleCheck, 
  IconPlayerPlay, 
  IconChevronLeft, 
  IconChevronRight, 
  IconMessageCircle, 
  IconClock,
  IconBuilding,
  IconShieldCheck,
  IconEye
} from '@tabler/icons-react';
import { cn } from '@/utils/helper';
import { format } from 'date-fns';
import { toast } from 'sonner';
import SafeImage from '@/components/common/SafeImage';
import { getSafeImageSrcString } from '@/components/modals/inquiry-modal/InquiryModalUtils';
import MediaPreviewOverlay from '@/components/common/MediaPreviewOverlay';

interface Review {
  id: string;
  listing: {
    id: string;
    title: string;
    imageSrc: string;
    images?: Array<{ url: string }>;
  };
  reservation?: {
    room?: {
      id: string;
      name: string;
      images?: Array<{ url: string }>;
    }
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
  rating: number;
  comment: string | null;
  images: string[];
  videos?: string[];
  response: string | null;
  status: string;
  createdAt: Date | string;
  respondedAt: Date | string | null;
}

interface LandlordReviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: string | null;
  onSuccess?: (id: string, response: string) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
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

export function LandlordReviewDetailsModal({
  isOpen,
  onClose,
  reviewId,
  onSuccess
}: LandlordReviewDetailsModalProps) {
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRoomImageIndex, setCurrentRoomImageIndex] = useState(0);

  // Media Overlay State
  const [mediaOverlay, setMediaOverlay] = useState<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
    title: string;
    isDocument?: boolean;
  }>({
    isOpen: false,
    images: [],
    currentIndex: 0,
    title: '',
    isDocument: false,
  });

  useEffect(() => {
    const fetchReviewDetails = async () => {
      if (!reviewId || !isOpen) return;

      try {
        setLoading(true);
        const res = await fetch(`/api/landlord/reviews?id=${reviewId}`);
        if (!res.ok) throw new Error('Failed to fetch details');
        const data = await res.json();
        setReview(data.data);
        setCurrentRoomImageIndex(0);
        setMediaOverlay({
          isOpen: false,
          images: [],
          currentIndex: 0,
          title: '',
          isDocument: false,
        });
      } catch (err) {
        console.error(err);
        toast.error('Could not load review details');
      } finally {
        setLoading(false);
      }
    };

    fetchReviewDetails();
  }, [reviewId, isOpen]);

  const formatDate = useCallback((dateStr: string | Date | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch (e) {
      return 'N/A';
    }
  }, []);

  const getStatusBadge = useCallback((hasResponse: boolean) => {
    if (hasResponse) {
      return {
        label: 'Responded',
        className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      };
    }
    return {
      label: 'Needs Response',
      className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    };
  }, []);

  const roomImages = useMemo(() => {
    if (!review) return [];
    if (review.reservation?.room?.images && review.reservation.room.images.length > 0) {
      return review.reservation.room.images.map(img => img.url);
    }
    if (review.listing?.images && review.listing.images.length > 0) {
      return review.listing.images.map(img => typeof img === 'string' ? img : (img as any).url);
    }
    if (review.listing?.imageSrc) {
      return [review.listing.imageSrc];
    }
    return ['/images/placeholder.jpg'];
  }, [review]);

  const guestMediaImages = useMemo(() => {
    if (!review) return [];
    return [
      ...(review.images || []),
      ...(review.videos || [])
    ];
  }, [review]);

  const handleSubmitResponse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!responseText.trim() || !reviewId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/landlord/reviews?id=${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseText.trim() }),
      });

      if (!res.ok) throw new Error('Failed to submit');
      const data = await res.json();
      setReview(data.data);
      setResponseText('');
      toast.success('Response recorded successfully');

      if (onSuccess) {
        onSuccess(reviewId, data.data.response || responseText.trim());
      }
    } catch (err) {
      toast.error('Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <IconStarFilled
          key={star}
          size={16}
          className={star <= rating ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}
        />
      ))}
    </div>
  );

  if (!isOpen) return null;

  const statusInfo = review ? getStatusBadge(Boolean(review.response)) : { label: 'Review Details', className: '' };
  const guestName = (review?.user?.name) || 'Anonymous Guest';

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} width="full" noPadding={true} hasFixedFooter={true} closeOnOutsideClick={false} fullOnMobile={true}>
        <div className="w-full h-full sm:h-auto sm:max-h-[90vh] max-w-full sm:max-w-5xl mx-auto sm:my-auto overflow-hidden flex flex-col bg-white dark:bg-gray-900 rounded-none sm:rounded-3xl border-0 sm:border sm:border-gray-200 dark:sm:border-gray-800 shadow-2xl">
          
          {/* Top Header Bar - Mobile Collision Proof */}
          <div className="px-3.5 sm:px-8 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 pr-2">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl shrink-0">
                <IconStarFilled size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                    Review Details
                  </h2>
                  <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border shadow-2xs sm:hidden shrink-0", statusInfo.className)}>
                    {statusInfo.label}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 truncate max-w-[130px] sm:max-w-md mt-0.5 leading-tight">
                  {guestName} • {review?.listing.title || 'Property Review'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={cn("hidden sm:inline-flex px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-xs", statusInfo.className)}>
                {statusInfo.label}
              </span>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer shrink-0"
                title="Close"
              >
                <IconX size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Main Content Area - Responsive 2-Column */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-7 space-y-3.5 sm:space-y-4 bg-slate-50/50 dark:bg-gray-950/60 custom-scrollbar overscroll-contain">
            {loading ? (
              <div className="h-64 sm:h-96 flex flex-col items-center justify-center gap-3 py-12">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-lg" />
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400">Loading Review Details...</p>
              </div>
            ) : review ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-5 items-start">
                
                {/* Left Column: Room Showcase & Guest Media */}
                <div className="space-y-3.5 sm:space-y-4 flex flex-col">
                  
                  {/* Room Showcase Card */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xs">
                    <div 
                      onClick={() => setMediaOverlay({
                        isOpen: true,
                        images: roomImages,
                        currentIndex: currentRoomImageIndex,
                        title: `${review.listing.title} - Showcase`,
                        isDocument: false,
                      })}
                      className="relative h-44 sm:h-60 w-full group/gallery bg-gray-100 dark:bg-gray-800 cursor-zoom-in overflow-hidden"
                    >
                      <SafeImage
                        src={getSafeImageSrcString(roomImages[currentRoomImageIndex])}
                        alt={review.listing.title}
                        className="w-full h-full object-cover group-hover/gallery:scale-105 transition-transform duration-500"
                        unoptimized={true}
                      />

                      {/* Preview overlay indicator */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/gallery:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-black uppercase tracking-wider backdrop-blur-[2px]">
                        <IconEye size={18} />
                        <span>View Gallery ({roomImages.length} Photos)</span>
                      </div>

                      {roomImages.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentRoomImageIndex((prev) => (prev === 0 ? roomImages.length - 1 : prev - 1));
                            }}
                            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
                          >
                            <IconChevronLeft size={16} className="sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentRoomImageIndex((prev) => (prev === roomImages.length - 1 ? 0 : prev + 1));
                            }}
                            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
                          >
                            <IconChevronRight size={16} className="sm:w-4 sm:h-4" />
                          </button>
                          <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 z-10">
                            {roomImages.map((_, idx) => (
                              <div
                                key={idx}
                                className={cn(
                                  "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all",
                                  idx === currentRoomImageIndex ? "bg-white w-3 sm:w-4" : "bg-white/50"
                                )}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="p-3.5 sm:p-5 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800/60">
                      <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white tracking-tight truncate">
                        {review.listing.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs font-bold text-primary flex items-center gap-1.5">
                        <IconBuilding size={14} className="shrink-0" />
                        <span className="truncate">
                          {review.reservation?.room?.name ? `${review.reservation.room.name} • Reviewed Property` : 'Reviewed Property'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Guest Photos & Videos Card */}
                  {guestMediaImages.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
                      <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                        <IconStarFilled size={14} className="shrink-0" />
                        <span>Guest Photos & Videos</span>
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                        {guestMediaImages.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => setMediaOverlay({
                              isOpen: true,
                              images: guestMediaImages,
                              currentIndex: idx,
                              title: `${guestName}'s Review Media`,
                              isDocument: false,
                            })}
                            className="group relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden shadow-xs cursor-pointer border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
                          >
                            <SafeImage 
                              src={url} 
                              alt="Review Media Attachment" 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                              unoptimized={true}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-[1px]">
                              <IconEye size={14} />
                              <span>View</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Column: Reviewer Profile, Quoted Feedback & Response */}
                <div className="space-y-3.5 sm:space-y-4 flex flex-col">
                  
                  {/* Reviewer Profile Card */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <Avatar 
                          src={review.user.image} 
                          name={guestName} 
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl shadow-xs border-2 border-primary/20 shrink-0" 
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white truncate leading-tight">
                            {guestName}
                          </h3>
                          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                            <IconShieldCheck size={13} className="text-emerald-500 shrink-0" />
                            <span>Verified Guest Review</span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-amber-500/10 px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-500/20 flex items-center gap-1.5 shrink-0">
                        {renderStars(review.rating)}
                        <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quoted Feedback Card */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
                    <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <IconMessage size={14} className="text-primary shrink-0" />
                      <span>Guest Comment</span>
                    </h4>
                    <p className="text-[11px] sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 leading-relaxed italic">
                      "{cleanText(review.comment) || 'No comment provided.'}"
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 pt-1">
                      <IconClock size={12} className="shrink-0" />
                      <span>Recorded on {formatDate(review.createdAt)}</span>
                    </p>
                  </div>

                  {/* Response Section / Form */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
                    <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <IconCircleCheck size={14} className="text-primary shrink-0" />
                      <span>Landlord Response</span>
                    </h4>

                    {review.response ? (
                      <div className="p-3 sm:p-4 bg-primary/10 rounded-xl sm:rounded-2xl border border-primary/20 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-primary">
                          <span>Response Recorded</span>
                          {review.respondedAt && <span>{formatDate(review.respondedAt)}</span>}
                        </div>
                        <p className="text-[11px] sm:text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                          {cleanText(review.response)}
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitResponse} className="space-y-3">
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Write your official landlord reply here..."
                          className="w-full bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-none transition-all placeholder:text-gray-400"
                        />
                        <button
                          type="submit"
                          disabled={isSubmitting || !responseText.trim()}
                          className="w-full h-10 sm:h-11 px-4 text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary/90 rounded-xl sm:rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          <IconMessageCircle size={16} />
                          <span>Submit Reply</span>
                        </button>
                      </form>
                    )}
                  </div>

                </div>
              </div>
            ) : null}

          </div>

          {/* Action Footer Bar - Compact Mobile Rows & Desktop Single Row */}
          {review && (
            <div className="px-3.5 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 shadow-lg">
              
              {/* Left Action: Chat with Reviewer */}
              <button
                className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-primary bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => {
                  const listingImg = (review.reservation?.room?.images && review.reservation.room.images.length > 0) ? review.reservation.room.images[0].url : (review.listing?.images && review.listing.images.length > 0) ? (typeof review.listing.images[0] === 'string' ? review.listing.images[0] : (review.listing.images[0] as any).url) : review.listing?.imageSrc;
                  const event = new CustomEvent('open-landlord-chat', {
                    detail: {
                      listingId: review.listing.id,
                      tenantId: review.user.id,
                      tenantName: guestName,
                      tenantImage: review.user.image || '',
                      listingTitle: review.listing.title,
                      listingImage: listingImg || ''
                    }
                  });
                  window.dispatchEvent(event);
                  onClose();
                }}
              >
                <IconMessage size={16} />
                <span>Chat with Reviewer</span>
              </button>
              
              {/* Right Status / Reply Indicator */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {review.response ? (
                  <div className="w-full sm:w-auto h-10 sm:h-11 px-4 text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2">
                    <IconCircleCheck size={16} />
                    <span>Response Active</span>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hidden sm:inline">
                    Submit reply above to publish response
                  </span>
                )}
              </div>
            </div>
          )}

        </div>
      </Modal>

      {/* Global Media Preview Overlay */}
      <MediaPreviewOverlay
        isOpen={mediaOverlay.isOpen}
        onClose={() => setMediaOverlay(prev => ({ ...prev, isOpen: false }))}
        images={mediaOverlay.images}
        currentIndex={mediaOverlay.currentIndex}
        onNavigate={(idx) => setMediaOverlay(prev => ({ ...prev, currentIndex: idx }))}
        title={mediaOverlay.title}
        isDocument={mediaOverlay.isDocument}
      />
    </>
  );
}
