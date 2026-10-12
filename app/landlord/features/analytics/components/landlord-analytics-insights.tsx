'use client';

import React from 'react';
import { PropertyLeaderboardItem } from '@/services/landlord/analytics';
import { PropertyComparisonTable } from './property-comparison-table';

interface LandlordAnalyticsInsightsProps {
  propertyLeaderboard: PropertyLeaderboardItem[];
  selectedPropertyId?: string;
  onSelectProperty?: (id: string) => void;
  isLoading?: boolean;
}

export function LandlordAnalyticsInsights({
  propertyLeaderboard = [],
  selectedPropertyId = 'all',
  onSelectProperty,
  isLoading = false,
}: LandlordAnalyticsInsightsProps) {
  return (
    <PropertyComparisonTable
      propertyLeaderboard={propertyLeaderboard}
      selectedPropertyId={selectedPropertyId}
      onSelectProperty={onSelectProperty}
      isLoading={isLoading}
    />
  );
}

export default LandlordAnalyticsInsights;