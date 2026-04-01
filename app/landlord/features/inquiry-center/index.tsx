'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconInbox, IconChevronDown } from '@tabler/icons-react';
import { cn } from '@/utils/helper';
import Button from '@/components/common/Button';
import { useInquiryLogic, Inquiry } from './hooks/use-inquiry-logic';
import { LandlordInquiryHeader } from './components/landlord-inquiry-header';
import { LandlordInquiryCard } from './components/landlord-inquiry-card';
import { LandlordInquiryModals } from './components/landlord-inquiry-modals';

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
    handleGenerateReport
  } = useInquiryLogic(inquiries);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 p-2">
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
      />

      <AnimatePresence mode="wait">
        {filteredInquiries.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-24 bg-white dark:bg-gray-900 rounded-[40px] border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center shadow-sm"
          >
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-[32px] flex items-center justify-center text-gray-300 mb-8 border border-gray-100 dark:border-gray-800">
              <IconInbox size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Box is Empty</h3>
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
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "flex flex-col gap-6"
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
          </motion.div>
        )}
      </AnimatePresence>

      {nextCursor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-8"
        >
          <Button
            outline
            className="rounded-[20px] px-10 py-4 border-2 border-gray-100 dark:border-gray-800 group hover:border-primary/40 hover:bg-primary/5 transition-all shadow-sm"
            onClick={handleLoadMore}
            isLoading={isLoadingMore}
          >
            <span className="flex items-center gap-2 uppercase font-black tracking-[0.2em] text-[10px] text-gray-500 group-hover:text-primary transition-colors">
              {isLoadingMore ? "Processing..." : "Load More Inquiries"}
              <IconChevronDown className="group-hover:translate-y-1 transition-transform" size={12} strokeWidth={3} />
            </span>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
