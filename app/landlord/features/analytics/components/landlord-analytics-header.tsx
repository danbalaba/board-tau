'use client';

import React from 'react';
import { IconChartLine } from '@tabler/icons-react';
import ModernSelect from '@/components/common/ModernSelect';
import GenerateReportButton from '@/components/common/GenerateReportButton';

import Skeleton from '@/components/common/Skeleton';

interface LandlordAnalyticsHeaderProps {
  timePeriod?: 'month' | 'quarter' | 'year';
  setTimePeriod?: (val: 'month' | 'quarter' | 'year') => void;
  handleGenerateReport?: () => Promise<void>;
  isLoading?: boolean;
}

export function LandlordAnalyticsHeader({
  timePeriod,
  setTimePeriod,
  handleGenerateReport,
  isLoading
}: LandlordAnalyticsHeaderProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-950 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Skeleton className="w-16 h-16 rounded-[24px]" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" variant="text" />
              <Skeleton className="h-3 w-64 opacity-60" variant="text" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-40 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-gray-950 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-black/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-[24px] flex items-center justify-center shadow-inner">
            <IconChartLine size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tighter">
              Analytics & Performance
            </h1>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              High-level overview of your rental empire's performance
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ModernSelect
            instanceId="analytics-time-period"
            value={timePeriod || 'month'}
            onChange={(val: any) => setTimePeriod?.(val)}
            className="min-w-[160px]"
            options={[
              { value: 'month', label: 'This Month' },
              { value: 'quarter', label: 'Quarterly' },
              { value: 'year', label: 'Yearly' },
            ]}
          />
          <GenerateReportButton 
            onGeneratePDF={handleGenerateReport || (async () => {})}
          />
        </div>
      </div>
    </div>
  );
}
