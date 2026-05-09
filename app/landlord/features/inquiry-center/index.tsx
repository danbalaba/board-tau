'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { IconInbox, IconChevronDown, IconMessage } from '@tabler/icons-react';
import { cn } from '@/utils/helper';
import { useRegisterActions } from 'kbar';
import Button from '@/components/common/Button';
import { useInquiryLogic, Inquiry } from './hooks/use-inquiry-logic';
import { LandlordInquiryHeader } from './components/landlord-inquiry-header';
import { LandlordInquiryCard } from './components/landlord-inquiry-card';
import { LandlordInquiryModals } from './components/landlord-inquiry-modals';
import { useLoadMore } from '@/hooks/useLoadMore';

interface LandlordInquiryCenterProps {
  inquiries: {
    inquiries: Inquiry[];
    nextCursor: string | null;
  };
}

export default function LandlordInquiryCenter({ inquiries }: LandlordInquiryCenterProps) {
  const {
    filteredInquiries,
    selectedStatus,
    setSelectedStatus,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedInquiry,
    setSelectedInquiry,
    viewModalOpen,
    setViewModalOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    rejectModalOpen,
    setRejectModalOpen,
    archiveModalOpen,
    setArchiveModalOpen,
    isDeleting,
    isResponding,
    isArchiving,
    isLoadingMore,
    nextCursor,
    handleConfirmDelete,
    handleConfirmArchive,
    handleRespond,
    handleConfirmReject,
    handleLoadMore,
    handleGenerateReport,
    isArchived,
    handleToggleArchived,
    rawInquiries,
    isLoading
  } = useInquiryLogic(inquiries);

  const { ref: loadMoreRef } = useLoadMore(
    handleLoadMore,
    !!nextCursor,
    isLoadingMore,
    false
  );

  const searchParams = useSearchParams();

  React.useEffect(() => {
    const id = searchParams?.get('id');
    if (id && rawInquiries.length > 0) {
      const target = rawInquiries.find(i => i.id === id);
      if (target && !viewModalOpen) {
        setSelectedInquiry(target);
        setViewModalOpen(true);
      }
    }
  }, [searchParams, rawInquiries, viewModalOpen, setSelectedInquiry, setViewModalOpen]);

  useRegisterActions(
    rawInquiries.map((inquiry: Inquiry) => ({
      id: `inquiry-${inquiry.id}`,
      name: `Inquiry from ${inquiry.user.name || 'Anonymous Tenant'}`,
      subtitle: `Property: ${inquiry.listing.title}`,
      keywords: `inquiry tenant message ${inquiry.user.name} ${inquiry.listing.title}`,
      section: 'Inquiries',
      perform: () => {
        setSearchQuery(inquiry.user.name || inquiry.user.email);
      },
      icon: <IconMessage size={18} />
    })),
    [rawInquiries]
  );

  return (
    <div className="space-y-6">
      <LandlordInquiryHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleGenerateReport={handleGenerateReport}
        rawInquiries={rawInquiries}
        isArchived={isArchived}
        onToggleArchived={handleToggleArchived}
      />

      <div className="min-h-[400px] relative">
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
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Syncing Inquiries</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              {filteredInquiries.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Showing {filteredInquiries.length} inquir{filteredInquiries.length !== 1 ? 'ies' : 'y'}
                  </span>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                </div>
              )}

              <AnimatePresence mode="wait">
                {filteredInquiries.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center shadow-sm"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-primary">
                      <IconInbox size={24} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Box is Empty</h3>
                    <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">
                      {searchQuery ? `No inquiries found matching "${searchQuery}"` : "No inquiries currently match your filter criteria."}
                    </p>
                    {searchQuery && (
                      <Button outline onClick={() => setSearchQuery("")} className="mt-8 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest">
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
                    {filteredInquiries.map((inquiry, idx) => (
                      <LandlordInquiryCard 
                        key={`${viewMode}-${inquiry.id}`}
                        inquiry={inquiry}
                        idx={idx}
                        viewMode={viewMode}
                        handleRespond={handleRespond}
                        isResponding={isResponding}
                        onArchive={() => {
                          setSelectedInquiry(inquiry);
                          setArchiveModalOpen(true);
                        }}
                        onDelete={(inq) => {
                          setSelectedInquiry(inq);
                          setDeleteModalOpen(true);
                        }}
                        onReject={() => {
                          setSelectedInquiry(inquiry);
                          setRejectModalOpen(true);
                        }}
                        onViewDetails={() => {
                          setSelectedInquiry(inquiry);
                          setViewModalOpen(true);
                        }}
                      />
                    ))}
                    {/* Scroll Sentinel */}
                    <div ref={loadMoreRef} className="h-1 col-span-full opacity-0 pointer-events-none" />
                  </motion.div>
                )}
              </AnimatePresence>

              {nextCursor && (
                <div className="flex flex-col items-center gap-4 pt-12 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-gray-200 dark:to-gray-800" />
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        {isLoadingMore ? 'Loading more inquiries...' : 'More inquiries available'}
                      </span>
                    </div>
                    <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-gray-200 dark:to-gray-800" />
                  </div>

                  <Button
                    outline
                    className="rounded-2xl px-12 py-4 group hover:bg-primary hover:text-white transition-all shadow-xl shadow-primary/5 border-2 border-gray-100 dark:border-gray-800"
                    onClick={handleLoadMore}
                    isLoading={isLoadingMore}
                  >
                    <span className="flex items-center gap-2 uppercase font-black tracking-[0.2em] text-[10px]">
                      {isLoadingMore ? 'Loading...' : 'Load More'}
                      <IconChevronDown className="group-hover:translate-y-0.5 transition-transform" size={14} strokeWidth={3} />
                    </span>
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LandlordInquiryModals 
        deleteModalOpen={deleteModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
        viewModalOpen={viewModalOpen}
        setViewModalOpen={setViewModalOpen}
        rejectModalOpen={rejectModalOpen}
        setRejectModalOpen={setRejectModalOpen}
        archiveModalOpen={archiveModalOpen}
        setArchiveModalOpen={setArchiveModalOpen}
        selectedInquiry={selectedInquiry}
        isDeleting={isDeleting}
        isResponding={isResponding}
        isArchiving={isArchiving}
        handleConfirmDelete={handleConfirmDelete}
        handleConfirmArchive={handleConfirmArchive}
        handleConfirmReject={handleConfirmReject}
        handleRespond={handleRespond}
      />
    </div>
  );
}
