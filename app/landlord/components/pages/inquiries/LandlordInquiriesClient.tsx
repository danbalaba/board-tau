'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaEye, FaCheck, FaTimes, FaChevronDown } from 'react-icons/fa';
import Button from "@/components/common/Button";
import ModernSelect from '@/components/common/ModernSelect';
import { cn } from '@/lib/utils';

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

  const router = useRouter();

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
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary hover:scale-110 transition-transform duration-300">
              <FaEnvelope size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-0.5 tracking-tight">
                Tenant Inquiries
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Manage and respond to property inquiries from potential tenants
              </p>
            </div>
          </div>
          <div className="hidden sm:inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-2 rounded-xl shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</span>
            <span className="font-black text-primary text-base">{filteredInquiries.length}</span>
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
              { value: 'ALL', label: 'All Inquiries' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'REJECTED', label: 'Rejected' },
            ]}
          />
        </div>
      </div>

      {/* Inquiries List */}
      {filteredInquiries.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-primary">
            <FaEnvelope size={24} />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            No inquiries found
          </h3>
          <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">
            You haven't received any inquiries matching the current criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => (
              <div
              key={inquiry.id}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:border-primary/20 transition-all duration-300 hover:shadow-xl shadow-sm"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-2">
                <div className="flex items-start gap-5 flex-1">
                  <div className="relative w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex-shrink-0 group-hover:shadow-md transition-all duration-300">
                    {inquiry.listing.imageSrc ? (
                      <img
                        src={inquiry.listing.imageSrc}
                        alt={inquiry.listing.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <FaEnvelope size={24} />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 pointer-events-none">
                      <span className={cn("px-2.5 py-1 rounded-[10px] text-[10px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md", statusColors[inquiry.status])}>
                        {inquiry.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {inquiry.listing.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black uppercase">
                        {inquiry.user.name?.charAt(0) || 'U'}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        <span className="font-bold text-gray-900 dark:text-gray-100">{inquiry.user.name || 'Anonymous User'}</span>
                      </p>
                    </div>
                    {inquiry.room && (
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-primary/5 text-primary rounded-md uppercase tracking-wider text-[10px]">Room</span>
                        {inquiry.room.name} • ₱{inquiry.room.price.toLocaleString()}/mo
                      </p>
                    )}
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Received {new Date(inquiry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                <Button
                  outline
                  onClick={() => router.push(`/landlord/inquiries/${inquiry.id}`)}
                  className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-700"
                >
                  <span className="flex items-center gap-2">
                    <FaEye size={12} />
                    View Details
                  </span>
                </Button>
                
                {inquiry.status === 'PENDING' && (
                  <div className="flex items-center gap-2 border-l border-gray-100 dark:border-gray-800 pl-3">
                    <Button
                      onClick={() => handleRespond(inquiry.id, 'APPROVED')}
                      className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    >
                      <span className="flex items-center gap-2">
                        <FaCheck size={12} />
                        Approve
                      </span>
                    </Button>
                    <Button
                      outline
                      onClick={() => handleRespond(inquiry.id, 'REJECTED')}
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

      {/* Load More */}
      {nextCursor && (
        <div className="text-center py-6">
          <Button
            outline
            onClick={() => console.log('Load more inquiries')}
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
