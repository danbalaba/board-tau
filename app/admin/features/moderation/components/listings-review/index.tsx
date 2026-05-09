// app/admin/features/moderation/components/listings-review/index.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconBuildingCommunity } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useListingsReviewLogic } from '../../hooks/use-listings-review-logic';
import { AdminListingHeader } from './admin-listing-header';
import { AdminListingCard } from './admin-listing-card';
import { AdminListingReviewModal } from './admin-listing-review-modal';
import { ListingKPICards } from './listing-kpi-cards';
import { Button } from '@/app/admin/components/ui/button';

export function ListingsReviewDashboard() {
  const {
    filteredListings,
    pendingCount,
    approvedCount,
    rejectedCount,
    isLoading,
    isDeciding,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedListing,
    setSelectedListing,
    viewModalOpen,
    setViewModalOpen,
    handleRefresh,
    handleDecision
  } = useListingsReviewLogic();

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminListingHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleRefresh={handleRefresh}
        pendingCount={pendingCount}
        isLoading={isLoading}
      />

      <ListingKPICards 
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
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Scanning Platform Assets</p>
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
                    Showing {filteredListings.length} pending asset{filteredListings.length !== 1 ? 's' : ''}
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
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-primary">
                      <IconBuildingCommunity size={24} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Queue is Clear</h3>
                    <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">
                      {searchQuery ? `No properties found matching "${searchQuery}"` : "All platform assets have been successfully vetted. No pending properties at this time."}
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
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "space-y-4"
                    )}
                  >
                    {filteredListings.map((listing, idx) => (
                      <AdminListingCard 
                        key={`${viewMode}-${listing.id}`}
                        listing={listing}
                        idx={idx}
                        viewMode={viewMode}
                        handleDecision={handleDecision}
                        isDeciding={isDeciding}
                        onViewDetails={() => {
                          setSelectedListing(listing);
                          setViewModalOpen(true);
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

      <AdminListingReviewModal 
        listing={selectedListing}
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        onDecision={handleDecision}
        isDeciding={isDeciding}
      />
    </div>
  );
}
