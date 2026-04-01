import { Metadata } from 'next';
import { UserDirectory } from '@/app/admin/features/user-management/components/user-directory';
import PageContainer from '@/app/admin/components/layout/page-container';

export const metadata: Metadata = {
  title: 'User Management - BoardTAU Admin',
  description: 'Manage institutional assets and user privileges',
};

export default function UserManagementPage() {
  return (
    <PageContainer scrollable>
      <div className="space-y-6">
        <UserDirectory />
      </div>
    </PageContainer>
  );
}
