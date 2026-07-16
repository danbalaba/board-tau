'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuditLogHeader } from './audit-log-header';
import { getColumns, AuditLog } from './columns';
import { AuditLogModal } from './audit-log-modal';
import { parseAsString, useQueryState } from 'nuqs';
import { useDataTable } from '@/app/admin/hooks/use-data-table';
import { DataTable } from '@/app/admin/components/ui/table/data-table';
import { DataTableToolbar } from '@/app/admin/components/ui/table/data-table-toolbar';
import { toast } from '@/app/admin/components/ui/sonner';
import { exportToCSV, exportToExcel } from '@/utils/export-utils';
import { format } from 'date-fns';

export default function AuditLogs() {
  const [range, setRange] = useState('30d');
  const [pageSize] = useQueryState('perPage', parseAsString.withDefault('10'));
  const [page] = useQueryState('page', parseAsString.withDefault('1'));
  
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['auditLogs', page, pageSize, range],
    queryFn: async () => {
      const res = await fetch(`/api/admin/monitoring/audit-logs?page=${page}&limit=${pageSize}&range=${range}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }
  });

  const columns = React.useMemo(() => getColumns(setSelectedLog), []);

  const totalItems = data?.total || 0;
  const pageCount = Math.max(1, Math.ceil(totalItems / parseInt(pageSize)));

  const { table } = useDataTable({
    data: data?.logs || [],
    columns: columns as any,
    shallow: true,
    debounceMs: 500,
    pageCount: pageCount
  });

  const handleExport = async (formatType: 'CSV' | 'EXCEL' | 'PDF') => {
    const logs = data?.logs || [];
    const rangeLabel = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', '1y': 'Past Year' }[range as string] || range;
    
    const exportData = logs.map((log: any) => ({
      'Action': log.action,
      'Type': log.type,
      'Environment': log.environment,
      'User': log.admin?.name || 'System',
      'Entity ID': log.entityId || 'N/A',
      'Date': format(new Date(log.createdAt), 'MMM d, yyyy HH:mm'),
    }));
    
    const meta = {
      reportTitle: 'Audit Logs Report',
      title: 'Audit Logs Report',
      reportId: `BTAU-AUDIT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [{ label: 'Period', value: rangeLabel }, { label: 'Logs Exported', value: `${exportData.length}` }],
      summaryData: [{ label: 'Period', value: rangeLabel }, { label: 'Logs Exported', value: `${exportData.length}` }],
      author: 'BoardTAU Admin Dashboard',
    };
    
    const fileName = `Audit_Logs_${format(new Date(), 'yyyy-MM-dd')}`;
    
    if (formatType === 'CSV') {
      toast.promise(Promise.resolve(exportToCSV(exportData, fileName, meta)), {
        loading: 'Preparing CSV export...',
        success: 'Audit Logs exported as CSV!',
        error: 'Failed to export CSV.',
      });
    } else if (formatType === 'EXCEL') {
      toast.promise(Promise.resolve(exportToExcel(exportData, fileName, 'Audit Logs', meta)), {
        loading: 'Preparing Excel export...',
        success: 'Audit Logs exported as Excel!',
        error: 'Failed to export Excel.',
      });
    } else if (formatType === 'PDF') {
      const { generateMultiSectionPDF } = await import('@/utils/pdfGenerator');
      const sections = [{
        title: 'Audit Logs',
        type: 'table' as const,
        columns: ['Action', 'Type', 'User', 'Environment', 'Date'],
        data: exportData.map((item: any) => [
          item['Action'],
          item['Type'],
          item['User'],
          item['Environment'],
          item['Date']
        ])
      }];
      toast.promise(generateMultiSectionPDF(fileName, sections, meta), {
        loading: 'Preparing PDF export...',
        success: 'Audit Logs exported as PDF!',
        error: 'Failed to export PDF.',
      });
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AuditLogHeader 
        onRefresh={() => {
          toast.promise(refetch(), {
            loading: 'Syncing audit logs...',
            success: 'Audit logs updated',
            error: 'Failed to refresh audit logs'
          });
        }}
        onExport={handleExport}
        isFetching={isLoading || isFetching}
        range={range}
        onRangeChange={setRange}
      />
      
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col p-6">
        <DataTable table={table} isLoading={isLoading || isFetching}>
          <DataTableToolbar table={table} />
        </DataTable>
      </div>

      <AuditLogModal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </div>
  );
}
