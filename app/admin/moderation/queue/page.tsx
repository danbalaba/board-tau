import { Metadata } from 'next';
import { GovernanceCenter } from '@/app/admin/features/moderation/components/moderation-queue';

export const metadata: Metadata = {
  title: 'Governance Center - BoardTAU HQ',
  description: 'High-level administrative oversight and content authorization queue',
};

export default function ModerationQueuePage() {
  return (
    <div className="flex-1 flex flex-col">
      <GovernanceCenter />
    </div>
  );
}
