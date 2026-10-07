'use client';

import { useState, useMemo } from 'react';
import { generateTablePDF, generateSingleItemPDF, SummaryCard } from '@/utils/pdfGenerator';
import { exportToExcel, exportToCSV, prepareDataForExport, prepareSingleItemForExport, ExportMetadata } from '@/utils/export-utils';
import { toast } from 'react-hot-toast';

export type ExportModuleType = 'property' | 'room' | 'booking' | 'inquiry' | 'review' | 'reservation';
export type ExportFormat = 'pdf' | 'excel' | 'csv';
export type ExportScope = 'filtered' | 'all';

interface UseReportExportProps<T> {
  moduleType: ExportModuleType;
  moduleTitle: string;
  allData: T[];
  filteredData: T[];
  columns: string[];
}

export function useReportExport<T extends Record<string, any>>({
  moduleType,
  moduleTitle,
  allData = [],
  filteredData = [],
  columns = []
}: UseReportExportProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [scope, setScope] = useState<ExportScope | null>(null);
  const [format, setFormat] = useState<ExportFormat | null>(null);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeGlossary, setIncludeGlossary] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const activeDataset = useMemo(() => {
    return scope === 'filtered' ? filteredData : allData;
  }, [scope, filteredData, allData]);

  // Dynamic Live Summary Cards computation for Preview & PDF Header
  const liveSummaryCards = useMemo<SummaryCard[]>(() => {
    const totalCount = activeDataset.length;

    switch (moduleType) {
      case 'property': {
        const activeCount = activeDataset.filter(item => !item.isArchived).length;
        const totalRooms = activeDataset.reduce((sum, item) => sum + (item.rooms?.length || 0), 0);
        return [
          { label: 'Total Properties', value: totalCount.toString(), subValue: `${scope === 'filtered' ? 'Filtered view' : 'All history'}` },
          { label: 'Active Listings', value: activeCount.toString(), subValue: `${Math.round((activeCount / (totalCount || 1)) * 100)}% active` },
          { label: 'Total Units/Rooms', value: totalRooms.toString(), subValue: 'Across listed properties' }
        ];
      }
      case 'room': {
        const totalCapacity = activeDataset.reduce((sum, item) => sum + (item.capacity || 1), 0);
        const avgPrice = activeDataset.length
          ? Math.round(activeDataset.reduce((sum, item) => sum + (item.price || 0), 0) / activeDataset.length)
          : 0;
        return [
          { label: 'Total Units', value: totalCount.toString() },
          { label: 'Total Capacity', value: `${totalCapacity} Pax` },
          { label: 'Avg Monthly Rate', value: `₱${avgPrice.toLocaleString()}` }
        ];
      }
      case 'booking':
      case 'reservation': {
        const totalRevenue = activeDataset.reduce((sum, item) => sum + (item.totalPrice || item.amount || 0), 0);
        const confirmedCount = activeDataset.filter(item => (item.status || '').toLowerCase() === 'confirmed' || (item.status || '').toLowerCase() === 'active').length;
        return [
          { label: 'Total Records', value: totalCount.toString() },
          { label: 'Confirmed / Active', value: confirmedCount.toString() },
          { label: 'Gross Revenue', value: `₱${totalRevenue.toLocaleString()}` }
        ];
      }
      case 'inquiry': {
        const pendingCount = activeDataset.filter(item => (item.status || '').toLowerCase() === 'pending').length;
        return [
          { label: 'Total Inquiries', value: totalCount.toString() },
          { label: 'Pending Response', value: pendingCount.toString() },
          { label: 'Response Rate', value: `${totalCount ? Math.round(((totalCount - pendingCount) / totalCount) * 100) : 100}%` }
        ];
      }
      case 'review': {
        const avgRating = activeDataset.length
          ? (activeDataset.reduce((sum, item) => sum + (item.rating || 0), 0) / activeDataset.length).toFixed(1)
          : '5.0';
        return [
          { label: 'Total Feedback', value: totalCount.toString() },
          { label: 'Avg Star Rating', value: `★ ${avgRating}` },
          { label: 'Satisfaction Rate', value: `${Math.round((parseFloat(avgRating) / 5) * 100)}%` }
        ];
      }
      default:
        return [
          { label: 'Total Records', value: totalCount.toString() }
        ];
    }
  }, [activeDataset, moduleType, scope]);

  // Execute Header/Portfolio Export (Level 1)
  const handleExport = async () => {
    if (!activeDataset.length) {
      toast.error('No records available to export.');
      return;
    }

    setIsExporting(true);
    const dateStamp = new Date().toISOString().slice(0, 10);
    const fileName = `BoardTAU_${moduleTitle.replace(/\s+/g, '_')}_Report_${dateStamp}`;
    const reportId = `BTAU-${moduleType.toUpperCase().slice(0, 4)}-${dateStamp.replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      const preparedRows = prepareDataForExport(activeDataset, moduleType);

      const metadata: ExportMetadata = {
        reportTitle: `${moduleTitle} Intelligence Report`,
        reportId: reportId,
        summary: liveSummaryCards,
        author: 'BoardTAU Landlord Portal'
      };

      if (format === 'excel') {
        exportToExcel(preparedRows, fileName, `${moduleTitle} Ledger`, metadata);
        toast.success(`Successfully exported ${preparedRows.length} records to Excel!`);
      } else if (format === 'csv') {
        exportToCSV(preparedRows, fileName, metadata);
        toast.success(`Successfully exported ${preparedRows.length} records to CSV!`);
      } else if (format === 'pdf') {
        const tableHeaders = Object.keys(preparedRows[0] || {});
        const tableValues = preparedRows.map(row => Object.values(row));

        // Derive Status Distribution for visual bar chart
        let distributionData: any[] = [];
        const totalItems = activeDataset.length || 1;

        if (moduleType === 'property') {
          const approved = activeDataset.filter(i => (i.status || '').toLowerCase() === 'approved' || (i.status || '').toLowerCase() === 'active').length;
          const pending = activeDataset.filter(i => (i.status || '').toLowerCase() === 'pending').length;
          const rejected = activeDataset.filter(i => (i.status || '').toLowerCase() === 'rejected').length;
          distributionData = [
            { label: 'Approved / Active', count: approved, percentage: (approved / totalItems) * 100, color: [47, 125, 109] },
            { label: 'Pending Review', count: pending, percentage: (pending / totalItems) * 100, color: [217, 119, 6] },
            { label: 'Rejected', count: rejected, percentage: (rejected / totalItems) * 100, color: [220, 38, 38] }
          ];
        } else if (moduleType === 'room') {
          const available = activeDataset.filter(i => (i.status || '').toLowerCase() === 'available').length;
          const full = activeDataset.filter(i => (i.status || '').toLowerCase() === 'full').length;
          const maint = activeDataset.filter(i => (i.status || '').toLowerCase() === 'maintenance').length;
          distributionData = [
            { label: 'Available', count: available, percentage: (available / totalItems) * 100, color: [47, 125, 109] },
            { label: 'Full Capacity', count: full, percentage: (full / totalItems) * 100, color: [37, 99, 235] },
            { label: 'Maintenance', count: maint, percentage: (maint / totalItems) * 100, color: [217, 119, 6] }
          ];
        } else if (moduleType === 'booking' || moduleType === 'reservation') {
          const confirmed = activeDataset.filter(i => ['confirmed', 'active', 'reserved', 'checked_in'].includes((i.status || '').toLowerCase())).length;
          const pending = activeDataset.filter(i => (i.status || '').toLowerCase().includes('pending')).length;
          const other = totalItems - confirmed - pending;
          distributionData = [
            { label: 'Confirmed / Active', count: confirmed, percentage: (confirmed / totalItems) * 100, color: [47, 125, 109] },
            { label: 'Pending Action', count: pending, percentage: (pending / totalItems) * 100, color: [217, 119, 6] },
            { label: 'Cancelled / Other', count: Math.max(0, other), percentage: (Math.max(0, other) / totalItems) * 100, color: [220, 38, 38] }
          ];
        }

        await generateTablePDF(fileName, tableHeaders, tableValues, {
          title: `${moduleTitle} Intelligence Report`,
          subtitle: `Portfolio Scope: ${scope === 'filtered' ? 'Filtered UI View' : 'Complete Historical Record'} (${activeDataset.length} items)`,
          author: 'BoardTAU Landlord Portal',
          summaryData: includeSummary ? liveSummaryCards : [],
          distributionData: distributionData,
          type: moduleType,
          reportId: reportId,
          includeSummary: includeSummary,
          includeGlossary: includeGlossary
        });
        toast.success(`Successfully generated Vector PDF Report (${reportId})!`);
      }

      setIsOpen(false);
    } catch (err) {
      console.error('Export error:', err);
      toast.error('An error occurred while generating the report.');
    } finally {
      setIsExporting(false);
    }
  };

  // Execute Single Item Specification Datasheet Export (Level 2)
  const handleExportSingleItem = async (item: T, singleFormat: ExportFormat = 'pdf') => {
    setIsExporting(true);
    try {
      const formattedItem = prepareSingleItemForExport(item, moduleType);
      const dateStamp = new Date().toISOString().slice(0, 10);
      const reportId = `BTAU-SPEC-${dateStamp.replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const fileName = `BoardTAU_SpecSheet_${formattedItem.title.replace(/\s+/g, '_')}_${dateStamp}`;

      if (singleFormat === 'pdf') {
        await generateSingleItemPDF(
          fileName,
          formattedItem.title,
          formattedItem.category,
          formattedItem.kvPairs,
          formattedItem.sections,
          {
            title: formattedItem.title,
            author: 'BoardTAU Landlord Portal',
            reportId: reportId,
            type: moduleType
          }
        );
        toast.success(`Generated Single-Item PDF Specification (${reportId})!`);
      } else if (singleFormat === 'excel' || singleFormat === 'csv') {
        const flatData = [
          ...formattedItem.kvPairs.map(kv => ({ 'Attribute': kv.label, 'Value': kv.value })),
          ...formattedItem.sections.map(sec => ({ 'Attribute': `Section: ${sec.title}`, 'Value': sec.text || sec.items?.join(', ') || 'N/A' }))
        ];
        const metadata: ExportMetadata = {
          reportTitle: `Single Item Datasheet: ${formattedItem.title}`,
          reportId: reportId,
          summary: [{ label: 'Item Category', value: formattedItem.category }],
          author: 'BoardTAU Landlord Portal'
        };

        if (singleFormat === 'excel') {
          exportToExcel(flatData, fileName, 'Item Spec Sheet', metadata);
          toast.success('Exported Item Datasheet to Excel!');
        } else {
          exportToCSV(flatData, fileName, metadata);
          toast.success('Exported Item Datasheet to CSV!');
        }
      }
    } catch (err) {
      console.error('Single item export error:', err);
      toast.error('Failed to export single item datasheet.');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isOpen,
    setIsOpen,
    scope,
    setScope,
    format,
    setFormat,
    includeSummary,
    setIncludeSummary,
    includeGlossary,
    setIncludeGlossary,
    isExporting,
    liveSummaryCards,
    activeDatasetCount: activeDataset.length,
    handleExport,
    handleExportSingleItem
  };
}
