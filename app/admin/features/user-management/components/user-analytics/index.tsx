'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IconTrendingUp,
  IconActivity,
} from '@tabler/icons-react';
import { AnalyticsKPICards } from './analytics-kpi-cards';
import { UserGrowthChart } from './user-growth-chart';
import { UserDemographicsChart } from './user-demographics-chart';
import { GeographicDistributionChart } from './geographic-distribution-chart';
import { ReportGenerationModal } from './report-generation-modal';
import { useUserAnalytics } from '@/app/admin/hooks/use-user-analytics';
import { toast } from '@/app/admin/components/ui/sonner';
import { VerificationLifecycleChart } from './verification-status-chart';
import { AdminAnalyticsHeader } from './admin-analytics-header';
import { exportToCSV, exportToExcel } from '@/utils/export-utils';
import { generateMultiSectionPDF } from '@/utils/pdfGenerator';
import { useSession } from 'next-auth/react';

export function UserAnalyticsDashboard() {
  const [range, setRange] = useState('30d');
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
  const { data, isLoading, refetch, isFetching } = useUserAnalytics(range);

  const handleRefresh = async () => {
    toast.promise(refetch(), {
      loading: 'Syncing intelligence suite...',
      success: 'Intelligence suite synchronized.',
      error: 'Failed to synchronize intelligence suite.'
    });
  };

  const analyticsData = data?.data;

  const handleExport = async (format: 'CSV' | 'EXCEL' | 'PDF') => {
    if (!analyticsData) return;
    
    const exportData = [
      { Metric: 'Total Users', Value: analyticsData.totalUsers },
      { Metric: 'New Users', Value: analyticsData.newUsers },
      { Metric: 'Active Users', Value: analyticsData.activeUsers },
      ...analyticsData.userRoles.map(r => ({ Metric: `Role: ${r.role}`, Value: r.count })),
    ];
    
    const rangeLabel = {
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 90 Days',
      '1y': 'Past Year'
    }[range] || 'Last 30 Days';

    const meta = {
      reportTitle: 'User Analytics Report',
      title: 'User Analytics Report',
      reportId: `BTAU-ANA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [{ label: 'Period', value: rangeLabel }],
      summaryData: [{ label: 'Period', value: rangeLabel }],
      author: 'BoardTAU Admin Dashboard',
    };
    
    const fileName = `User_Analytics_${new Date().toLocaleDateString().replace(/\//g, '-')}`;

    try {
      if (format === 'CSV') {
        exportToCSV(exportData, fileName, meta);
      } else if (format === 'EXCEL') {
        exportToExcel(exportData, fileName, 'Analytics', meta);
      } else if (format === 'PDF') {
        const sections = [
          {
            title: 'Analytics Overview',
            type: 'table' as const,
            columns: ['Metric', 'Value'],
            data: exportData.map(item => [String(item.Metric), String(item.Value)]),
          }
        ];
        generateMultiSectionPDF(fileName, sections, meta);
      }
      toast.success(`Exported as ${format}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Failed to export as ${format}`);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-10">
      <AdminAnalyticsHeader 
        range={range}
        onRangeChange={setRange}
        onRefresh={handleRefresh}
        onExport={handleExport}
        isFetching={isFetching}
        isSuperAdmin={isSuperAdmin}
      />

      <div className="space-y-12">
        <div className="mb-6">
          <AnalyticsKPICards data={analyticsData} isLoading={isLoading || isFetching} range={range} />
        </div>

        {isLoading || isFetching || !analyticsData ? (
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 h-80 bg-gray-200/50 dark:bg-gray-800/50 rounded-[2.5rem]" />
              <div className="lg:col-span-2 h-80 bg-gray-200/50 dark:bg-gray-800/50 rounded-[2.5rem]" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 h-80 bg-gray-200/50 dark:bg-gray-800/50 rounded-[2.5rem]" />
              <div className="lg:col-span-3 h-80 bg-gray-200/50 dark:bg-gray-800/50 rounded-[2.5rem]" />
            </div>
          </div>
        ) : (
          <>
          {/* Growth & Verification Row */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 pl-5 border-l-[4px] border-fuchsia-500">
              <IconTrendingUp className="w-5 h-5 text-fuchsia-500" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
                User Growth &amp; Verification Lifecycle
              </h2>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="xl:col-span-3 flex flex-col"
              >
                <UserGrowthChart data={analyticsData} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                className="xl:col-span-2 flex flex-col"
              >
                <VerificationLifecycleChart data={analyticsData} />
              </motion.div>
            </div>
          </div>

          {/* Demographics & Geography Row */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 pl-5 border-l-[4px] border-amber-500">
              <IconActivity className="w-5 h-5 text-amber-500" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
                Role Distribution &amp; Geographic Footprint
              </h2>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="xl:col-span-2 flex flex-col"
              >
                <UserDemographicsChart data={analyticsData} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="xl:col-span-3 flex flex-col"
              >
                <GeographicDistributionChart data={analyticsData} />
              </motion.div>
            </div>
          </div>
        </>
        )}
      </div>
    </div>
  );
}
