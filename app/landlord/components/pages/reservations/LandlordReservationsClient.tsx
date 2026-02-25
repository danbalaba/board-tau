'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaEye, FaCheck, FaTimes } from 'react-icons/fa';

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
  moveInDate: string;
  stayDuration: string;
  createdAt: Date;
}

interface LandlordReservationsClientProps {
  reservations: ReservationRequest[];
}

export default function LandlordReservationsClient({ reservations }: LandlordReservationsClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const paymentStatusColors: Record<string, string> = {
    unpaid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredReservations = selectedStatus === 'all'
    ? reservations
    : reservations.filter(reservation => reservation.status === selectedStatus);

  const handleRespond = async (reservationId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/reservations?id=${reservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Refresh the reservations list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error responding to reservation request:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reservation Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage reservation requests from potential tenants
          </p>
        </div>
      </div>

      {/* Filter by Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <FaEnvelope size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No reservation requests found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You haven't received any reservation requests for your properties yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {reservation.listing.imageSrc ? (
                      <img
                        src={reservation.listing.imageSrc}
                        alt={reservation.listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FaEnvelope size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {reservation.listing.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[reservation.status]}`}>
                        {formatStatus(reservation.status)}
                      </span>
                      {reservation.paymentStatus && (
                        <span className={`px-2 py-1 text-xs rounded-full ${paymentStatusColors[reservation.paymentStatus]}`}>
                          {formatStatus(reservation.paymentStatus)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Reservation from <span className="font-medium">{reservation.user.name}</span> ({reservation.user.email})
                    </p>
                    {reservation.room && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Room: {reservation.room.name} - ₱{reservation.room.price.toLocaleString()}/month
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>Move-in: {reservation.moveInDate}</span>
                      <span>Duration: {reservation.stayDuration}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Received {new Date(reservation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={`/landlord/reservations/${reservation.id}`}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  <FaEye size={14} />
                  <span>View Details</span>
                </Link>
                {reservation.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleRespond(reservation.id, 'approved')}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors"
                    >
                      <FaCheck size={14} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleRespond(reservation.id, 'rejected')}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                    >
                      <FaTimes size={14} />
                      <span>Reject</span>
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
