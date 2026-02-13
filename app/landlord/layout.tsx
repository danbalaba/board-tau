import { ReactNode } from 'react';
import { requireLandlord } from '@/lib/landlord';
import LandlordLayoutClient from './components/layout/LandlordLayoutClient';
import Providers from '@/components/common/Provider';
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme handling is done by next-themes */}
      </head>
      <body
        className={`${inter.variable} ${inter.className} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <LandlordLayoutClient user={landlord}>
            {children}
          </LandlordLayoutClient>
        </Providers>
      </body>
    </html>
  );
}
