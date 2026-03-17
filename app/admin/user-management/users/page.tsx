import { Metadata } from 'next';
import { UserDirectory } from '@/app/admin/features/user-management/components/user-directory';

export const metadata: Metadata = {
  title: 'User Directory - BoardTAU Admin',
  description: 'Manage user accounts and permissions',
};

export default function UserManagementPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <UserDirectory />
    </div>
  );
}
