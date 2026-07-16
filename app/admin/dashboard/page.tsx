import { Metadata } from 'next';
import SystemAdminOverview from '@/app/admin/features/dashboard/components/system-admin-overview';

export const metadata: Metadata = {
  title: 'Operations Overview - BoardTAU Admin',
  description: 'Operational analytics, moderation queue backlog, and support dashboard',
};

export default function ModeratorDashboardPage() {
  return <SystemAdminOverview />;
}
