import { getLandlordProperties } from '@/services/landlord/properties';
import LandlordPropertyManagement from '../features/property-management';

import { requireLandlord } from '@/lib/landlord';
import { requirePagePermission } from '@/lib/rbac';

export default async function LandlordPropertiesPage() {
  const user = await requireLandlord();
  await requirePagePermission(user.id, "VIEW_PROPERTIES");

  const properties = await getLandlordProperties();

  return <LandlordPropertyManagement properties={properties as any} />;
}
