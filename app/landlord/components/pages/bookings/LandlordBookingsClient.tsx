'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarCheck, FaEye, FaCheck, FaTimes, FaCalendar, FaChevronDown } from 'react-icons/fa';
import Button from "@/components/common/Button";
import ModernSelect from '@/components/common/ModernSelect';
import { cn } from '@/lib/utils';

interface Booking {
  id: string;
  listing: {
    id: string;
    title: string;
    imageSrc: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  status: string;
  paymentStatus: string;
  totalPrice: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

interface LandlordBookingsClientProps {
  bookings: {
    bookings: Booking[];
    nextCursor: string | null;
  };
}

export default function LandlordBookingsClient({ bookings }: LandlordBookingsClientProps) {
  const { bookings: bookingsList, nextCursor } = bookings;
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
    confirmed: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
  };

  const paymentStatusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
    paid: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
    failed: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
  };

  const router = useRouter();

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredBookings = bookingsList.filter(booking => {
    const statusMatch = selectedStatus === 'all' || booking.status === selectedStatus;
    const paymentMatch = selectedPaymentStatus === 'all' || booking.paymentStatus === selectedPaymentStatus;
    return statusMatch && paymentMatch;
  });

  const handleUpdateStatus = async (bookingId: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      const response = await fetch(`/api/landlord/bookings?id=${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Refresh the bookings list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary hover:scale-110 transition-transform duration-300">
              <FaCalendarCheck size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-0.5 tracking-tight">
                Bookings
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Manage your property bookings and payments
              </p>
            </div>
          </div>
          <div className="hidden sm:inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-2 rounded-xl shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</span>
            <span className="font-black text-primary text-base">{filteredBookings.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap mb-0 sm:mb-2 text-right w-16 sm:w-auto">
              Status:
            </span>
            <ModernSelect
              instanceId="bookingStatus"
              value={selectedStatus}
              onChange={setSelectedStatus}
              className="w-full sm:w-auto min-w-[200px]"
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap mb-0 sm:mb-2 text-right w-16 sm:w-auto">
              Payment:
            </span>
            <ModernSelect
              instanceId="paymentStatus"
              value={selectedPaymentStatus}
              onChange={setSelectedPaymentStatus}
              className="w-full sm:w-auto min-w-[200px]"
              options={[
                { value: 'all', label: 'All Payments' },
                { value: 'pending', label: 'Pending' },
                { value: 'paid', label: 'Paid' },
                { value: 'failed', label: 'Failed' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-primary">
            <FaCalendarCheck size={24} />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            No bookings found
          </h3>
          <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">
            You don't have any bookings matching the current criteria yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
              <div
              key={booking.id}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:border-primary/20 transition-all duration-300 hover:shadow-xl shadow-sm"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-2">
                <div className="flex items-start gap-5 flex-1">
                  <div className="relative w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex-shrink-0 group-hover:shadow-md transition-all duration-300">
                    {booking.listing.imageSrc ? (
                      <img
                        src={booking.listing.imageSrc}
                        alt={booking.listing.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <FaCalendarCheck size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-widest", statusColors[booking.status])}>
                        {booking.status}
                      </span>
                      <span className={cn("px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-widest", paymentStatusColors[booking.paymentStatus])}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {booking.listing.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black uppercase">
                        {booking.user.name?.charAt(0) || 'U'}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        <span className="font-bold text-gray-900 dark:text-gray-100">{booking.user.name || 'Anonymous User'}</span>
                      </p>
                    </div>
                    <p className="text-xl font-black text-gray-900 dark:text-white mb-2">
                      ₱{booking.totalPrice.toLocaleString()}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
                      <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                        <FaCalendar size={10} className="text-primary" />
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                <Button
                  outline
                  onClick={() => router.push(`/landlord/bookings/${booking.id}`)}
                  className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-700"
                >
                  <span className="flex items-center gap-2">
                    <FaEye size={12} />
                    View Details
                  </span>
                </Button>
                
                {booking.status === 'pending' && (
                  <div className="flex items-center gap-2 border-l border-gray-100 dark:border-gray-800 pl-3">
                    <Button
                      onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                      className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    >
                      <span className="flex items-center gap-2">
                        <FaCheck size={12} />
                        Confirm
                      </span>
                    </Button>
                    <Button
                      outline
                      onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                      className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 dark:border-red-900/50"
                    >
                      <span className="flex items-center gap-2">
                        <FaTimes size={12} />
                        Cancel
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {nextCursor && (
        <div className="text-center py-6">
          <Button
            outline
            onClick={() => console.log('Load more bookings')}
            className="px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-700 hover:border-primary/50"
          >
            <span className="flex items-center justify-center gap-2">
              Load More
              <FaChevronDown size={12} className="animate-bounce" />
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
