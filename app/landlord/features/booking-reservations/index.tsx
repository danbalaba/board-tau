'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { IconCalendar, IconCalendarCheck, IconAlertTriangle, IconRestore, IconChevronDown } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/common/Button';
import { cn } from '@/utils/helper';
import { useRegisterActions } from 'kbar';
import { useReservationLogic, ReservationRequest } from './hooks/use-reservation-logic';
import { LandlordReservationHeader } from './components/landlord-reservation-header';
import { LandlordReservationCard } from './components/landlord-reservation-card';
import { LandlordReservationDetailsModal } from './components/landlord-reservation-details-modal';
import { useSearchParams } from 'next/navigation';
import { useLoadMore } from '@/hooks/useLoadMore';
import LandlordArchiveModal from '../inquiry-center/components/landlord-inquiry-archive-modal';

const PAGE_SIZE = 12;

interface LandlordBookingReservationsProps {
  reservations: ReservationRequest[];
}

export default function LandlordBookingReservations({ reservations }: LandlordBookingReservationsProps) {
  const {
    filteredReservations,
    selectedStatus,
    setSelectedStatus,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    rawReservations,
    isArchived,
    handleToggleArchivedView,
    handleToggleArchiveRecord,
    handleUpdateStatus,
    handleGenerateReport,
    isUpdating,
    isLoading
  } = useReservationLogic(reservations);

  const [selectedReservation, setSelectedReservation] = useState<ReservationRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [recordToArchive, setRecordToArchive] = useState<ReservationRequest | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Client-side pagination
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const paginatedReservations = filteredReservations.slice(0, page * PAGE_SIZE);
  const hasMore = paginatedReservations.length < filteredReservations.length;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filteredReservations.length, selectedStatus, sortBy, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setPage(prev => prev + 1);
      setIsLoadingMore(false);
    }, 150);
  }, [isLoadingMore, hasMore]);

  const { ref: loadMoreRef } = useLoadMore(handleLoadMore, hasMore, isLoadingMore, false);

  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    const id = searchParams?.get('id');
    if (id && rawReservations.length > 0) {
      const target = rawReservations.find(r => r.id === id);
      if (target && !isModalOpen) {
        setSelectedReservation(target);
        setIsModalOpen(true);
      }
    }
  }, [searchParams, rawReservations, isModalOpen]);

  const handleOpenDetails = (res: ReservationRequest) => {
    setSelectedReservation(res);
    setIsModalOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!recordToArchive) return;
    setIsArchiving(true);
    await handleToggleArchiveRecord(recordToArchive.id, recordToArchive.isArchived);
    setIsArchiving(false);
    setIsArchiveModalOpen(false);
    setRecordToArchive(null);
  };

  useRegisterActions(
    rawReservations.map((res) => ({
      id: `reservation-${res.id}`,
      name: `Reservation: ${res.user.name || 'Anonymous Tenant'}`,
      subtitle: `Property: ${res.listing.title} • ${res.status}`,
      keywords: `reservation tenant stay ${res.user.name} ${res.listing.title}`,
      section: 'Reservations',
      perform: () => {
        setSearchQuery(res.user.name || res.user.email);
      },
      icon: <IconCalendarCheck size={18} />
    })),
    [rawReservations]
  );

  return (
    <div className="space-y-6">
      <LandlordReservationHeader 
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleGenerateReport={handleGenerateReport}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        rawReservations={rawReservations}
        isArchived={isArchived}
        onToggleArchived={handleToggleArchivedView}
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
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Syncing Reservations</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              {filteredReservations.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Showing {paginatedReservations.length} of {filteredReservations.length} reservation{filteredReservations.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                </div>
              )}

              {filteredReservations.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-primary">
                    <IconCalendar size={24} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                    No reservation requests found
                  </h3>
                  <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">
                    You haven't received any reservation requests matching the current criteria.
                  </p>
                </div>
              ) : (
                <>
                  <div className={cn(
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "space-y-4"
                  )}>
                    {paginatedReservations.map((reservation, idx) => (
                      <LandlordReservationCard 
                        key={`${viewMode}-${reservation.id}`}
                        reservation={reservation}
                        idx={idx}
                        viewMode={viewMode}
                        onUpdateStatus={handleUpdateStatus}
                        isUpdating={isUpdating}
                        onViewDetails={handleOpenDetails}
                        onArchive={() => {
                          setRecordToArchive(reservation);
                          setIsArchiveModalOpen(true);
                        }}
                      />
                    ))}
                    {/* Scroll Sentinel */}
                    <div ref={loadMoreRef} className="h-10 col-span-full opacity-0 pointer-events-none" />
                  </div>

                  {hasMore && (
                    <div className="flex flex-col items-center gap-4 pt-12 pb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-gray-200 dark:to-gray-800" />
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            {isLoadingMore ? 'Loading more reservations...' : `${filteredReservations.length - paginatedReservations.length} more reservations`}
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
                          <IconChevronDown className="group-hover:translate-y-0.5 transition-transform" size={14} />
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

      {mounted && createPortal(
        <>
          {isModalOpen && selectedReservation && (
            <LandlordReservationDetailsModal
              reservation={selectedReservation}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {recordToArchive && (
            <LandlordArchiveModal 
              isOpen={isArchiveModalOpen}
              onClose={() => setIsArchiveModalOpen(false)}
              onConfirm={handleConfirmArchive}
              isArchiving={isArchiving}
              isRestore={recordToArchive.isArchived}
              title={recordToArchive.isArchived ? 'Restore Reservation' : 'Archive Reservation'}
              description={recordToArchive.isArchived 
                ? `Move the reservation for "${recordToArchive.user.name || recordToArchive.user.email}" back to your active list.`
                : `Move the reservation for "${recordToArchive.user.name || recordToArchive.user.email}" to your archive for record keeping.`
              }
            />
          )}
        </>,
        document.body
      )}
    </div>
  );
}
