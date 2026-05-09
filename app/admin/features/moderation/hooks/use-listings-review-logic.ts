import { useState, useMemo } from 'react';
import { useListingsReview, useModerationDecision } from '@/app/admin/hooks/use-moderation';
import { toast } from 'sonner';

export function useListingsReviewLogic() {
  const { data: apiResponse, isLoading, refetch, isFetching } = useListingsReview();
  const { mutate: decide, isPending: isDeciding } = useModerationDecision();

  // Raw data from the API
  const rawListings = apiResponse?.data || [];
  const pendingCount = apiResponse?.meta?.stats?.pending || 0;
  const approvedCount = apiResponse?.meta?.stats?.active || 0;
  const rejectedCount = apiResponse?.meta?.stats?.rejected || 0;

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modal & Selection state
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  // Filtering and Sorting
  const filteredListings = useMemo(() => {
    let result = [...rawListings];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        listing =>
          listing.title?.toLowerCase().includes(q) ||
          listing.user?.name?.toLowerCase().includes(q) ||
          listing.user?.email?.toLowerCase().includes(q)
      );
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price_desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'price_asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      default:
        break;
    }

    return result;
  }, [rawListings, searchQuery, sortBy]);

  // Actions
  const handleRefresh = async () => {
    await refetch();
    toast.success('Market inventory synchronized.');
  };

  const handleDecision = (id: string, action: 'approve' | 'reject', reason?: string) => {
    decide({ id, entityType: 'listing', action, reason }, {
      onSuccess: () => {
        toast.success(`Listing ${action === 'approve' ? 'authorized' : 'rejected'} successfully.`);
        // Close modals after action
        if (action === 'approve') setViewModalOpen(false);
        if (action === 'reject') {
          setRejectModalOpen(false);
          setViewModalOpen(false);
        }
      },
      onError: (err: any) => {
        toast.error(`Database Error: ${err.message}`);
      }
    });
  };

  return {
    // Data
    rawListings,
    filteredListings,
    pendingCount,
    approvedCount,
    rejectedCount,
    
    // State
    isLoading: isLoading || isFetching,
    isDeciding,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    
    // Modals
    selectedListing,
    setSelectedListing,
    viewModalOpen,
    setViewModalOpen,
    rejectModalOpen,
    setRejectModalOpen,
    
    // Actions
    handleRefresh,
    handleDecision
  };
}
