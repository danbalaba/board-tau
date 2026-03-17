import { Metadata } from 'next';
import { ServerMetrics } from '@/app/admin/features/monitoring/components/server-metrics';

export const metadata: Metadata = {
  title: 'Server Metrics - BoardTAU Admin',
  description: 'Monitor server performance and resource utilization',
};

export default function ServerMetricsPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <ServerMetrics />
    </div>
  );
}
