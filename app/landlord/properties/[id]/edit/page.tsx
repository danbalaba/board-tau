import { getLandlordPropertyById } from "@/services/landlord/properties";
import { notFound, redirect } from "next/navigation";
import LandlordEditPropertyClient from "../../../components/pages/properties/LandlordEditPropertyClient";

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
    <LandlordEditPropertyClient initialData={property} />
  );
};

export default EditPropertyPage;
