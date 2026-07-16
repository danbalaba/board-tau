import React from 'react';
import { Button } from '@/app/admin/components/ui/button';
import { IconDeviceFloppy, IconRotate } from '@tabler/icons-react';
import { Save, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Skeleton from '@/components/common/Skeleton';

interface GeneralHeaderProps {
  onSave: (e: React.FormEvent) => void;
  onReset: () => void;
  isSaving: boolean;
  hasChanges?: boolean;
  isLoading?: boolean;
}

export function GeneralHeader({ onSave, onReset, isSaving, hasChanges = true, isLoading }: GeneralHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
          Platform Settings
        </h1>
        <p className="text-sm font-medium text-gray-500 mt-1">
          Basic platform information and global settings
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        {isLoading ? (
          <>
            <Skeleton className="h-11 w-24 rounded-xl" />
            <Skeleton className="h-11 w-36 rounded-xl" />
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              onClick={onReset}
              disabled={isSaving}
              className="h-11 px-6 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button 
              onClick={onSave}
              disabled={isSaving || !hasChanges}
              className={cn(
                "h-11 px-8 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all gap-2",
                isSaving ? "opacity-80 cursor-not-allowed bg-primary" : "bg-primary hover:bg-primary/90 hover:shadow-primary/20 hover:-translate-y-0.5"
              )}
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
