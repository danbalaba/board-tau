import { getLandlordInquiries } from '@/services/landlord/inquiries';
import LandlordInquiryCenter from '../features/inquiry-center';

export default async function LandlordInquiriesPage() {
  const inquiries = await getLandlordInquiries();

  return <LandlordInquiryCenter inquiries={inquiries} />;
}
