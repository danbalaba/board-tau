import { Metadata } from 'next';
import OverViewPage from '@/app/admin/features/overview/components/overview';

export const metadata: Metadata = {
  title: 'Executive Overview - BoardTAU Admin',
  description: 'Comprehensive dashboard with real-time platform analytics',
};

export default function DashboardPage() {
  return <OverViewPage />;
}
