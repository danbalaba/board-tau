'use client';

import React from 'react';
import { IconCalendar, IconCalendarCheck } from '@tabler/icons-react';
import { cn } from '@/utils/helper';
import { useRegisterActions } from 'kbar';
import { useReservationLogic, ReservationRequest } from './hooks/use-reservation-logic';
import { LandlordReservationHeader } from './components/landlord-reservation-header';
import { LandlordReservationCard } from './components/landlord-reservation-card';

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
    handleRespond,
    handleGenerateReport
  } = useReservationLogic(reservations);

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
              handleRespond={handleRespond}
            />
          ))}
        </div>
      )}
    </div>
  );
}
