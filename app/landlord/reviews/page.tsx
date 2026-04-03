import { getLandlordReviews } from '@/services/landlord/reviews';
import LandlordReviewsFeature from '../features/reviews';

export default async function LandlordReviewsPage() {
  await requireLandlord();
  const reviews = await getLandlordReviews();

  return <LandlordReviewsFeature reviews={reviews as any} />;
}
