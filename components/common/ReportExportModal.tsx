'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DateRange, DayPicker } from 'react-day-picker';
import { format, subDays, startOfMonth, subMonths, endOfMonth, startOfYear } from 'date-fns';
import { MdClose } from 'react-icons/md';
import { IconFileDownload, IconFileTypePdf, IconFileTypeCsv, IconTable, IconCalendarEvent, IconLoader2 } from '@tabler/icons-react';
import { cn } from '@/utils/helper';
import Button from '@/components/common/Button';
import 'react-day-picker/style.css';

export interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (format: 'PDF' | 'CSV' | 'EXCEL', dateRange?: DateRange) => Promise<void>;
  isGenerating?: boolean;
}

import { createPortal } from 'react-dom';

const PRESETS = [
  { label: 'All Time', getValue: () => undefined },
  { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: 'Last 7 Days', getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Last 30 Days', getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'This Month', getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: 'Last Month', getValue: () => {
      const start = startOfMonth(subMonths(new Date(), 1));
      const end = endOfMonth(start);
      return { from: start, to: end };
    } 
  },
  { label: 'Year to Date', getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) }
];

const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating = false
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'CSV' | 'EXCEL'>('PDF');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [activePreset, setActivePreset] = useState<string>('All Time');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handlePresetClick = (preset: typeof PRESETS[0]) => {
    setActivePreset(preset.label);
    setDateRange(preset.getValue());
  };

  const handleGenerateClick = async () => {
    await onGenerate(selectedFormat, dateRange);
  };

  // When picking a custom date, remove the active preset highlight
  const handleSelectDateRange = (range: DateRange | undefined) => {
    setDateRange(range);
    setActivePreset('Custom');
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto"
            >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                  <IconFileDownload size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Export Business Report</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Configure your report format and date range</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <MdClose size={24} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row overflow-auto">
              {/* Left Column: Formats & Presets */}
              <div className="w-full md:w-64 p-6 border-r border-gray-100 dark:border-gray-800 space-y-8 bg-gray-50/30 dark:bg-gray-900/30 shrink-0">
                {/* Format Selection */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">1. Select Format</h3>
                  
                  <button
                    onClick={() => setSelectedFormat('PDF')}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border text-sm font-semibold transition-all",
                      selectedFormat === 'PDF' 
                        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 shadow-sm" 
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <IconFileTypePdf size={20} className={selectedFormat === 'PDF' ? "text-red-500" : "text-gray-400"} />
                    PDF Document
                  </button>

                  <button
                    onClick={() => setSelectedFormat('EXCEL')}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border text-sm font-semibold transition-all",
                      selectedFormat === 'EXCEL' 
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 shadow-sm" 
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <IconTable size={20} className={selectedFormat === 'EXCEL' ? "text-green-500" : "text-gray-400"} />
                    Excel Spreadsheet
                  </button>

                  <button
                    onClick={() => setSelectedFormat('CSV')}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border text-sm font-semibold transition-all",
                      selectedFormat === 'CSV' 
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 shadow-sm" 
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <IconFileTypeCsv size={20} className={selectedFormat === 'CSV' ? "text-blue-500" : "text-gray-400"} />
                    CSV Data
                  </button>
                </div>

                {/* Presets */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">2. Quick Date Filters</h3>
                  <div className="flex flex-col gap-1.5">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => handlePresetClick(preset)}
                        className={cn(
                          "text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                          activePreset === preset.label
                            ? "bg-primary/10 text-primary"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Calendar */}
              <div className="flex-1 p-6 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Custom Date Range</h3>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <IconCalendarEvent size={16} className="text-primary" />
                    {dateRange?.from ? (
                      <>
                        {format(dateRange.from, 'MMM dd, yyyy')}
                        {dateRange.to && ` - ${format(dateRange.to, 'MMM dd, yyyy')}`}
                      </>
                    ) : (
                      "Select a custom range below (Optional)"
                    )}
                  </p>
                </div>

                <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                  <style>{`
                    .rdp-root {
                      --rdp-accent-color: var(--primary-color);
                      --rdp-accent-text-color: #fff;
                      --rdp-range_start-color: var(--primary-color);
                      --rdp-range_end-color: var(--primary-color);
                      --rdp-range_middle-background-color: var(--primary-light-color);
                      --rdp-cell-size: 40px;
                      --rdp-caption-font-size: 16px;
                      margin: 0;
                    }
                    .dark .rdp-root {
                      --rdp-range_middle-background-color: var(--primary-dark-color);
                      color: #e5e7eb;
                    }
                    .rdp-day_selected {
                      background-color: var(--rdp-accent-color) !important;
                    }
                    .rdp-day_range_middle {
                      background-color: var(--rdp-range_middle-background-color) !important;
                      color: inherit !important;
                    }
                  `}</style>
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={handleSelectDateRange}
                    numberOfMonths={2}
                    pagedNavigation
                    className="m-0"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <Button
                onClick={handleGenerateClick}
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-xl flex items-center gap-2 min-w-[160px] justify-center"
              >
                {isGenerating ? (
                  <>
                    <IconLoader2 size={16} className="animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <IconFileDownload size={16} />
                    <span>Generate Report</span>
                  </>
                )}
              </Button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ReportExportModal;
