'use client';

import React from 'react';
import { IconChartLine } from '@tabler/icons-react';
import ModernSelect from '@/components/common/ModernSelect';
import GenerateReportButton from '@/components/common/GenerateReportButton';

interface LandlordAnalyticsHeaderProps {
  timePeriod: 'month' | 'quarter' | 'year';
  setTimePeriod: (val: 'month' | 'quarter' | 'year') => void;
  handleGenerateReport: () => Promise<void>;
}

export function LandlordAnalyticsHeader({
  timePeriod,
  setTimePeriod,
  handleGenerateReport
}: LandlordAnalyticsHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
            <IconChartLine size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              Analytics & Performance
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModernSelect
            instanceId="analytics-time-period"
            value={timePeriod}
            onChange={(val: any) => setTimePeriod(val)}
            className="min-w-[140px]"
            options={[
              { value: 'month', label: 'This Month' },
              { value: 'quarter', label: 'Quarter' },
              { value: 'year', label: 'Year' },
            ]}
          />
          <GenerateReportButton 
            onGeneratePDF={handleGenerateReport}
          />
        </div>
      </div>
    </div>
  );
}
