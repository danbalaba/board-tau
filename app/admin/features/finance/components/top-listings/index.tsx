'use client';

import React from 'react';
import { useTopListings, PricingRecommendation } from '@/app/admin/hooks/use-top-listings';
import { TopListingsHeader } from './top-listings-header';
import { PerformanceKPICards } from './performance-kpis';
import { OccupancyLeaderboard } from './occupancy-leaderboard';
import { PricingIntelligence } from './pricing-intelligence';
import { toast } from '@/app/admin/components/ui/sonner';

export function TopListingsDashboard() {
  const { data, isLoading, error, range, setRange } = useTopListings();

  const handleExport = (format: 'CSV' | 'EXCEL' | 'PDF') => {
    if (!data || data.occupancyByProperty.length === 0) {
      toast.error('No performance data available to export.');
      return;
    }

    if (format === 'CSV') {
      const headers = ['Property', 'Occupancy Rate', 'Current Price', 'Suggested Price', 'Demand Level', 'Competitor Avg'];
      const rows = data.pricingRecommendations.map((rec: PricingRecommendation) => [
        rec.property,
        `${rec.occupancyRate}%`,
        `₱${rec.currentPrice}`,
        `₱${rec.suggestedPrice}`,
        rec.demandLevel,
        `₱${rec.competitorPrice}`
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map((e: string[]) => e.map((val: string) => `"${val}"`).join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `TopListings_Intelligence_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Performance report CSV exported successfully.');
    } else {
      toast.success(`Exporting as ${format}...`);
    }
  };

  if (error) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-rose-500">Failed to load performance data</h2>
        <p className="text-gray-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <TopListingsHeader 
        isLoading={isLoading} 
        range={range}
        onRangeChange={setRange}
        onExport={handleExport}
      />

      <PerformanceKPICards 
        data={data}
        isLoading={isLoading}
        range={range}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <OccupancyLeaderboard 
          data={data?.occupancyByProperty || []}
          isLoading={isLoading}
        />
        <PricingIntelligence 
          data={data?.pricingRecommendations || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
