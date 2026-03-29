import { getLandlordInquiries } from '@/services/landlord/inquiries';
import LandlordInquiriesClient from '../components/pages/inquiries/LandlordInquiriesClient';

export default async function LandlordInquiriesPage() {
  const inquiries = await getLandlordInquiries();

  return <LandlordInquiriesClient inquiries={inquiries} />;
}
