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
import { useLoadMore } from '@/hooks/useLoadMore';
import { useSearchParams } from 'next/navigation';

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
    isUpdatingStatus
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

  const { ref: loadMoreRef } = useLoadMore(
    handleLoadMore,
    !!nextCursor,
    isLoadingMore,
    false
  );

  useRegisterActions(
    rawBookings.map((booking) => ({
      id: `booking-${booking.id}`,
      name: `Booking: ${booking.user.name || 'Anonymous Guest'}`,
      subtitle: `Property: ${booking.listing.title} • ${booking.status}`,
      keywords: `booking guest tenant stay ${booking.user.name} ${booking.listing.title}`,
      section: 'Bookings',
      perform: () => {
        setSearchQuery(booking.user.name || booking.user.email);
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

      <AnimatePresence mode="popLayout">
        {filteredBookings.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-primary"><IconCalendarCheck size={24} /></div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No bookings found</h3>
            <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">You don't have any bookings matching the current criteria yet.</p>
          </motion.div>
        ) : (
          <motion.div layout className={cn(viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4")}>
            {filteredBookings.map((booking, idx) => (
              <LandlordBookingCard 
                key={`${viewMode}-${booking.id}`}
                booking={booking}
                idx={idx}
                viewMode={viewMode}
                statusColors={statusColors}
                paymentStatusColors={paymentStatusColors}
                onUpdateStatus={handleUpdateStatus}
                isUpdatingStatus={isUpdatingStatus}
                onViewDetails={handleOpenDetails}
                onArchive={() => {
                  setRecordToArchive(booking);
                  setIsArchiveModalOpen(true);
                }}
              />
            ))}
            {/* Scroll Sentinel */}
            <div ref={loadMoreRef} className="h-1 col-span-full opacity-0 pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {nextCursor && (
        <div className="flex flex-col items-center gap-4 pt-12 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-gray-200 dark:to-gray-800" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                {isLoadingMore ? 'Fetching more bookings...' : 'Scroll for more'}
              </span>
            </div>
            <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-gray-200 dark:to-gray-800" />
          </div>

          <Button 
            outline 
            className="rounded-xl px-10 py-4 group transition-all hover:bg-primary hover:text-white border-2 border-gray-100 dark:border-gray-800" 
            onClick={handleLoadMore} 
            isLoading={isLoadingMore}
          >
            <span className="flex items-center gap-2 uppercase font-black tracking-[0.15em] text-[10px]">
              {isLoadingMore ? 'Fetching...' : 'Force Load More'}
              <IconChevronDown className={cn("group-hover:translate-y-0.5 transition-transform", isLoadingMore && "animate-bounce")} size={10} />
            </span>
          </Button>
        </div>
      )}
      {mounted && createPortal(
        <>
          {isModalOpen && selectedBooking && (
            <LandlordBookingDetailsModal
              booking={selectedBooking}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onUpdateStatus={handleUpdateStatus}
              isUpdatingStatus={isUpdatingStatus}
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
                       {recordToArchive.isArchived ? 'Restore Booking?' : 'Archive Booking?'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed font-medium">
                      {recordToArchive.isArchived 
                        ? `Are you sure you want to restore the booking for "${recordToArchive.user.name || recordToArchive.user.email}"? This will move it back to your active list.`
                        : `Are you sure you want to archive the booking for "${recordToArchive.user.name || recordToArchive.user.email}"? This will hide it from your active list but keep it in your records.`
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
