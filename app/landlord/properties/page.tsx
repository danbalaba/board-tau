import { getLandlordProperties } from '@/services/landlord/properties';
import LandlordPropertyManagement from '../features/property-management';

export default async function LandlordPropertiesPage() {
  const properties = await getLandlordProperties();

  return <LandlordPropertyManagement properties={properties as any} />;
}
