import { Metadata } from 'next';
import { SecurityLogs } from '@/app/admin/features/monitoring/components/security-logs';

export const metadata: Metadata = {
  title: 'Security Logs - BoardTAU Admin',
  description: 'Monitor security events and activities',
};

export default function SecurityLogsPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <SecurityLogs />
    </div>
  );
}
