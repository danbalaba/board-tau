'use client';

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import PageContainer from '../../../components/layout/page-container';
import { Button } from '../../../components/ui/button';
import { AreaGraph } from './area-graph';
import { BarGraph } from './bar-graph';
import { PieGraph } from './pie-graph';
import { RecentSales } from './recent-sales';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconDownload,
  IconRefresh,
  IconCurrencyDollar,
  IconUsers,
  IconUserCheck,
  IconBuilding,
  IconActivity,
  IconAlertTriangle,
  IconDeviceAnalytics,
} from '@tabler/icons-react';
import { useExecutiveOverview } from '@/app/admin/hooks/use-executive-overview';
import { cn } from '@/lib/utils';
import Skeleton from '@/components/common/Skeleton';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function OverViewPage() {
  const [range, setRange] = useState('30d');
  const { data: apiResponse, isLoading, error, refetch, isFetching } = useExecutiveOverview(range);
  const data = apiResponse?.data;
  const metrics = data?.metrics;

  const ranges = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: '1y', label: '1Y' },
  ];

  const kpis = [
    {
      label: 'Gross Revenue',
      value: isLoading ? '—' : `$${metrics?.totalRevenue?.toLocaleString() || '0'}`,
      trend: metrics?.revenueGrowthPercentage || 0,
      trendLabel: 'vs last period',
      footer: 'Platform-wide revenue',
      icon: IconCurrencyDollar,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'New Users',
      value: isLoading ? '—' : (metrics?.newUsers?.toLocaleString() || '0'),
      trend: metrics?.userGrowthPercentage || 0,
      trendLabel: 'vs last month',
      footer: 'New registrations',
      icon: IconUsers,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Active Accounts',
      value: isLoading ? '—' : (metrics?.activeUsers?.toLocaleString() || '0'),
      trend: 8.4,
      trendLabel: 'retention rate',
      footer: 'Active last 30 days',
      icon: IconUserCheck,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Active Listings',
      value: isLoading ? '—' : (metrics?.totalListings?.toLocaleString() || '0'),
      trend: metrics?.newListings || 0,
      trendLabel: 'new this month',
      footer: 'Total active properties',
      icon: IconBuilding,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ];

  if (error) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="p-4 rounded-2xl bg-red-500/10">
            <IconAlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Failed to load dashboard data</p>
          <Button size="sm" onClick={() => refetch()} className="gap-2 font-black uppercase text-[10px] tracking-widest">
            <IconRefresh className="w-4 h-4" /> Retry
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10 pb-20"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants}>
          <div className="bg-white dark:bg-gray-950 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-black/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {isLoading ? (
                <Skeleton className="w-16 h-16 rounded-[24px]" />
              ) : (
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-[24px] flex items-center justify-center shadow-inner">
                  <IconDeviceAnalytics size={32} strokeWidth={2.5} />
                </div>
              )}
              <div>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-48 mb-2" variant="text" />
                    <Skeleton className="h-4 w-64 opacity-60" variant="text" />
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tighter">
                      Executive Overview
                    </h1>
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Real-time platform telemetry & analytics
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Range Selector & Actions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                {ranges.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setRange(r.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                      range === r.value
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className={cn('h-9 w-9 p-0 border-gray-200 dark:border-gray-800 rounded-xl', isFetching && 'animate-spin')}
              >
                <IconRefresh className="w-4 h-4" />
              </Button>
              <Button size="sm" className="h-9 gap-2 shadow-lg rounded-xl font-black uppercase text-[10px] tracking-widest">
                <IconDownload className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── Live Status Bar ── */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 px-6 py-4 rounded-[24px] bg-emerald-500/5 border border-emerald-500/10">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">All Systems Operational</span>
            </div>
            <div className="h-3 w-px bg-emerald-500/20" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Showing · {ranges.find(r => r.value === range)?.label === '7D' ? 'Last 7 Days' : ranges.find(r => r.value === range)?.label === '30D' ? 'Last 30 Days' : ranges.find(r => r.value === range)?.label === '90D' ? 'Last 90 Days' : 'Past Year'}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <IconActivity className="w-3.5 h-3.5 text-emerald-500/60" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Feed</span>
            </div>
          </div>
        </motion.div>

        {/* ── KPI Cards ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, i) => {
            const isPositive = Number(kpi.trend) >= 0;
            return (
              <div key={i} className="group relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-500 shadow-sm overflow-hidden h-full">
                <div className={cn('absolute top-0 left-0 h-1 w-full opacity-50', kpi.bg.replace('/10', ''))} />
                <div className="flex items-start justify-between mb-4">
                  <div className={cn('w-12 h-12 rounded-[18px] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm', kpi.bg, kpi.color)}>
                    <kpi.icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                    {kpi.label}
                  </h3>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 mb-2" />
                  ) : (
                    <div className="text-2xl font-black tabular-nums tracking-tighter text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                      {kpi.value}
                    </div>
                  )}
                  {isLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 w-fit px-2 py-0.5 rounded-lg">
                      {isPositive
                        ? <IconTrendingUp className="w-3 h-3 text-emerald-500" />
                        : <IconTrendingDown className="w-3 h-3 text-rose-500" />
                      }
                      <span className={cn(
                        'text-[11px] font-bold',
                        isPositive ? 'text-emerald-500' : 'text-rose-500'
                      )}>
                        {isPositive ? '+' : ''}{kpi.trend}
                        {typeof kpi.trend === 'number' && Math.abs(Number(kpi.trend)) < 100 ? '%' : ''}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{kpi.trendLabel}</span>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{kpi.footer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* ── Charts Row 1: Bar + Recent Sales ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <div className="lg:col-span-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500">
            {isLoading ? (
              <div className="w-full h-[350px] flex flex-col">
                <Skeleton className="h-6 w-40 mb-6" variant="text" />
                <div className="flex-1 w-full flex items-end gap-2">
                  {[...Array(12)].map((_, i) => (
                    <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${20 + Math.random() * 60}%` }} />
                  ))}
                </div>
              </div>
            ) : <BarGraph data={data?.charts?.revenue} />}
          </div>

          <div className="lg:col-span-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : <RecentSales data={data?.recentSales} />}
          </div>
        </motion.div>

        {/* ── Charts Row 2: Area + Pie ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <div className="lg:col-span-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500">
            {isLoading ? (
              <div className="w-full h-[350px] flex flex-col">
                <Skeleton className="h-6 w-40 mb-6" variant="text" />
                <div className="flex-1 w-full flex items-end gap-2">
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                </div>
              </div>
            ) : <AreaGraph data={data?.charts?.revenue} />}
          </div>

          <div className="lg:col-span-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500">
            {isLoading ? (
              <div className="w-full h-[350px] flex flex-col">
                <Skeleton className="h-6 w-40 mb-6" variant="text" />
                <div className="flex-1 w-full flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    <Skeleton className="w-full h-full rounded-full" />
                    <div className="absolute inset-4 bg-white dark:bg-gray-950 rounded-full" />
                  </div>
                </div>
              </div>
            ) : <PieGraph data={data?.charts?.propertyDistribution} />}
          </div>
        </motion.div>

      </motion.div>
    </PageContainer>
  );
}
