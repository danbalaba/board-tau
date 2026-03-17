import { Metadata } from 'next';
import { RolesManagement } from '@/app/admin/features/user-management/components/roles-management';

export const metadata: Metadata = {
  title: 'Roles & Permissions - BoardTAU Admin',
  description: 'Manage user roles and permissions',
};

export default function RolesPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <RolesManagement />
    </div>
  );
}
