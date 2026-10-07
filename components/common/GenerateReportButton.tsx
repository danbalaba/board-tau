'use client';

import React, { useState, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helper';
import ReportExportModal from './ReportExportModal';
import { ExportFormat, ExportScope } from '@/hooks/use-report-export';
import { SummaryCard } from '@/utils/pdfGenerator';

interface GenerateReportButtonProps {
  onGeneratePDF?: (options?: any) => Promise<void>;
  onGenerateCSV?: (options?: any) => Promise<void>;
  onGenerateExcel?: (options?: any) => Promise<void>;
  moduleType?: 'property' | 'room' | 'booking' | 'inquiry' | 'review' | 'reservation';
  moduleTitle?: string;
  allData?: any[];
  filteredData?: any[];
  onGenerate?: (options?: any) => Promise<void>;
  label?: string;
  className?: string;
  outline?: boolean;
  // Hook bindings if passed directly
  exportHook?: {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    scope: ExportScope | null;
    setScope: (scope: ExportScope | null) => void;
    format: ExportFormat | null;
    setFormat: (format: ExportFormat | null) => void;
    includeSummary: boolean;
    setIncludeSummary: (val: boolean) => void;
    includeGlossary: boolean;
    setIncludeGlossary: (val: boolean) => void;
    liveSummaryCards: SummaryCard[];
    activeDatasetCount: number;
    handleExport: () => Promise<void>;
    isExporting: boolean;
  } | null | undefined;
}

const GenerateReportButton: React.FC<GenerateReportButtonProps> = ({
  onGeneratePDF,
  onGenerateCSV,
  onGenerateExcel,
  moduleType = 'property',
  moduleTitle = 'Business',
  allData = [],
  filteredData = [],
  onGenerate,
  label = "Export Report",
  className,
  outline = false,
  exportHook
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalScope, setInternalScope] = useState<ExportScope | null>(null);
  const [internalFormat, setInternalFormat] = useState<ExportFormat | null>(null);
  const [internalIncludeSummary, setInternalIncludeSummary] = useState(true);
  const [internalIncludeGlossary, setInternalIncludeGlossary] = useState(true);
  const [internalGenerating, setInternalGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Use hook bindings if supplied, else fallback to standard trigger
  const isOpen = exportHook ? exportHook.isOpen : internalOpen;
  const setIsOpen = exportHook ? exportHook.setIsOpen : setInternalOpen;
  const isGenerating = exportHook ? exportHook.isExporting : internalGenerating;

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleModalGenerate = async (options?: { scope: ExportScope; format: ExportFormat; includeSummary: boolean; includeGlossary: boolean }) => {
    if (exportHook) {
      await exportHook.handleExport();
      return;
    }

    const scopeToUse = options?.scope || (exportHook ? (exportHook as any).scope : internalScope);
    const formatToUse = options?.format || (exportHook ? (exportHook as any).format : internalFormat);
    const includeSummaryToUse = options?.includeSummary ?? (exportHook ? (exportHook as any).includeSummary : internalIncludeSummary);
    const includeGlossaryToUse = options?.includeGlossary ?? (exportHook ? (exportHook as any).includeGlossary : internalIncludeGlossary);

    setInternalGenerating(true);
    try {
      const exportOptions = {
        scope: scopeToUse,
        format: formatToUse,
        includeSummary: includeSummaryToUse,
        includeGlossary: includeGlossaryToUse
      };
      if (formatToUse === 'pdf' && onGeneratePDF) {
        await onGeneratePDF(exportOptions);
      } else if (formatToUse === 'csv' && onGenerateCSV) {
        await onGenerateCSV(exportOptions);
      } else if (formatToUse === 'excel' && onGenerateExcel) {
        await onGenerateExcel(exportOptions);
      } else if (onGenerate) {
        await onGenerate(exportOptions);
      }
    } catch (err) {
      console.error('Report generation error:', err);
    } finally {
      setInternalGenerating(false);
      setInternalOpen(false);
    }
  };

  const activeDatasetCount = exportHook
    ? exportHook.activeDatasetCount
    : internalScope === 'filtered'
      ? (filteredData.length || allData.length || 1)
      : (allData.length || filteredData.length || 1);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        disabled={isGenerating}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md",
          outline
            ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            : "bg-primary hover:bg-primary/90 text-white shadow-primary/20",
          isGenerating && "opacity-75 cursor-not-allowed",
          className
        )}
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          <Download className="w-4 h-4 text-current" />
        )}
        <span className="uppercase tracking-wider text-[11px] font-extrabold whitespace-nowrap">
          {isGenerating ? "Exporting..." : label}
        </span>
      </motion.button>

      <ReportExportModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={moduleTitle}
        moduleType={moduleType}
        scope={exportHook ? exportHook.scope : internalScope}
        setScope={exportHook ? exportHook.setScope : setInternalScope}
        format={exportHook ? exportHook.format : internalFormat}
        setFormat={exportHook ? exportHook.setFormat : setInternalFormat}
        includeSummary={exportHook ? exportHook.includeSummary : internalIncludeSummary}
        setIncludeSummary={exportHook ? exportHook.setIncludeSummary : setInternalIncludeSummary}
        includeGlossary={exportHook ? exportHook.includeGlossary : internalIncludeGlossary}
        setIncludeGlossary={exportHook ? exportHook.setIncludeGlossary : setInternalIncludeGlossary}
        liveSummaryCards={exportHook ? exportHook.liveSummaryCards : []}
        activeDatasetCount={activeDatasetCount}
        allDataCount={allData.length || (exportHook ? exportHook.activeDatasetCount : 0)}
        filteredDataCount={filteredData.length || (exportHook ? exportHook.activeDatasetCount : 0)}
        onGenerate={handleModalGenerate}
        isGenerating={isGenerating}
      />
    </>
  );
};

export default GenerateReportButton;
