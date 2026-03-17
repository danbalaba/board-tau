import { Metadata } from 'next';
import { CommissionsManagement } from '@/app/admin/features/finance/components/commissions-management';

export const metadata: Metadata = {
  title: 'Commissions & Fees - BoardTAU Admin',
  description: 'Manage commission rates and calculate fees',
};

export default function CommissionsPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <CommissionsManagement />
    </div>
  );
}
