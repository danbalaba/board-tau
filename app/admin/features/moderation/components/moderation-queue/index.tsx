'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GovernanceKPICards } from './governance-kpi-cards';
import { AdminQueueHeader } from './admin-queue-header';
import { ModerationActivityFeed } from './moderation-activity-feed';
import { AdminTodoSidebar } from './admin-todo-sidebar';
import { useModerationQueue } from '@/app/admin/hooks/use-moderation';
import { toast } from '@/app/admin/components/ui/sonner';
import { exportToCSV, exportToExcel } from '@/utils/export-utils';
import { useSession } from 'next-auth/react';
import { AdminDashboardError } from '@/app/admin/components/ui/admin-dashboard-error';

export function ModerationQueueDashboard() {
  const [range, setRange] = useState('30d');
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  const { data: queueData, isLoading, error, refetch, isFetching } = useModerationQueue({
    entityType: '',
  });

  if (error) {
    return <AdminDashboardError onRetry={() => refetch()} />;
  }

  const pendingItems = queueData?.data?.pendingItems || [];
  const recentLogs = queueData?.data?.recentLogs || [];
  const stats = queueData?.meta?.stats;

  const handleExport = async (format: 'CSV' | 'EXCEL' | 'PDF') => {
    const rangeLabel = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', '1y': 'Past Year' }[range] || range;
    const exportData = pendingItems.map((item: any) => ({
      'Type': item.entityType,
      'Title': item.title || item.entityId,
      'Status': item.status,
      'Submitted By': item.submittedBy || 'N/A',
      'Submitted At': new Date(item.createdAt).toLocaleDateString(),
    }));
    const meta = {
      reportTitle: 'Moderation Queue Report',
      title: 'Moderation Queue Report',
      reportId: `BTAU-MOD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [{ label: 'Period', value: rangeLabel }, { label: 'Items Exported', value: `${exportData.length}` }],
      summaryData: [{ label: 'Period', value: rangeLabel }, { label: 'Items Exported', value: `${exportData.length}` }],
      author: 'BoardTAU Admin Dashboard',
    };
    const fileName = `Moderation_Queue_${new Date().toLocaleDateString().replace(/\//g, '-')}`;
    
    if (format === 'CSV') {
      toast.promise(Promise.resolve(exportToCSV(exportData, fileName, meta)), { loading: 'Preparing CSV...', success: 'Exported as CSV!', error: 'Export failed.' });
    } else if (format === 'EXCEL') {
      toast.promise(Promise.resolve(exportToExcel(exportData, fileName, 'Queue', meta)), { loading: 'Preparing Excel...', success: 'Exported as Excel!', error: 'Export failed.' });
    } else if (format === 'PDF') {
      const { generateMultiSectionPDF } = await import('@/utils/pdfGenerator');
      const sections = [{
        title: 'Moderation Queue',
        type: 'table' as const,
        columns: ['Type', 'Title', 'Status', 'Submitted By', 'Submitted At'],
        data: exportData.map((item: any) => [
          item['Type'],
          item['Title'],
          item['Status'],
          item['Submitted By'],
          item['Submitted At']
        ])
      }];
      toast.promise(generateMultiSectionPDF(fileName, sections, meta), { loading: 'Preparing PDF...', success: 'Exported as PDF!', error: 'Export failed.' });
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6">
      {/* Header section moved to the top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <AdminQueueHeader
          handleRefresh={() => {
            toast.promise(refetch(), {
              loading: 'Syncing dashboard data...',
              success: 'Dashboard refreshed successfully',
              error: 'Failed to refresh dashboard'
            });
          }}
          onExport={handleExport}
          isLoading={isFetching}
          totalPending={pendingItems.length}
          range={range}
          onRangeChange={setRange}
          isSuperAdmin={isSuperAdmin}
        />
      </motion.div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* KPI Cards section underneath header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full"
        >
          <GovernanceKPICards 
            totalPending={(stats?.pendingHosts || 0) + (stats?.pendingListings || 0) + (stats?.pendingReviews || 0)}
            pendingListings={stats?.pendingListings || 0}
            pendingReviews={stats?.pendingReviews || 0}
            pendingHosts={stats?.pendingHosts || 0}
            totalLastWeek={stats?.totalLastWeek || 0}
            pendingListingsLastWeek={stats?.pendingListingsLastWeek || 0}
            pendingReviewsLastWeek={stats?.pendingReviewsLastWeek || 0}
            pendingHostsLastWeek={stats?.pendingHostsLastWeek || 0}
            isLoading={isFetching}
            range={range}
          />
        </motion.div>

        {/* Main Command Center Layout: 2 Columns */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1"
        >
        
        {/* Left Column: Moderation Activity Feed */}
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col">
          <ModerationActivityFeed 
            pendingItems={pendingItems} 
            recentLogs={recentLogs}
            isLoading={isFetching} 
          />
        </div>

        {/* Right Column: Auto-To-Do Checklist */}
        <div className="lg:col-span-1 xl:col-span-1">
          <div className="sticky top-8">
            <AdminTodoSidebar 
              pendingItems={pendingItems} 
              isLoading={isFetching} 
            />
          </div>
        </div>

      </motion.div>
      </div>
    </div>
  );
}
