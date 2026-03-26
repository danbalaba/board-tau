'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaEye, FaCheck, FaTimes, FaChevronDown } from 'react-icons/fa';

interface Inquiry {
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
  room?: {
    id: string;
    name: string;
    price: number;
  };
  status: string;
  createdAt: Date;
}

interface LandlordInquiriesClientProps {
  inquiries: {
    inquiries: Inquiry[];
    nextCursor: string | null;
  };
}

export default function LandlordInquiriesClient({ inquiries }: LandlordInquiriesClientProps) {
  const { inquiries: inquiriesList, nextCursor } = inquiries;
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const statusColors: Record<string, string> = {
    PENDING: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
    APPROVED: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    REJECTED: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
  };

  const formatStatus = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const filteredInquiries = selectedStatus === 'ALL'
    ? inquiriesList
    : inquiriesList.filter(inquiry => inquiry.status === selectedStatus);

  const handleRespond = async (inquiryId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/landlord/inquiries?id=${inquiryId}`, {
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
              Inquiries
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Manage property inquiries from potential tenants
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-2xl shadow-lg">
            <FaEnvelope size={16} />
            <span className="font-semibold text-sm">{filteredInquiries.length}</span>
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
              <option value="ALL">All Inquiries</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      {filteredInquiries.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl mb-4">
            <FaEnvelope size={32} className="text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            No inquiries found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            You haven't received any inquiries for your properties yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-[1.05] transition-transform duration-300">
                    {inquiry.listing.imageSrc ? (
                      <img
                        src={inquiry.listing.imageSrc}
                        alt={inquiry.listing.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                        <FaEnvelope size={24} className="text-gray-400 dark:text-gray-500 group-hover:scale-110 transition-transform" />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[inquiry.status]} shadow-lg`}>
                        {formatStatus(inquiry.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {inquiry.listing.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                      Inquiry from <span className="font-semibold">{inquiry.user.name}</span> ({inquiry.user.email})
                    </p>
                    {inquiry.room && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Room: {inquiry.room.name} - ₱{inquiry.room.price.toLocaleString()}/month
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Received {new Date(inquiry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={`/landlord/inquiries/${inquiry.id}`}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 group-hover:scale-[1.02]"
                >
                  <FaEye size={12} />
                  <span className="font-semibold text-xs">View Details</span>
                </Link>
                {inquiry.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleRespond(inquiry.id, 'APPROVED')}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 group-hover:scale-[1.02]"
                    >
                      <FaCheck size={12} />
                      <span className="font-semibold text-xs">Approve</span>
                    </button>
                    <button
                      onClick={() => handleRespond(inquiry.id, 'REJECTED')}
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

      {/* Load More */}
      {nextCursor && (
        <div className="text-center py-6">
          <button
            className="group flex items-center justify-center gap-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-gray-500/30 transform hover:-translate-y-1"
            onClick={() => console.log('Load more inquiries')}
          >
            <span className="font-semibold text-sm">Load More</span>
            <FaChevronDown size={12} className="group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
