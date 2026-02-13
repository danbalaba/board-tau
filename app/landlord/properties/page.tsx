import { getLandlordProperties } from '@/services/landlord/properties';
import LandlordPropertiesClient from '../components/pages/properties/LandlordPropertiesClient';

export default async function LandlordPropertiesPage() {
  const properties = await getLandlordProperties();

  return <LandlordPropertiesClient properties={properties} />;
}
