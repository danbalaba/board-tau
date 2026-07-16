'use client';

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import PageContainer from '../../../components/layout/page-container';
import { Button } from '../../../components/ui/button';
import { AdminDashboardError } from '@/app/admin/components/ui/admin-dashboard-error';
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
  IconFileTypePdf,
  IconTable,
  IconFileTypeCsv,
  IconLoader2,
} from '@tabler/icons-react';
import { useExecutiveOverview } from '@/app/admin/hooks/use-executive-overview';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';
import { exportToCSV, exportToExcel, prepareDataForExport } from '@/utils/export-utils';
import { generateMultiSectionPDF } from '@/utils/pdfGenerator';
import { toast } from '@/app/admin/components/ui/sonner';
import Skeleton from '@/components/common/Skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/admin/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Calendar, ChevronDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const { data: apiResponse, isLoading, error, refetch, isFetching } = useExecutiveOverview(range);

  const handleExportSubmit = async (format: 'PDF' | 'EXCEL' | 'CSV') => {
    setIsExportMenuOpen(false);
    setIsExporting(format);
    try {
      // Intentionally show a loading state
      await new Promise(r => setTimeout(r, 800));
      
      const res = await fetch('/api/admin/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataSource: 'reservations',
          exportFormat: 'json',
          dateRange: 'custom',
          startDate: new Date(new Date().setDate(new Date().getDate() - (range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365))).toISOString(),
          endDate: new Date().toISOString()
        })
      });

      if (!res.ok) throw new Error('Failed to fetch export data');
      const rawData = await res.json();
      
      const reportMetadata = {
        reportTitle: 'Executive Reservations Report',
        reportId: `BTAU-RES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        summary: [
          { label: 'Period', value: `Last ${range.replace('d', ' Days').replace('1y', 'Year')}` },
          { label: 'Total Revenue', value: `PHP ${metrics?.totalRevenue || 0}` },
          { label: 'Total Reservations', value: `${metrics?.totalReservations || 0}` },
          { label: 'Total Users', value: `${metrics?.totalUsers || 0}` },
          { label: 'Active Properties', value: `${metrics?.totalListings || 0}` },
          { label: 'Average Rating', value: `${metrics?.averageRating || 0} / 5` }
        ],
        author: 'BoardTAU Executive Dashboard'
      };

      const flattenedData = prepareDataForExport(rawData, 'reservation');

      if (format === 'PDF') {
        const sections: any[] = [];

        // Top Properties Section
        if (data?.topProperties && data.topProperties.length > 0) {
          sections.push({
            title: 'Top Performing Properties',
            type: 'table',
            columns: ['Property Name', 'Revenue Generated'],
            data: data.topProperties.map((p: any) => [p.listingTitle, `PHP ${p.revenue.toLocaleString()}`])
          });
        }

        // Property Distribution Section
        if (data?.charts?.propertyDistribution && data.charts.propertyDistribution.length > 0) {
          sections.push({
            title: 'Platform Property Split',
            type: 'table',
            columns: ['Category', 'Total Properties'],
            data: data.charts.propertyDistribution.map((p: any) => [p.name, p.value.toString()])
          });
        }

        // Recent Reservations Section
        const columns = ['Guest', 'Room', 'Dates', 'Amount', 'Status', 'Reserved At'];
        const tableData = flattenedData.map((i: any) => [
          i['Guest'],
          i['Room'],
          i['Dates'],
          `PHP ${i['Amount']}`,
          i['Status'],
          i['Reserved At']
        ]);
        
        sections.push({
          title: 'Recent Transactions & Reservations',
          type: 'table',
          columns: columns,
          data: tableData
        });

        await generateMultiSectionPDF('Executive_Report', sections, {
          title: 'Executive Platform Report',
          subtitle: `Comprehensive data for the last ${range.replace('d', ' Days').replace('1y', 'Year')}`,
          author: 'BoardTAU Executive System',
          summaryData: reportMetadata.summary
        });
      } else if (format === 'EXCEL') {
        exportToExcel(flattenedData, `Executive_Report_${new Date().toLocaleDateString()}`, 'Reservations', reportMetadata);
      } else if (format === 'CSV') {
        exportToCSV(flattenedData, `Executive_Report_${new Date().toLocaleDateString()}`, reportMetadata);
      }

      toast.success(`Successfully exported as ${format}!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to export report');
    } finally {
      setIsExporting(null);
    }
  };

  const data = apiResponse?.data;
  const metrics = data?.metrics;

  const generateTrend = (val: number, isLoad: boolean = false) => {
    if (isLoad) {
      return [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }];
    }
    return [
      { v: val * 0.8 }, { v: val * 0.85 }, { v: val * 0.82 }, 
      { v: val * 0.9 }, { v: val * 0.88 }, { v: val * 0.95 }, { v: val }
    ];
  };

  const ranges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' },
  ];

  const getTrendLabel = () => {
    switch (range) {
      case '7d': return 'vs last 7 days';
      case '90d': return 'vs last 90 days';
      case '1y': return 'vs last year';
      case '30d':
      default: return 'vs last 30 days';
    }
  };

  const getNewItemsLabel = () => {
    switch (range) {
      case '7d': return 'new this week';
      case '90d': return 'new last 90 days';
      case '1y': return 'new this year';
      case '30d':
      default: return 'new this month';
    }
  };

  const kpis = [
    {
      label: 'Gross Revenue',
      value: isLoading ? '—' : `₱${metrics?.totalRevenue?.toLocaleString() || '0'}`,
      trend: metrics?.revenueGrowthPercentage || 0,
      isPercentage: false,
      isCurrency: true,
      trendLabel: getTrendLabel(),
      footer: 'Platform-wide revenue',
      icon: IconCurrencyDollar,
      color: 'text-primary',
      bg: 'bg-primary/10',
      chartColor: '#6366f1',
      trendData: generateTrend(metrics?.totalRevenue || 0, isLoading),
      tooltip: {
        title: 'Gross Revenue',
        description: 'Total revenue generated across all properties on the platform.',
        detail: 'This includes all completed reservations and fees.',
      }
    },
    {
      label: 'New Users',
      value: isLoading ? '—' : (metrics?.newUsers?.toLocaleString() || '0'),
      trend: metrics?.userGrowthPercentage || 0,
      isPercentage: false,
      trendLabel: getTrendLabel(),
      footer: 'New registrations',
      icon: IconUsers,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      chartColor: '#10b981',
      trendData: generateTrend(metrics?.newUsers || 0, isLoading),
      tooltip: {
        title: 'New Users',
        description: 'Number of new users who registered on the platform recently.',
        detail: 'Includes both tenants and landlords.',
      }
    },
    {
      label: 'New Landlords',
      value: isLoading ? '—' : (metrics?.newLandlords?.toLocaleString() || '0'),
      trend: metrics?.newLandlordsGrowthPercentage || 0,
      isPercentage: false,
      trendLabel: getTrendLabel(),
      footer: 'New hosts joined',
      icon: IconUserCheck,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      chartColor: '#3b82f6',
      trendData: generateTrend(metrics?.newLandlords || 0, isLoading),
      tooltip: {
        title: 'New Landlords',
        description: 'Number of new property owners who registered.',
        detail: 'Tracks the growth of our hosting community.',
      }
    },
    {
      label: 'Active Listings',
      value: isLoading ? '—' : (metrics?.totalListings?.toLocaleString() || '0'),
      trend: metrics?.newListings || 0,
      isPercentage: false,
      trendLabel: getNewItemsLabel(),
      footer: 'Total active properties',
      icon: IconBuilding,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      chartColor: '#f59e0b',
      trendData: generateTrend(metrics?.totalListings || 0, isLoading),
      tooltip: {
        title: 'Active Listings',
        description: 'The total number of approved, live properties on the platform.',
        detail: 'Does not include pending or archived listings.',
      }
    },
  ];

  if (error) {
    return (
      <PageContainer>
        <AdminDashboardError onRetry={() => refetch()} message="We are unable to establish a connection to the analytics database. Please check your network or try refreshing the data feed." />
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
          <div className="relative p-8 rounded-[3rem] border border-teal-500/20 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-teal-500/10 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/20 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex w-full flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                {isLoading ? (
                  <Skeleton className="w-16 h-16 rounded-[24px]" />
                ) : (
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 text-teal-500 rounded-[24px] flex items-center justify-center shadow-xl border border-gray-100 dark:border-gray-700">
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
                      <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
                        Executive Overview
                      </h1>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                          Real-time platform telemetry & analytics
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Range Selector & Actions */}
            {/* Range Selector & Actions */}
            <div className="flex items-center gap-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-12 w-48 rounded-[1rem]" />
                  <Skeleton className="h-12 w-12 rounded-[1rem]" />
                  <Skeleton className="h-12 w-32 rounded-[1rem]" />
                </>
              ) : (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border-gray-200/50 dark:border-gray-800/50 hover:bg-teal-500/10 hover:border-teal-500/30 shadow-sm transition-all rounded-[1rem] px-5 h-12 flex items-center gap-3 font-semibold text-gray-700 dark:text-gray-200 group relative z-10"
                      >
                        <div className="p-1.5 bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-lg group-hover:bg-teal-500/20 transition-colors">
                          <Calendar size={18} strokeWidth={2.5} />
                        </div>
                        <span className="group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {ranges.find(r => r.value === range)?.label || 'Last 30 Days'}
                        </span>
                        <ChevronDown size={16} className="text-gray-400 ml-1 group-hover:text-teal-500 transition-colors" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 rounded-[1rem] p-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 shadow-xl">
                      {ranges.map(r => (
                        <DropdownMenuItem 
                          key={r.value}
                          onClick={() => setRange(r.value)} 
                          className="rounded-xl focus:bg-teal-50 dark:focus:bg-teal-500/10 cursor-pointer py-2.5 px-3"
                        >
                          <span className={cn("font-medium", range === r.value ? "text-teal-600 dark:text-teal-400" : "text-gray-700 dark:text-gray-300")}>
                            {r.label}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.promise(Promise.resolve(refetch()), {
                        loading: 'Syncing dashboard data...',
                        success: 'Dashboard updated',
                        error: 'Failed to refresh data'
                      });
                    }}
                    disabled={isFetching}
                    className={cn(
                      "h-12 w-12 p-0 shadow-sm rounded-[1rem] border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 hover:bg-teal-500/10 hover:border-teal-500/30 transition-all duration-200 group",
                      isFetching && "animate-spin [animation-duration:2s]"
                    )}
                  >
                    <IconRefresh className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
                  </Button>
                  
                  <div className="relative">
                    <Button 
                      size="sm" 
                      onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                      className="h-12 px-5 gap-2 shadow-lg rounded-[1rem] font-black uppercase text-[10px] tracking-widest relative z-10"
                      disabled={!!isExporting}
                    >
                      {isExporting ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <IconDownload className="w-4 h-4" />}
                      {isExporting ? `Exporting ${isExporting}...` : 'Export'}
                      <ChevronDown size={14} className="opacity-70 ml-1" />
                    </Button>

                    <AnimatePresence>
                      {isExportMenuOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsExportMenuOpen(false)} 
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute right-0 top-full mt-2 w-48 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                          >
                            <div className="p-1">
                              <button onClick={() => handleExportSubmit('PDF')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300 dark:hover:text-white group">
                                <IconFileTypePdf className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                                PDF Document
                              </button>
                              <button onClick={() => handleExportSubmit('EXCEL')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300 dark:hover:text-white group">
                                <IconTable className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                                Excel
                              </button>
                              <button onClick={() => handleExportSubmit('CSV')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300 dark:hover:text-white group">
                                <IconFileTypeCsv className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                                CSV Data
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
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
        <TooltipProvider delayDuration={200}>
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => {
              const isPositive = Number(kpi.trend) >= 0;
              return (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div className="group relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-500 shadow-sm overflow-hidden h-full cursor-help">
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
                          <div className="h-8 w-24 bg-muted/50 dark:bg-white/10 animate-pulse rounded-xl mb-2" />
                        ) : (
                          <div className="text-2xl font-black tabular-nums tracking-tighter text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                            {kpi.value}
                          </div>
                        )}
                        {isLoading ? (
                          <div className="h-5 w-32 bg-muted/50 dark:bg-white/10 animate-pulse rounded-lg mt-2" />
                        ) : (
                          <div className="flex items-center gap-2 mt-2">
                            <div className={cn(
                              "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                              isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                            )}>
                              {isPositive ? (
                                <ArrowUpRight className="w-3 h-3" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3" />
                              )}
                              {isPositive ? '+' : ''}
                              {(kpi as any).isCurrency ? '₱' : ''}
                              {Math.abs(Number(kpi.trend)).toLocaleString()}
                              {kpi.isPercentage ? '%' : ''}
                            </div>
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{kpi.trendLabel}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="h-20 w-full mt-6 -mx-6 mb-[-1.5rem]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={kpi.trendData}>
                            <defs>
                              <linearGradient id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={kpi.chartColor} stopOpacity={0.25} />
                                <stop offset="100%" stopColor={kpi.chartColor} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="v"
                              stroke={kpi.chartColor}
                              strokeWidth={3}
                              fill={`url(#gradient-${i})`}
                              isAnimationActive={true}
                              animationDuration={1500}
                              animationEasing="ease-out"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{kpi.footer}</p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="bottom" 
                    className="max-w-[280px] p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-black/5"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-lg", kpi.bg, kpi.color)}>
                          <kpi.icon size={16} strokeWidth={2.5} />
                        </div>
                        <p className="font-black text-sm text-gray-900 dark:text-white">{kpi.tooltip.title}</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                        {kpi.tooltip.description}
                      </p>
                      <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", kpi.color)}>
                          {kpi.tooltip.detail}
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </motion.div>
        </TooltipProvider>

        {/* ── Charts Row 1: Bar + Recent Sales ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <div className="lg:col-span-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500">
            {isLoading ? (
              <div className="w-full h-[350px] flex flex-col">
                <Skeleton className="h-6 w-40 mb-6" variant="text" />
                <div className="flex-1 w-full flex items-end gap-2">
                  {[35, 60, 40, 75, 45].map((height, i) => (
                    <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
            ) : <BarGraph data={data?.topProperties} range={range} />}
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
            ) : <AreaGraph data={data?.charts?.engagement} range={range} />}
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
