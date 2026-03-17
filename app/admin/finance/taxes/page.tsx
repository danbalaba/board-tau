import { Metadata } from 'next';
import { TaxCompliance } from '@/app/admin/features/finance/components/tax-compliance';

export const metadata: Metadata = {
  title: 'Tax Compliance - BoardTAU Admin',
  description: 'Manage tax filings and compliance',
};

export default function TaxCompliancePage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <TaxCompliance />
    </div>
  );
}
