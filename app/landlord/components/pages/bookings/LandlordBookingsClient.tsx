'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaCalendarCheck, FaEye, FaCheck, FaTimes } from 'react-icons/fa';

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
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const paymentStatusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your property bookings and payments
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment:
            </span>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <FaCalendarCheck size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No bookings found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have any bookings for your properties yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {booking.listing.imageSrc ? (
                      <img
                        src={booking.listing.imageSrc}
                        alt={booking.listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FaCalendarCheck size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {booking.listing.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[booking.status]}`}>
                        {formatStatus(booking.status)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${paymentStatusColors[booking.paymentStatus]}`}>
                        {formatStatus(booking.paymentStatus)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Booking by <span className="font-medium">{booking.user.name}</span> ({booking.user.email})
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      ₱{booking.totalPrice.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={`/landlord/bookings/${booking.id}`}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  <FaEye size={14} />
                  <span>View Details</span>
                </Link>
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors"
                    >
                      <FaCheck size={14} />
                      <span>Confirm</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                    >
                      <FaTimes size={14} />
                      <span>Cancel</span>
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
        <div className="text-center">
          <button
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-2 rounded-lg transition-colors"
            onClick={() => console.log('Load more bookings')}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
