import { Metadata } from 'next';
import { DatabasePerformance } from '@/app/admin/features/monitoring/components/database-performance';

export const metadata: Metadata = {
  title: 'Database Performance - BoardTAU Admin',
  description: 'Monitor database query performance and connections',
};

export default function DatabasePerformancePage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <DatabasePerformance />
    </div>
  );
}
