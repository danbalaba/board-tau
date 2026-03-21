'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaEye, FaCheck, FaTimes, FaCalendar, FaClock } from 'react-icons/fa';

interface ReservationRequest {
  id: string;
  listing: {
    id: string;
    title: string;
    imageSrc: string;
  };
  room?: {
    id: string;
    name: string;
    price: number;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  status: string;
  paymentStatus?: string;
  moveInDate: Date;
  stayDuration: number;
  createdAt: Date;
}

interface LandlordReservationsClientProps {
  reservations: ReservationRequest[];
}

export default function LandlordReservationsClient({ reservations }: LandlordReservationsClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const statusColors: Record<string, string> = {
    pending: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
    approved: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    rejected: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
  };

  const paymentStatusColors: Record<string, string> = {
    unpaid: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
    paid: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredReservations = selectedStatus === 'all'
    ? reservations
    : reservations.filter(reservation => reservation.status === selectedStatus);

  const handleRespond = async (inquiryId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/inquiries?id=${inquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Refresh the inquiries list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error responding to inquiry:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border border-blue-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Reservation Requests
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Manage reservation requests from potential tenants
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-2xl shadow-lg">
            <FaEnvelope size={16} />
            <span className="font-semibold text-sm">{filteredReservations.length}</span>
          </div>
        </div>
      </div>

      {/* Filter by Status */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Filter by Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 text-sm"
            >
              <option value="all">All Reservations</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl mb-4">
            <FaEnvelope size={32} className="text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            No reservation requests found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            You haven't received any reservation requests for your properties yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-[1.05] transition-transform duration-300">
                    {reservation.listing.imageSrc ? (
                      <img
                        src={reservation.listing.imageSrc}
                        alt={reservation.listing.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                        <FaEnvelope size={24} className="text-gray-400 dark:text-gray-500 group-hover:scale-110 transition-transform" />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[reservation.status]} shadow-lg`}>
                        {formatStatus(reservation.status)}
                      </span>
                      {reservation.paymentStatus && (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${paymentStatusColors[reservation.paymentStatus]} shadow-lg ml-1`}>
                          {formatStatus(reservation.paymentStatus)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {reservation.listing.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      Reservation from <span className="font-semibold">{reservation.user.name}</span> ({reservation.user.email})
                    </p>
                    {reservation.room && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Room: {reservation.room.name} - ₱{reservation.room.price.toLocaleString()}/month
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        <FaCalendar size={12} />
                        Move-in: {new Date(reservation.moveInDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock size={12} />
                        Duration: {reservation.stayDuration} days
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Received {new Date(reservation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={`/landlord/reservations/${reservation.id}`}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 group-hover:scale-[1.02]"
                >
                  <FaEye size={12} />
                  <span className="font-semibold text-xs">View Details</span>
                </Link>
                {reservation.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleRespond(reservation.id, 'approved')}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 group-hover:scale-[1.02]"
                    >
                      <FaCheck size={12} />
                      <span className="font-semibold text-xs">Approve</span>
                    </button>
                    <button
                      onClick={() => handleRespond(reservation.id, 'rejected')}
                      className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 group-hover:scale-[1.02]"
                    >
                      <FaTimes size={12} />
                      <span className="font-semibold text-xs">Reject</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
