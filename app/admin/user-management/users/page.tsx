import { Metadata } from 'next';
import { UserDirectory } from '@/app/admin/features/user-management/components/user-directory';

export const metadata: Metadata = {
  title: 'User Directory - BoardTAU Admin',
  description: 'Manage user accounts, roles and system permissions',
};

export default function UserManagementPage() {
  return <UserDirectory />;
}
