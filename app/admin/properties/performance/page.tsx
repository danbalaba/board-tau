import { Metadata } from 'next';
import { PerformanceMetrics } from '@/app/admin/features/properties/components/performance-metrics';

export const metadata: Metadata = {
  title: 'Performance Metrics - BoardTAU Admin',
  description: 'Track property performance and occupancy',
};

export default function PerformanceMetricsPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <PerformanceMetrics />
    </div>
  );
}
