import { getLandlordTenants } from '@/services/landlord/tenants';
import LandlordTenantManager from '../features/tenant-manager';
import { requireLandlord } from '@/lib/landlord';

export const metadata = {
  title: 'Tenants - Landlord Dashboard',
  description: 'Manage your property tenants',
};

import { requirePagePermission } from '@/lib/rbac';

export default async function LandlordTenantsPage() {
  const user = await requireLandlord();
  await requirePagePermission(user.id, "VIEW_TENANT_PROFILE");
  const tenants = await getLandlordTenants();

  return <LandlordTenantManager tenants={tenants as any} />;
}
