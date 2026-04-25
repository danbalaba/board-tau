import { Metadata } from 'next';
import { RolesManagement } from '@/app/admin/features/user-management/components/roles-management';

export const metadata: Metadata = {
  title: 'Roles & Permissions - BoardTAU Admin',
  description: 'Institutional role management and privilege delegation',
};

export default function RolesPage() {
  return <RolesManagement />;
}
