import { LandlordPropertyCreator } from '@/app/landlord/features/property-management/landlord-property-creator';

export const metadata = {
  title: 'Add Property - Landlord Dashboard',
  description: 'Add a new rental property to BoardTAU',
};

export default function LandlordCreatePropertyPage() {
  return <LandlordPropertyCreator />;
}
