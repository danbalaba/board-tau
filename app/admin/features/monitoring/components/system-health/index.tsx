'use client';

import React, { useState } from 'react';
import { AdminMonitoringHeader } from './admin-monitoring-header';
import { HealthKPIGrid } from './health-kpi-grid';
import { InfrastructureLedger } from './infrastructure-ledger';
import { PerformanceOverview } from './performance-overview';
import { useQuery } from '@tanstack/react-query';

export default function SystemHealth() {
  const [range, setRange] = useState('30d');

  const { data, isLoading, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['systemHealth', range],
    queryFn: async () => {
      const res = await fetch(`/api/admin/monitoring/health?range=${range}`);
      if (!res.ok) throw new Error('Failed to fetch system health');
      return res.json();
    },
    refetchInterval: 15000,
  });

  const handleRefresh = async () => {
    await refetch();
  };

  const formattedTime = dataUpdatedAt 
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : undefined;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <AdminMonitoringHeader 
        title="System Health & Status" 
        description="Real-Time Health Monitoring & Service Telemetry"
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
        isLoading={isLoading}
        lastUpdated={formattedTime}
        range={range}
        onRangeChange={setRange}
      />

      <HealthKPIGrid data={data} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xl:col-span-8">
          <InfrastructureLedger data={data} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <PerformanceOverview data={data} />
        </div>
      </div>
    </div>
  );
}




