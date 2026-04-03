import { ReactNode } from 'react';
import { requireLandlord } from '@/lib/landlord';
import LandlordLayoutClientRoot from './features/layout/landlord-layout-client-root';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import 'react-loading-skeleton/dist/skeleton.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

export const metadata = {
  title: 'Landlord Dashboard - BoardTAU',
  description: 'Manage your properties, inquiries, and bookings',
};

export default async function LandlordLayout({
  children,
}: {
  children: ReactNode;
}) {
  const landlord = await requireLandlord();

  return (
    <div className={`${inter.variable} ${inter.className} font-sans antialiased`}>
      <LandlordLayoutClientRoot user={landlord}>
        {children}
      </LandlordLayoutClientRoot>
    </div>
  );
}
