import { Metadata } from 'next';
import { ErrorTracking } from '@/app/admin/features/monitoring/components/error-tracking';

export const metadata: Metadata = {
  title: 'Error Tracking - BoardTAU Admin',
  description: 'Monitor and track application errors',
};

export default function ErrorTrackingPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <ErrorTracking />
    </div>
  );
}
