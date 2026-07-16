'use client';

import React, { useState, useEffect } from 'react';
import { IconFileDownload, IconLoader2 } from '@tabler/icons-react';
import { DateRange } from 'react-day-picker';
import Button from './Button';
import { cn } from '@/utils/helper';
import ReportExportModal from './ReportExportModal';

interface GenerateReportButtonProps {
  onGeneratePDF: (dateRange?: DateRange) => Promise<void>;
  onGenerateCSV?: (dateRange?: DateRange) => Promise<void>;
  onGenerateExcel?: (dateRange?: DateRange) => Promise<void>;
  label?: string;
  className?: string;
  outline?: boolean;
}

const GenerateReportButton: React.FC<GenerateReportButtonProps> = ({
  onGeneratePDF,
  onGenerateCSV,
  onGenerateExcel,
  label = "Generate Report",
  className,
  outline = false
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGenerate = async (type: 'PDF' | 'CSV' | 'EXCEL', dateRange?: DateRange) => {
    setIsGenerating(true);
    try {
      // Intentional delay to show the loading state properly
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (type === 'PDF') await onGeneratePDF(dateRange);
      if (type === 'CSV' && onGenerateCSV) await onGenerateCSV(dateRange);
      if (type === 'EXCEL' && onGenerateExcel) await onGenerateExcel(dateRange);
      
      setIsModalOpen(false); // Close modal on success
    } catch (error) {
      console.error(`Error generating ${type} report:`, error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <Button 
        outline={outline}
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "w-auto px-4 py-2.5 shadow-lg shadow-primary/20 group transition-all duration-300",
          isGenerating && "opacity-80 pointer-events-none",
          className
        )}
        disabled={isGenerating}
      >
        <span className="flex items-center gap-2">
          {isGenerating ? (
            <IconLoader2 size={16} className="animate-spin" />
          ) : (
            <IconFileDownload size={16} className="group-hover:translate-y-0.5 transition-transform duration-300" />
          )}
          <span className="text-[11px] uppercase tracking-widest font-black">
            {isGenerating ? "Processing..." : label}
          </span>
        </span>
      </Button>

      <ReportExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
    </>
  );
};

export default GenerateReportButton;
