'use client';

import React from 'react';
import { SidebarProvider, SidebarInset } from '@/app/admin/components/ui/sidebar';
import LandlordSidebar from './components/landlord-sidebar';
import LandlordTopbar from './components/landlord-topbar';
import LandlordKBar from './components/landlord-kbar';
import { useLandlordProfileStore } from '../settings-hub/hooks/use-landlord-profile-store';

interface LandlordLayoutClientProps {
  children: React.ReactNode;
  user: any;
}

export default function LandlordLayoutClient({
  children,
  user,
}: LandlordLayoutClientProps) {
  const setUser = useLandlordProfileStore((state: any) => state.setUser);
  const isInitialized = useLandlordProfileStore((state: any) => state.isInitialized);

  React.useEffect(() => {
    if (!isInitialized) {
      setUser(user);
    }
  }, [user, setUser, isInitialized]);

  return (
    <div className="h-screen overflow-hidden bg-background">
      <LandlordKBar>
        <SidebarProvider defaultOpen={true}>
          <LandlordSidebar />
          <SidebarInset className="flex flex-col h-screen overflow-y-auto">
            <LandlordTopbar user={user} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
              <div className="w-full px-4 py-8">
                {children}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </LandlordKBar>
    </div>
  );
}
