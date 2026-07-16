import React from 'react';
import { Database } from 'lucide-react';

export function BackupHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <Database className="h-8 w-8 text-rose-500" />
          System Backup
        </h1>
        <p className="text-sm font-medium text-gray-500 mt-1">
          Download a copy of your data or restore from a backup.
        </p>
      </div>
    </div>
  );
}
