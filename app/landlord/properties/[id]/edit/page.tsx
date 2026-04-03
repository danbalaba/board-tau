import { getLandlordPropertyById } from "@/services/landlord/properties";
import { notFound, redirect } from "next/navigation";
import LandlordPropertyEditorEdit from "../../../features/property-management/landlord-property-editor-edit";

export const metadata = {
  title: 'Edit Property - Landlord Dashboard',
  description: 'Update your rental property details on BoardTAU',
};

interface EditPropertyPageProps {
  params: {
    id: string;
  };
}

const EditPropertyPage = async ({ params }: EditPropertyPageProps) => {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  const property = await getLandlordPropertyById(id);

  if (!property) {
    return notFound();
  }

  return (
    <LandlordPropertyEditorEdit initialData={property} />
  );
};

export default EditPropertyPage;
