// app/admin/features/moderation/components/host-applications/index.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHostApplicationsLogic } from '../../hooks/use-host-applications-logic';
import { AdminApplicationHeader } from './admin-application-header';
import { AdminApplicationCard } from './admin-application-card';
import { AdminApplicationReviewModal } from './admin-application-review-modal';
import { ApplicationKPICards } from './application-kpi-cards';
import { Button } from '@/app/admin/components/ui/button';

export function HostApplicationsDashboard() {
  const {
    filteredApplications,
    pendingCount,
    approvedCount,
    rejectedCount,
    isLoading,
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
  } = useHostApplicationsLogic();

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
        pendingCount={pendingCount}
        isLoading={isLoading}
        isArchived={isArchived}
        onToggleArchived={() => setIsArchived(!isArchived)}
      />

      <ApplicationKPICards 
        total={pendingCount} 
        pending={pendingCount} 
        approved={approvedCount} 
        rejected={rejectedCount} 
      />

      <div className="min-h-[400px] relative mt-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-24 flex flex-col items-center justify-center gap-6"
            >
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-xl shadow-primary/10" />
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Initializing Security Clearance</p>
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
                    Showing {filteredApplications.length} identit{filteredApplications.length !== 1 ? 'ies' : 'y'}
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
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-primary">
                      <Users size={24} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Queue is Clear</h3>
                    <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">
                      {searchQuery ? `No applications found matching "${searchQuery}"` : "All landlord identities have been successfully verified. No pending applications at this time."}
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
                        onArchive={handleToggleArchive}
                        onDelete={(app) => {
                          setSelectedApplication(app);
                          setDeleteModalOpen(true);
                        }}
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
