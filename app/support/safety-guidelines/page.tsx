export const revalidate = 86400;
import SafetyGuidelinesContent from '@/components/informative/SafetyGuidelinesContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Safety Guidelines | BoardTAU',
  description: 'Safety protocols on BoardTAU',
};

export default function Page() {
  return <SafetyGuidelinesContent />;
}
