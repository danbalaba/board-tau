'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaEye, FaCheck, FaTimes, FaCalendar, FaClock } from 'react-icons/fa';
import Button from "@/components/common/Button";
import ModernSelect from '@/components/common/ModernSelect';
import { cn } from '@/lib/utils';

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
    pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
    approved: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
    rejected: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
  };

  const paymentStatusColors: Record<string, string> = {
    unpaid: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
    paid: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
  };

  const router = useRouter();

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
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary hover:scale-110 transition-transform duration-300">
              <FaCalendar size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-0.5 tracking-tight">
                Reservation Requests
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Manage reservation requests from potential tenants
              </p>
            </div>
          </div>
          <div className="hidden sm:inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-2 rounded-xl shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</span>
            <span className="font-black text-primary text-base">{filteredReservations.length}</span>
          </div>
        </div>
      </div>

      {/* Filter by Status */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0">
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap mb-0 sm:mb-2">
            Filter by Status
          </span>
          <ModernSelect
            instanceId="status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            className="w-full sm:w-auto min-w-[200px]"
            options={[
              { value: 'all', label: 'All Reservations' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />
        </div>
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-primary">
            <FaCalendar size={24} />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            No reservation requests found
          </h3>
          <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">
            You haven't received any reservation requests matching the current criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
              <div
              key={reservation.id}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:border-primary/20 transition-all duration-300 hover:shadow-xl shadow-sm"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-2">
                <div className="flex items-start gap-5 flex-1">
                  <div className="relative w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex-shrink-0 group-hover:shadow-md transition-all duration-300">
                    {reservation.listing.imageSrc ? (
                      <img
                        src={reservation.listing.imageSrc}
                        alt={reservation.listing.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <FaCalendar size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-widest", statusColors[reservation.status])}>
                        {reservation.status}
                      </span>
                      {reservation.paymentStatus && (
                        <span className={cn("px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-widest", paymentStatusColors[reservation.paymentStatus])}>
                          {reservation.paymentStatus}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {reservation.listing.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black uppercase">
                        {reservation.user.name?.charAt(0) || 'U'}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        <span className="font-bold text-gray-900 dark:text-gray-100">{reservation.user.name || 'Anonymous User'}</span>
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
                      {reservation.room && (
                        <span className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-primary/5 text-primary rounded-md uppercase tracking-wider text-[10px]">Room</span>
                          {reservation.room.name} • ₱{reservation.room.price.toLocaleString()}/mo
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                        <FaCalendar size={10} className="text-primary" />
                        {new Date(reservation.moveInDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                        <FaClock size={10} className="text-primary" />
                        {reservation.stayDuration} days
                      </span>
                    </div>

                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Received {new Date(reservation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                <Button
                  outline
                  onClick={() => router.push(`/landlord/reservations/${reservation.id}`)}
                  className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-700"
                >
                  <span className="flex items-center gap-2">
                    <FaEye size={12} />
                    View Details
                  </span>
                </Button>
                
                {reservation.status === 'pending' && (
                  <div className="flex items-center gap-2 border-l border-gray-100 dark:border-gray-800 pl-3">
                    <Button
                      onClick={() => handleRespond(reservation.id, 'approved')}
                      className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    >
                      <span className="flex items-center gap-2">
                        <FaCheck size={12} />
                        Approve
                      </span>
                    </Button>
                    <Button
                      outline
                      onClick={() => handleRespond(reservation.id, 'rejected')}
                      className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 dark:border-red-900/50"
                    >
                      <span className="flex items-center gap-2">
                        <FaTimes size={12} />
                        Reject
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
