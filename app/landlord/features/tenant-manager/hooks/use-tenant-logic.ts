'use client';

import { useState, useMemo } from 'react';

export interface Tenant {
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

export function useTenantLogic(initialTenants: Tenant[], nextCursor: string | null) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [cursor, setCursor] = useState<string | null>(nextCursor);

  const filteredTenants = useMemo(() => {
    return selectedStatus === 'all'
      ? initialTenants
      : initialTenants.filter(tenant => tenant.status === selectedStatus);
  }, [initialTenants, selectedStatus]);

  const handleLoadMore = () => {
    console.log('Fetching more tenants with cursor:', cursor);
    // Placeholder for actual fetch logic
  };

  return {
    filteredTenants,
    selectedStatus,
    setSelectedStatus,
    cursor,
    handleLoadMore
  };
}
