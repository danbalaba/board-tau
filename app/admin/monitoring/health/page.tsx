import { Metadata } from 'next';
import { SystemHealth } from '@/app/admin/features/monitoring/components/system-health';

export const metadata: Metadata = {
  title: 'System Health - BoardTAU Admin',
  description: 'Monitor system status and uptime',
};

export default function SystemHealthPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <SystemHealth />
    </div>
  );
}
