'use client';

import React, { useState } from 'react';
import { IconFileDownload, IconLoader2, IconFileTypePdf } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import Button from './Button';
import LoadingAnimation from './LoadingAnimation';
import { cn } from '@/utils/helper';

interface GenerateReportButtonProps {
  onGeneratePDF: () => Promise<void>;
  label?: string;
  className?: string;
}

const GenerateReportButton: React.FC<GenerateReportButtonProps> = ({
  onGeneratePDF,
  label = "Generate Report",
  className
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Intentional delay to show the loading screen properly instead of flashing
      await new Promise(resolve => setTimeout(resolve, 2000));
      await onGeneratePDF();
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          className={cn(
            "w-auto rounded-xl px-4 py-2.5 shadow-lg shadow-primary/20 group transition-all duration-300",
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
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-72 p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl z-[110]"
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
          Available Formats
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-700" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleGenerate}
            className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <IconFileTypePdf size={14} className="text-red-500" />
            </div>
            Export as PDF
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>

    {isGenerating && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <LoadingAnimation text="Generating PDF Report..." size="large" />
      </div>
    )}
    </>
  );
};

export default GenerateReportButton;
