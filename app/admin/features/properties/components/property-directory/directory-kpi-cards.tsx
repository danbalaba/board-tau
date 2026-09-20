'use client';

import React from 'react';
import { ListingKPICards } from '@/app/admin/features/moderation/components/listings-review/listing-kpi-cards';

interface DirectoryKPICardsProps {
  total?: number;
  pending?: number;
  approved?: number;
  rejected?: number;
  totalLastWeek?: number;
  pendingLastWeek?: number;
  approvedLastWeek?: number;
  rejectedLastWeek?: number;
  isLoading?: boolean;
  range?: string;
  performanceData?: any;
  totalProperties?: number;
}

export function DirectoryKPICards({
  total = 0,
  pending = 0,
  approved = 0,
  rejected = 0,
  totalLastWeek = 0,
  pendingLastWeek = 0,
  approvedLastWeek = 0,
  rejectedLastWeek = 0,
  isLoading = false,
  range = '30d',
  performanceData,
  totalProperties
}: DirectoryKPICardsProps) {
  const finalTotal = total || totalProperties || performanceData?.totalProperties || 0;

  return (
    <ListingKPICards
      total={finalTotal}
      pending={pending}
      approved={approved}
      rejected={rejected}
      totalLastWeek={totalLastWeek}
      pendingLastWeek={pendingLastWeek}
      approvedLastWeek={approvedLastWeek}
      rejectedLastWeek={rejectedLastWeek}
      isLoading={isLoading}
      range={range}
    />
  );
}

