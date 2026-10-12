import { Metadata } from 'next';
import SystemAdminOverview from '@/app/admin/features/dashboard/components/system-admin-overview';

export const metadata: Metadata = {
  title: 'Admin Dashboard - BoardTAU',
  description: 'Admin operations and moderation dashboard for BoardTAU',
};

export default function ModeratorDashboardPage() {
  return <SystemAdminOverview />;
}
