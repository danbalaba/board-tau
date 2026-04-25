'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IconDownload,
  IconRefresh,
  IconCalendar,
  IconChevronDown,
  IconTrendingUp,
  IconActivity,
  IconStack2,
} from '@tabler/icons-react';
import { AnalyticsKPICards } from './analytics-kpi-cards';
import { UserGrowthChart } from './user-growth-chart';
import { UserDemographicsChart } from './user-demographics-chart';
import { GeographicDistributionChart } from './geographic-distribution-chart';
import { ReportGenerationModal } from './report-generation-modal';
import { useUserAnalytics } from '@/app/admin/hooks/use-user-analytics';
import { AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import { Button } from '@/app/admin/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { VerificationLifecycleChart } from './verification-status-chart';
import PageContainer from '@/app/admin/components/layout/page-container';

export function UserAnalyticsDashboard() {
  const [range, setRange] = useState('30d');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { data, isLoading, refetch, isFetching } = useUserAnalytics(range);

  const handleRefresh = async () => {
    await refetch();
    toast.success('Intelligence suite synchronized.');
  };

  const timeRangeLabel = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    '1y': 'Past Year'
  }[range] || range;

  if (isLoading || !data?.data) {
    return (
      <PageContainer pageTitle="User Analytics" pageDescription="Loading intelligence suite...">
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted/30 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 h-80 bg-muted/30 rounded-2xl" />
            <div className="h-80 bg-muted/30 rounded-2xl" />
          </div>
        </div>
      </PageContainer>
    );
  }

  const analyticsData = data.data;

  return (
    <PageContainer
      pageTitle="User Intelligence Suite"
      pageDescription="Platform-wide user growth, verification lifecycle and demographic distribution telemetry"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 hover:bg-white/5 border-border/40 font-black uppercase text-[10px] tracking-widest">
                <IconCalendar className="w-4 h-4" />
                {timeRangeLabel}
                <IconChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-background/95 backdrop-blur-xl border-border/40 rounded-2xl p-2">
              {[
                { r: '7d', l: 'Last 7 Days' },
                { r: '30d', l: 'Last 30 Days' },
                { r: '90d', l: 'Last 90 Days' },
                { r: '1y', l: 'Past Year' }
              ].map(item => (
                <DropdownMenuItem
                  key={item.r}
                  onClick={() => setRange(item.r)}
                  className={cn(
                    'text-[10px] font-black py-3 uppercase tracking-widest cursor-pointer rounded-xl mb-1',
                    range === item.r ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.l}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className={cn('h-9 w-9 p-0 hover:bg-white/5 border-border/40', isFetching && 'animate-spin')}
          >
            <IconRefresh className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            onClick={() => setIsReportModalOpen(true)}
            className="h-9 gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest"
          >
            <IconDownload className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      }
    >
      <div className="space-y-10">
        {/* KPI Cards */}
        <AnalyticsKPICards data={analyticsData} />

        {/* Growth & Verification Row */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pl-4 border-l-[3px] border-emerald-500">
            <IconTrendingUp className="w-4 h-4 text-emerald-500" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/70">
              User Growth &amp; Verification Lifecycle
            </h2>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="xl:col-span-3 flex flex-col"
            >
              <UserGrowthChart data={analyticsData} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="xl:col-span-2 flex flex-col"
            >
              <VerificationLifecycleChart data={analyticsData} />
            </motion.div>
          </div>
        </div>

        {/* Demographics & Geography Row */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pl-4 border-l-[3px] border-amber-500">
            <IconActivity className="w-4 h-4 text-amber-500" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/70">
              Role Distribution &amp; Geographic Footprint
            </h2>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="xl:col-span-2 flex flex-col"
            >
              <UserDemographicsChart data={analyticsData} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
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
    </PageContainer>
  );
}
