'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/layout/Footer';
import AuthErrorHandler from '@/components/auth/AuthErrorHandler';
import EmailVerificationNotice from '@/components/auth/EmailVerificationNotice';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import RightSwipePanel from '@/components/navbar/RightSwipePanel';
import { User } from 'next-auth';

interface LayoutContentClientProps {
  children: React.ReactNode;
  user?: (User & { id: string; role?: string });
}

const LayoutContentClient: React.FC<LayoutContentClientProps> = ({ children, user }) => {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isLandlord = pathname.startsWith('/landlord');
  const isListingDetail = pathname.startsWith('/listings/') && pathname.split('/').length > 2;
  const isDashboardPage = ['/inquiries', '/favorites', '/reservations', '/my-reviews', '/profile'].some(path => pathname.startsWith(path));
  
  const hideNavbarOnMobile = isListingDetail || isDashboardPage;
  const mobilePaddingTop = isListingDetail ? 'pt-0' : (isDashboardPage ? 'pt-6' : 'pt-24');

  if (isAdmin || isLandlord) {
    return <>{children}</>;
  }

  return (
    <>
      <AuthErrorHandler />
      <div className={hideNavbarOnMobile ? "hidden md:block" : ""}>
        <Navbar user={user} />
      </div>
      <EmailVerificationNotice />
      <main className={`md:pt-28 ${mobilePaddingTop} bg-[#F8FAF9] dark:bg-[#0f1419] transition-colors duration-300 ${!isListingDetail ? 'pb-24' : ''}`}>
        {children}
      </main>
      <Footer />
      {!isListingDetail && <MobileBottomBar user={user} />}
      <RightSwipePanel user={user} />
    </>
  );
};

export default LayoutContentClient;
