'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, DoorOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import { Button } from '@/app/admin/components/ui/button';
import { IconChevronDown as TablerChevron } from '@tabler/icons-react';
import { LandlordRoomHeader } from './components/landlord-room-header';
import { LandlordRoomDetailsModal } from './components/landlord-room-details-modal';
import { LandlordRoomDeleteModal } from './components/landlord-room-delete-modal';
import { LandlordRoomArchiveModal } from './components/landlord-room-archive-modal';
import { LandlordRoomAddModal } from './components/landlord-room-add-modal';
import LandlordRoomEditModal from './components/landlord-room-edit-modal';
import { useRoomLogic, Room } from './hooks/use-room-logic';
import { LandlordRoomCard } from './components/landlord-room-card';
import { useLoadMore } from '@/hooks/useLoadMore';

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  FULL: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
  MAINTENANCE: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
};

const formatStatus = (status: string) => status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

interface LandlordRoomManagementHubProps {
  initialData: {
    rooms: Room[];
    nextCursor: string | null;
  };
}

export default function LandlordRoomManagementHub({ initialData }: LandlordRoomManagementHubProps) {
  const router = useRouter();
  const {
    rooms,
    totalCount,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    propertyFilter,
    setPropertyFilter,
    typeFilter,
    setTypeFilter,
    capacityFilter,
    setCapacityFilter,
    archiveModalOpen,
    setArchiveModalOpen,
    addModalOpen,
    setAddModalOpen,
    isArchived,
    setIsArchived,
    uniqueProperties,
    uniqueCapacities,
    handleGenerateReport,
    handleClearFilters,
    handleConfirmArchive,
    selectedRoom,
    setSelectedRoom,
    viewModalOpen,
    setViewModalOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    handleConfirmDelete,
    isDeleting,
    isArchiving,
    isLoading,
    hasMore,
    isLoadingMore,
    handleLoadMore,
  } = useRoomLogic(initialData.rooms, initialData.nextCursor);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const { ref: loadMoreRef } = useLoadMore(handleLoadMore, hasMore, isLoadingMore, false);

  return (
    <div className="space-y-8 p-1 pb-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* 1. Header */}
      <LandlordRoomHeader 
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        rooms={rooms}
        onGenerateReport={handleGenerateReport}
        propertyFilter={propertyFilter}
        setPropertyFilter={setPropertyFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        capacityFilter={capacityFilter}
        setCapacityFilter={setCapacityFilter}
        uniqueProperties={uniqueProperties}
        uniqueCapacities={uniqueCapacities}
        onClear={handleClearFilters}
        isArchived={isArchived}
        onToggleArchived={() => setIsArchived(!isArchived)}
        onAddRoom={() => setAddModalOpen(true)}
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
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Syncing Inventory</p>
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
              {totalCount > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    {isArchived ? 'Archived Units' : 'Active Units'} ({rooms.length} of {totalCount})
                  </span>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                </div>
              )}

              {rooms.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-24 bg-gray-50/50 dark:bg-gray-900/50 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800"
                >
                  <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center text-gray-300 mb-8 shadow-2xl relative">
                    <DoorOpen size={40} className="text-gray-200" />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                      <Plus size={20} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                    {isArchived ? 'No archived units' : 'No units found'}
                  </h3>
                  <p className="text-gray-500 font-medium text-sm mb-10 text-center max-w-sm">
                    {isArchived 
                      ? "You haven't archived any units yet. Items you archive will appear here for safekeeping."
                      : searchQuery || propertyFilter !== 'all' || typeFilter !== 'all' || capacityFilter !== 'all'
                        ? 'No rooms match your current filters. Try adjusting or resetting them.'
                        : 'Manage your room availability and occupancy by adding individual units to your properties.'}
                  </p>
                  <Button
                    className="h-14 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 border-b-4 border-primary/30 active:border-b-0 transition-all group"
                    onClick={handleClearFilters}
                  >
                    <span className="text-[12px] font-black uppercase tracking-widest">Clear Filters</span>
                  </Button>
                </motion.div>
              ) : (
                <>
                  <div className={cn(
                    viewMode === 'grid'
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "flex flex-col gap-4"
                  )}>
                    {rooms.map((room, idx) => (
                      <LandlordRoomCard
                        key={`${viewMode}-${room.id}`}
                        room={room}
                        idx={idx}
                        viewMode={viewMode}
                        statusColors={statusColors}
                        formatStatus={formatStatus}
                        onView={(r) => { setSelectedRoom(r); setViewModalOpen(true); }}
                        onEdit={(r) => { setSelectedRoom(r); setEditModalOpen(true); }}
                        onDelete={(r) => { setSelectedRoom(r); setDeleteModalOpen(true); }}
                        onArchive={(r) => { setSelectedRoom(r); setArchiveModalOpen(true); }}
                      />
                    ))}

                    {/* Intersection Observer Sentinel */}
                    <div ref={loadMoreRef} className="h-10 w-full col-span-full opacity-0 pointer-events-none" />
                  </div>

                  {/* Load More Section */}
                  {hasMore && (
                    <div className="flex flex-col items-center gap-4 pt-12 pb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-gray-200 dark:to-gray-800" />
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            {isLoadingMore ? 'Loading more...' : `${totalCount - rooms.length} more units`}
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
                          <TablerChevron size={14} className="group-hover:translate-y-0.5 transition-transform" />
                        </span>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {viewModalOpen && selectedRoom && (
          <LandlordRoomDetailsModal
            room={selectedRoom}
            onClose={() => setViewModalOpen(false)}
            onEdit={(r) => {
              setViewModalOpen(false);
              setSelectedRoom(r);
              setEditModalOpen(true);
            }}
            statusColors={statusColors}
            formatStatus={formatStatus}
            rooms={rooms}
            onNavigate={setSelectedRoom}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteModalOpen && selectedRoom && (
          <LandlordRoomDeleteModal
            room={selectedRoom}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>

      <LandlordRoomArchiveModal 
        isOpen={archiveModalOpen}
        onClose={setArchiveModalOpen}
        room={selectedRoom}
        onConfirm={handleConfirmArchive}
        isLoading={isArchiving}
      />

      <AnimatePresence>
        {addModalOpen && (
          <LandlordRoomAddModal
            isOpen={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            uniqueProperties={uniqueProperties}
            initialListingId={propertyFilter !== 'all' ? propertyFilter : ''}
            onSuccess={() => router.refresh()}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editModalOpen && selectedRoom && (
          <LandlordRoomEditModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            initialData={selectedRoom}
            onSuccess={() => {
              setEditModalOpen(false);
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
