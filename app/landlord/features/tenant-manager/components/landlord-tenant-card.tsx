'use client';

import React from 'react';
import Link from 'next/link';
import { FaUsers, FaEye, FaFile, FaHistory } from 'react-icons/fa';
import { Tenant } from '../hooks/use-tenant-logic';

interface LandlordTenantCardProps {
  tenant: Tenant;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  past: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export function LandlordTenantCard({ tenant }: LandlordTenantCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
            {tenant.user.image ? (
              <img
                src={tenant.user.image}
                alt={tenant.user.name as string}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <FaUsers size={24} />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {tenant.user.name}
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full ${statusColors[tenant.status]}`}>
                {formatStatus(tenant.status)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{tenant.user.email}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Property: {tenant.listing.title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {new Date(tenant.startDate).toLocaleDateString()} - {new Date(tenant.endDate).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Joined on {new Date(tenant.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Link href={`/landlord/tenants/${tenant.id}`} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors">
          <FaEye size={14} />
          <span>View Details</span>
        </Link>
        <Link href={`/landlord/tenants/${tenant.id}?action=documents`} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors">
          <FaFile size={14} />
          <span>Documents</span>
        </Link>
        <Link href={`/landlord/tenants/${tenant.id}?action=history`} className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm transition-colors">
          <FaHistory size={14} />
          <span>Rental History</span>
        </Link>
      </div>
    </div>
  );
}
