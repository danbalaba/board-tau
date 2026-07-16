import { Metadata } from 'next';
import { requireAdmin } from '@/lib/admin';
import { requirePagePermission } from '@/lib/rbac';
import { ModerationQueueDashboard } from '@/app/admin/features/moderation/components/moderation-queue';

export default async function ModerationQueuePage() {
  const admin = await requireAdmin();
  await requirePagePermission(admin.id, "VIEW_MODERATION_QUEUE");

  return (
    <div className="flex-1 flex flex-col">
      <ModerationQueueDashboard />
    </div>
  );
}
