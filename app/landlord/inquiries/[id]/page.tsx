import { getInquiryDetails } from '@/services/landlord/inquiries';
import LandlordInquiryDetailClient from '../../components/pages/inquiries/LandlordInquiryDetailClient';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LandlordInquiryDetailPage({ params }: Props) {
  const { id } = await params;
  
  try {
    const inquiry = await getInquiryDetails(id);
    return <LandlordInquiryDetailClient inquiry={inquiry} />;
  } catch (error) {
    return notFound();
  }
}
