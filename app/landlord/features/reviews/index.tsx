'use client';

import React from 'react';
import { 
  IconStar, 
  IconChevronDown 
} from '@tabler/icons-react';
import { cn } from '@/utils/helper';
import Button from "@/components/common/Button";
import { useReviewLogic, Review } from './hooks/use-review-logic';
import { LandlordReviewHeader } from './components/landlord-review-header';
import { LandlordReviewCard } from './components/landlord-review-card';
import { LandlordReviewRespondModal } from './components/landlord-review-respond-modal';

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
    handleLoadMore,
    handleGenerateReport,
    respondModal,
    setRespondModal,
    updateReviewResponse
  } = useReviewLogic(reviews.reviews, reviews.nextCursor);

  return (
    <div className="space-y-6 pb-12">
      <LandlordReviewHeader 
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedRating={selectedRating}
        setSelectedRating={setSelectedRating}
        handleGenerateReport={handleGenerateReport}
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
            />
          ))}
        </div>
      )}

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

      <LandlordReviewRespondModal 
        isOpen={respondModal.isOpen}
        reviewId={respondModal.reviewId}
        reviewTitle={respondModal.reviewTitle}
        onClose={() => setRespondModal({ ...respondModal, isOpen: false })}
        onSuccess={updateReviewResponse}
      />
    </div>
  );
}
