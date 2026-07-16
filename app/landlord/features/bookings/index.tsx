'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconCalendarCheck, IconChevronDown, IconCalendarStats, IconAlertTriangle, IconRestore } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import { useRegisterActions } from 'kbar';
import Button from '@/components/common/Button';
import { useBookingLogic, Booking } from './hooks/use-booking-logic';
import { LandlordBookingHeader } from './components/landlord-booking-header';
import { LandlordBookingCard } from './components/landlord-booking-card';
import { LandlordBookingDetailsModal } from './components/landlord-booking-details-modal';
import { useSearchParams } from 'next/navigation';
import { LandlordPagination } from '../shared/landlord-pagination';
import LandlordArchiveModal from '../inquiry-center/components/landlord-inquiry-archive-modal';

interface LandlordBookingsProps {
  bookings: {
    bookings: Booking[];
    nextCursor: string | null;
  };
}

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  RESERVED: 'bg-green-500/10 text-green-600 border-green-500/20',
  CANCELLED: 'bg-red-500/10 text-red-600 border-red-500/20',
  CHECKED_IN: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  COMPLETED: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  paid: 'bg-green-500/10 text-green-600 border-green-500/20',
  failed: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function LandlordBookings({ bookings }: LandlordBookingsProps) {
  const {
    nextCursor,
    isLoadingMore,
    totalBookings,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    selectedStatus,
    setSelectedStatus,
    selectedPaymentStatus,
    setSelectedPaymentStatus,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    filteredBookings,
    searchQuery,
    setSearchQuery,
    rawBookings,
    isArchived,
    handleToggleArchivedView,
    handleToggleArchiveRecord,
    handleUpdateStatus,
    handleLoadMore,
    handleGenerateReport,
    updatingId,
    isLoading
  } = useBookingLogic(bookings.bookings, bookings.nextCursor);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [recordToArchive, setRecordToArchive] = useState<Booking | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    const id = searchParams?.get('id');
    if (id && rawBookings.length > 0) {
      const target = rawBookings.find(b => b.id === id);
      if (target && !isModalOpen) {
        setSelectedBooking(target);
        setIsModalOpen(true);
      }
    }
  }, [searchParams, rawBookings, isModalOpen]);

  const handleOpenDetails = (booking: Booking) => {
    setSelectedBooking(booking);
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
    rawBookings.map((booking) => ({
      id: `booking-${booking.id}`,
      name: `Booking: ${(booking.user?.name || booking.guestName) || 'Anonymous Guest'}`,
      subtitle: `Property: ${booking.listing.title} • ${booking.status}`,
      keywords: `booking guest tenant stay ${(booking.user?.name || booking.guestName)} ${booking.listing.title}`,
      section: 'Bookings',
      perform: () => {
        setSearchQuery((booking.user?.name || booking.guestName) || (booking.user?.email || booking.guestContact) || '');
      },
      icon: <IconCalendarStats size={18} />
    })),
    [rawBookings]
  );

  return (
    <div className="space-y-6">
      <LandlordBookingHeader 
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedPaymentStatus={selectedPaymentStatus}
        setSelectedPaymentStatus={setSelectedPaymentStatus}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleGenerateReport={handleGenerateReport}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        rawBookings={rawBookings}
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
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Syncing Bookings</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              {filteredBookings.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Showing {totalBookings} booking{totalBookings !== 1 ? 's' : ''}
                  </span>
                  <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {filteredBookings.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-primary"><IconCalendarCheck size={24} /></div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No bookings found</h3>
                    <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">You don't have any bookings matching the current criteria yet.</p>
                  </motion.div>
                ) : (
                  <motion.div layout className={cn(viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4")}>
                    {filteredBookings.map((booking, idx) => (
                      <LandlordBookingCard 
                        key={`${viewMode}-${booking.id}`}
                        booking={booking}
                        idx={idx}
                        viewMode={viewMode}
                        statusColors={statusColors}
                        paymentStatusColors={paymentStatusColors}
                        onUpdateStatus={handleUpdateStatus}
                        isUpdatingStatus={updatingId === booking.id}
                        onViewDetails={handleOpenDetails}
                        onArchive={() => {
                          setRecordToArchive(booking);
                          setIsArchiveModalOpen(true);
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <LandlordPagination 
                currentPage={currentPage}
                totalPages={Math.ceil(totalBookings / itemsPerPage)}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={totalBookings}
                itemName="bookings"
              />

            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {mounted && createPortal(
        <>
          {isModalOpen && selectedBooking && (
            <LandlordBookingDetailsModal
              booking={selectedBooking}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onUpdateStatus={handleUpdateStatus}
              isUpdatingStatus={updatingId === selectedBooking.id}
            />
          )}

          {recordToArchive && (
            <LandlordArchiveModal 
              isOpen={isArchiveModalOpen}
              onClose={() => setIsArchiveModalOpen(false)}
              onConfirm={handleConfirmArchive}
              isArchiving={isArchiving}
              isRestore={recordToArchive.isArchived}
              title={recordToArchive.isArchived ? 'Restore Booking' : 'Archive Booking'}
              description={recordToArchive.isArchived 
                ? `Move the booking for "${(recordToArchive.user?.name || recordToArchive.guestName) || (recordToArchive.user?.email || recordToArchive.guestContact)}" back to your active list.`
                : `Move the booking for "${(recordToArchive.user?.name || recordToArchive.guestName) || (recordToArchive.user?.email || recordToArchive.guestContact)}" to your archive.`
              }
            />
          )}
        </>,
        document.body
      )}
    </div>
  );
}
