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
import { toast } from 'sonner';
import { VerificationLifecycleChart } from './verification-status-chart';
import { AdminAnalyticsHeader } from './admin-analytics-header';

export function UserAnalyticsDashboard() {
  const [range, setRange] = useState('30d');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { data, isLoading, refetch, isFetching } = useUserAnalytics(range);

  const handleRefresh = async () => {
    await refetch();
    toast.success('Intelligence suite synchronized.');
  };

  if (isLoading || !data?.data) {
    return (
      <div className="p-6 lg:p-10 space-y-8 animate-pulse">
        <div className="h-32 bg-gray-200/50 dark:bg-gray-800/50 rounded-[3rem]" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200/50 dark:bg-gray-800/50 rounded-[2rem]" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-80 bg-gray-200/50 dark:bg-gray-800/50 rounded-[2.5rem]" />
          <div className="lg:col-span-2 h-80 bg-gray-200/50 dark:bg-gray-800/50 rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  const analyticsData = data.data;

  return (
    <div className="p-6 lg:p-10 space-y-10">
      <AdminAnalyticsHeader 
        range={range}
        onRangeChange={setRange}
        onRefresh={handleRefresh}
        onExport={() => setIsReportModalOpen(true)}
        isFetching={isFetching}
      />

      <div className="space-y-12">
        {/* KPI Cards */}
        <AnalyticsKPICards data={analyticsData} />

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
      </div>

      <ReportGenerationModal
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
      />
    </div>
  );
}
