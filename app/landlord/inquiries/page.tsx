import { getLandlordInquiries } from '@/services/landlord/inquiries';
import LandlordInquiriesFeature from '../features/inquiries';

export default async function LandlordInquiriesPage() {
  const inquiries = await getLandlordInquiries();

  return <LandlordInquiriesFeature inquiries={inquiries} />;
}
