export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
// Trigger reload
import FaqsContent from '@/components/informative/FaqsContent';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about finding and hosting boarding houses on BoardTAU.',
};

export default async function Page() {
  await new Promise(resolve => setTimeout(resolve, 400));
  return <FaqsContent />;
}
