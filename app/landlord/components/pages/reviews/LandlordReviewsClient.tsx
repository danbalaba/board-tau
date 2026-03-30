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
  IconList,
  IconFilter,
  IconHistory,
  IconCalendarEvent,
  IconSortDescending,
  IconSortAscending,
  IconLoader2
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from "@/components/common/Button";
import { cn } from '@/utils/helper';
import ModernSearchInput from '@/components/common/ModernSearchInput';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
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
  const [allReviews, setAllReviews] = useState(reviews.reviews);
  const [filteredReviewsState, setFilteredReviewsState] = useState(reviews.reviews);
  const [nextCursor, setNextCursor] = useState(reviews.nextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sync state with props
  useEffect(() => {
    setAllReviews(reviews.reviews);
    setFilteredReviewsState(reviews.reviews);
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

  const displayedReviews = useMemo(() => {
    let result = [...filteredReviewsState];
    
    if (selectedStatus !== 'all' || selectedRating !== 'all') {
      result = result.filter(review => {
        const statusMatch = selectedStatus === 'all' || review.status === selectedStatus;
        const ratingMatch = selectedRating === 'all' || review.rating === parseInt(selectedRating);
        return statusMatch && ratingMatch;
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'rating_desc':
          return b.rating - a.rating;
        case 'rating_asc':
          return a.rating - b.rating;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [selectedStatus, selectedRating, filteredReviewsState, sortBy]);

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
        setAllReviews(prev => prev.map(review => 
          review.id === reviewId ? { ...review, response, status: 'approved' } : review
        ));
        setFilteredReviewsState(prev => prev.map(review => 
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
        setAllReviews(prev => [...prev, ...data.data.reviews]);
        setFilteredReviewsState(prev => [...prev, ...data.data.reviews]);
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
        setAllReviews(prev => prev.map(review => 
          review.id === reviewId ? { ...review, response: responseValue, status: 'approved' } : review
        ));
        setFilteredReviewsState(prev => prev.map(review => 
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 md:p-5 rounded-2xl border border-primary/10 shadow-sm"
      >
        {/* Decorative elements - Contained for dropdown visibility */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-400/10 rounded-full blur-xl" />
        </div>

        <div className="relative z-20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary">
              <IconStar size={20} />
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
              <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                Reviews
              </h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Tenant feedback & ratings
              </p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Optimized Search Bar */}
            <div className="w-full lg:w-72">
              <ModernSearchInput
                data={allReviews}
                searchKeys={['listing.title', 'user.name', 'comment']}
                onSearch={setFilteredReviewsState}
                placeholder="Search reviews..."
                onSuggestionClick={(review) => {
                  router.push(`/landlord/reviews/${review.id}`);
                }}
                renderSuggestion={(review) => (
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      {review.listing.imageSrc ? (
                        <img src={review.listing.imageSrc} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <IconStar size={14} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-900 dark:text-white truncate">{review.user.name || 'Anonymous'}</p>
                      <p className="text-[9px] font-bold text-primary tracking-widest uppercase truncate">{review.listing.title}</p>
                    </div>
                  </div>
                )}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm shadow-sm">
                {[
                  { value: 'newest', label: 'Recent', icon: IconHistory },
                  { value: 'oldest', label: 'Oldest', icon: IconCalendarEvent },
                  { value: 'rating_desc', label: 'High', icon: IconSortDescending },
                  { value: 'rating_asc', label: 'Low', icon: IconSortAscending },
                ].map((option) => {
                  const Icon = option.icon;
                  const isSelected = sortBy === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                        isSelected
                          ? "bg-primary text-white shadow-md shadow-primary/30"
                          : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700"
                      )}
                    >
                      <Icon size={12} />
                      <span className="hidden sm:inline">{option.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Optimized Filters Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-primary transition-all backdrop-blur-sm">
                    <IconFilter size={12} />
                    <span>Filters</span> {(selectedStatus !== 'all' || selectedRating !== 'all') && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl">
                  <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">Status</div>
                  <DropdownMenuGroup>
                    {['all', 'pending', 'approved', 'rejected'].map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={cn(
                          "cursor-pointer flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold transition-all",
                          selectedStatus === status ? "bg-primary/10 text-primary" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        )}
                      >
                        <span className="capitalize">{status}</span>
                        {selectedStatus === status && <IconCheck size={14} className="ml-auto" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">Rating</div>
                  <DropdownMenuGroup>
                    {['all', '5', '4', '3', '2', '1'].map((rating) => (
                      <DropdownMenuItem
                        key={rating}
                        onClick={() => setSelectedRating(rating)}
                        className={cn(
                          "cursor-pointer flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold transition-all",
                          selectedRating === rating ? "bg-primary/10 text-primary" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        )}
                      >
                        <div className="flex items-center gap-1">
                          {rating === 'all' ? 'All Ratings' : (
                            <>
                              <span>{rating}</span>
                              <IconStarFilled size={10} className="text-amber-400" />
                            </>
                          )}
                        </div>
                        {selectedRating === rating && <IconCheck size={14} className="ml-auto" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-1.5 rounded-lg transition-all duration-300 text-gray-400 hover:text-gray-900",
                    viewMode === 'grid' && "bg-primary text-white shadow-md"
                  )}
                  title="Grid View"
                >
                  <IconLayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-1.5 rounded-lg transition-all duration-300 text-gray-400 hover:text-gray-900",
                    viewMode === 'list' && "bg-primary text-white shadow-md"
                  )}
                  title="List View"
                >
                  <IconList size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Reviews List */}
      {displayedReviews.length === 0 ? (
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
          {displayedReviews.map((review) => (
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
      {/* Enhanced Pagination / Load More */}
      <AnimatePresence>
        {nextCursor && allReviews.length >= 16 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center pt-16 pb-12 relative"
          >
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
            
            <button 
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className={cn(
                "group relative overflow-hidden rounded-2xl transition-all duration-500",
                isLoadingMore 
                  ? "cursor-default bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 px-12 py-5"
                  : "bg-white dark:bg-gray-900 border border-primary/20 hover:border-primary/50 shadow-xl hover:shadow-2xl hover:shadow-primary/10 px-10 py-4 active:scale-95"
              )}
            >
              {/* Animated Accent Bar */}
              <motion.div 
                className="absolute top-0 left-0 h-1 bg-primary"
                initial={{ width: 0 }}
                animate={isLoadingMore ? { 
                  width: ["0%", "100%", "0%"],
                  left: ["0%", "0%", "100%"]
                } : { width: 0 }}
                transition={isLoadingMore ? { 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {}}
              />

              <div className="relative flex flex-col items-center gap-3">
                {isLoadingMore ? (
                  <>
                    <div className="flex items-center gap-3 text-primary">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <IconLoader2 size={14} />
                      </motion.div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                        Discovering more reviews
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-1 h-1 rounded-full bg-primary"
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 h-full">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      Explore More Reviews
                    </span>
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <IconChevronDown className="group-hover:translate-y-0.5 transition-transform" size={14} />
                    </div>
                  </div>
                )}
              </div>
            </button>

            {!isLoadingMore && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest"
              >
                Showing {allReviews.length} reviews
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
