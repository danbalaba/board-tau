import React from 'react';
import { Metadata } from 'next';
import TermsOfServiceContent from '@/components/informative/TermsOfServiceContent';

export const metadata: Metadata = {
  title: 'Terms of Service | BoardTAU',
  description: 'Terms and conditions for using the BoardTAU platform.',
};

export default function TermsOfServicePage() {
  return <TermsOfServiceContent />;
}
