import { Metadata } from 'next';
import { ReviewsModerationDashboard } from '@/app/admin/features/moderation/components/reviews-moderation';

export const metadata: Metadata = {
  title: 'Reviews & Ratings - BoardTAU HQ',
  description: 'Moderate student ratings, feedback, and property reviews',
};

import { requireAdmin } from '@/lib/admin';
import { requirePagePermission } from '@/lib/rbac';

export default async function ReviewsModerationPage() {
  const admin = await requireAdmin();
  await requirePagePermission(admin.id, "MODERATE_REVIEWS");

  return (
    <div className="flex-1 flex flex-col">
      <ReviewsModerationDashboard />
    </div>
  );
}
