'use client';

import React, { useState } from 'react';
import { Card } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import {
  Download,
  RefreshCcw,
  Calendar,
  Layers,
  Map as MapIcon,
  ChevronDown,
  TrendingUp,
  Activity
} from 'lucide-react';
import { AnalyticsKPICards } from './analytics-kpi-cards';
import { UserGrowthChart } from './user-growth-chart';
import { UserDemographicsChart } from './user-demographics-chart';
import { GeographicDistributionChart } from './geographic-distribution-chart';
import { ReportGenerationModal } from './report-generation-modal';
import { useUserAnalytics } from '@/app/admin/hooks/use-user-analytics';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { VerificationLifecycleChart } from './verification-status-chart';

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
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 bg-muted rounded-lg w-1/4" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-80 bg-muted rounded-xl" />
          <div className="h-80 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  const analyticsData = data.data;

  return (
    <div className="p-6 lg:p-10 space-y-12">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/50 pb-10">
        <div className="space-y-1">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black tracking-tighter text-foreground uppercase"
          >
            User Analytics
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground font-medium text-sm flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-emerald-500" />
            See how many people are joining and using BoardTAU
          </motion.p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 px-6 gap-3 rounded-2xl border-border/60 bg-card shadow-sm hover:shadow-md transition-all">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">{timeRangeLabel}</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
              {[
                { r: '7d', l: 'Last 7 Days' },
                { r: '30d', l: 'Last 30 Days' },
                { r: '90d', l: 'Last 90 Days' },
                { r: '1y', l: 'Past Year' }
              ].map((item) => (
                <DropdownMenuItem
                  key={item.r}
                  onClick={() => setRange(item.r)}
                  className={cn(
                    "text-[10px] font-black py-3 uppercase tracking-widest cursor-pointer rounded-xl mb-1",
                    range === item.r ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.l}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className={cn("h-11 w-11 rounded-xl", isFetching && "animate-spin")}
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>

          <Button
            variant="default"
            onClick={() => setIsReportModalOpen(true)}
            className="h-11 px-8 gap-3 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95 text-white"
          >
            <Download className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Download Report</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Section */}
      <AnalyticsKPICards data={analyticsData} />

      {/* Main Grid Layout */}
      {/* Performance & Trust Row */}
      <div className="lg:col-span-5 space-y-8">
        <div className="flex items-center gap-3 pl-4 border-l-[3px] border-emerald-500">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80">User Growth & Verification</h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-3 flex flex-col h-full"
          >
            <UserGrowthChart data={analyticsData} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="xl:col-span-2 flex flex-col h-full"
          >
            <VerificationLifecycleChart data={analyticsData} />
          </motion.div>
        </div>
      </div>

      {/* Distribution & Geography Row */}
      <div className="lg:col-span-5 space-y-8">
        <div className="flex items-center gap-3 pl-4 border-l-[3px] border-amber-500">
          <Activity className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80">Roles & Locations</h2>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="xl:col-span-2 flex flex-col h-full"
          >
            <UserDemographicsChart data={analyticsData} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="xl:col-span-3 flex flex-col h-full"
          >
            <GeographicDistributionChart data={analyticsData} />
          </motion.div>
        </div>
      </div>

      <ReportGenerationModal
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
      />
    </div>
  );
}
