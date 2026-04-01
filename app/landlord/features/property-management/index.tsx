'use client';

import React from 'react';
import { IconSearchOff, IconChevronDown } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import Button from '@/components/common/Button';
import { usePropertyLogic, Property } from './hooks/use-property-logic';
import { LandlordPropertyHeader } from './components/landlord-property-header';
import { LandlordPropertyCard } from './components/landlord-property-card';
import { LandlordPropertyDetailsModal } from './components/landlord-property-details-modal';
import { LandlordPropertyDeleteModal } from './components/landlord-property-delete-modal';

interface LandlordPropertyManagementProps {
  properties: {
    listings: Property[];
    nextCursor: string | null;
  };
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-600 border-green-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
  flagged: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
};

const formatStatus = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

export default function LandlordPropertyManagement({ properties }: LandlordPropertyManagementProps) {
  const {
    listings,
    nextCursor,
    isLoadingMore,
    deleteModalOpen,
    setDeleteModalOpen,
    viewModalOpen,
    setViewModalOpen,
    selectedProperty,
    setSelectedProperty,
    isDeleting,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    handleConfirmDelete,
    handleLoadMore,
    handleGenerateReport
  } = usePropertyLogic(properties.listings, properties.nextCursor);

  return (
    <div className="space-y-8 p-1 pb-12">
      <LandlordPropertyHeader 
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Legacy pattern: No AnimatePresence wrapping the whole list to avoid juggling/popLayout artifacts */}
      {listings.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-gray-900/50 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
          <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center text-gray-300 mb-6 shadow-xl"><IconSearchOff size={32} /></div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">No listings found</h3>
          <p className="text-gray-500 font-medium text-sm mb-8">Ready to grow your portfolio?</p>
          <Button outline onClick={() => {}} className="rounded-2xl px-10 py-3 uppercase tracking-widest text-[10px] font-black">Publish New Property</Button>
        </motion.div>
      ) : (
        <div 
          className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "flex flex-col gap-4"
          )}
        >
          {listings.map((property, idx) => (
            <LandlordPropertyCard 
              key={`${viewMode}-${property.id}`} // Prepending viewMode to ensure clean re-mount during toggle, matching legacy behavior
              property={property}
              idx={idx}
              viewMode={viewMode}
              statusColors={statusColors}
              formatStatus={formatStatus}
              onView={(p) => { setSelectedProperty(p); setViewModalOpen(true); }}
              onDelete={(p) => { setSelectedProperty(p); setDeleteModalOpen(true); }}
            />
          ))}
        </div>
      )}

      {nextCursor && (
        <div className="flex justify-center pt-8">
          <Button outline className="rounded-2xl px-12 py-4 group hover:bg-primary hover:text-white transition-all shadow-xl shadow-primary/5" onClick={handleLoadMore} isLoading={isLoadingMore}>
            <span className="flex items-center gap-2 uppercase font-black tracking-[0.2em] text-[10px]">{isLoadingMore ? 'Fetching...' : 'Show More Listings'} <IconChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" /></span>
          </Button>
        </div>
      )}

      <AnimatePresence>
        {viewModalOpen && selectedProperty && (
          <LandlordPropertyDetailsModal 
            property={selectedProperty}
            onClose={() => setViewModalOpen(false)}
            statusColors={statusColors}
            formatStatus={formatStatus}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteModalOpen && selectedProperty && (
          <LandlordPropertyDeleteModal 
            isOpen={deleteModalOpen}
            property={selectedProperty}
            isDeleting={isDeleting}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
