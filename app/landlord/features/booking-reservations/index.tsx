'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconCalendar, IconCalendarCheck, IconAlertTriangle, IconRestore } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/common/Button';
import { cn } from '@/utils/helper';
import { useRegisterActions } from 'kbar';
import { useReservationLogic, ReservationRequest } from './hooks/use-reservation-logic';
import { LandlordReservationHeader } from './components/landlord-reservation-header';
import { LandlordReservationCard } from './components/landlord-reservation-card';
import { LandlordReservationDetailsModal } from './components/landlord-reservation-details-modal';
import { useSearchParams } from 'next/navigation';

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
    isUpdating
  } = useReservationLogic(reservations);

  const [selectedReservation, setSelectedReservation] = useState<ReservationRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [recordToArchive, setRecordToArchive] = useState<ReservationRequest | null>(null);

  const [isArchiving, setIsArchiving] = useState(false);
  const [mounted, setMounted] = useState(false);
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
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        )}>
          {filteredReservations.map((reservation, idx) => (
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
        </div>
      )}

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

          <AnimatePresence>
            {isArchiveModalOpen && recordToArchive && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsArchiveModalOpen(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 max-w-sm w-full shadow-2xl overflow-hidden"
                >
                  <div className={cn(
                    "absolute top-0 left-0 w-full h-1.5",
                    recordToArchive.isArchived ? "bg-gradient-to-r from-emerald-500 to-green-500" : "bg-gradient-to-r from-red-500 to-rose-500"
                  )} />
                  <div className="flex flex-col items-center text-center">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 animate-pulse",
                      recordToArchive.isArchived ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500" : "bg-red-50 dark:bg-red-900/20 text-red-500"
                    )}>
                      {recordToArchive.isArchived ? <IconRestore size={32} /> : <IconAlertTriangle size={32} />}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                       {recordToArchive.isArchived ? 'Restore Reservation?' : 'Archive Reservation?'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed font-medium">
                      {recordToArchive.isArchived 
                        ? `Are you sure you want to restore the reservation from "${recordToArchive.user.name || recordToArchive.user.email}"? This will move it back to your active requests.`
                        : `Are you sure you want to archive the reservation from "${recordToArchive.user.name || recordToArchive.user.email}"? This will hide it from your active list but keep it in your records.`
                      }
                    </p>
                    <div className="flex flex-col w-full gap-2.5">
                      <Button
                        variant={recordToArchive.isArchived ? "primary" : "danger"}
                        isLoading={isArchiving}
                        onClick={handleConfirmArchive}
                        className={cn(
                          "rounded-xl py-3 shadow-lg text-xs font-black uppercase tracking-widest",
                          recordToArchive.isArchived ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10" : "shadow-red-500/10"
                        )}
                      >
                        {recordToArchive.isArchived ? 'Confirm Restoration' : 'Confirm Archiving'}
                      </Button>
                      <Button
                        outline
                        onClick={() => setIsArchiveModalOpen(false)}
                        className="rounded-xl py-3 border-gray-100 dark:border-gray-800 text-xs font-black uppercase tracking-widest"
                      >
                        {recordToArchive.isArchived ? 'Keep Archived' : 'Keep Active'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </div>
  );
}
