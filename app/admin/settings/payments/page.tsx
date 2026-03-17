import { Metadata } from 'next';
import { PaymentSettings } from '@/app/admin/features/settings/components/payment-settings';

export const metadata: Metadata = {
  title: 'Payment & Tax Settings - BoardTAU Admin',
  description: 'Configure payment gateways and tax settings',
};

export default function PaymentSettingsPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <PaymentSettings />
    </div>
  );
}
