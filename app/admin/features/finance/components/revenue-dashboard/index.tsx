'use client';

import React, { useState } from 'react';
import { AdminRevenueHeader } from './admin-revenue-header';
import { useRevenueDashboard } from '@/app/admin/hooks/use-revenue-dashboard';
import { useTransactions } from '@/app/admin/hooks/use-transactions';
import { AdminDashboardError } from '@/app/admin/components/ui/admin-dashboard-error';

// Modular Components
import { RevenueKPICards } from './revenue-kpi-cards';
import { RevenueChartCard } from './revenue-chart-card';
import { RevenueHotLedger } from './revenue-hot-ledger';
import { RevenueTopProperties } from './revenue-top-properties';
import { RevenueComplianceCard } from './revenue-compliance-card';

export function RevenueDashboard() {
  const [range, setRange] = useState('30d');
  
  // Fetch main revenue metrics
  const { data: apiResponse, isLoading, error } = useRevenueDashboard(range);
  const data = apiResponse?.data;

  // Fetch recent transactions (first 5 transactions)
  const { data: transactionsResponse, isLoading: isTxLoading } = useTransactions({ page: 1, perPage: 5 });
  const recentTransactions = transactionsResponse?.data || [];
  const activeBookings = transactionsResponse?.meta?.total || 0;

  const handleExport = async (format: 'CSV' | 'EXCEL' | 'PDF') => {
    // In a real implementation, you would use exportToCSV, exportToExcel from utils
    // and pass the revenue data to it.
    console.log(`Exporting revenue data as ${format}`);
    alert(`Exporting Revenue Report as ${format}`);
  };

  if (error) {
    return <AdminDashboardError />;
  }

  return (
    <div className="p-6 lg:p-10 space-y-6">
      {/* Header */}
      <AdminRevenueHeader 
        isLoading={isLoading} 
        range={range}
        onRangeChange={setRange}
        onExport={handleExport}
      />

      {/* KPI Grid */}
      <RevenueKPICards 
        data={data} 
        isLoading={isLoading} 
        activeBookings={activeBookings} 
        isTxLoading={isTxLoading} 
        range={range}
      />

      {/* Analytics & Ledger Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <RevenueChartCard 
          data={data} 
          isLoading={isLoading} 
        />
        <RevenueHotLedger 
          recentTransactions={recentTransactions} 
          isTxLoading={isTxLoading} 
        />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueTopProperties 
          data={data} 
          isLoading={isLoading} 
        />
        <RevenueComplianceCard />
      </div>
    </div>
  );
}
