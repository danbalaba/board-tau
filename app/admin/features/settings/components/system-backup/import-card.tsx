import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Upload, HardDriveUpload, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImportCardProps {
  onImportClick: () => void;
  restoring: boolean;
}

export function ImportCard({ onImportClick, restoring }: ImportCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
      <Card className="group h-full border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] border border-rose-500/20 dark:border-rose-500/30 overflow-hidden transition-all duration-500 hover:shadow-rose-500/10 hover:border-rose-500/40">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 px-8 pt-8 pb-6 border-b border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 shrink-0 transition-transform duration-500 group-hover:scale-110">
            <HardDriveUpload className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg font-black tracking-tight text-rose-900 dark:text-rose-400">Restore Data</CardTitle>
            <CardDescription className="text-xs font-medium text-rose-600/70 dark:text-rose-400/70">Upload a backup file to replace the current data.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-8 pb-8 px-8">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
            <p className="text-xs font-semibold text-rose-800 dark:text-rose-300 leading-relaxed">
              DANGER: Restoring from a backup will permanently drop current active collections in the database. Super Admin credentials are preserved automatically to prevent lockout.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 mt-8">
            <Button
              type="button"
              onClick={onImportClick}
              disabled={restoring}
              className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest rounded-xl gap-2 transition-all shadow-lg hover:shadow-rose-600/30 hover:-translate-y-0.5 disabled:opacity-80"
            >
              {restoring ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Restoring Data...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Backup
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
