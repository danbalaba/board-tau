'use client';

import React from 'react';
import DataTable from '@/app/admin/components/common/DataTable';

interface Inquiry {
  id: string;
  user: { id: string; name: string | null; email: string };
  listing: { id: string; title: string; user: { id: string; name: string | null } };
  room: { id: string; name: string; roomType: string | null };
  moveInDate: string;
  stayDuration: string;
  occupantsCount: number;
  status: string;
}

interface AdminInquiriesClientProps {
  inquiries: Inquiry[];
}

const AdminInquiriesClient: React.FC<AdminInquiriesClientProps> = ({ inquiries }) => {
  const columns = [
    {
      key: 'user',
      title: 'Student',
      sortable: true,
      render: (user: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.name?.charAt(0) || '?'}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">{user?.name || 'Unknown'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'N/A'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'listing',
      title: 'Property',
      sortable: true,
      render: (listing: any) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white">{listing?.title || 'Unknown'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Landlord: {listing?.user?.name || 'Unknown'}
          </p>
        </div>
      ),
    },
    {
      key: 'room',
      title: 'Room',
      sortable: true,
      render: (room: any) => (
        <span className="text-gray-800 dark:text-white">{room?.name || 'Unknown'}</span>
      ),
    },
    {
      key: 'moveInDate',
      title: 'Move-in Date',
      sortable: true,
      render: (date: string) => (
        <span className="text-gray-800 dark:text-white">{date}</span>
      ),
    },
    {
      key: 'stayDuration',
      title: 'Stay Duration',
      sortable: true,
      render: (duration: string) => (
        <span className="text-gray-800 dark:text-white">{duration}</span>
      ),
    },
    {
      key: 'occupantsCount',
      title: 'Occupants',
      sortable: true,
      render: (count: number) => (
        <span className="text-gray-800 dark:text-white">{count} person(s)</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (status: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          status === 'pending'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            : status === 'approved'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={inquiries}
      searchable={true}
      filterable={true}
      pagination={{
        current: 1,
        total: inquiries.length,
        perPage: 10,
        onPageChange: (page) => console.log('Page change to:', page),
      }}
    />
  );
};

export default AdminInquiriesClient;
