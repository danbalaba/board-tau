import { Metadata } from 'next';
import OverViewPage from '@/app/admin/features/overview/components/overview';

export const metadata: Metadata = {
  title: 'Dashboard - BoardTAU Admin',
  description: 'Admin dashboard and platform overview for BoardTAU',
};

export default function DashboardPage() {
  return <OverViewPage />;
}
