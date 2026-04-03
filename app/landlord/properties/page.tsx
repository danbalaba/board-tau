import { getLandlordProperties } from '@/services/landlord/properties';
import LandlordPropertyManagementFeature from '../features/property-management';

export default async function LandlordPropertiesPage() {
  const properties = await getLandlordProperties();

  return <LandlordPropertyManagementFeature properties={properties} />;
}
