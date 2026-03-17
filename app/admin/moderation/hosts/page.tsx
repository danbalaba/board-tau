import { Metadata } from 'next';
import { HostApplications } from '@/app/admin/features/moderation/components/host-applications';

export const metadata: Metadata = {
  title: 'Host Applications - BoardTAU Admin',
  description: 'Review and approve host applications',
};

export default function HostApplicationsPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <HostApplications />
    </div>
  );
}
