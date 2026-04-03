import LandlordSettingsFeature from '../features/settings';
import { requireLandlord } from '@/lib/landlord';

export const metadata = {
  title: 'Settings - Landlord Dashboard',
  description: 'Manage your landlord profile and settings',
};

export default async function LandlordSettingsPage() {
  await requireLandlord();

  return <LandlordSettingsFeature />;
}
