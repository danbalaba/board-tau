import { getLandlordReviews } from '@/services/landlord/reviews';
import LandlordReviews from '../features/reviews';
import { requireLandlord } from '@/lib/landlord';

export const metadata = {
  title: 'Reviews - Landlord Dashboard',
  description: 'Manage property reviews',
};

export default async function LandlordReviewsPage() {
  await requireLandlord();
  const reviews = await getLandlordReviews();

  return <LandlordReviews reviews={reviews as any} />;
}
