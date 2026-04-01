import { Metadata } from 'next';
import { RolesManagement } from '@/app/admin/features/user-management/components/roles-management';
import PageContainer from '@/app/admin/components/layout/page-container';

export const metadata: Metadata = {
  title: 'Governance & Roles - BoardTAU Admin',
  description: 'Institutional role management and privilege delegation',
};

export default function RolesPage() {
  return (
    <PageContainer scrollable>
      <div className="space-y-6">
        <RolesManagement />
      </div>
    </PageContainer>
  );
}
