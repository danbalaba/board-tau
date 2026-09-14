import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useListingsReview, useModerationDecision, useModerationDelete } from '@/app/admin/hooks/use-moderation';
import { toast } from '@/app/admin/components/ui/sonner';

export function useListingsReviewLogic(initialIsArchived: boolean = false, range: string = '30d') {
  const isArchived = initialIsArchived;
  const searchParams = useSearchParams();
  const autoSelectId = searchParams.get('id') || searchParams.get('selectedId');

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const { data: apiResponse, isLoading, error, refetch, isFetching } = useListingsReview({
    isArchived,
    range,
    status: statusFilter !== 'all' ? statusFilter : undefined
  });
  const { mutate: decide, isPending: isDeciding } = useModerationDecision();
  const { mutate: doDelete, isPending: isDeleting } = useModerationDelete();

  // Raw data from the API
  const rawListings = apiResponse?.data || [];
  const pendingCount = apiResponse?.meta?.stats?.pending || 0;
  const approvedCount = apiResponse?.meta?.stats?.active || apiResponse?.meta?.stats?.approved || 0;
  const rejectedCount = apiResponse?.meta?.stats?.rejected || 0;
  const totalLastWeek = apiResponse?.meta?.stats?.totalLastWeek || 0;
  const pendingLastWeek = apiResponse?.meta?.stats?.pendingLastWeek || 0;
  const approvedLastWeek = apiResponse?.meta?.stats?.activeLastWeek || apiResponse?.meta?.stats?.approvedLastWeek || 0;
  const rejectedLastWeek = apiResponse?.meta?.stats?.rejectedLastWeek || 0;

  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [notFoundInActive, setNotFoundInActive] = useState(false);

  // Auto-open modal if URL has ?id=XYZ or ?selectedId=XYZ
  useEffect(() => {
    if (autoSelectId && !selectedListing) {
      if (rawListings.length > 0) {
        const match = rawListings.find((l: any) => l.id === autoSelectId);
        if (match) {
          setSelectedListing(match);
          setViewModalOpen(true);
          setNotFoundInActive(false);
          return;
        }
      }
      if (!isLoading && !isFetching && !isArchived) {
        setNotFoundInActive(true);
      }
    }
  }, [rawListings, autoSelectId, selectedListing, isLoading, isFetching, isArchived]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToArchive, setItemToArchive] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);

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

  // Filtering and Sorting
  const filteredListings = useMemo(() => {
    let result = [...rawListings];

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      const qStatus = statusFilter.toLowerCase();
      result = result.filter(listing => {
        const s = String(listing.status || 'pending').toLowerCase();
        if (qStatus === 'approved' || qStatus === 'active') {
          return s === 'approved' || s === 'active';
        }
        return s === qStatus;
      });
    }

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

  const [moderationLoader, setModerationLoader] = useState<{
    isOpen: boolean;
    actionType: 'approve' | 'reject';
    listingTitle: string;
  }>({
    isOpen: false,
    actionType: 'approve',
    listingTitle: ''
  });

  // Actions
  const handleRefresh = async () => {
    toast.promise(refetch(), {
      loading: 'Syncing listing queue...',
      success: 'Listings review queue synchronized.',
      error: 'Failed to synchronize listings.'
    });
  };

  const handleDecision = (id: string, action: 'approve' | 'reject' | 'archive' | 'unarchive', reason?: string) => {
    const listingTitle = itemToArchive?.id === id ? itemToArchive?.title : selectedListing?.id === id ? selectedListing?.title || selectedListing?.name : null;
    const nameStr = listingTitle ? `"${listingTitle}"` : 'Listing';

    if (action === 'approve' || action === 'reject') {
      setModerationLoader({
        isOpen: true,
        actionType: action,
        listingTitle: listingTitle || 'Property Listing'
      });
    }

    decide({ id, entityType: 'listing', action, reason }, {
      onSuccess: () => {
        if (action === 'archive') {
          toast.success(`${nameStr} Archived`, {
            description: 'Moved to Admin Archive. The listing is now suspended from public moderation.'
          });
        } else if (action === 'unarchive') {
          toast.success(`${nameStr} Restored`, {
            description: 'Successfully restored to the active Moderation Queue.'
          });
        } else if (action === 'approve') {
          toast.success(`${nameStr} Approved`, {
            description: 'Authorized and published live on BoardTAU.'
          });
        } else if (action === 'reject') {
          toast.warning(`${nameStr} Rejected`, {
            description: 'Listing rejected and feedback logged for the landlord.'
          });
        }

        // Close reject modal right away after API responds
        if (action === 'reject') {
          setRejectModalOpen(false);
        }
      },
      onError: (err: any) => {
        setModerationLoader(prev => ({ ...prev, isOpen: false }));
        toast.error('Action Failed', {
          description: err.message || 'Database operation failed.'
        });
      }
    });
  };

  const handleLoaderComplete = () => {
    setModerationLoader(prev => ({ ...prev, isOpen: false }));
    setViewModalOpen(false);
  };

  const handleArchive = (listing: any) => {
    setItemToArchive(listing);
    setArchiveModalOpen(true);
  };

  const handleConfirmArchive = () => {
    if (!itemToArchive) return;
    const isCurrentlyArchived = Boolean(itemToArchive.isAdminArchived || itemToArchive.isArchived);
    const action = isCurrentlyArchived ? 'unarchive' : 'archive';
    handleDecision(itemToArchive.id, action);
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
    
    // Modals
    selectedListing,
    setSelectedListing,
    viewModalOpen,
    setViewModalOpen,
    rejectModalOpen,
    setRejectModalOpen,
    moderationLoader,
    handleLoaderComplete,
    
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
    itemToDelete,
    notFoundInActive
  };
}
