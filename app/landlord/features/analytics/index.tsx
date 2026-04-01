'use client';

import React from 'react';
import { useAnalyticsLogic, AnalyticsStats } from './hooks/use-analytics-logic';
import { LandlordAnalyticsHeader } from './components/landlord-analytics-header';
import { LandlordAnalyticsStatsGrid } from './components/landlord-analytics-stats-grid';
import { LandlordAnalyticsChartsGrid } from './components/landlord-analytics-charts-grid';
import { LandlordAnalyticsInsights } from './components/landlord-analytics-insights';

interface LandlordAnalyticsProps {
  stats: AnalyticsStats;
  revenue: any;
  occupancy: any;
}

export default function LandlordAnalytics({
  stats,
  revenue,
  occupancy,
}: LandlordAnalyticsProps) {
  const {
    timePeriod,
    setTimePeriod,
    propertyPerformanceData,
    handleGenerateReport
  } = useAnalyticsLogic(stats, occupancy);

  return (
    <div className="space-y-4 pb-12">
      <LandlordAnalyticsHeader 
        timePeriod={timePeriod}
        setTimePeriod={setTimePeriod}
        handleGenerateReport={handleGenerateReport}
      />

      <LandlordAnalyticsStatsGrid 
        stats={stats}
        occupancyRate={occupancy.occupancyRate}
      />

      <LandlordAnalyticsChartsGrid />

      <LandlordAnalyticsInsights 
        propertyPerformanceData={propertyPerformanceData}
        stats={stats}
        occupancy={occupancy}
      />
    </div>
  );
}
