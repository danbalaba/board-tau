'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useListingsReviewLogic } from '@/app/admin/features/moderation/hooks/use-listings-review-logic';
import { AdminDirectoryHeader } from './admin-directory-header';
import { DirectoryKPICards } from './directory-kpi-cards';
import { AdminListingCard } from '@/app/admin/features/moderation/components/listings-review/admin-listing-card';
import { AdminListingReviewModal } from '@/app/admin/features/moderation/components/listings-review/admin-listing-review-modal';
import { AdminListingRejectModal } from '@/app/admin/features/moderation/components/listings-review/admin-listing-reject-modal';
import { AdminModerationActionLoaderModal } from '@/app/admin/features/moderation/components/listings-review/AdminModerationActionLoaderModal';
import { AdminArchiveModal } from '@/app/admin/components/modals/admin-archive-modal';
import { AdminDeleteModal } from '@/app/admin/components/modals/admin-delete-modal';
import { Button } from '@/app/admin/components/ui/button';
import { toast } from '@/app/admin/components/ui/sonner';
import { exportToCSV, exportToExcel } from '@/utils/export-utils';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AdminDashboardError } from '@/app/admin/components/ui/admin-dashboard-error';

export function PropertyDirectory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlIsArchived = searchParams.get('isArchived') === 'true';

  const [range, setRange] = useState('30d');
  const [isArchived, setIsArchived] = useState(urlIsArchived);
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  React.useEffect(() => {
    if (urlIsArchived && !isArchived) {
      setIsArchived(true);
    }
  }, [urlIsArchived]);

  const {
    filteredListings,
    pendingCount,
    approvedCount,
    rejectedCount,
    totalLastWeek,
    pendingLastWeek,
    approvedLastWeek,
    rejectedLastWeek,
    isFetching,
    isLoading,
    error,
    isDeciding,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    handleClearFilters,
    isFilterLoading,
    selectedListing,
    setSelectedListing,
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
    rejectModalOpen,
    setRejectModalOpen,
    moderationLoader,
    handleLoaderComplete,
    notFoundInActive
  } = useListingsReviewLogic(isArchived, range);

  React.useEffect(() => {
    if (notFoundInActive && !isArchived) {
      setIsArchived(true);
    }
  }, [notFoundInActive, isArchived]);

  const isGridLoading = isLoading || isFetching || isFilterLoading;

  if (error) {
    return <AdminDashboardError onRetry={handleRefresh} />;
  }

  const handleExport = async (format: 'CSV' | 'EXCEL' | 'PDF') => {
    const rangeLabel = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', '1y': 'Past Year' }[range] || range;
    const exportData = filteredListings.map((item: any) => ({
      'Title': item.title || item.name,
      'Host': item.owner?.name || item.user?.name || 'N/A',
      'Status': item.status,
      'Category': item.propertyType?.name || item.category || 'Boarding House',
      'Price': item.price ? `₱${item.price}` : 'N/A',
      'Rooms': item.roomCount || item.rooms?.length || 1,
      'Submitted At': new Date(item.createdAt).toLocaleDateString(),
    }));
    const meta = {
      reportTitle: 'Property Directory Report',
      title: 'Property Directory Report',
      reportId: `BTAU-PROP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [{ label: 'Period', value: rangeLabel }, { label: 'Items Exported', value: `${exportData.length}` }],
      summaryData: [{ label: 'Period', value: rangeLabel }, { label: 'Items Exported', value: `${exportData.length}` }],
      author: 'BoardTAU Admin Dashboard',
    };
    const fileName = `Property_Directory_${new Date().toLocaleDateString().replace(/\//g, '-')}`;
    
    if (format === 'CSV') {
      toast.promise(Promise.resolve(exportToCSV(exportData, fileName, meta)), { loading: 'Preparing CSV...', success: 'Exported as CSV!', error: 'Export failed.' });
    } else if (format === 'EXCEL') {
      toast.promise(Promise.resolve(exportToExcel(exportData, fileName, 'Properties', meta)), { loading: 'Preparing Excel...', success: 'Exported as Excel!', error: 'Export failed.' });
    } else if (format === 'PDF') {
      const { generateMultiSectionPDF } = await import('@/utils/pdfGenerator');
      const sections = [{
        title: 'Property Directory',
        type: 'table' as const,
        columns: ['Title', 'Host', 'Status', 'Category', 'Price', 'Rooms', 'Submitted At'],
        data: exportData.map((item: any) => [
          item['Title'],
          item['Host'],
          item['Status'],
          item['Category'],
          item['Price'],
          item['Rooms'],
          item['Submitted At']
        ])
      }];
      toast.promise(generateMultiSectionPDF(fileName, sections, meta), { loading: 'Preparing PDF...', success: 'Exported as PDF!', error: 'Export failed.' });
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminDirectoryHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onClearFilters={handleClearFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleRefresh={handleRefresh}
        onExport={handleExport}
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        totalCount={pendingCount + approvedCount + rejectedCount}
        isLoading={isLoading || isFetching || isFilterLoading}
        isFetching={isFetching}
        range={range}
        onRangeChange={setRange}
        isArchived={isArchived}
        onToggleArchived={() => setIsArchived(!isArchived)}
        isSuperAdmin={isSuperAdmin}
        onAddProperty={() => {
          toast.info('Navigating to listing submission moderation queue...');
          router.push('/admin/properties/moderation');
        }}
      />

      <DirectoryKPICards 
        total={pendingCount + approvedCount + rejectedCount}
        pending={pendingCount}
        approved={approvedCount}
        rejected={rejectedCount}
        totalLastWeek={totalLastWeek}
        pendingLastWeek={pendingLastWeek}
        approvedLastWeek={approvedLastWeek}
        rejectedLastWeek={rejectedLastWeek}
        isLoading={isLoading || isFetching}
        range={range}
      />

      <div className="min-h-[400px] relative mt-8">
        <AnimatePresence mode="wait">
          {isGridLoading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-6 flex flex-col h-[340px] shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-20 h-20 rounded-[1.5rem] shimmer" />
                    <div className="w-24 h-8 rounded-xl shimmer" />
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    <div className="h-6 w-3/4 rounded-lg shimmer" />
                    <div className="h-4 w-1/2 rounded-md shimmer" />
                  </div>
                  
                  <div className="mt-auto space-y-4">
                    <div className="h-12 w-full rounded-2xl shimmer" />
                    <div className="flex gap-3">
                      <div className="h-14 flex-1 rounded-2xl shimmer" />
                      <div className="h-14 flex-1 rounded-2xl shimmer" />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              {filteredListings.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Showing {filteredListings.length} {statusFilter && statusFilter !== 'all' ? statusFilter : isArchived ? 'archived' : 'total'} property listing{filteredListings.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                </div>
              )}

              <AnimatePresence mode="wait">
                {filteredListings.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center shadow-sm"
                  >
                    <div className={cn(
                      "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4",
                      isArchived ? "bg-gray-500/10 text-gray-400" : "bg-primary/10 text-primary"
                    )}>
                      <Building2 size={24} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                      {isArchived ? 'No Archived Properties' : 'No Properties Found'}
                    </h3>
                    <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">
                      {searchQuery
                        ? `No properties found matching "${searchQuery}"`
                        : isArchived
                        ? "You haven't archived any property listings yet."
                        : "No property listings found for the selected filter."
                      }
                    </p>
                    {searchQuery && (
                      <Button variant="outline" onClick={() => setSearchQuery("")} className="mt-8 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest">
                        Clear Search
                      </Button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    className={cn(
                      viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        : "space-y-4"
                    )}
                  >
                    {filteredListings.map((listing, idx) => (
                      <AdminListingCard 
                        key={listing.id}
                        listing={listing}
                        idx={idx}
                        viewMode={viewMode}
                        onViewDetails={() => {
                          setSelectedListing(listing);
                          setViewModalOpen(true);
                        }}
                        onApprove={() => handleDecision(listing.id, 'approve')}
                        onReject={() => {
                          setSelectedListing(listing);
                          setRejectModalOpen(true);
                        }}
                        isDeciding={isDeciding}
                        onArchive={handleArchive}
                        onDelete={handleDelete}
                        isArchived={isArchived}
                        isSuperAdmin={isSuperAdmin}
                        isDeleting={isDeleting}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AdminListingReviewModal 
        listing={selectedListing}
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        onDecision={handleDecision}
        isDeciding={isDeciding}
        onRestore={handleArchive}
      />

      <AdminListingRejectModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={(reason) => {
          if (selectedListing) {
            handleDecision(selectedListing.id, 'reject', reason);
          }
        }}
        listingTitle={selectedListing?.title || selectedListing?.name}
        isSubmitting={isDeciding}
      />

      <AdminArchiveModal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        onConfirm={handleConfirmArchive}
        isArchiving={isDeciding}
        isRestore={Boolean(itemToArchive?.isAdminArchived || itemToArchive?.isArchived || isArchived)}
        title={(itemToArchive?.isAdminArchived || itemToArchive?.isArchived || isArchived) ? 'Restore Listing' : 'Archive Listing'}
        description={(itemToArchive?.isAdminArchived || itemToArchive?.isArchived || isArchived) 
          ? `This will restore the property "${itemToArchive?.title || itemToArchive?.name || 'this listing'}" to the active directory.`
          : `This will move the property "${itemToArchive?.title || itemToArchive?.name || 'this listing'}" to your archive.`
        }
      />

      <AdminDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={`the property "${itemToDelete?.title || itemToDelete?.name || 'this listing'}"`}
        isDeleting={isDeleting}
      />

      <AdminModerationActionLoaderModal
        isOpen={moderationLoader.isOpen}
        actionType={moderationLoader.actionType}
        listingTitle={moderationLoader.listingTitle}
        onComplete={handleLoaderComplete}
      />
    </div>
  );
}

