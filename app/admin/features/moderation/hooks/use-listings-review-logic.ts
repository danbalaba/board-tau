import { useState, useMemo } from 'react';
import { useListingsReview, useModerationDecision, useModerationDelete } from '@/app/admin/hooks/use-moderation';
import { toast } from '@/app/admin/components/ui/sonner';

export function useListingsReviewLogic(isArchived: boolean = false) {
  const { data: apiResponse, isLoading, error, refetch, isFetching } = useListingsReview({ isArchived });
  const { mutate: decide, isPending: isDeciding } = useModerationDecision();
  const { mutate: doDelete, isPending: isDeleting } = useModerationDelete();

  // Raw data from the API
  const rawListings = apiResponse?.data || [];
  const pendingCount = apiResponse?.meta?.stats?.pending || 0;
  const approvedCount = apiResponse?.meta?.stats?.active || 0;
  const rejectedCount = apiResponse?.meta?.stats?.rejected || 0;
  const totalLastWeek = apiResponse?.meta?.stats?.totalLastWeek || 0;
  const pendingLastWeek = apiResponse?.meta?.stats?.pendingLastWeek || 0;
  const approvedLastWeek = apiResponse?.meta?.stats?.activeLastWeek || 0;
  const rejectedLastWeek = apiResponse?.meta?.stats?.rejectedLastWeek || 0;

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToArchive, setItemToArchive] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);

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
    toast.promise(refetch(), {
      loading: 'Syncing market inventory...',
      success: 'Market inventory synchronized.',
      error: 'Failed to synchronize inventory.'
    });
  };

  const handleDecision = (id: string, action: 'approve' | 'reject' | 'archive', reason?: string) => {
    decide({ id, entityType: 'listing', action, reason }, {
      onSuccess: () => {
        toast.success(action === 'archive' ? 'Listing archived.' : `Listing ${action === 'approve' ? 'authorized' : 'rejected'} successfully.`);
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

  const handleArchive = (listing: any) => {
    setItemToArchive(listing);
    setArchiveModalOpen(true);
  };

  const handleConfirmArchive = () => {
    if (!itemToArchive) return;
    handleDecision(itemToArchive.id, 'archive');
    setArchiveModalOpen(false);
  };

  const handleDelete = (listing: any) => {
    setItemToDelete(listing);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    doDelete({ id: itemToDelete.id, entityType: 'listing' }, {
      onSuccess: () => {
        toast.success('Listing permanently deleted.');
        setDeleteModalOpen(false);
      },
      onError: (err: any) => {
        toast.error(`Delete Failed: ${err.message}`);
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
    totalLastWeek,
    pendingLastWeek,
    approvedLastWeek,
    rejectedLastWeek,
    
    // State
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
    
    // Modals
    selectedListing,
    setSelectedListing,
    viewModalOpen,
    setViewModalOpen,
    rejectModalOpen,
    setRejectModalOpen,
    
    // Actions
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
