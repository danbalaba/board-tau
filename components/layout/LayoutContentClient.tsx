'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/layout/Footer';
import AuthErrorHandler from '@/components/auth/AuthErrorHandler';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import RightSwipePanel from '@/components/navbar/RightSwipePanel';
import UserBackToTop from '@/components/common/UserBackToTop';
import ChatBot from '@/components/ui/ChatBot';
import { User } from 'next-auth';
import { useLoadingStore } from '@/hooks/use-loading-store';
import UltimateLogoutOverlay from '@/components/navbar/UltimateLogoutOverlay';
import CompareFloatingBar from '@/components/compare/CompareFloatingBar';

interface LayoutContentClientProps {
  children: React.ReactNode;
  user?: (User & { id: string; role?: string });
}

const LayoutContentClient: React.FC<LayoutContentClientProps> = ({ children, user }) => {
  const pathname = usePathname();
  const { isLoggingOut } = useLoadingStore();
  const isAdmin = pathname.startsWith('/admin');
  const isLandlord = pathname.startsWith('/landlord');
  const isHomePage = pathname === '/';
  const isListingDetail = pathname.startsWith('/listings/') && pathname.split('/').length > 2;
  const isDashboardPage = ['/inquiries', '/favorites', '/reservations', '/my-reviews', '/profile'].some(path => pathname.startsWith(path));
  
  const isMessages = pathname.startsWith('/messages');
  const isLocked = pathname === '/auth/locked';
  const isInternalRole = user?.role === 'LANDLORD' || user?.role === 'ADMIN' || user?.role === 'landlord' || user?.role === 'admin';
  
  useEffect(() => {
    // Force scroll to top on every navigation
    window.scrollTo(0, 0);
  }, [pathname]);

  const isAuthPage = pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password');
  const hideNavbarOnMobile = isListingDetail || isDashboardPage || isMessages || isAuthPage;
  const mobilePaddingTop = (isListingDetail || isMessages || isAuthPage || isHomePage) ? 'pt-0' : (isDashboardPage ? 'pt-6' : 'pt-24');
  
  // BLOCK public UI for Admins, Landlords, and protected paths
  if (isAdmin || isLandlord || isLocked || isInternalRole) {
    return <>{children}</>;
  }

  return (
    <>
      <AuthErrorHandler />
      <div className={hideNavbarOnMobile ? "hidden md:block" : ""}>
        <Navbar user={user} />
      </div>
      <main className={`${(isAuthPage || isHomePage) ? 'md:pt-0' : 'md:pt-28'} ${mobilePaddingTop} ${isAuthPage ? '' : 'bg-[#F8FAF9] dark:bg-[#0f1419]'} transition-colors duration-300 ${(!isListingDetail && !isAuthPage) ? 'pb-24' : ''} ${isAuthPage ? '' : 'overflow-x-hidden'}`}>
        {children}
      </main>
      <div className={(isMessages || isAuthPage) ? "hidden md:block" : ""}>
        <Footer />
      </div>
      {!isListingDetail && <MobileBottomBar user={user} />}
      <RightSwipePanel user={user} />
      <UserBackToTop />
      <ChatBot />
      <CompareFloatingBar />
      
      {/* Global Logout Overlay */}
      {isLoggingOut && <UltimateLogoutOverlay userName={user?.name} />}
    </>
  );
};

export default LayoutContentClient;
