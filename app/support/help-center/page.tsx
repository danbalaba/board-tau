import HelpCenterContent from '@/components/informative/HelpCenterContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center | BoardTAU',
  description: 'Get help with BoardTAU',
};

export default function Page() {
  return <HelpCenterContent />;
}
