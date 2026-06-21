import React from 'react';
import { Metadata } from 'next';
import AccessibilitySupportContent from '@/components/informative/AccessibilitySupportContent';

export const metadata: Metadata = {
  title: 'Accessibility | BoardTAU',
  description: 'BoardTAU commitment to accessibility for all users.',
};

export default function AccessibilityPage() {
  return <AccessibilitySupportContent />;
}
