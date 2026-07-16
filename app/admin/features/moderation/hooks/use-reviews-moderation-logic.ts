import { useState, useMemo } from 'react';
import { useReviewsModeration, useModerationDecision, useModerationDelete } from '@/app/admin/hooks/use-moderation';
import { toast } from '@/app/admin/components/ui/sonner';

export function useReviewsModerationLogic(isArchived: boolean = false) {
  const { data: apiResponse, isLoading, error, refetch, isFetching } = useReviewsModeration({ isArchived });
  const { mutate: decide, isPending: isDeciding } = useModerationDecision();
  const { mutate: doDelete, isPending: isDeleting } = useModerationDelete();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToArchive, setItemToArchive] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);

  const reviews = apiResponse?.data || [];
  const pendingCount = apiResponse?.meta?.stats?.pending || 0;
  const approvedCount = apiResponse?.meta?.stats?.approved || 0;
  const rejectedCount = apiResponse?.meta?.stats?.rejected || 0;
  const totalLastWeek = apiResponse?.meta?.stats?.totalLastWeek || 0;
  const pendingLastWeek = apiResponse?.meta?.stats?.pendingLastWeek || 0;
  const approvedLastWeek = apiResponse?.meta?.stats?.approvedLastWeek || 0;
  const rejectedLastWeek = apiResponse?.meta?.stats?.rejectedLastWeek || 0;
  
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
    toast.promise(refetch(), {
      loading: 'Syncing reputation feed...',
      success: 'Reputation feed synchronized successfully.',
      error: 'Failed to synchronize feed.'
    });
  };

  const handleDecision = (id: string, action: 'approve' | 'reject' | 'archive', reason?: string) => {
    decide({ id, entityType: 'review', action, reason }, {
      onSuccess: () => {
        toast.success(action === 'archive' ? 'Feedback archived.' : `Feedback ${action === 'approve' ? 'authorized' : 'rejected'}.`);
        setViewModalOpen(false);
      },
      onError: (err: any) => {
        toast.error(`Decision Failed: ${err.message}`);
      }
    });
  };

  const handleArchive = (review: any) => {
    setItemToArchive(review);
    setArchiveModalOpen(true);
  };

  const handleConfirmArchive = () => {
    if (!itemToArchive) return;
    handleDecision(itemToArchive.id, 'archive');
    setArchiveModalOpen(false);
  };

  const handleDelete = (review: any) => {
    setItemToDelete(review);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    doDelete({ id: itemToDelete.id, entityType: 'review' }, {
      onSuccess: () => {
        toast.success('Feedback permanently deleted.');
        setDeleteModalOpen(false);
      },
      onError: (err: any) => {
        toast.error(`Delete Failed: ${err.message}`);
      }
    });
  };

  return {
    reviews,
    filteredReviews,
    pendingCount,
    approvedCount,
    rejectedCount,
    totalLastWeek,
    pendingLastWeek,
    approvedLastWeek,
    rejectedLastWeek,
    avgRating,
    isLoading,
    isFetching,
    error,
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
    handleDecision,
    handleArchive,
    handleConfirmArchive,
    handleDelete,
    handleConfirmDelete,
    isDeleting,
    archiveModalOpen,
    setArchiveModalOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    itemToArchive,
    itemToDelete
  };
}
