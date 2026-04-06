'use client';

import React from 'react';
import { IconSearchOff, IconChevronDown, IconBuilding } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import { useRegisterActions } from 'kbar';
import Button from '@/components/common/Button';
import { usePropertyLogic, Property } from './hooks/use-property-logic';
import { LandlordPropertyHeader } from './components/landlord-property-header';
import { LandlordPropertyCard } from './components/landlord-property-card';
import { LandlordPropertyDetailsModal } from './components/landlord-property-details-modal';
import { LandlordPropertyDeleteModal } from './components/landlord-property-delete-modal';
import { useLoadMore } from '@/hooks/useLoadMore';

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
    searchQuery,
    setSearchQuery,
    handleConfirmDelete,
    handleLoadMore,
    handleGenerateReport
  } = usePropertyLogic(properties.listings, properties.nextCursor);

  const { ref: loadMoreRef } = useLoadMore(
    handleLoadMore,
    !!nextCursor,
    isLoadingMore,
    false
  );

  useRegisterActions(
    listings.map((property) => ({
      id: `property-${property.id}`,
      name: `Property: ${property.title}`,
      subtitle: `${property.region || 'No region'} • PHP ${property.price.toLocaleString()}`,
      keywords: `property listing ${property.title} ${property.region}`,
      section: 'Properties',
      perform: () => {
        setSelectedProperty(property);
        setViewModalOpen(true);
      },
      icon: <IconBuilding size={18} />
    })),
    [listings]
  );

  return (
    <div className="space-y-8 p-1 pb-12">
      <LandlordPropertyHeader 
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        properties={listings}
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
          {/* Scroll Sentinel for Infinite Loading */}
          <div ref={loadMoreRef} className="h-10 w-full col-span-full opacity-0 pointer-events-none" />
        </div>
      )}

      {nextCursor && (
        <div className="flex flex-col items-center gap-4 pt-12 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-gray-200 dark:to-gray-800" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                {isLoadingMore ? 'Fetching more listings...' : 'Scroll for more'}
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
              {isLoadingMore ? 'Fetching...' : 'Force Load More'} 
              <IconChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
            </span>
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
