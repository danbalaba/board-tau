'use client';

import React from 'react';
import { IconSearchOff, IconChevronDown, IconBuilding, IconPlus } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import { useRegisterActions } from 'kbar';
import { useRouter } from 'next/navigation';
import { usePropertyLogic, Property } from './hooks/use-property-logic';
import { LandlordPropertyHeader } from './components/landlord-property-header';
import { LandlordPropertyCard } from './components/landlord-property-card';
import { LandlordPropertyDetailsModal } from './components/landlord-property-details-modal';
import { LandlordPropertyDeleteModal } from './components/landlord-property-delete-modal';
import { LandlordPropertyArchiveModal } from './components/landlord-property-archive-modal';
import { useLoadMore } from '@/hooks/useLoadMore';
import Link from 'next/link';
import { Button } from '@/app/admin/components/ui/button';

interface LandlordPropertyManagementProps {
  properties: {
    listings: Property[];
    nextCursor: string | null;
  };
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  pending: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
  rejected: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
  flagged: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
};

const formatStatus = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

export default function LandlordPropertyManagement({ properties }: LandlordPropertyManagementProps) {
  const router = useRouter();
  const {
    listings,
    nextCursor,
    isLoadingMore,
    deleteModalOpen,
    setDeleteModalOpen,
    viewModalOpen,
    setViewModalOpen,
    archiveModalOpen,
    setArchiveModalOpen,
    selectedProperty,
    setSelectedProperty,
    isDeleting,
    isArchiving,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    isArchived,
    setIsArchived,
    uniqueCategories,
    handleConfirmDelete,
    handleLoadMore,
    handleGenerateReport,
    handleClearFilters,
    handleConfirmArchive,
    isLoading
  } = usePropertyLogic(properties.listings, properties.nextCursor);

  const { ref: loadMoreRef } = useLoadMore(
    handleLoadMore,
    !!nextCursor,
    isLoadingMore,
    false
  );

  useRegisterActions(
    [
      {
        id: 'add-property',
        name: 'Add New Property',
        subtitle: 'List a new rental property to your portfolio',
        keywords: 'create add new listing property',
        section: 'Properties',
        perform: () => router.push('/landlord/properties/create'),
        icon: <IconPlus size={18} />,
        shortcut: ['a', 'p']
      },
      ...listings.map((property) => ({
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
      }))
    ],
    [listings]
  );

  return (
    <div className="space-y-8 p-1 pb-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <LandlordPropertyHeader 
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        listings={listings}
        onGenerateReport={handleGenerateReport}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        uniqueCategories={uniqueCategories}
        onClear={handleClearFilters}
        isArchived={isArchived}
        onToggleArchived={() => setIsArchived(!isArchived)}
      />

      {/* 2. Main Content Area */}
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
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Syncing Portfolio</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Results count */}
              {listings.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    {isArchived ? 'Archived Portfolio' : 'Active Portfolio'} ({listings.length} Listing{listings.length !== 1 ? 's' : ''})
                  </span>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                </div>
              )}

              {listings.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-24 bg-gray-50/50 dark:bg-gray-900/50 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
                  <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center text-gray-300 mb-8 shadow-2xl relative">
                    <IconBuilding size={40} className="text-gray-200" />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                      <IconPlus size={20} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                    {isArchived ? 'No archived listings' : 'No listings found'}
                  </h3>
                  <p className="text-gray-500 font-medium text-sm mb-10 text-center max-w-sm">
                    {isArchived
                      ? "You haven't archived any properties yet. Items you archive will appear here for management."
                      : searchQuery || categoryFilter !== 'all'
                        ? 'No properties match your current search or category filters.'
                        : 'Ready to grow your portfolio? Start by listing your first property today.'}
                  </p>
                  {searchQuery || categoryFilter !== 'all' || isArchived ? (
                    <Button 
                      className="h-14 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 border-b-4 border-primary/30 active:border-b-0 transition-all group"
                      onClick={handleClearFilters}
                    >
                      <span className="text-[12px] font-black uppercase tracking-widest">Reset View</span>
                    </Button>
                  ) : (
                    <Link href="/landlord/properties/create">
                      <Button className="h-14 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 border-b-4 border-primary/30 active:border-b-0 transition-all group">
                        <IconPlus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-[12px] font-black uppercase tracking-widest">Publish New Property</span>
                      </Button>
                    </Link>
                  )}
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
                      key={`${viewMode}-${property.id}`}
                      property={property}
                      idx={idx}
                      viewMode={viewMode}
                      statusColors={statusColors}
                      formatStatus={formatStatus}
                      onView={(p) => { setSelectedProperty(p); setViewModalOpen(true); }}
                      onDelete={(p) => { setSelectedProperty(p); setDeleteModalOpen(true); }}
                      onArchive={(p) => { setSelectedProperty(p); setArchiveModalOpen(true); }}
                    />
                  ))}
                  {/* Scroll Sentinel for Infinite Loading */}
                  <div ref={loadMoreRef} className="h-10 w-full col-span-full opacity-0 pointer-events-none" />
                </div>
              )}

              {nextCursor && (
                <div className="flex flex-col items-center gap-4 pt-12 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-gray-200 dark:to-gray-800" />
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        {isLoadingMore ? 'Loading more listings...' : 'More listings available'}
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
                      <IconChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                    </span>
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {viewModalOpen && selectedProperty && (
          <LandlordPropertyDetailsModal 
            property={selectedProperty}
            onClose={() => setViewModalOpen(false)}
            statusColors={statusColors}
            formatStatus={formatStatus}
            properties={listings}
            onNavigate={setSelectedProperty}
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

      <LandlordPropertyArchiveModal 
        isOpen={archiveModalOpen}
        onClose={setArchiveModalOpen}
        property={selectedProperty}
        onConfirm={handleConfirmArchive}
        isLoading={isArchiving}
      />
    </div>
  );
}
