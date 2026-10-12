import { Metadata } from 'next';
import { UserDirectory } from '@/app/admin/features/user-management/components/user-directory';

export const metadata: Metadata = {
  title: 'User Directory - BoardTAU Admin',
  description: 'Manage registered students, landlords, and administrative accounts',
};

import { requireAdmin } from '@/lib/admin';
import { requirePagePermission } from '@/lib/rbac';

export default async function UserManagementPage() {
  const admin = await requireAdmin();
  await requirePagePermission(admin.id, "MANAGE_USERS");

  return <UserDirectory />;
}
