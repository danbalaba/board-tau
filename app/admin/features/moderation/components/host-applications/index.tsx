// app/admin/features/moderation/components/host-applications/index.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHostApplicationsLogic } from '../../hooks/use-host-applications-logic';
import { AdminApplicationHeader } from './admin-application-header';
import { AdminApplicationCard } from './admin-application-card';
import { AdminApplicationReviewModal } from './admin-application-review-modal';
import { ApplicationKPICards } from './application-kpi-cards';
import { AdminArchiveModal } from '@/app/admin/components/modals/admin-archive-modal';
import { Button } from '@/app/admin/components/ui/button';
import { toast } from '@/app/admin/components/ui/sonner';
import { exportToCSV, exportToExcel } from '@/utils/export-utils';
import { useSession } from 'next-auth/react';
import { AdminDashboardError } from '@/app/admin/components/ui/admin-dashboard-error';

export function HostApplicationsDashboard() {
  const [range, setRange] = useState('30d');
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  const {
    filteredApplications,
    pendingCount,
    approvedCount,
    rejectedCount,
    totalLastWeek,
    pendingLastWeek,
    approvedLastWeek,
    rejectedLastWeek,
    isLoading,
    error,
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
    archiveModalOpen,
    setArchiveModalOpen,
    itemToArchive,
    handleRefresh,
    handleDecision,
    handleArchive,
    handleConfirmArchive,
    handleConfirmDelete
  } = useHostApplicationsLogic();

  if (error) {
    return <AdminDashboardError onRetry={handleRefresh} />;
  }

  const handleExport = async (format: 'CSV' | 'EXCEL' | 'PDF') => {
    const rangeLabel = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', '1y': 'Past Year' }[range] || range;
    const exportData = filteredApplications.map((item: any) => ({
      'Applicant': item.user?.name || 'N/A',
      'Email': item.user?.email || 'N/A',
      'Business Name': item.businessName || 'N/A',
      'Status': item.status,
      'Submitted At': new Date(item.createdAt).toLocaleDateString(),
    }));
    const meta = {
      reportTitle: 'Host Applications Report',
      title: 'Host Applications Report',
      reportId: `BTAU-APP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [{ label: 'Period', value: rangeLabel }, { label: 'Items Exported', value: `${exportData.length}` }],
      summaryData: [{ label: 'Period', value: rangeLabel }, { label: 'Items Exported', value: `${exportData.length}` }],
      author: 'BoardTAU Admin Dashboard',
    };
    const fileName = `Host_Applications_${new Date().toLocaleDateString().replace(/\//g, '-')}`;
    
    if (format === 'CSV') {
      toast.promise(Promise.resolve(exportToCSV(exportData, fileName, meta)), { loading: 'Preparing CSV...', success: 'Exported as CSV!', error: 'Export failed.' });
    } else if (format === 'EXCEL') {
      toast.promise(Promise.resolve(exportToExcel(exportData, fileName, 'Applications', meta)), { loading: 'Preparing Excel...', success: 'Exported as Excel!', error: 'Export failed.' });
    } else if (format === 'PDF') {
      const { generateMultiSectionPDF } = await import('@/utils/pdfGenerator');
      const sections = [{
        title: 'Host Applications',
        type: 'table' as const,
        columns: ['Applicant', 'Email', 'Business Name', 'Status', 'Submitted At'],
        data: exportData.map((item: any) => [
          item['Applicant'],
          item['Email'],
          item['Business Name'],
          item['Status'],
          item['Submitted At']
        ])
      }];
      toast.promise(generateMultiSectionPDF(fileName, sections, meta), { loading: 'Preparing PDF...', success: 'Exported as PDF!', error: 'Export failed.' });
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminApplicationHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleRefresh={handleRefresh}
        onExport={handleExport}
        pendingCount={pendingCount}
        isLoading={isLoading}
        isArchived={isArchived}
        onToggleArchived={() => setIsArchived(!isArchived)}
        range={range}
        onRangeChange={setRange}
        isSuperAdmin={isSuperAdmin}
      />

      <ApplicationKPICards 
        total={pendingCount + approvedCount + rejectedCount} 
        pending={pendingCount} 
        approved={approvedCount} 
        rejected={rejectedCount}
        totalLastWeek={totalLastWeek}
        pendingLastWeek={pendingLastWeek}
        approvedLastWeek={approvedLastWeek}
        rejectedLastWeek={rejectedLastWeek}
        isLoading={isLoading}
        range={range}
      />

      <div className="min-h-[400px] relative mt-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
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
              {filteredApplications.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Showing {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                </div>
              )}

              <AnimatePresence mode="wait">
                {filteredApplications.length === 0 ? (
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
                      <Users size={24} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                      {isArchived ? 'No Archived Applications' : 'Queue is Clear'}
                    </h3>
                    <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">
                      {searchQuery
                        ? `No applications found matching "${searchQuery}"`
                        : isArchived
                        ? "You haven't archived any applications yet. Archive an application to store it here."
                        : "All landlord identities have been successfully verified. No pending applications at this time."
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
                    {filteredApplications.map((application: any, idx: number) => (
                      <AdminApplicationCard 
                        key={`${viewMode}-${application.id}`}
                        application={application}
                        idx={idx}
                        viewMode={viewMode}
                        handleDecision={handleDecision}
                        isDeciding={isDeciding}
                        onViewDetails={() => {
                          setSelectedApplication(application);
                          setViewModalOpen(true);
                        }}
                        onArchive={handleArchive}
                        onDelete={(app) => {
                          setSelectedApplication(app);
                          setDeleteModalOpen(true);
                        }}
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

      <AdminApplicationReviewModal 
        application={selectedApplication}
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        onDecision={handleDecision}
        isDeciding={isDeciding}
      />

      <AdminArchiveModal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        onConfirm={handleConfirmArchive}
        isArchiving={isArchiving}
        isRestore={itemToArchive?.isArchived}
        title={itemToArchive?.isArchived ? 'Restore Application' : 'Archive Application'}
        description={itemToArchive?.isArchived 
          ? `This will restore the application for "${itemToArchive?.user?.name || 'this landlord'}" to the active queue.`
          : `This will move the application for "${itemToArchive?.user?.name || 'this landlord'}" to your archive.`
        }
      />

      <AnimatePresence>
        {deleteModalOpen && selectedApplication && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setDeleteModalOpen(false)} 
              className="absolute inset-0 bg-gray-900/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative bg-[#111827] rounded-[2.5rem] border border-white/10 p-10 max-w-md w-full shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
              
              <button onClick={() => setDeleteModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
      
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mb-8 text-red-500 shadow-inner border border-red-900/30">
                  <AlertTriangle size={36} className="animate-bounce" />
                </div>
                
                <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Destroy Sensitive Data</h3>
                <p className="text-[13px] text-gray-400 mb-10 leading-relaxed font-medium">
                  You are about to permanently delete the application for <span className="font-black text-white underline decoration-red-500/30 decoration-2 underline-offset-4">"{selectedApplication.user?.name || 'this landlord'}"</span>. 
                  This will wipe all selfies, government IDs, and legal permits from EdgeStore.
                </p>
      
                <div className="flex flex-col sm:flex-row w-full gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setDeleteModalOpen(false)} 
                    disabled={isDeleting}
                    className="flex-1 rounded-2xl py-4 border-gray-700 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 order-2 sm:order-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleConfirmDelete} 
                    disabled={isDeleting}
                    className="flex-1 rounded-2xl py-4 shadow-xl shadow-red-500/20 text-[10px] font-black uppercase tracking-[0.2em] order-1 sm:order-2"
                  >
                    {isDeleting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" /> Purging...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Trash2 size={14} /> Purge Identity
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
