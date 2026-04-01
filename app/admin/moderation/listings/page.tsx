import { Metadata } from 'next';
import { ListingsReviewDashboard } from '@/app/admin/features/moderation/components/listings-review';

export const metadata: Metadata = {
  title: 'Market Inventory Hub - BoardTAU HQ',
  description: 'Vetting and authorizing property listing assets for platform release',
};

export default function ListingsReviewPage() {
  return (
    <div className="flex-1 flex flex-col">
      <ListingsReviewDashboard />
    </div>
  );
}
