import { useState, useMemo } from 'react';
import { useHostApplications, useModerationDecision, useModerationDelete } from '@/app/admin/hooks/use-moderation';
import { toast } from '@/app/admin/components/ui/sonner';

export function useHostApplicationsLogic() {
  const [isArchived, setIsArchived] = useState(false);
  const { data: apiResponse, isLoading, error, refetch, isFetching } = useHostApplications({ isArchived });
  const { mutate: decide, isPending: isDeciding } = useModerationDecision();
  const { mutate: doDelete, isPending: isDeleting } = useModerationDelete();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [itemToArchive, setItemToArchive] = useState<any | null>(null);

  const applications = apiResponse?.data || [];
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

    result.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [applications, searchQuery, sortBy]);

  const handleRefresh = async () => {
    toast.promise(refetch(), {
      loading: 'Syncing host applications...',
      success: 'Security clearance queue synchronized.',
      error: 'Failed to synchronize queue.'
    });
  };

  const handleDecision = (id: string, action: 'approve' | 'reject' | 'archive', reason?: string) => {
    decide({ id, entityType: 'hostApplication', action, reason }, {
      onSuccess: () => {
        toast.success(action === 'archive' ? 'Host application archived.' : `Host application ${action === 'approve' ? 'authorized' : 'rejected'}.`);
        setViewModalOpen(false);
      },
      onError: (err: any) => {
        toast.error(`Decision Failed: ${err.message}`);
      }
    });
  };

  const handleArchive = (application: any) => {
    setItemToArchive(application);
    setArchiveModalOpen(true);
  };

  const handleConfirmArchive = () => {
    if (!itemToArchive) return;
    handleDecision(itemToArchive.id, 'archive');
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
    isLoading: isLoading || isFetching,
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
    sortBy,
    setSortBy,
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
