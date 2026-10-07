import { toast } from 'react-hot-toast';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { generateTablePDF } from '@/utils/pdfGenerator';
import { DateRange } from 'react-day-picker';
import { useSession } from 'next-auth/react';
import { pusherClient } from '@/lib/pusher-client';

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
  const [sortBy, setSortBy] = useState<string>('newest');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isLoading, setIsLoading] = useState(true);

  // Filter loader state
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const isFirstRender = useRef(true);

  // Trigger loader animation when filters change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsFilterLoading(true);
    const timer = setTimeout(() => {
      setIsFilterLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedStatus, selectedRating, sortBy]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedRating, sortBy]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  // Real-time Pusher listener for landlord review hub
  useEffect(() => {
    if (!userId) return;

    const channelName = `private-user-${userId}`;
    const channel = pusherClient.subscribe(channelName);

    const handleReviewUpdated = (data: any) => {
      if (!data || !data.entityId) return;

      setListings((prev) => {
        const index = prev.findIndex((r) => r.id === data.entityId);
        if (index === -1) {
          if (data.payload && data.payload.id) {
            return [data.payload, ...prev];
          }
          return prev;
        }

        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          ...(data.payload || {}),
        };
        return updated;
      });
    };

    channel.bind("review-updated", handleReviewUpdated);
    channel.bind("review-created", handleReviewUpdated);

    return () => {
      channel.unbind("review-updated", handleReviewUpdated);
      channel.unbind("review-created", handleReviewUpdated);
    };
  }, [userId]);

  useEffect(() => {
    setListings(initialReviews);
    setNextCursor(initialNextCursor);
  }, [initialReviews, initialNextCursor]);

  const filteredReviews = useMemo(() => {
    let result = listings.filter(review => {
      const statusMatch = 
        selectedStatus === 'all' ? true :
        selectedStatus === 'needs_response' ? !review.response :
        selectedStatus === 'responded' ? !!review.response :
        true;
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

    result.sort((a, b) => {
      if (sortBy === 'rating_desc') return b.rating - a.rating;
      if (sortBy === 'rating_asc') return a.rating - b.rating;
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortBy === 'oldest' ? timeA - timeB : timeB - timeA;
    });

    return result;
  }, [selectedStatus, selectedRating, listings, searchQuery, sortBy]);

  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReviews, currentPage, itemsPerPage]);

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

  const handleGenerateReport = async (options?: { scope?: 'filtered' | 'all'; format?: string; includeSummary?: boolean; includeGlossary?: boolean; dateRange?: DateRange } | DateRange) => {
    try {
      const isParamDateRange = options && ('from' in options || 'to' in options);
      const dateRange = isParamDateRange ? (options as DateRange) : (options as any)?.dateRange;
      const exportScope = !isParamDateRange && (options as any)?.scope ? (options as any).scope : 'filtered';
      const includeSummary = !isParamDateRange && (options as any)?.includeSummary !== undefined ? (options as any).includeSummary : true;
      const includeGlossary = !isParamDateRange && (options as any)?.includeGlossary !== undefined ? (options as any).includeGlossary : true;

      let exportData = exportScope === 'all' ? listings : filteredReviews;

      if (dateRange?.from) {
        const fromDate = dateRange.from;
        const toDate = dateRange.to;
        exportData = exportData.filter((r: any) => {
          const createdAt = new Date(r.createdAt);
          if (toDate) {
            return createdAt >= fromDate && createdAt <= toDate;
          }
          return createdAt >= fromDate;
        });
      }

      const totalReviews = exportData.length;
      const responseCount = exportData.filter((r: any) => r.response !== null && r.response !== undefined).length;
      const avgRating = totalReviews > 0 ? exportData.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / totalReviews : 5.0;

      const fiveStarCount = exportData.filter((r: any) => r.rating === 5).length;
      const fourStarCount = exportData.filter((r: any) => r.rating === 4).length;
      const lowStarCount = exportData.filter((r: any) => r.rating <= 3).length;

      const distributionData = [
        { label: '5-Star Ratings', count: fiveStarCount, percentage: totalReviews ? (fiveStarCount / totalReviews) * 100 : 0, color: [47, 125, 109] as [number, number, number] },
        { label: '4-Star Ratings', count: fourStarCount, percentage: totalReviews ? (fourStarCount / totalReviews) * 100 : 0, color: [37, 99, 235] as [number, number, number] },
        { label: '1 to 3 Stars', count: lowStarCount, percentage: totalReviews ? (lowStarCount / totalReviews) * 100 : 0, color: [217, 119, 6] as [number, number, number] }
      ];

      // Rating Category Breakdown for Horizontal Bar Chart Graph
      const ratingCounts: Record<string, number> = {
        '5 Stars': fiveStarCount,
        '4 Stars': fourStarCount,
        '1 to 3 Stars': lowStarCount,
      };

      const categoryData = Object.entries(ratingCounts)
        .map(([label, count]) => ({ label, count }))
        .filter(c => c.count > 0);

      // Monthly Review Feedback Trajectory
      const monthCounts: Record<string, number> = {};
      exportData.forEach((r: any) => {
        const date = new Date(r.createdAt || Date.now());
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
        monthCounts[monthLabel] = (monthCounts[monthLabel] || 0) + 1;
      });
      const trendData = Object.entries(monthCounts).map(([label, value]) => ({ label, value }));

      const summaryData = [
        { label: 'Average Rating', value: `${avgRating.toFixed(1)} / 5.0 Stars`, subValue: 'Guest satisfaction score' },
        { label: 'Total Reviews', value: `${totalReviews} Reviews`, subValue: `${responseCount} Landlord replies` },
        { label: 'Reply Rate', value: `${totalReviews ? Math.round((responseCount / totalReviews) * 100) : 100}%`, subValue: 'Landlord reply rate' }
      ];

      const columns = ['Property Title', 'Guest / Reviewer', 'Rating', 'Landlord Response', 'Date Posted'];
      const data = exportData.map((r: any) => [
        r.listing?.title || (r as any).propertyTitle || 'N/A',
        r.user?.name || r.user?.email || 'N/A',
        r.rating ? `★ ${r.rating}.0 / 5.0` : 'N/A',
        r.response ? 'Responded' : 'No Response',
        new Date(r.createdAt).toLocaleDateString()
      ]);

      const totalsRow = [
        'TOTALS',
        `${totalReviews} Reviews`,
        `Avg ★ ${avgRating.toFixed(1)}`,
        `${responseCount} Responded`,
        new Date().toLocaleDateString()
      ];

      const glossaryItems = [
        { term: 'Satisfaction Rating Score', definition: 'Tenant satisfaction score rated on a 1.0 (Lowest) to 5.0 (Highest) star scale.' },
        { term: 'Average Reputation Rating', definition: 'Mean average star score calculated across all verified tenant reviews.' },
        { term: 'Landlord Reply Rate', definition: 'Percentage of tenant reviews that have received an official landlord response.' }
      ];

      const subtitle = exportScope === 'all'
        ? `All-Time Review Record for ${totalReviews} tenant reviews (★ ${avgRating.toFixed(1)} Avg Rating)`
        : `Filtered Review Report for ${totalReviews} feedback records`;

      const authorName = session?.user?.name || session?.user?.email || 'BoardTAU Landlord Portal';

      await generateTablePDF('Tenant_Reputation_Report', columns, data, {
        title: 'Tenant Review & Rating Summary Report',
        subtitle: subtitle,
        author: authorName,
        summaryData: summaryData,
        distributionData: distributionData,
        categoryData: categoryData,
        trendData: trendData,
        statusChartTitle: 'Star Ratings',
        categoryChartTitle: 'Rating Categories',
        trendChartTitle: 'Monthly Review Trend',
        glossaryItems: glossaryItems,
        totalsRow: totalsRow,
        scopeTag: exportScope === 'all' ? 'Complete History' : 'Filtered View',
        type: 'review',
        includeSummary: includeSummary,
        includeGlossary: includeGlossary
      });
      toast.success(`Generated review report for ${totalReviews} records`);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate review report');
    }
  };

  const [respondModal, setRespondModal] = useState<{
    isOpen: boolean;
    reviewId: string;
    reviewTitle: string;
  }>({ isOpen: false, reviewId: '', reviewTitle: '' });

  const updateReviewResponse = (reviewId: string, responseText: string) => {
    setListings(prev => prev.map(review => 
      review.id === reviewId ? { ...review, response: responseText, status: 'responded', respondedAt: new Date() } : review
    ));
    router.refresh();
  };

  return {
    filteredReviews: paginatedReviews,
    allFilteredReviews: filteredReviews,
    totalReviews: filteredReviews.length,
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
    rawReviews: listings,
    handleLoadMore,
    handleGenerateReport,
    respondModal,
    setRespondModal,
    updateReviewResponse,
    isHeaderLoading: isLoading,
    isSyncing: isFilterLoading || isLoadingMore,
    isLoading: isLoading || isFilterLoading
  };
}
