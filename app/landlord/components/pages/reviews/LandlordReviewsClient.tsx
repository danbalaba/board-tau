'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  IconStar, 
  IconEye, 
  IconMessage, 
  IconChevronDown,
  IconCheck,
  IconX,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconInbox,
  IconStarFilled,
  IconLayoutGrid,
  IconList
} from '@tabler/icons-react';
import Button from "@/components/common/Button";
import { cn } from '@/utils/helper';
import { 
  generateTablePDF 
} from '@/utils/pdfGenerator';
import GenerateReportButton from '@/components/common/GenerateReportButton';

interface Review {
  id: string;
  listing: {
    id: string;
    title: string;
    imageSrc: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  rating: number;
  comment: string | null;
  response: string | null;
  status: string;
  createdAt: Date;
  respondedAt: Date | null;
}

interface LandlordReviewsClientProps {
  reviews: {
    reviews: Review[];
    nextCursor: string | null;
  };
}

export default function LandlordReviewsClient({ reviews }: LandlordReviewsClientProps) {
  const router = useRouter();
  const [listings, setListings] = useState(reviews.reviews);
  const [nextCursor, setNextCursor] = useState(reviews.nextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Sync state with props
  useEffect(() => {
    setListings(reviews.reviews);
    setNextCursor(reviews.nextCursor);
  }, [reviews]);

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    approved: 'bg-green-500/10 text-green-600 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  const formatStatus = useCallback((status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }, []);

  const renderStars = useCallback((rating: number) => {
    return (
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
  }, []);

  const filteredReviews = useMemo(() => {
    return listings.filter(review => {
      const statusMatch = selectedStatus === 'all' || review.status === selectedStatus;
      const ratingMatch = selectedRating === 'all' || review.rating === parseInt(selectedRating);
      return statusMatch && ratingMatch;
    });
  }, [selectedStatus, selectedRating, listings]);

  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All Reviews', icon: IconInbox },
    { value: 'pending', label: 'Pending', icon: IconClock },
    { value: 'approved', label: 'Approved', icon: IconCircleCheck },
    { value: 'rejected', label: 'Rejected', icon: IconCircleX },
  ], []);

  const ratingOptions = useMemo(() => ['all', '5', '4', '3', '2', '1'], []);

  const [respondModal, setRespondModal] = useState<{
    isOpen: boolean;
    reviewId: string;
    reviewTitle: string;
  }>({ isOpen: false, reviewId: '', reviewTitle: '' });
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRespond = useCallback(async (reviewId: string, response: string) => {
    try {
      const res = await fetch(`/api/landlord/reviews?id=${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      });

      if (res.ok) {
        setListings(prev => prev.map(review => 
          review.id === reviewId ? { ...review, response, status: 'approved' } : review
        ));
        router.refresh();
      }
    } catch (error) {
      console.error('Error responding to review:', error);
    }
  }, [router]);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/landlord/reviews?cursor=${nextCursor}`);
      const data = await response.json();

      if (data.success && data.data) {
        setListings(prev => [...prev, ...data.data.reviews]);
        setNextCursor(data.data.nextCursor);
      }
    } catch (error) {
      console.error('Error loading more reviews:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore]);

  const handleGenerateReport = async () => {
    const columns = ['Listing', 'Guest', 'Rating', 'Comment', 'Date'];
    const data = filteredReviews.map((r: any) => [
      r.listing.title,
      r.user.name || r.user.email,
      `${r.rating} / 5`,
      r.comment || 'N/A',
      new Date(r.createdAt).toLocaleDateString()
    ]);

    await generateTablePDF(
      'Reviews_Report',
      columns,
      data,
      {
        title: 'Property Reviews Report',
        subtitle: `Compilation of all ${filteredReviews.length} reviews for your properties`,
        author: 'Landlord Dashboard'
      }
    );
  };

  const handleSubmitResponse = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/landlord/reviews?id=${respondModal.reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseText.trim() }),
      });

      if (res.ok) {
        const reviewId = respondModal.reviewId;
        const responseValue = responseText.trim();
        setListings(prev => prev.map(review => 
          review.id === reviewId ? { ...review, response: responseValue, status: 'approved' } : review
        ));
        setRespondModal({ isOpen: false, reviewId: '', reviewTitle: '' });
        setResponseText('');
        router.refresh();
      }
    } catch (error) {
      console.error('Error responding to review:', error);
    } finally {
      setSubmitting(false);
    }
  }, [responseText, respondModal.reviewId, router]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  viewMode === 'grid'
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                )}
              >
                <IconLayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  viewMode === 'list'
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                )}
              >
                <IconList size={18} />
              </button>
            </div>
            
            <GenerateReportButton 
              onGeneratePDF={handleGenerateReport}
            />

            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary hover:scale-110 transition-transform duration-300">
              <IconStar size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-0.5 tracking-tight">
                Guest Reviews
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Manage property reviews and responses
              </p>
            </div>
          </div>
          
          <div className="hidden xl:flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2">Status</span>
              {[
                { value: 'all', label: 'All Reviews', icon: IconInbox },
                { value: 'pending', label: 'Pending', icon: IconClock },
                { value: 'approved', label: 'Approved', icon: IconCircleCheck },
                { value: 'rejected', label: 'Rejected', icon: IconCircleX },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = selectedStatus === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                      isSelected
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700"
                    )}
                  >
                    <Icon size={12} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2">Rating</span>
              {['all', '5', '4', '3', '2', '1'].map((rating) => {
                const isSelected = selectedRating === rating;
                return (
                  <button
                    key={rating}
                    onClick={() => setSelectedRating(rating)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                      isSelected
                        ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700"
                    )}
                  >
                    {rating === 'all' ? (
                      <>
                        <IconInbox size={12} />
                        <span>All Ratings</span>
                      </>
                    ) : (
                      <>
                        <IconStarFilled size={10} className={isSelected ? "text-white" : "text-amber-500"} />
                        <span>{rating} Stars</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="xl:hidden flex flex-col gap-4 bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm mb-4">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Status</span>
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedStatus === status ? "bg-primary text-white" : "bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Rating</span>
          <div className="flex flex-wrap gap-2">
            {['all', '5', '4', '3', '2', '1'].map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedRating === rating ? "bg-amber-500 text-white" : "bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700"
                )}
              >
                {rating === 'all' ? 'All' : `${rating} ★`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-primary">
            <IconStar size={24} />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            No reviews found
          </h3>
          <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">
            Your properties haven't received any reviews matching the current criteria yet.
          </p>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        )}>
          {filteredReviews.map((review) => (
            viewMode === 'grid' ? (
              <div
                key={review.id}
                className="group relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 shadow-sm flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="relative w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden group-hover:shadow-md transition-all duration-300">
                    {review.listing.imageSrc ? (
                      <img
                        src={review.listing.imageSrc}
                        alt={review.listing.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <IconStar size={20} />
                      </div>
                    )}
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-500/20 flex items-center gap-1.5">
                    <IconStarFilled size={10} className="text-amber-500" />
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400">{review.rating}</span>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                    {review.listing.title}
                  </h3>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 italic mb-4 line-clamp-3">
                    {review.comment || 'No comment provided.'}
                  </div>

                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">
                      {review.user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 truncate">{review.user.name || 'Anonymous'}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  {!review.response && (
                    <Button
                      onClick={() => setRespondModal({
                        isOpen: true,
                        reviewId: review.id,
                        reviewTitle: review.listing.title
                      })}
                      className="w-full rounded-xl py-2.5 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    >
                      Respond Now
                    </Button>
                  )}
                  <Button
                    outline
                    onClick={() => router.push(`/landlord/reviews/${review.id}`)}
                    className="w-full rounded-xl py-2.5 text-[10px] font-black uppercase tracking-widest"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ) : (
              <div
              key={review.id}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 shadow-sm"
            >
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="relative w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex-shrink-0 group-hover:shadow-md transition-all duration-300">
                  {review.listing.imageSrc ? (
                    <img
                      src={review.listing.imageSrc}
                      alt={review.listing.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <IconStar size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full">
                  <div className="flex items-start justify-between mb-1 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-widest", statusColors[review.status])}>
                          {review.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {review.listing.title}
                      </h3>
                    </div>
                    <div className="bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 flex items-center gap-2 shadow-sm">
                      {renderStars(review.rating)}
                      <span className="text-xs font-black text-primary">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black uppercase">
                      {review.user.name?.charAt(0) || 'U'}
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                      <span className="font-bold text-gray-900 dark:text-gray-100">{review.user.name || 'Anonymous User'}</span> 
                      <span className="mx-1.5 opacity-50">•</span> 
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic relative mb-4">
                    <span className="absolute -top-3 left-4 text-3xl text-gray-200 dark:text-gray-700">"</span>
                    <p className="relative z-10 whitespace-pre-line">{review.comment || 'No comment provided.'}</p>
                  </div>

                  {review.response && (
                    <div className="flex flex-col mb-4">
                      <div className="flex items-center gap-2 mb-2 pl-4">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-[10px] font-black uppercase">
                          L
                        </div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">Your Response</p>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-auto">
                          {new Date(review.respondedAt!).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="ml-10 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-xl rounded-tl-sm p-3 text-sm text-gray-700 dark:text-gray-300">
                        {review.response}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                <Button
                  outline
                  onClick={() => router.push(`/landlord/reviews/${review.id}`)}
                  className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-700"
                >
                  <span className="flex items-center gap-2">
                    <IconEye size={12} />
                    View Details
                  </span>
                </Button>
                
                {!review.response && (
                  <div className="flex items-center gap-2 border-l border-gray-100 dark:border-gray-800 pl-3">
                    <Button
                      onClick={() => setRespondModal({
                        isOpen: true,
                        reviewId: review.id,
                        reviewTitle: review.listing.title
                      })}
                      className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    >
                      <span className="flex items-center gap-2">
                        <IconMessage size={12} />
                        Respond
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            )
          ))}
        </div>
      )}

      {/* Load More */}
      {nextCursor && (
        <div className="flex justify-center pt-8">
          <Button 
            outline 
            className="rounded-xl px-10 py-4 group transition-all hover:bg-primary hover:text-white"
            onClick={handleLoadMore}
            isLoading={isLoadingMore}
          >
            <span className="flex items-center gap-2 uppercase font-black tracking-[0.15em] text-[10px]">
              {isLoadingMore ? 'Fetching reviews...' : 'Load More Reviews'}
              <IconChevronDown className={cn("group-hover:translate-y-0.5 transition-transform", isLoadingMore && "animate-bounce")} size={10} />
            </span>
          </Button>
        </div>
      )}

      {/* Respond Modal */}
      {respondModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 w-full max-w-lg shadow-2xl overflow-hidden shadow-gray-200/50 dark:shadow-none animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                Respond to Review
              </h2>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-6 line-clamp-1">
                For property: <span className="text-primary">{respondModal.reviewTitle}</span>
              </p>
              
              <form onSubmit={handleSubmitResponse} className="space-y-6">
                <div>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response clearly and professionally..."
                    className="w-full p-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 dark:text-white text-sm font-medium resize-none min-h-[140px] transition-all"
                  />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 px-1">
                    Your response will be visible publicly.
                  </p>
                </div>
                
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                  <Button
                    outline
                    type="button"
                    onClick={() => {
                      setRespondModal({ isOpen: false, reviewId: '', reviewTitle: '' });
                      setResponseText('');
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={submitting || !responseText.trim()}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                        Submitting...
                      </div>
                    ) : (
                      <span className="flex items-center gap-2">
                        <IconMessage size={12} />
                        Submit Response
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
