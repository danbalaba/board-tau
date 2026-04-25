import { Metadata } from 'next';
import { SecuritySettings } from '@/app/admin/features/settings/components/platform-security';

export const metadata: Metadata = {
  title: 'Security Settings - BoardTAU Admin',
  description: 'Configure security, compliance, and authentication policies',
};

export default function SecuritySettingsPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <SecuritySettings />
    </div>
  );
}
