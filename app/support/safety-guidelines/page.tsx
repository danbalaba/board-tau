export const dynamic = 'force-dynamic';
import SafetyGuidelinesContent from '@/components/informative/SafetyGuidelinesContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Safety Guidelines | BoardTAU',
  description: 'Safety protocols on BoardTAU',
};

export default async function Page() {
  await new Promise(resolve => setTimeout(resolve, 400));
  return <SafetyGuidelinesContent />;
}
