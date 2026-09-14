import { Metadata } from 'next';
import { ListingsReviewDashboard } from '@/app/admin/features/moderation/components/listings-review';

export const metadata: Metadata = {
  title: 'Listings Review - BoardTAU',
  description: 'Review and moderate landlord property submissions before releasing them to BoardTAU',
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
