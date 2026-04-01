import { Metadata } from 'next';
import { HostApplicationsDashboard } from '@/app/admin/features/moderation/components/host-applications';

export const metadata: Metadata = {
  title: 'Host Recruitment Hub - BoardTAU HQ',
  description: 'Expanding and vetting the platform\'s property host network',
};

export default function HostApplicationsPage() {
  return (
    <div className="flex-1 flex flex-col">
      <HostApplicationsDashboard />
    </div>
  );
}
