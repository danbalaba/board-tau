import { Metadata } from 'next';
import { RevenueDashboard } from '@/app/admin/features/finance/components/revenue-dashboard';

export const metadata: Metadata = {
  title: 'Revenue Dashboard - BoardTAU Admin',
  description: 'Comprehensive revenue and financial analytics',
};

export default function RevenueDashboardPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <RevenueDashboard />
    </div>
  );
}
