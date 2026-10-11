import React from 'react';
import { Database, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/app/admin/components/ui/button';

interface BackupHeaderProps {
  onRefresh?: () => void;
}

export function BackupHeader({ onRefresh }: BackupHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shrink-0">
            <Database className="h-6 w-6" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            System Backup
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5" /> 33 Collections Active
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Manage automated snapshots, database exports, and recovery points
          </p>
        </div>
      </div>

      {onRefresh && (
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            className="h-10 w-10 rounded-xl bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-all hover:scale-105 shadow-sm"
            title="Refresh System Logs"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
