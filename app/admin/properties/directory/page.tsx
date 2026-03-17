import { Metadata } from 'next';
import { PropertyDirectory } from '@/app/admin/features/properties/components/property-directory';

export const metadata: Metadata = {
  title: 'Property Directory - BoardTAU Admin',
  description: 'Manage all properties on the platform',
};

export default function PropertyDirectoryPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <PropertyDirectory />
    </div>
  );
}
