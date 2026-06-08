import { useState, useMemo } from 'react';
import { useHostApplications, useModerationDecision } from '@/app/admin/hooks/use-moderation';
import { toast } from 'sonner';

export function useHostApplicationsLogic() {
  const { data: apiResponse, isLoading, refetch, isFetching } = useHostApplications();
  const { mutate: decide, isPending: isDeciding } = useModerationDecision();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isArchived, setIsArchived] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const applications = apiResponse?.data || [];
  const pendingCount = apiResponse?.meta?.stats?.pending || 0;
  const approvedCount = apiResponse?.meta?.stats?.approved || 0;
  const rejectedCount = apiResponse?.meta?.stats?.rejected || 0;

  const filteredApplications = useMemo(() => {
    let result = applications.filter((app: any) => !!app.isArchived === isArchived);

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
    await refetch();
    toast.success('Security clearance queue synchronized.');
  };

  const handleDecision = (id: string, action: 'approve' | 'reject', reason?: string) => {
    decide({ id, entityType: 'hostApplication', action, reason }, {
      onSuccess: () => {
        toast.success(`Host application ${action === 'approve' ? 'authorized' : 'rejected'}.`);
        setViewModalOpen(false);
      },
      onError: (err: any) => {
        toast.error(`Decision Failed: ${err.message}`);
      }
    });
  };

  const handleToggleArchive = async (id: string, currentStatus: boolean) => {
    setIsArchiving(true);
    try {
      const response = await fetch(`/api/admin/moderation/hosts?id=${id}&action=archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: !currentStatus })
      });

      if (response.ok) {
        toast.success(`Application ${currentStatus ? 'restored' : 'archived'} successfully.`);
        refetch();
      } else {
        toast.error('Failed to update archive status');
      }
    } catch (error) {
      toast.error('Error archiving application');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedApplication) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/moderation/hosts?id=${selectedApplication.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Host application and sensitive files permanently deleted.');
        setDeleteModalOpen(false);
        refetch();
      } else {
        toast.error('Failed to delete application');
      }
    } catch (error) {
      toast.error('Error during deletion');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    applications,
    filteredApplications,
    pendingCount,
    approvedCount,
    rejectedCount,
    isLoading: isLoading || isFetching,
    isDeciding,
    isArchiving,
    isDeleting,
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
    handleRefresh,
    handleDecision,
    handleToggleArchive,
    handleConfirmDelete
  };
}
