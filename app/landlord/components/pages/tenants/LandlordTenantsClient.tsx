'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaUsers, FaEye, FaFile, FaHistory, FaSearch, FaTimes } from 'react-icons/fa';

interface Tenant {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
  listing: {
    id: string;
    title: string;
    imageSrc?: string;
  };
  status: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

interface LandlordTenantsClientProps {
  tenants: {
    tenants: Tenant[];
    nextCursor: string | null;
  };
}

export default function LandlordTenantsClient({ tenants }: LandlordTenantsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');

  const { tenants: tenantsList, nextCursor } = tenants;
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    past: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const clearSearch = () => {
    router.push('/landlord/tenants');
  };

  const filteredTenants = useMemo(() => {
    return tenantsList.filter(tenant => {
      const statusMatch = selectedStatus === 'all' || tenant.status === selectedStatus;

      let searchMatch = true;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        searchMatch = (tenant.user.name?.toLowerCase() || '').includes(query) ||
          tenant.user.email.toLowerCase().includes(query) ||
          tenant.listing.title.toLowerCase().includes(query);
      }

      return statusMatch && searchMatch;
    });
  }, [selectedStatus, tenantsList, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
            <FaUsers size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
                Tenants
              </h1>
              {searchQuery && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold">
                  <FaSearch size={10} />
                  <span>Search: {searchQuery}</span>
                  <button onClick={clearSearch} className="hover:text-blue-900">
                    <FaTimes size={10} />
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Manage your property tenants and their information
            </p>
          </div>
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
              <option value="all">All Tenants</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tenants List */}
      {filteredTenants.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <FaUsers size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tenants found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have any tenants for your properties yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTenants.map((tenant) => (
            <div
              key={tenant.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
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
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {tenant.user.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Property: {tenant.listing.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {new Date(tenant.startDate).toLocaleDateString()} - {new Date(tenant.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Joined on {new Date(tenant.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={`/landlord/tenants/${tenant.id}`}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  <FaEye size={14} />
                  <span>View Details</span>
                </Link>
                <Link
                  href={`/landlord/tenants/${tenant.id}?action=documents`}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  <FaFile size={14} />
                  <span>Documents</span>
                </Link>
                <Link
                  href={`/landlord/tenants/${tenant.id}?action=history`}
                  className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  <FaHistory size={14} />
                  <span>Rental History</span>
                </Link>
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
            onClick={() => console.log('Load more tenants')}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
