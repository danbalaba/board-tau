'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageContainer from '../../../components/layout/page-container';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../../components/ui/card';
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
  IconCircleDot,
  IconChartBar,
  IconChartLine,
  IconDeviceAnalytics,
} from '@tabler/icons-react';
import { useExecutiveOverview } from '@/app/admin/hooks/use-executive-overview';
import { cn } from '@/lib/utils';

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
      <PageContainer pageTitle="Executive Dashboard" pageDescription="Error loading platform telemetry">
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
    <PageContainer
      pageTitle="Executive Overview"
      pageDescription="Real-time platform telemetry — revenue, users, properties, and activity signals"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          {/* Range selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            {ranges.map(r => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                  range === r.value
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:bg-white/10'
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
            className={cn('h-9 w-9 p-0 hover:bg-white/5 border-border/40', isFetching && 'animate-spin')}
          >
            <IconRefresh className="w-4 h-4" />
          </Button>
          <Button size="sm" className="h-9 gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest">
            <IconDownload className="w-4 h-4" />
            Export
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* ── Live Status Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10"
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">All Systems Operational</span>
          </div>
          <div className="h-3 w-px bg-emerald-500/20" />
          <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
            Showing · {ranges.find(r => r.value === range)?.label === '7D' ? 'Last 7 Days' : ranges.find(r => r.value === range)?.label === '30D' ? 'Last 30 Days' : ranges.find(r => r.value === range)?.label === '90D' ? 'Last 90 Days' : 'Past Year'}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <IconActivity className="w-3.5 h-3.5 text-emerald-500/60" />
            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Live Feed</span>
          </div>
        </motion.div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => {
            const isPositive = Number(kpi.trend) >= 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="group relative overflow-hidden border-none bg-card/30 backdrop-blur-md shadow-xl transition-all hover:bg-card/40 hover:shadow-2xl">
                  <div className={cn('absolute top-0 left-0 h-0.5 w-full opacity-50', kpi.bg.replace('/10', ''))} />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      {kpi.label}
                    </CardTitle>
                    <div className={cn('p-2 rounded-xl transition-transform group-hover:scale-110', kpi.bg)}>
                      <kpi.icon className={cn('h-4 w-4', kpi.color)} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-3xl font-black tabular-nums tracking-tighter">
                      {kpi.value}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isPositive
                        ? <IconTrendingUp className="w-3 h-3 text-emerald-500" />
                        : <IconTrendingDown className="w-3 h-3 text-rose-500" />
                      }
                      <span className={cn(
                        'text-[10px] font-black',
                        isPositive ? 'text-emerald-500' : 'text-rose-500'
                      )}>
                        {isPositive ? '+' : ''}{kpi.trend}
                        {typeof kpi.trend === 'number' && Math.abs(kpi.trend) < 100 ? '%' : ''}
                      </span>
                      <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{kpi.trendLabel}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">{kpi.footer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* ── Charts Row 1: Bar + Recent Sales ── */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <BarGraph data={data?.charts?.revenue} />
          </motion.div>

          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <RecentSales data={data?.recentSales} />
          </motion.div>
        </div>

        {/* ── Charts Row 2: Area + Pie ── */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AreaGraph data={data?.charts?.revenue} />
          </motion.div>

          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 }}
          >
            <PieGraph data={data?.charts?.propertyDistribution} />
          </motion.div>
        </div>

      </div>
    </PageContainer>
  );
}
