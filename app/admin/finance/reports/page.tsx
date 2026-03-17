import { Metadata } from 'next';
import { FinancialReports } from '@/app/admin/features/finance/components/financial-reports';

export const metadata: Metadata = {
  title: 'Financial Reports - BoardTAU Admin',
  description: 'Generate and manage financial reports',
};

export default function FinancialReportsPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <FinancialReports />
    </div>
  );
}
