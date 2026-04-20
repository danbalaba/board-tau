import { Metadata } from 'next';
import { PaymentSettings } from '@/app/admin/features/settings/components/platform-payments';

export const metadata: Metadata = {
  title: 'Payments & Taxes - BoardTAU Admin',
  description: 'Configure payment gateways, tax compliance, and commission structures',
};

export default function PaymentSettingsPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <PaymentSettings />
    </div>
  );
}
