'use client';

import React from 'react';
import { IconCalendarCheck, IconChevronDown, IconCalendarStats } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import { useRegisterActions } from 'kbar';
import Button from '@/components/common/Button';
import { useBookingLogic, Booking } from './hooks/use-booking-logic';
import { LandlordBookingHeader } from './components/landlord-booking-header';
import { LandlordBookingCard } from './components/landlord-booking-card';
import { useLoadMore } from '@/hooks/useLoadMore';

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
    searchQuery,
    setSearchQuery,
    rawBookings,
    handleUpdateStatus,
    handleLoadMore,
    handleGenerateReport
  } = useBookingLogic(bookings.bookings, bookings.nextCursor);

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
    </div>
  );
}
