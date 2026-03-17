import { Metadata } from 'next';
import { ModerationQueue } from '@/app/admin/features/moderation/components/moderation-queue';

export const metadata: Metadata = {
  title: 'Moderation Queue - BoardTAU Admin',
  description: 'Review and moderate content on the platform',
};

export default function ModerationQueuePage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <ModerationQueue />
    </div>
  );
}
