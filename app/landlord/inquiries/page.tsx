import { getLandlordInquiries } from '@/services/landlord/inquiries';
import LandlordInquiriesClient from '../components/pages/inquiries/LandlordInquiriesClient';
import { requireLandlord } from '@/lib/landlord';

export const metadata = {
  title: 'Inquiries - Landlord Dashboard',
  description: 'Manage property inquiries',
};

export default async function LandlordInquiriesPage() {
  await requireLandlord();
  const inquiries = await getLandlordInquiries();

  return <LandlordInquiriesClient inquiries={inquiries} />;
}
