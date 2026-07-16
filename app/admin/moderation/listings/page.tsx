import { Metadata } from 'next';
import { ListingsReviewDashboard } from '@/app/admin/features/moderation/components/listings-review';

export const metadata: Metadata = {
  title: 'Market Inventory Hub - BoardTAU HQ',
  description: 'Vetting and authorizing property listing assets for platform release',
};

import { requireAdmin } from '@/lib/admin';
import { requirePagePermission } from '@/lib/rbac';

export default async function ListingsReviewPage() {
  const admin = await requireAdmin();
  await requirePagePermission(admin.id, "MODERATE_LISTINGS");

  return (
    <div className="flex-1 flex flex-col">
      <ListingsReviewDashboard />
    </div>
  );
}
