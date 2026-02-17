import { getLandlordReviews } from '@/services/landlord/reviews';
import LandlordReviewsClient from '@/app/landlord/components/pages/reviews/LandlordReviewsClient';

// Type assertion to bypass TypeScript error temporarily
type AnyReviews = {
  reviews: any[];
  nextCursor: string | null;
};
import { requireLandlord } from '@/lib/landlord';

export const metadata = {
  title: 'Reviews - Landlord Dashboard',
  description: 'Manage property reviews',
};

export default async function LandlordReviewsPage() {
  await requireLandlord();
  const reviews = await getLandlordReviews();

  return <LandlordReviewsClient reviews={reviews} />;
}
