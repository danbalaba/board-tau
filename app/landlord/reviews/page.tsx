import { getLandlordReviews } from '@/services/landlord/reviews';
import LandlordReviews from '../features/reviews';
import { requireLandlord } from '@/lib/landlord';

export const metadata = {
  title: 'Reviews - Landlord Dashboard',
  description: 'Manage property reviews',
};

import { requirePagePermission } from '@/lib/rbac';

export default async function LandlordReviewsPage() {
  const user = await requireLandlord();
  await requirePagePermission(user.id, "RESPOND_REVIEW");
  const reviews = await getLandlordReviews();

  return <LandlordReviews reviews={reviews as any} />;
}
