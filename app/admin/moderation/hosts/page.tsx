import { Metadata } from 'next';
import { HostApplicationsDashboard } from '@/app/admin/features/moderation/components/host-applications';

export const metadata: Metadata = {
  title: 'Host Applications Review - BoardTAU HQ',
  description: 'Review and verify landlord onboarding applications',
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
