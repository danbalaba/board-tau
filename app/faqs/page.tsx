export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import FaqsContent from '@/components/informative/FaqsContent';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | BoardTAU Camiling',
  description: 'Find answers to common questions about finding, booking, and hosting boarding houses and dormitories near Tarlac Agricultural University (TAU) on BoardTAU.',
  keywords: [
    'BoardTAU FAQ',
    'TAU Boarding House Questions',
    'How to book dorm near TAU',
    'Camiling Tarlac Student Housing FAQ',
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is BoardTAU?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "BoardTAU is a localized boarding house search and management platform for the Tarlac Agricultural University (TAU) community in Camiling, Tarlac. It connects students, faculty, and guests with safe, verified accommodations."
      }
    },
    {
      "@type": "Question",
      "name": "Who can use the platform?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "BoardTAU is open to students looking for bedspaces or solo rooms, TAU faculty and staff seeking apartments near campus, and local landlords listing their properties."
      }
    },
    {
      "@type": "Question",
      "name": "How do I book a room on BoardTAU?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Browse listings by price or distance to TAU, select your room type, submit a booking inquiry with your target move-in date and ID, and complete payment once approved by the landlord."
      }
    },
    {
      "@type": "Question",
      "name": "Why do I need to complete an identity check?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "To prevent fraud and maintain safety, renters upload a valid government/student ID and hosts provide business permit verification."
      }
    },
    {
      "@type": "Question",
      "name": "How do I register as a host?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Click Become a Host, submit your business name and contact info, upload your Mayor's or Business Permit, and our team will review your application within 24-48 hours."
      }
    }
  ]
};

export default async function Page() {
  await new Promise(resolve => setTimeout(resolve, 400));
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FaqsContent />
    </>
  );
}
