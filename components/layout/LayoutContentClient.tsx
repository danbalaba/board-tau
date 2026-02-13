'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/layout/Footer';
import AuthErrorHandler from '@/components/auth/AuthErrorHandler';
import EmailVerificationNotice from '@/components/auth/EmailVerificationNotice';
import { User } from 'next-auth';

interface LayoutContentClientProps {
  children: React.ReactNode;
  user?: (User & { id: string; role?: string });
}

const LayoutContentClient: React.FC<LayoutContentClientProps> = ({ children, user }) => {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isLandlord = pathname.startsWith('/landlord');

  if (isAdmin || isLandlord) {
    return <>{children}</>;
  }

  return (
    <>
      <AuthErrorHandler />
      <Navbar user={user} />
      <EmailVerificationNotice />
      <main className="pb-16 md:pt-28 pt-24 bg-[#F8FAF9] dark:bg-[#0f1419] transition-colors duration-300">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default LayoutContentClient;
