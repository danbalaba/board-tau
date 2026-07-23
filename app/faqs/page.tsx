import { Metadata } from 'next';
// Trigger reload
import FaqsContent from '@/components/informative/FaqsContent';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about finding and hosting boarding houses on BoardTAU.',
};

export default function Page() {
  return <FaqsContent />;
}
