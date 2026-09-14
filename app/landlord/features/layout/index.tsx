'use client';

import React from 'react';
import { SidebarProvider, SidebarInset } from '@/app/admin/components/ui/sidebar';
import LandlordSidebar from './components/landlord-sidebar';
import LandlordTopbar from './components/landlord-topbar';
import LandlordKBar from './components/landlord-kbar';
import LandlordMobileBottomBar from './components/landlord-mobile-bottom-bar';
import LandlordRightSwipePanel from './components/landlord-right-swipe-panel';
import { useLandlordProfileStore } from '../settings-hub/hooks/use-landlord-profile-store';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/helper';
import BackToTop from '@/components/common/BackToTop';
import FloatingMessagingWidget from '../messaging-hub/components/floating-messaging-widget';
import { useLoadingStore } from '@/hooks/use-loading-store';
import UltimateLogoutOverlay from '@/components/navbar/UltimateLogoutOverlay';

import { KerbyProvider } from '@/lib/context/KerbyContext';

interface LandlordLayoutClientProps {
  children: React.ReactNode;
  user: any;
}

export default function LandlordLayoutClient({
  children,
  user,
}: LandlordLayoutClientProps) {
  const pathname = usePathname();
  const setUser = useLandlordProfileStore((state: any) => state.setUser);
  const isInitialized = useLandlordProfileStore((state: any) => state.isInitialized);
  const { isLoggingOut } = useLoadingStore();

  const isPropertyCreator = Boolean(
    pathname?.includes('/landlord/properties/create') || 
    pathname?.includes('/edit')
  );

  React.useEffect(() => {
    if (!isInitialized) {
      setUser(user);
    }
  }, [user, setUser, isInitialized]);

  return (
    <div className="h-screen overflow-hidden bg-background">
      <KerbyProvider>
        <LandlordKBar>
          <SidebarProvider defaultOpen={true}>
            <LandlordSidebar />
            <SidebarInset className="flex flex-col h-screen overflow-hidden">
              <LandlordTopbar user={user} />
              <main id="scroll-container" className="flex-1 overflow-x-hidden overflow-y-auto bg-background [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className={cn("w-full", isPropertyCreator ? "px-0 pt-0 md:px-4 md:pt-8 pb-14 md:pb-8" : "px-4 pt-4 md:pt-8 pb-28 md:pb-8")}>
                  {children}
                </div>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </LandlordKBar>
      </KerbyProvider>

      {/* Mobile Navigation Components */}
      <LandlordMobileBottomBar />
      <LandlordRightSwipePanel user={user} />

      {!isPropertyCreator && <BackToTop />}
      <FloatingMessagingWidget />
      
      {/* Global Logout Overlay */}
      {isLoggingOut && <UltimateLogoutOverlay userName={user?.name} />}
    </div>
  );
}

