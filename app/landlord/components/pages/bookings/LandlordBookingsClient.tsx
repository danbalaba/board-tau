'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaCalendarCheck, FaEye, FaCheck, FaTimes, FaCalendar, FaChevronDown } from 'react-icons/fa';

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
    pending: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
    confirmed: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    cancelled: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
  };

  const paymentStatusColors: Record<string, string> = {
    pending: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
    paid: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    failed: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
  };

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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border border-blue-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Bookings
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Manage your property bookings and payments
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-2xl shadow-lg">
            <FaCalendarCheck size={16} />
            <span className="font-semibold text-sm">{filteredBookings.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Payment:
            </span>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 text-sm"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl mb-4">
            <FaCalendarCheck size={32} className="text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            No bookings found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            You don't have any bookings for your properties yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-[1.05] transition-transform duration-300">
                    {booking.listing.imageSrc ? (
                      <img
                        src={booking.listing.imageSrc}
                        alt={booking.listing.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                        <FaCalendarCheck size={24} className="text-gray-400 dark:text-gray-500 group-hover:scale-110 transition-transform" />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status]} shadow-lg`}>
                        {formatStatus(booking.status)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${paymentStatusColors[booking.paymentStatus]} shadow-lg ml-1`}>
                        {formatStatus(booking.paymentStatus)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {booking.listing.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      Booking by <span className="font-semibold">{booking.user.name}</span> ({booking.user.email})
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      ₱{booking.totalPrice.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        <FaCalendar size={12} />
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={`/landlord/bookings/${booking.id}`}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 group-hover:scale-[1.02]"
                >
                  <FaEye size={12} />
                  <span className="font-semibold text-xs">View Details</span>
                </Link>
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 group-hover:scale-[1.02]"
                    >
                      <FaCheck size={12} />
                      <span className="font-semibold text-xs">Confirm</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                      className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 group-hover:scale-[1.02]"
                    >
                      <FaTimes size={12} />
                      <span className="font-semibold text-xs">Cancel</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {nextCursor && (
        <div className="text-center py-6">
          <button
            className="group flex items-center justify-center gap-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-gray-500/30 transform hover:-translate-y-1"
            onClick={() => console.log('Load more bookings')}
          >
            <span className="font-semibold text-sm">Load More</span>
            <FaChevronDown size={12} className="group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
