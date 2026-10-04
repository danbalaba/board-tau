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
import { LandlordPagination } from '../shared/landlord-pagination';

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-primary/90 text-white border-primary/40 shadow-primary/20',
  FULL: 'bg-rose-500/90 text-white border-rose-400/50 shadow-rose-500/20',
  MAINTENANCE: 'bg-amber-500/90 text-white border-amber-400/50 shadow-amber-500/20',
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
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
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
    statusFilter,
    setStatusFilter,
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
    handleStatusChange,
    refetchRooms,
  } = useRoomLogic(initialData.rooms, initialData.nextCursor);

  const [editModalOpen, setEditModalOpen] = useState(false);

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
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        uniqueProperties={uniqueProperties}
        uniqueCapacities={uniqueCapacities}
        onClear={handleClearFilters}
        isArchived={isArchived}
        onToggleArchived={() => setIsArchived(!isArchived)}
        onAddRoom={() => setAddModalOpen(true)}
        isLoading={isLoading}
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
              className={cn(viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6" : "space-y-4")}
            >
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 sm:p-5 space-y-4 animate-pulse shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
                  </div>
                  <div className="h-28 sm:h-36 bg-gray-200 dark:bg-gray-800 rounded-xl w-full" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                    <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                  </div>
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
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
              transition={{ duration: 0.15 }}
            >
              {/* Results count */}
              {totalCount > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    {isArchived ? 'Archived Units' : 'Active Units'} ({totalCount})
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
                      ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6"
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
                  </div>

                  <LandlordPagination 
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalCount / itemsPerPage)}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                    totalItems={totalCount}
                    itemName="units"
                  />
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
            isOpen={viewModalOpen}
            room={selectedRoom}
            onClose={() => setViewModalOpen(false)}
            onStatusChange={handleStatusChange}
            onEdit={(r) => {
              setViewModalOpen(false);
              setSelectedRoom(r);
              setEditModalOpen(true);
            }}
            rooms={rooms}
            onNavigateRoom={(direction) => {
              const currIdx = rooms.findIndex((r) => r.id === selectedRoom.id);
              if (direction === 'prev' && currIdx > 0) {
                setSelectedRoom(rooms[currIdx - 1]);
              } else if (direction === 'next' && currIdx < rooms.length - 1) {
                setSelectedRoom(rooms[currIdx + 1]);
              }
            }}
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
            onSuccess={() => {
              refetchRooms();
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editModalOpen && selectedRoom && (
          <LandlordRoomEditModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            initialData={selectedRoom}
            uniqueProperties={uniqueProperties}
            onSuccess={() => {
              setEditModalOpen(false);
              refetchRooms();
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
