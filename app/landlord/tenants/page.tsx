import { getLandlordTenants } from '@/services/landlord/tenants';
import LandlordTenantManager from '../features/tenant-manager';
import { requireLandlord } from '@/lib/landlord';

export const metadata = {
  title: 'Tenants - Landlord Dashboard',
  description: 'Manage your property tenants',
};

export default async function LandlordTenantsPage() {
  await requireLandlord();
  const tenants = await getLandlordTenants();

  return <LandlordTenantManager tenants={tenants as any} />;
}
