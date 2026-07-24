export const dynamic = 'force-dynamic';
import HowBookingWorksContent from '@/components/informative/HowBookingWorksContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How Booking Works | BoardTAU',
};

export default async function Page() {
  await new Promise(resolve => setTimeout(resolve, 400));
  return <HowBookingWorksContent />;
}
