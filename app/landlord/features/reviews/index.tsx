'use client';

import React from 'react';
import { 
  IconStar, 
  IconChevronDown 
} from '@tabler/icons-react';
import { cn } from '@/utils/helper';
import { useRegisterActions } from 'kbar';
import Button from "@/components/common/Button";
import { useReviewLogic, Review } from './hooks/use-review-logic';
import { LandlordReviewHeader } from './components/landlord-review-header';
import { LandlordReviewCard } from './components/landlord-review-card';
import { LandlordReviewRespondModal } from './components/landlord-review-respond-modal';
import { LandlordReviewDetailsModal } from './components/landlord-review-details-modal';
import { useLoadMore } from '@/hooks/useLoadMore';

interface LandlordReviewsProps {
  reviews: {
    reviews: Review[];
    nextCursor: string | null;
  };
}

export default function LandlordReviews({ reviews }: LandlordReviewsProps) {
  const {
    filteredReviews,
    nextCursor,
    isLoadingMore,
    selectedStatus,
    setSelectedStatus,
    selectedRating,
    setSelectedRating,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    rawReviews,
    handleLoadMore,
    handleGenerateReport,
    respondModal,
    setRespondModal,
    updateReviewResponse
  } = useReviewLogic(reviews.reviews, reviews.nextCursor);

  const [detailsModal, setDetailsModal] = React.useState<{
    isOpen: boolean;
    reviewId: string | null;
  }>({ isOpen: false, reviewId: null });

  const { ref: loadMoreRef } = useLoadMore(
    handleLoadMore,
    !!nextCursor,
    isLoadingMore,
    false
  );

  useRegisterActions(
    rawReviews.map((review) => ({
      id: `review-${review.id}`,
      name: `Review from ${review.user.name || 'Anonymous Guest'}`,
      subtitle: `${review.rating} Stars • ${review.listing.title}`,
      keywords: `review feedback guest stars ${review.user.name} ${review.listing.title}`,
      section: 'Reviews',
      perform: () => {
        setSearchQuery(review.user.name || review.user.email);
      },
      icon: <IconStar size={18} />
    })),
    [rawReviews]
  );

  return (
    <div className="space-y-6">
      <LandlordReviewHeader 
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedRating={selectedRating}
        setSelectedRating={setSelectedRating}
        handleGenerateReport={handleGenerateReport}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        rawReviews={rawReviews}
      />

      {/* Mobile Filters UI (Simplified version for small screens) */}
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
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-primary">
            <IconStar size={24} />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No reviews found</h3>
          <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">Your properties haven't received any reviews matching the current criteria yet.</p>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        )}>
          {filteredReviews.map((review, idx) => (
            <LandlordReviewCard 
              key={`${viewMode}-${review.id}`}
              review={review}
              idx={idx}
              viewMode={viewMode}
              setRespondModal={setRespondModal}
              onViewDetails={(id) => setDetailsModal({ isOpen: true, reviewId: id })}
            />
          ))}
          {/* Scroll Sentinel */}
          <div ref={loadMoreRef} className="h-1 col-span-full opacity-0 pointer-events-none" />
        </div>
      )}

      {nextCursor && (
        <div className="flex flex-col items-center gap-4 pt-12 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-gray-200 dark:to-gray-800" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                {isLoadingMore ? 'Fetching more reviews...' : 'Scroll for more'}
              </span>
            </div>
            <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-gray-200 dark:to-gray-800" />
          </div>

          <Button 
            outline 
            className="rounded-xl px-10 py-4 group transition-all hover:bg-primary hover:text-white border-2 border-gray-100 dark:border-gray-800"
            onClick={handleLoadMore}
            isLoading={isLoadingMore}
          >
            <span className="flex items-center gap-2 uppercase font-black tracking-[0.15em] text-[10px]">
              {isLoadingMore ? 'Fetching...' : 'Force Load More'}
              <IconChevronDown className={cn("group-hover:translate-y-0.5 transition-transform", isLoadingMore && "animate-bounce")} size={10} />
            </span>
          </Button>
        </div>
      )}

      <LandlordReviewRespondModal 
        isOpen={respondModal.isOpen}
        reviewId={respondModal.reviewId}
        reviewTitle={respondModal.reviewTitle}
        onClose={() => setRespondModal({ ...respondModal, isOpen: false })}
        onSuccess={updateReviewResponse}
      />

      <LandlordReviewDetailsModal 
        isOpen={detailsModal.isOpen}
        reviewId={detailsModal.reviewId}
        onClose={() => setDetailsModal({ ...detailsModal, isOpen: false })}
        onSuccess={updateReviewResponse}
      />
    </div>
  );
}
