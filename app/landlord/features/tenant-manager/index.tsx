'use client';

import React from 'react';
import { FaUsers } from 'react-icons/fa';
import { useTenantLogic, Tenant } from './hooks/use-tenant-logic';
import { LandlordTenantHeader } from './components/landlord-tenant-header';
import { LandlordTenantFilters } from './components/landlord-tenant-filters';
import { LandlordTenantCard } from './components/landlord-tenant-card';

interface LandlordTenantManagerProps {
  tenants: {
    tenants: Tenant[];
    nextCursor: string | null;
  };
}

export default function LandlordTenantManager({ tenants }: LandlordTenantManagerProps) {
  const {
    filteredTenants,
    selectedStatus,
    setSelectedStatus,
    cursor,
    handleLoadMore
  } = useTenantLogic(tenants.tenants, tenants.nextCursor);

  return (
    <div className="space-y-6">
      <LandlordTenantHeader />
      
      <LandlordTenantFilters 
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />

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
            <LandlordTenantCard 
              key={tenant.id}
              tenant={tenant}
            />
          ))}
        </div>
      )}

      {cursor && (
        <div className="text-center pb-8">
          <button
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-2 rounded-lg transition-colors"
            onClick={handleLoadMore}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
