'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { generateTablePDF } from '@/utils/pdfGenerator';

export interface Review {
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

export function useReviewLogic(initialReviews: Review[], initialNextCursor: string | null) {
  const router = useRouter();
  const [listings, setListings] = useState(initialReviews);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredReviews = useMemo(() => {
    return listings.filter(review => {
      const statusMatch = selectedStatus === 'all' || review.status === selectedStatus;
      const ratingMatch = selectedRating === 'all' || review.rating === Number(selectedRating);
      return statusMatch && ratingMatch;
    });
  }, [selectedStatus, selectedRating, listings]);

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
    const data = filteredReviews.map((r) => [
      r.listing.title,
      r.user.name || r.user.email,
      `${r.rating} / 5`,
      r.comment || 'N/A',
      new Date(r.createdAt).toLocaleDateString()
    ]);
    await generateTablePDF('Reviews_Report', columns, data, {
      title: 'Property Reviews Report',
      subtitle: `Compilation of all ${filteredReviews.length} reviews`,
      author: 'Landlord Dashboard'
    });
  };

  const [respondModal, setRespondModal] = useState<{
    isOpen: boolean;
    reviewId: string;
    reviewTitle: string;
  }>({ isOpen: false, reviewId: '', reviewTitle: '' });

  const updateReviewResponse = (reviewId: string, responseText: string) => {
    setListings(prev => prev.map(review => 
      review.id === reviewId ? { ...review, response: responseText, status: 'approved', respondedAt: new Date() } : review
    ));
    router.refresh();
  };

  return {
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
  };
}
