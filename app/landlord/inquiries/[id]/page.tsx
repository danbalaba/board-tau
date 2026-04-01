import { getInquiryDetails } from '@/services/landlord/inquiries';
import { LandlordInquiryDetailView } from '../../features/inquiry-center/landlord-inquiry-detail-view';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LandlordInquiryDetailPage({ params }: Props) {
  const { id } = await params;
  
  try {
    const inquiry = await getInquiryDetails(id);
    return <LandlordInquiryDetailView inquiry={inquiry} />;
  } catch (error) {
    return notFound();
  }
}
