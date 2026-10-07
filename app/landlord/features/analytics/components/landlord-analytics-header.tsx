'use client';

import React from 'react';
import { IconChartLine } from '@tabler/icons-react';
import ModernSelect from '@/components/common/ModernSelect';
import GenerateReportButton from '@/components/common/GenerateReportButton';


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
              Check total revenue, room occupancy, and earnings reports
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
            outline={false}
            className="w-auto h-9 sm:h-11 px-3 sm:px-5 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] sm:text-[11px] tracking-wider sm:tracking-widest shadow-md shadow-primary/20 border-b-2 sm:border-b-4 border-primary/30 active:border-b-0 transition-all flex items-center justify-center gap-1.5 shrink-0"
          />
        </div>
      </div>
    </div>
  );
}
