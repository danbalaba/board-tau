'use client';

import React from 'react';
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
    viewModalOpen,
    setViewModalOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    isDeleting,
    isLoadingMore,
    nextCursor,
    handleConfirmDelete,
    handleRespond,
    handleLoadMore,
    handleGenerateReport,
    rawInquiries
  } = useInquiryLogic(inquiries);

  const { ref: loadMoreRef } = useLoadMore(
    handleLoadMore,
    !!nextCursor,
    isLoadingMore,
    false
  );

  useRegisterActions(
    rawInquiries.map((inquiry) => ({
      id: `inquiry-${inquiry.id}`,
      name: `Inquiry from ${inquiry.user.name || 'Anonymous Tenant'}`,
      subtitle: `Property: ${inquiry.listing.title}`,
      keywords: `inquiry tenant message ${inquiry.user.name} ${inquiry.listing.title}`,
      section: 'Inquiries',
      perform: () => {
        // We don't have a direct "view details" function exported from useInquiryLogic that we can call
        // But we can trigger the same logic as the card's response button or just navigate
        // For now, let's navigate to the inquiries page to ensure it's filtered
        setSearchQuery(inquiry.user.name || inquiry.user.email);
      },
      icon: <IconMessage size={18} />
    })),
    [rawInquiries]
  );

  return (
    <div className="space-y-6">
      <LandlordInquiryModals 
        deleteModalOpen={deleteModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
        viewModalOpen={viewModalOpen}
        setViewModalOpen={setViewModalOpen}
        selectedInquiry={selectedInquiry}
        isDeleting={isDeleting}
        handleConfirmDelete={handleConfirmDelete}
      />

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
      />

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
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
              />
            ))}
            {/* Scroll Sentinel */}
            <div ref={loadMoreRef} className="h-1 col-span-full opacity-0 pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {nextCursor && (
        <div className="flex flex-col items-center gap-4 pt-12 pb-8">
           <div className="flex items-center gap-4">
            <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-gray-200 dark:to-gray-800" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                {isLoadingMore ? 'Fetching more inquiries...' : 'Scroll for more'}
              </span>
            </div>
            <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-gray-200 dark:to-gray-800" />
          </div>

          <Button
            outline
            className="rounded-[20px] px-10 py-4 border-2 border-gray-100 dark:border-gray-800 group hover:border-primary/40 hover:bg-primary/5 transition-all shadow-sm"
            onClick={handleLoadMore}
            isLoading={isLoadingMore}
          >
            <span className="flex items-center gap-2 uppercase font-black tracking-[0.2em] text-[10px] text-gray-500 group-hover:text-primary transition-colors">
              {isLoadingMore ? "Processing..." : "Force Load More"}
              <IconChevronDown className="group-hover:translate-y-1 transition-transform" size={12} strokeWidth={3} />
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
