export const dynamic = 'force-dynamic';
import React from 'react';
import { Metadata } from 'next';
import AccessibilitySupportContent from '@/components/informative/AccessibilitySupportContent';

export const metadata: Metadata = {
  title: 'Accessibility | BoardTAU',
  description: 'BoardTAU commitment to accessibility for all users.',
};

export default async function AccessibilityPage() {
  await new Promise(resolve => setTimeout(resolve, 400));
  return <AccessibilitySupportContent />;
}
