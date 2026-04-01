import { Metadata } from 'next';
import { ReviewsModerationDashboard } from '@/app/admin/features/moderation/components/reviews-moderation';

export const metadata: Metadata = {
  title: 'Reputation & Feedback Hub - BoardTAU HQ',
  description: 'Vetting and authorizing user reputation sentiment and platform feedback',
};

export default function ReviewsModerationPage() {
  return (
    <div className="flex-1 flex flex-col">
      <ReviewsModerationDashboard />
    </div>
  );
}
