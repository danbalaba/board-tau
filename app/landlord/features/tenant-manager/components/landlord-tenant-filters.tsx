'use client';

import React from 'react';

interface LandlordTenantFiltersProps {
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
}

export function LandlordTenantFilters({ selectedStatus, setSelectedStatus }: LandlordTenantFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Status:
          </span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
          >
            <option value="all">All Tenants</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>
    </div>
  );
}
