import { Metadata } from 'next';
import { ApiMonitoring } from '@/app/admin/features/monitoring/components/api-monitoring';

export const metadata: Metadata = {
  title: 'API Monitoring - BoardTAU Admin',
  description: 'Monitor API endpoints and request performance',
};

export default function ApiMonitoringPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <ApiMonitoring />
    </div>
  );
}
