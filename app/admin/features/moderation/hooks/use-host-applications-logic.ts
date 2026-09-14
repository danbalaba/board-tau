import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useHostApplications, useModerationDecision, useModerationDelete } from '@/app/admin/hooks/use-moderation';
import { toast } from '@/app/admin/components/ui/sonner';

export function useHostApplicationsLogic({ range }: { range?: string } = {}) {
  const searchParams = useSearchParams();
  const autoSelectId = searchParams.get('id') || searchParams.get('selectedId');
  const urlIsArchived = searchParams.get('isArchived') === 'true';

  const [isArchived, setIsArchived] = useState(urlIsArchived);

  useEffect(() => {
    if (urlIsArchived && !isArchived) {
      setIsArchived(true);
    }
  }, [urlIsArchived]);

  const { data: apiResponse, isLoading, error, refetch, isFetching } = useHostApplications({ isArchived, range });
  const { mutate: decide, isPending: isDeciding } = useModerationDecision();
  const { mutate: doDelete, isPending: isDeleting } = useModerationDelete();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilterState] = useState<string>('all');
  const [sortBy, setSortByState] = useState('newest');
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const setStatusFilter = (val: string) => {
    setIsFilterLoading(true);
    setStatusFilterState(val);
    setTimeout(() => setIsFilterLoading(false), 250);
  };

  const setSortBy = (val: string) => {
    setIsFilterLoading(true);
    setSortByState(val);
    setTimeout(() => setIsFilterLoading(false), 250);
  };

  const handleClearFilters = () => {
    setIsFilterLoading(true);
    setStatusFilterState('all');
    setSearchQuery('');
    setSortByState('newest');
    setTimeout(() => setIsFilterLoading(false), 250);
  };

  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [itemToArchive, setItemToArchive] = useState<any | null>(null);

  const applications = apiResponse?.data || [];

  // Auto-open modal if URL has ?id=XYZ or ?selectedId=XYZ
  useEffect(() => {
    if (autoSelectId && !selectedApplication) {
      if (applications.length > 0) {
        const match = applications.find((a: any) => a.id === autoSelectId);
        if (match) {
          setSelectedApplication(match);
          setViewModalOpen(true);
          return;
        }
      }
      if (!isLoading && !isFetching && !isArchived) {
        setIsArchived(true);
      }
    }
  }, [applications, autoSelectId, selectedApplication, isLoading, isFetching, isArchived]);
  const pendingCount = apiResponse?.meta?.stats?.pending || 0;
  const approvedCount = apiResponse?.meta?.stats?.approved || 0;
  const rejectedCount = apiResponse?.meta?.stats?.rejected || 0;

  const totalLastWeek = apiResponse?.meta?.stats?.totalLastWeek || 0;
  const pendingLastWeek = apiResponse?.meta?.stats?.pendingLastWeek || 0;
  const approvedLastWeek = apiResponse?.meta?.stats?.approvedLastWeek || 0;
  const rejectedLastWeek = apiResponse?.meta?.stats?.rejectedLastWeek || 0;

  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((app: any) => 
        app.user?.name?.toLowerCase().includes(q) || 
        app.user?.email?.toLowerCase().includes(q) ||
        app.businessInfo?.businessName?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((app: any) => app.status === statusFilter);
    }

    result.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name_asc':
          return (a.user?.name || '').localeCompare(b.user?.name || '');
        case 'business_asc':
          return (a.businessInfo?.businessName || '').localeCompare(b.businessInfo?.businessName || '');
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [applications, searchQuery, statusFilter, sortBy]);

  const handleRefresh = async () => {
    toast.promise(refetch(), {
      loading: 'Syncing host applications...',
      success: 'Security clearance queue synchronized.',
      error: 'Failed to synchronize queue.'
    });
  };

  const handleDecision = (id: string, action: 'approve' | 'reject' | 'archive' | 'unarchive', reason?: string) => {
    const appTitle = itemToArchive?.id === id 
      ? (itemToArchive.businessInfo?.businessName || itemToArchive.user?.name) 
      : selectedApplication?.id === id 
        ? (selectedApplication.businessInfo?.businessName || selectedApplication.user?.name) 
        : null;
    const nameStr = appTitle ? `"${appTitle}"` : 'Host Application';

    decide({ id, entityType: 'hostApplication', action, reason }, {
      onSuccess: () => {
        if (action === 'archive') {
          toast.success(`${nameStr} Archived`, {
            description: 'Moved to Admin Archive. The application is now hidden from the active review queue.'
          });
        } else if (action === 'unarchive') {
          toast.success(`${nameStr} Restored`, {
            description: 'Successfully restored to the active host application review queue.'
          });
        } else if (action === 'approve') {
          toast.success(`${nameStr} Approved`, {
            description: 'Host application authorized and user granted host privileges.'
          });
        } else if (action === 'reject') {
          toast.warning(`${nameStr} Rejected`, {
            description: 'Host application rejected and feedback logged.'
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

  const handleArchive = (application: any) => {
    setItemToArchive(application);
    setArchiveModalOpen(true);
  };

  const handleConfirmArchive = () => {
    if (!itemToArchive) return;
    const isCurrentlyArchived = Boolean(itemToArchive.isArchived || itemToArchive.isAdminArchived || isArchived);
    const action = isCurrentlyArchived ? 'unarchive' : 'archive';
    handleDecision(itemToArchive.id, action);
    setArchiveModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedApplication) return;
    doDelete({ id: selectedApplication.id, entityType: 'hostApplication' }, {
      onSuccess: () => {
        toast.success('Host application and sensitive files permanently deleted.');
        setDeleteModalOpen(false);
      },
      onError: (err: any) => {
        toast.error(`Error during deletion: ${err.message}`);
      }
    });
  };

  return {
    applications,
    filteredApplications,
    pendingCount,
    approvedCount,
    rejectedCount,
    totalLastWeek,
    pendingLastWeek,
    approvedLastWeek,
    rejectedLastWeek,
    isLoading: isLoading || isFetching || isFilterLoading,
    error,
    isDeciding,
    isDeleting,
    isArchiving: isDeciding,
    isArchived,
    setIsArchived,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    handleClearFilters,
    selectedApplication,
    setSelectedApplication,
    viewModalOpen,
    setViewModalOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    archiveModalOpen,
    setArchiveModalOpen,
    itemToArchive,
    handleRefresh,
    handleDecision,
    handleArchive,
    handleConfirmArchive,
    handleConfirmDelete
  };
}
