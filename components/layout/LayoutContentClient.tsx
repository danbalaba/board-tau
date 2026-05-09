'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/layout/Footer';
import AuthErrorHandler from '@/components/auth/AuthErrorHandler';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import RightSwipePanel from '@/components/navbar/RightSwipePanel';
import UserBackToTop from '@/components/common/UserBackToTop';
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
  
  const isMessages = pathname.startsWith('/messages');
  const isLocked = pathname === '/auth/locked';
  
  useEffect(() => {
    // Force scroll to top on every navigation
    window.scrollTo(0, 0);
  }, [pathname]);

  const hideNavbarOnMobile = isListingDetail || isDashboardPage || isMessages;
  const mobilePaddingTop = (isListingDetail || isMessages) ? 'pt-0' : (isDashboardPage ? 'pt-6' : 'pt-24');

  if (isAdmin || isLandlord || isLocked) {
    return <>{children}</>;
  }

  return (
    <>
      <AuthErrorHandler />
      <div className={hideNavbarOnMobile ? "hidden md:block" : ""}>
        <Navbar user={user} />
      </div>
      <main className={`md:pt-28 ${mobilePaddingTop} bg-[#F8FAF9] dark:bg-[#0f1419] transition-colors duration-300 ${!isListingDetail ? 'pb-24' : ''}`}>
        {children}
      </main>
      <div className={isMessages ? "hidden md:block" : ""}>
        <Footer />
      </div>
      {!isListingDetail && <MobileBottomBar user={user} />}
      <RightSwipePanel user={user} />
      <UserBackToTop />
    </>
  );
};

export default LayoutContentClient;
