// app/admin/features/user-management/components/user-analytics/report-generation-modal.tsx
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/admin/components/ui/dialog';
import { Button } from '@/app/admin/components/ui/button';
import { Label } from '@/app/admin/components/ui/label';
import { 
  IconDownload, 
  IconFileText, 
  IconCheck, 
  IconShieldCheck, 
  IconMapPin, 
  IconDatabase, 
  IconLoader2 
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { toast } from '@/app/admin/components/ui/sonner';

interface ReportGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportGenerationModal({ open, onOpenChange }: ReportGenerationModalProps) {
  const [reportType, setReportType] = useState('full');
  const [format, setFormat] = useState('csv');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsDone(true);
      toast.success('Analytics report generated successfully.');
      setTimeout(() => {
        setIsDone(false);
        onOpenChange(false);
      }, 2000);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-[2.5rem] p-8">
        <DialogHeader className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-fuchsia-500/10 rounded-2xl shadow-sm">
              <IconFileText className="w-6 h-6 text-fuchsia-500" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Export Analytics</DialogTitle>
          </div>
          <DialogDescription className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-[3.25rem]">
            Generate and download detailed reports of platform activity
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-8 py-4">
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Select Report Scope</Label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'full', label: 'Complete Registry', desc: 'All user growth and role telemetry.', icon: IconDatabase },
                { id: 'demographics', label: 'Demographics', desc: 'Distribution analysis of user types.', icon: IconShieldCheck },
                { id: 'geography', label: 'Geographic Density', desc: 'Regional distribution activity hubs.', icon: IconMapPin },
              ].map((type) => (
                <div 
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-300",
                    reportType === type.id 
                      ? "border-fuchsia-500/50 bg-fuchsia-500/5 shadow-lg shadow-fuchsia-500/5 ring-1 ring-fuchsia-500/20" 
                      : "border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors",
                    reportType === type.id ? "bg-fuchsia-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                  )}>
                    <type.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest transition-colors",
                      reportType === type.id ? "text-fuchsia-600 dark:text-fuchsia-400" : "text-gray-900 dark:text-white"
                    )}>{type.label}</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-0.5">{type.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Output Architecture</Label>
            <div className="flex bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700">
              {[
                { id: 'csv', label: 'CSV Spreadsheet' },
                { id: 'pdf', label: 'Formal PDF Report' }
              ].map((f) => (
                <button 
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={cn(
                    "flex-1 py-2.5 text-[9px] font-black uppercase tracking-[0.15em] rounded-xl transition-all",
                    format === f.id 
                      ? "bg-white dark:bg-gray-700 text-fuchsia-600 dark:text-fuchsia-400 shadow-sm" 
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-0 mt-8">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 h-12 px-6">
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || isDone}
            className={cn(
              "min-w-[180px] rounded-xl font-black uppercase tracking-[0.15em] text-[10px] shadow-lg transition-all h-12 px-6",
              isDone ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20" : 
              "bg-gray-900 hover:bg-fuchsia-600 dark:bg-white dark:text-gray-900 dark:hover:bg-fuchsia-600 text-white"
            )}
          >
            {isDone ? (
              <><IconCheck className="w-4 h-4 mr-2" /> Downloaded</>
            ) : isGenerating ? (
              <><IconLoader2 className="w-4 h-4 mr-2 animate-spin" /> Synchronizing...</>
            ) : (
              <><IconDownload className="w-4 h-4 mr-2" /> Generate Intelligence</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
