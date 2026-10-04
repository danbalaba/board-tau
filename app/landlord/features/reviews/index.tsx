'use client';

import React from 'react';
import { 
  IconStar, 
  IconChevronDown 
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import { useRegisterActions } from 'kbar';
import Button from "@/components/common/Button";
import { useSearchParams } from 'next/navigation';
import { decryptEntityId } from '@/lib/encryption';
import { useReviewLogic, Review } from './hooks/use-review-logic';
import { LandlordReviewHeader } from './components/landlord-review-header';
import { LandlordReviewCard } from './components/landlord-review-card';
import { LandlordReviewRespondModal } from './components/landlord-review-respond-modal';
import { LandlordReviewDetailsModal } from './components/landlord-review-details-modal';
import { LandlordPagination } from '../shared/landlord-pagination';

interface LandlordReviewsProps {
  reviews: {
    reviews: Review[];
    nextCursor: string | null;
  };
}

export default function LandlordReviews({ reviews }: LandlordReviewsProps) {
  const searchParams = useSearchParams();
  const {
    filteredReviews,
    totalReviews,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    nextCursor,
    isLoadingMore,
    selectedStatus,
    setSelectedStatus,
    selectedRating,
    setSelectedRating,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    rawReviews,
    handleLoadMore,
    handleGenerateReport,
    respondModal,
    setRespondModal,
    updateReviewResponse,
    isLoading
  } = useReviewLogic(reviews.reviews, reviews.nextCursor);

  const [detailsModal, setDetailsModal] = React.useState<{
    isOpen: boolean;
    reviewId: string | null;
  }>({ isOpen: false, reviewId: null });

  React.useEffect(() => {
    const id = searchParams?.get('id');
    if (id && !detailsModal.isOpen) {
      const decryptedId = decryptEntityId(id);
      setDetailsModal({ isOpen: true, reviewId: decryptedId });
    }
  }, [searchParams, detailsModal.isOpen]);

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
        sortBy={sortBy}
        setSortBy={setSortBy}
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
        isLoading={isLoading}
      />


      <div className="min-h-[400px] relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6" : "space-y-4")}
            >
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 sm:p-5 space-y-4 animate-pulse shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
                  </div>
                  <div className="h-28 sm:h-36 bg-gray-200 dark:bg-gray-800 rounded-xl w-full" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                    <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                  </div>
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
            >
              {filteredReviews.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Showing {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                  </span>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                </div>
              )}

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
                    ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6"
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
                </div>
              )}

              <LandlordPagination 
                currentPage={currentPage}
                totalPages={Math.ceil(totalReviews / itemsPerPage)}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={totalReviews}
                itemName="reviews"
              />


            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
