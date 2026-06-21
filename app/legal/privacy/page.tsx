import React from 'react';
import { Metadata } from 'next';
import PrivacyPolicyContent from '@/components/informative/PrivacyPolicyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy | BoardTAU',
  description: 'How BoardTAU collects, uses, and protects your information.',
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}
