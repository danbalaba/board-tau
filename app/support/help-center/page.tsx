export const dynamic = 'force-dynamic';
import HelpCenterContent from '@/components/informative/HelpCenterContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center | BoardTAU',
  description: 'Get help with BoardTAU',
};

export default async function Page() {
  await new Promise(resolve => setTimeout(resolve, 400));
  return <HelpCenterContent />;
}
