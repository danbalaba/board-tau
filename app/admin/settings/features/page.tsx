import { Metadata } from 'next';
import { FeatureFlags } from '@/app/admin/features/settings/components/platform-flags';

export const metadata: Metadata = {
  title: 'Feature Flags - BoardTAU Admin',
  description: 'Manage platform feature flags and toggles',
};

export default function FeatureFlagsPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <FeatureFlags />
    </div>
  );
}
