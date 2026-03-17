import { Metadata } from 'next';
import { ListingsReview } from '@/app/admin/features/moderation/components/listings-review';

export const metadata: Metadata = {
  title: 'Listings Review - BoardTAU Admin',
  description: 'Review and moderate property listings',
};

export default function ListingsReviewPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <ListingsReview />
    </div>
  );
}
