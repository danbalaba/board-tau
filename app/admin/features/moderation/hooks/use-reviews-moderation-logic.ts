import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useReviewsModeration, useModerationDecision, useModerationDelete } from '@/app/admin/hooks/use-moderation';
import { toast } from '@/app/admin/components/ui/sonner';

export function useReviewsModerationLogic(initialIsArchived: boolean = false, range: string = '30d') {
  const isArchived = initialIsArchived;
  const searchParams = useSearchParams();
  const autoSelectId = searchParams.get('id') || searchParams.get('selectedId');

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const { data: apiResponse, isLoading, error, refetch, isFetching } = useReviewsModeration({
    isArchived,
    range,
    status: statusFilter !== 'all' ? statusFilter : undefined
  });
  const { mutate: decide, isPending: isDeciding } = useModerationDecision();
  const { mutate: doDelete, isPending: isDeleting } = useModerationDelete();
  
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [notFoundInActive, setNotFoundInActive] = useState(false);

  const reviews = apiResponse?.data || [];

  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToArchive, setItemToArchive] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);

  // Auto-open modal if URL has ?id=XYZ or ?selectedId=XYZ
  useEffect(() => {
    if (autoSelectId && !selectedReview) {
      if (reviews.length > 0) {
        const match = reviews.find((r: any) => r.id === autoSelectId);
        if (match) {
          setSelectedReview(match);
          setViewModalOpen(true);
          setNotFoundInActive(false);
          return;
        }
      }
      if (!isLoading && !isFetching && !isArchived) {
        setNotFoundInActive(true);
      }
    }
  }, [reviews, autoSelectId, selectedReview, isLoading, isFetching, isArchived]);
  const pendingCount = apiResponse?.meta?.stats?.pending || 0;
  const approvedCount = apiResponse?.meta?.stats?.approved || 0;
  const rejectedCount = apiResponse?.meta?.stats?.rejected || 0;
  const totalLastWeek = apiResponse?.meta?.stats?.totalLastWeek || 0;
  const pendingLastWeek = apiResponse?.meta?.stats?.pendingLastWeek || 0;
  const approvedLastWeek = apiResponse?.meta?.stats?.approvedLastWeek || 0;
  const rejectedLastWeek = apiResponse?.meta?.stats?.rejectedLastWeek || 0;
  const avgRating = apiResponse?.meta?.stats?.avgRating ?? '0.0';

  const handleClearFilters = () => {
    setIsFilterLoading(true);
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('newest');
    setTimeout(() => setIsFilterLoading(false), 200);
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setIsFilterLoading(true);
    setStatusFilter(newStatus);
    setTimeout(() => setIsFilterLoading(false), 200);
  };

  const handleSortChange = (newSort: string) => {
    setIsFilterLoading(true);
    setSortBy(newSort);
    setTimeout(() => setIsFilterLoading(false), 200);
  };

  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (statusFilter && statusFilter !== 'all') {
      result = result.filter((r: any) => String(r.status || 'pending').toLowerCase() === statusFilter.toLowerCase());
    }

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

  const handleDecision = (id: string, action: 'approve' | 'reject' | 'archive' | 'unarchive', reason?: string) => {
    const reviewTitle = itemToArchive?.id === id 
      ? (itemToArchive.listing?.title || itemToArchive.user?.name) 
      : selectedReview?.id === id 
        ? (selectedReview.listing?.title || selectedReview.user?.name) 
        : null;
    const nameStr = reviewTitle ? `"${reviewTitle}"` : 'Review';

    decide({ id, entityType: 'review', action, reason }, {
      onSuccess: () => {
        if (action === 'archive') {
          toast.success(`${nameStr} Archived`, {
            description: 'Moved to Admin Archive. The feedback is now suspended from active moderation.'
          });
        } else if (action === 'unarchive') {
          toast.success(`${nameStr} Restored`, {
            description: 'Successfully restored to the active Review Moderation queue.'
          });
        } else if (action === 'approve') {
          toast.success(`${nameStr} Approved`, {
            description: 'Feedback authorized and published.'
          });
        } else if (action === 'reject') {
          toast.warning(`${nameStr} Rejected`, {
            description: 'Feedback rejected and hidden from public view.'
          });
        }
        setViewModalOpen(false);
      },
      onError: (err: any) => {
        toast.error('Action Failed', {
          description: err.message || 'Database operation failed.'
        });
      }
    });
  };

  const handleArchive = (review: any) => {
    setItemToArchive(review);
    setArchiveModalOpen(true);
  };

  const handleConfirmArchive = () => {
    if (!itemToArchive) return;
    const isCurrentlyArchived = Boolean(itemToArchive.isArchived || itemToArchive.isAdminArchived);
    const action = isCurrentlyArchived ? 'unarchive' : 'archive';
    handleDecision(itemToArchive.id, action);
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
    isFilterLoading,
    error,
    isDeciding,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    sortBy,
    setSortBy: handleSortChange,
    handleClearFilters,
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
    itemToDelete,
    notFoundInActive
  };
}
