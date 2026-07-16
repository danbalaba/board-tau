'use client';

import React, { useState } from 'react';
import { toast } from '@/app/admin/components/ui/sonner';
import { BackupHeader } from './backup-header';
import { ExportCard } from './export-card';
import { ImportCard } from './import-card';
import { AutomatedBackupCard } from './automated-backup-card';
import { BackupHistoryCard } from './backup-history-card';
import { RestoreWarningModal } from './restore-warning-modal';

export function SystemBackup() {
  const [backupScope, setBackupScope] = useState('');
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExport = async (selectedTables: string[]) => {
    try {
      setExporting(true);
      let fetchUrl = `/api/admin/backup?scope=${backupScope}`;
      if (backupScope !== 'all' && selectedTables.length > 0) {
        fetchUrl += `&tables=${selectedTables.join(',')}`;
      }
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error('Backup generation failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boardtau_manual_${backupScope}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('System snapshot generated and downloaded.');
      setBackupScope('all'); 
      
      window.dispatchEvent(new Event('refreshBackupLogs'));
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate system backup.');
    } finally {
      setExporting(false);
    }
  };

  const handleConfirmRestore = async (file: File) => {
    setIsModalOpen(false);
    
    if (!file) {
      toast.error('No backup file selected.');
      return;
    }

    try {
      setRestoring(true);
      const formData = new FormData();
      formData.append('backup', file);

      const res = await fetch('/api/admin/restore?action=execute', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Restore failed');

      toast.success(`System successfully restored. Reloading environment...`);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Catastrophic failure during system restore.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <BackupHeader />
      
      <div className="grid gap-6 lg:grid-cols-2 pb-6">
        <ExportCard 
          backupScope={backupScope}
          setBackupScope={setBackupScope}
          onExport={handleExport}
          exporting={exporting}
        />
        
        <ImportCard 
          onImportClick={() => setIsModalOpen(true)}
          restoring={restoring}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 pb-10">
        <AutomatedBackupCard />
        <BackupHistoryCard />
      </div>

      <RestoreWarningModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmRestore}
      />
    </div>
  );
}
