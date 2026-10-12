import { Metadata } from 'next';
import { SystemBackup } from '@/app/admin/features/settings/components/system-backup';

export const metadata: Metadata = {
  title: 'System Backup & Restore - BoardTAU Admin',
  description: 'Manage automated snapshots, database exports, and recovery points',
};

export default function BackupRestorePage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <SystemBackup />
    </div>
  );
}
