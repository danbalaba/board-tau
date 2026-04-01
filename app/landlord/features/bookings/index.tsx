'use client';

import React from 'react';
import { IconCalendarCheck, IconChevronDown } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import Button from '@/components/common/Button';
import { useBookingLogic, Booking } from './hooks/use-booking-logic';
import { LandlordBookingHeader } from './components/landlord-booking-header';
import { LandlordBookingCard } from './components/landlord-booking-card';

interface LandlordBookingsProps {
  bookings: {
    bookings: Booking[];
    nextCursor: string | null;
  };
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  confirmed: 'bg-green-500/10 text-green-600 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
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
    handleUpdateStatus,
    handleLoadMore,
    handleGenerateReport
  } = useBookingLogic(bookings.bookings, bookings.nextCursor);

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
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {nextCursor && (
        <div className="flex justify-center pt-8">
          <Button outline className="rounded-xl px-10 py-4 group transition-all hover:bg-primary hover:text-white" onClick={handleLoadMore} isLoading={isLoadingMore}>
            <span className="flex items-center gap-2 uppercase font-black tracking-[0.15em] text-[10px]">
              {isLoadingMore ? 'Fetching bookings...' : 'Load More Bookings'}
              <IconChevronDown className={cn("group-hover:translate-y-0.5 transition-transform", isLoadingMore && "animate-bounce")} size={10} />
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
