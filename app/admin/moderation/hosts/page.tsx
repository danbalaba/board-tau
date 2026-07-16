import { Metadata } from 'next';
import { HostApplicationsDashboard } from '@/app/admin/features/moderation/components/host-applications';

export const metadata: Metadata = {
  title: 'Host Recruitment Hub - BoardTAU HQ',
  description: 'Expanding and vetting the platform\'s property host network',
};

import { requireAdmin } from '@/lib/admin';
import { requirePagePermission } from '@/lib/rbac';

export default async function HostApplicationsPage() {
  const admin = await requireAdmin();
  await requirePagePermission(admin.id, "MODERATE_HOSTS");

  return (
    <div className="flex-1 flex flex-col">
      <HostApplicationsDashboard />
    </div>
  );
}
