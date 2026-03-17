import { Metadata } from 'next';
import { ReviewsModeration } from '@/app/admin/features/moderation/components/reviews-moderation';

export const metadata: Metadata = {
  title: 'Reviews & Ratings - BoardTAU Admin',
  description: 'Review and moderate user reviews and ratings',
};

export default function ReviewsModerationPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <ReviewsModeration />
    </div>
  );
}
