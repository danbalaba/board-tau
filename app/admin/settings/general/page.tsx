import { Metadata } from 'next';
import { GeneralSettings } from '@/app/admin/features/settings/components/platform-general';

export const metadata: Metadata = {
  title: 'General Settings - BoardTAU Admin',
  description: 'Configure platform-wide general settings and preferences',
};

export default function GeneralSettingsPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <GeneralSettings />
    </div>
  );
}
