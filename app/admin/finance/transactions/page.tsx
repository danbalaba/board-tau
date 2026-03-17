import { Metadata } from 'next';
import { TransactionsManagement } from '@/app/admin/features/finance/components/transactions-management';

export const metadata: Metadata = {
  title: 'Transactions - BoardTAU Admin',
  description: 'Manage and track all payment transactions',
};

export default function TransactionsPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <TransactionsManagement />
    </div>
  );
}
