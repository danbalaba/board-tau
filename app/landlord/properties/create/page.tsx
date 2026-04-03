import LandlordPropertyEditorCreate from '../../features/property-management/landlord-property-editor-create';

export const metadata = {
  title: 'Add Property - Landlord Dashboard',
  description: 'Add a new rental property to BoardTAU',
};

export default function LandlordCreatePropertyPage() {
  return <LandlordPropertyEditorCreate />;
}
