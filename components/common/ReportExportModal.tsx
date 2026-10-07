import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Table,
  Filter,
  Layers,
  Sparkles,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Info,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/utils/helper';
import { ExportFormat, ExportScope } from '@/hooks/use-report-export';
import { SummaryCard } from '@/utils/pdfGenerator';
import Checkbox from '@/components/inputs/Checkbox';

export interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  moduleType?: string;
  scope?: ExportScope | null;
  setScope?: (scope: ExportScope | null) => void;
  format?: ExportFormat | null;
  setFormat?: (format: ExportFormat | null) => void;
  includeSummary?: boolean;
  setIncludeSummary?: (val: boolean) => void;
  includeGlossary?: boolean;
  setIncludeGlossary?: (val: boolean) => void;
  liveSummaryCards?: SummaryCard[];
  activeDatasetCount?: number;
  allDataCount?: number;
  filteredDataCount?: number;
  onGenerate: (options?: { scope: ExportScope; format: ExportFormat; includeSummary: boolean; includeGlossary: boolean }) => Promise<void>;
  isGenerating?: boolean;
}

const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  title = "Business",
  scope: initialScope = null,
  setScope: parentSetScope,
  format: initialFormat = null,
  setFormat: parentSetFormat,
  includeSummary: initialIncludeSummary = true,
  setIncludeSummary: parentSetIncludeSummary,
  includeGlossary: initialIncludeGlossary = true,
  setIncludeGlossary: parentSetIncludeGlossary,
  liveSummaryCards = [],
  activeDatasetCount = 0,
  allDataCount = 0,
  filteredDataCount = 0,
  onGenerate,
  isGenerating = false
}) => {
  const [internalScope, setInternalScope] = useState<ExportScope | null>(initialScope);
  const [internalFormat, setInternalFormat] = useState<ExportFormat | null>(initialFormat);
  const [internalIncludeSummary, setInternalIncludeSummary] = useState<boolean>(initialIncludeSummary);
  const [internalIncludeGlossary, setInternalIncludeGlossary] = useState<boolean>(initialIncludeGlossary);

  const [scopeError, setScopeError] = useState(false);
  const [formatError, setFormatError] = useState(false);

  const scope = parentSetScope !== undefined ? initialScope : internalScope;
  const setScope = parentSetScope || setInternalScope;
  const format = parentSetFormat !== undefined ? initialFormat : internalFormat;
  const setFormat = parentSetFormat || setInternalFormat;
  const includeSummary = parentSetIncludeSummary ? initialIncludeSummary : internalIncludeSummary;
  const setIncludeSummary = parentSetIncludeSummary || setInternalIncludeSummary;
  const includeGlossary = parentSetIncludeGlossary ? initialIncludeGlossary : internalIncludeGlossary;
  const setIncludeGlossary = parentSetIncludeGlossary || setInternalIncludeGlossary;

  const [mounted, setMounted] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobileView(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Clear validation errors when modal opens
  useEffect(() => {
    if (isOpen) {
      setScopeError(false);
      setFormatError(false);
    }
  }, [isOpen]);

  if (!mounted) return null;

  const handleSelectScope = (newScope: ExportScope) => {
    setScope(newScope);
    setScopeError(false);
  };

  const handleSelectFormat = (newFormat: ExportFormat) => {
    setFormat(newFormat);
    setFormatError(false);
  };

  const handleDownload = async () => {
    let hasError = false;
    if (!scope) {
      setScopeError(true);
      hasError = true;
    }
    if (!format) {
      setFormatError(true);
      hasError = true;
    }

    if (hasError) {
      toast.error('Please select both Data Export Scope and File Format before downloading.');
      return;
    }

    await onGenerate({
      scope: scope!,
      format: format!,
      includeSummary,
      includeGlossary
    });
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[201] flex items-end sm:items-center justify-center p-0 sm:p-6 pointer-events-none">
            <motion.div
              initial={isMobileView ? { y: '100%', opacity: 1 } : { opacity: 0, scale: 0.95, y: 15 }}
              animate={isMobileView ? { y: 0, opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={isMobileView ? { y: '100%', opacity: 1 } : { opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              drag={isMobileView ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              dragSnapToOrigin={true}
              onDragEnd={(_, info) => {
                if (isMobileView && (info.offset.y > 80 || info.velocity.y > 200)) {
                  onClose();
                }
              }}
              className="w-full max-h-[88vh] sm:max-h-[90vh] sm:max-w-3xl bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto border-t sm:border border-slate-100 dark:border-slate-800"
            >
              {/* Single Sleek Top Drag Handle Bar (Draggable to slide down to close) */}
              <div 
                onClick={onClose}
                className="w-full pt-3.5 pb-1 flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing touch-none group select-none"
                title="Slide down to close"
              >
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full group-hover:bg-slate-400 dark:group-hover:bg-slate-600 transition-colors" />
              </div>

              {/* Header */}
              <div className="px-4 sm:px-6 pb-3 sm:pb-4 pt-1 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="p-2 sm:p-2.5 bg-primary/10 text-primary rounded-xl sm:rounded-2xl shrink-0">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                        Export {title} Report
                      </h2>
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                        Official Report
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      Choose your report range, format, and options
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain">
                {/* 1. Scope Selector */}
                <div className={cn(
                  "space-y-2.5 sm:space-y-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all border",
                  scopeError
                    ? "border-rose-500/80 bg-rose-50/40 dark:bg-rose-950/20 ring-2 ring-rose-500/20"
                    : "border-transparent"
                )}>
                  <div className="flex items-center justify-between">
                    <label className={cn(
                      "text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5",
                      scopeError ? "text-rose-600 dark:text-rose-400" : "text-slate-400 dark:text-slate-500"
                    )}>
                      <Filter className={cn("w-3.5 h-3.5", scopeError ? "text-rose-600" : "text-primary")} />
                      1. Choose Records to Export
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    {scopeError && (
                      <span className="text-[10px] sm:text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Select records
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectScope('filtered')}
                      className={cn(
                        "flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all relative overflow-hidden",
                        scope === 'filtered'
                          ? "bg-primary/10 dark:bg-primary/20 border-primary/40 text-slate-900 dark:text-white ring-2 ring-primary/20 shadow-sm"
                          : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      )}
                    >
                      <Filter className={cn("w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0", scope === 'filtered' ? "text-primary" : "text-slate-400")} />
                      <div className="pr-4">
                        <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5 flex-wrap">
                          Current Filtered List
                          <span className="text-[9px] sm:text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">
                            {filteredDataCount} items
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                          Exports only the items currently shown on screen
                        </p>
                      </div>
                      {scope === 'filtered' && (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary absolute top-2.5 right-2.5 sm:top-3 sm:right-3" />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectScope('all')}
                      className={cn(
                        "flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all relative overflow-hidden",
                        scope === 'all'
                          ? "bg-primary/10 dark:bg-primary/20 border-primary/40 text-slate-900 dark:text-white ring-2 ring-primary/20 shadow-sm"
                          : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      )}
                    >
                      <Layers className={cn("w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0", scope === 'all' ? "text-primary" : "text-slate-400")} />
                      <div className="pr-4">
                        <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5 flex-wrap">
                          All Records
                          <span className="text-[9px] sm:text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-full font-bold">
                            {allDataCount} items
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                          Exports all records regardless of search or filters
                        </p>
                      </div>
                      {scope === 'all' && (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary absolute top-2.5 right-2.5 sm:top-3 sm:right-3" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* 2. Format Selection */}
                <div className={cn(
                  "space-y-2.5 sm:space-y-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all border",
                  formatError
                    ? "border-rose-500/80 bg-rose-50/40 dark:bg-rose-950/20 ring-2 ring-rose-500/20"
                    : "border-transparent"
                )}>
                  <div className="flex items-center justify-between">
                    <label className={cn(
                      "text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5",
                      formatError ? "text-rose-600 dark:text-rose-400" : "text-slate-400 dark:text-slate-500"
                    )}>
                      <FileText className={cn("w-3.5 h-3.5", formatError ? "text-rose-600" : "text-primary")} />
                      2. Select File Format
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    {formatError && (
                      <span className="text-[10px] sm:text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Select format
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3">
                    <button
                      onClick={() => handleSelectFormat('pdf')}
                      className={cn(
                        "flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-center transition-all min-h-[85px] sm:min-h-[100px]",
                        format === 'pdf'
                          ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20 shadow-sm"
                          : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      )}
                    >
                      <FileText className={cn("w-5 h-5 sm:w-7 sm:h-7 mb-1 sm:mb-2", format === 'pdf' ? "text-rose-600" : "text-slate-400")} />
                      <span className="text-[11px] sm:text-xs font-bold leading-tight">PDF Document</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">Formatted report with QR code</span>
                    </button>

                    <button
                      onClick={() => handleSelectFormat('excel')}
                      className={cn(
                        "flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-center transition-all min-h-[85px] sm:min-h-[100px]",
                        format === 'excel'
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 shadow-sm"
                          : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      )}
                    >
                      <FileSpreadsheet className={cn("w-5 h-5 sm:w-7 sm:h-7 mb-1 sm:mb-2", format === 'excel' ? "text-emerald-600" : "text-slate-400")} />
                      <span className="text-[11px] sm:text-xs font-bold leading-tight">Excel (.xlsx)</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">Includes summary & data tabs</span>
                    </button>

                    <button
                      onClick={() => handleSelectFormat('csv')}
                      className={cn(
                        "flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-center transition-all min-h-[85px] sm:min-h-[100px]",
                        format === 'csv'
                          ? "bg-sky-50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800/80 text-sky-900 dark:text-sky-200 ring-2 ring-sky-500/20 shadow-sm"
                          : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      )}
                    >
                      <Table className={cn("w-5 h-5 sm:w-7 sm:h-7 mb-1 sm:mb-2", format === 'csv' ? "text-sky-600" : "text-slate-400")} />
                      <span className="text-[11px] sm:text-xs font-bold leading-tight">CSV (.csv)</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">Plain data file for Excel/Sheets</span>
                    </button>
                  </div>
                </div>

                {/* 3. Live Metrics Summary Preview Card */}
                {(() => {
                  const summaryCardsToDisplay = (liveSummaryCards && liveSummaryCards.length > 0)
                    ? liveSummaryCards
                    : [
                        { label: 'Dataset Count', value: `${activeDatasetCount} Items`, subValue: scope === 'all' ? 'All-time dataset' : 'Filtered screen items' },
                        { label: 'Export Scope', value: scope === 'all' ? 'Complete Records' : 'Current Filtered List', subValue: 'Selected data range' },
                        { label: 'Report Status', value: 'Ready to Generate', subValue: format ? `${format.toUpperCase()} format selected` : 'Verified report' }
                      ];

                  return (
                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-700/60 space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                          Report Summary Preview
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold">
                          {activeDatasetCount} items
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3">
                        {summaryCardsToDisplay.map((card, idx) => (
                          <div key={idx} className="bg-white dark:bg-slate-800 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-slate-100 dark:border-slate-700 shadow-xs">
                            <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate">{card.label}</div>
                            <div className="text-xs sm:text-base font-extrabold text-primary dark:text-primary mt-0.5 truncate">{card.value}</div>
                            {card.subValue && <div className="text-[9px] sm:text-[10px] text-slate-400 truncate">{card.subValue}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 4. Options & Features Toggles */}
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Report Options
                  </label>

                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-6 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <Checkbox
                      id="include-summary-toggle"
                      label="Include Overview Summary Cards"
                      checked={includeSummary}
                      onChange={(val) => setIncludeSummary(val)}
                    />

                    <Checkbox
                      id="include-glossary-toggle"
                      label="Include Key Terms & Definitions"
                      checked={includeGlossary}
                      onChange={(val) => setIncludeGlossary(val)}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions - Pinned Sticky on Mobile */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-0 shrink-0 sticky bottom-0 z-20 shadow-md sm:shadow-none">
                <div className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 justify-center sm:justify-start">
                  <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Official BoardTAU Verified Report</span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <button
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 sm:py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center border border-slate-200 dark:border-slate-700 sm:border-0"
                    disabled={isGenerating}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl sm:rounded-2xl text-xs font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download {format ? `${format.toUpperCase()} ` : ''}Report</span>
                      </>
                    )}
                  </motion.button>
                </div>
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
