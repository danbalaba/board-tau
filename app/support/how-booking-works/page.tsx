export const revalidate = 86400;
import HowBookingWorksContent from '@/components/informative/HowBookingWorksContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How Booking Works | BoardTAU',
};

export default function Page() {
  return <HowBookingWorksContent />;
}
