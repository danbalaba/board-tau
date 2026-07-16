import { getLandlordInquiries } from '@/services/landlord/inquiries';
import LandlordInquiryCenter from '../features/inquiry-center';

import { requireLandlord } from '@/lib/landlord';
import { requirePagePermission } from '@/lib/rbac';

export default async function LandlordInquiriesPage() {
  const user = await requireLandlord();
  await requirePagePermission(user.id, "MANAGE_INQUIRIES");

  const inquiries = await getLandlordInquiries();

  return <LandlordInquiryCenter inquiries={inquiries} />;
}
