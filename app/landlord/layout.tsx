import { ReactNode } from 'react';
import { requireLandlord } from '@/lib/landlord';
import LandlordLayoutClient from './features/layout';
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

import { cookies } from 'next/headers';

export default async function LandlordLayout({
  children,
}: {
  children: ReactNode;
}) {
  const landlord = await requireLandlord();
  const cookieStore = await cookies();
  const sidebarCookie = cookieStore.get('sidebar_state');
  const defaultOpen = sidebarCookie ? sidebarCookie.value === 'true' : true;

  return (
    <div className={`${inter.variable} ${inter.className} [--font-sans:var(--font-inter)] font-sans antialiased`}>
      <LandlordLayoutClient user={landlord} defaultOpen={defaultOpen}>
        {children}
      </LandlordLayoutClient>
    </div>
  );
}
