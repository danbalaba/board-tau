import { useState, useMemo } from 'react';
import { useReviewsModeration, useModerationDecision } from '@/app/admin/hooks/use-moderation';
import { toast } from 'sonner';

export function useReviewsModerationLogic() {
  const { data: apiResponse, isLoading, refetch, isFetching } = useReviewsModeration();
  const { mutate: decide, isPending: isDeciding } = useModerationDecision();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const reviews = apiResponse?.data || [];
  const pendingCount = apiResponse?.meta?.stats?.pending || 0;
  const approvedCount = apiResponse?.meta?.stats?.approved || 0;
  
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '4.8';

  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r: any) => 
        r.listing?.title?.toLowerCase().includes(q) || 
        r.user?.name?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q)
      );
    }

    result.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'rating_high':
          return b.rating - a.rating;
        case 'rating_low':
          return a.rating - b.rating;
        case 'status':
          return a.status.localeCompare(b.status);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [reviews, searchQuery, sortBy]);

  const handleRefresh = async () => {
    await refetch();
    toast.success('Reputation feed synchronized successfully.');
  };

  const handleDecision = (id: string, action: 'approve' | 'reject', reason?: string) => {
    decide({ id, entityType: 'review', action, reason }, {
      onSuccess: () => {
        toast.success(`Feedback ${action === 'approve' ? 'authorized' : 'rejected'}.`);
        setViewModalOpen(false);
      },
      onError: (err: any) => {
        toast.error(`Decision Failed: ${err.message}`);
      }
    });
  };

  return {
    reviews,
    filteredReviews,
    pendingCount,
    approvedCount,
    avgRating,
    isLoading: isLoading || isFetching,
    isDeciding,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedReview,
    setSelectedReview,
    viewModalOpen,
    setViewModalOpen,
    handleRefresh,
    handleDecision
  };
}
