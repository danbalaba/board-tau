'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateTablePDF } from '@/utils/pdfGenerator';

export interface Review {
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setListings(initialReviews);
    setNextCursor(initialNextCursor);
  }, [initialReviews, initialNextCursor]);

  const filteredReviews = useMemo(() => {
    return listings.filter(review => {
      const statusMatch = selectedStatus === 'all' || review.status === selectedStatus;
      const ratingMatch = selectedRating === 'all' || review.rating === Number(selectedRating);
      
      let searchMatch = true;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        searchMatch = 
          review.listing.title.toLowerCase().includes(q) || 
          (review.user.name?.toLowerCase() || '').includes(q) || 
          review.user.email.toLowerCase().includes(q) ||
          (review.comment?.toLowerCase() || '').includes(q);
      }

      return statusMatch && ratingMatch && searchMatch;
    });
  }, [selectedStatus, selectedRating, listings, searchQuery]);

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
    try {
      const totalReviews = filteredReviews.length;
      const avgRating = totalReviews > 0 
        ? filteredReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews 
        : 0;
      const responseCount = filteredReviews.filter(r => r.response !== null).length;

      const summaryData = [
        { 
          label: 'Average Rating', 
          value: `${avgRating.toFixed(1)} / 5.0`,
          subValue: 'Overall guest satisfaction'
        },
        { 
          label: 'Total Reviews', 
          value: `${totalReviews}`,
          subValue: 'Feedback volume'
        },
        { 
          label: 'Response Rate', 
          value: `${((responseCount / (totalReviews || 1)) * 100).toFixed(0)}%`,
          subValue: `${responseCount} Responses provided`
        }
      ];

      const columns = ['Listing', 'Guest', 'Rating', 'Comment', 'Date'];
      const data = filteredReviews.map((r) => [
        r.listing.title,
        r.user.name || r.user.email,
        `${r.rating} / 5`,
        r.comment || 'N/A',
        new Date(r.createdAt).toLocaleDateString()
      ]);

      await generateTablePDF('Reviews_Report', columns, data, {
        title: 'Property Reputation Business Report',
        subtitle: `Auditing feedback and response performance for ${totalReviews} guest reviews`,
        author: 'Landlord Relationship Management',
        summaryData: summaryData
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
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
    searchQuery,
    setSearchQuery,
    rawReviews: listings,
    handleLoadMore,
    handleGenerateReport,
    respondModal,
    setRespondModal,
    updateReviewResponse,
    isLoading
  };
}
