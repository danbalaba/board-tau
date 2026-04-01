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
import { Download, FileText, CheckCircle2, ShieldCheck, MapPin, Database, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">Export Analytics</DialogTitle>
          </div>
          <DialogDescription>
            Generate and download detailed reports of platform activity and user data.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Report Type</Label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'full', label: 'Complete User Registry', desc: 'All user data including growth and roles.', icon: Database },
                { id: 'demographics', label: 'User Demographics', desc: 'Distribution analysis of platform roles.', icon: ShieldCheck },
                { id: 'geography', label: 'Geographic Density', desc: 'Location-based user distribution reporting.', icon: MapPin },
              ].map((type) => (
                <div 
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                    reportType === type.id 
                      ? "border-primary bg-primary/5 ring-1 ring-primary" 
                      : "border-border hover:bg-muted"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    reportType === type.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    <type.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <div className="flex bg-muted p-1 rounded-lg border">
              {[
                { id: 'csv', label: 'CSV Spreadsheet' },
                { id: 'pdf', label: 'PDF Report' }
              ].map((f) => (
                <button 
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                    format === f.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || isDone}
            className="min-w-[140px]"
          >
            {isDone ? (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> Downloaded</>
            ) : isGenerating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Download className="w-4 h-4 mr-2" /> Generate Report</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
