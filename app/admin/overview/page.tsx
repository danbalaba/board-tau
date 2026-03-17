import { Metadata } from 'next';
import { ExecutiveOverview } from '@/app/admin/features/dashboard/components/executive-overview';

export const metadata: Metadata = {
  title: 'Executive Overview - BoardTAU Admin',
  description: 'Comprehensive dashboard with real-time platform analytics',
};

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Overview</h1>
          <p className="text-muted-foreground">
            Comprehensive dashboard with real-time platform analytics and business insights
          </p>
        </div>
      </div>
      <ExecutiveOverview />
    </div>
  );
}
