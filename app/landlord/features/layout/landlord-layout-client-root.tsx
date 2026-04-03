'use client';

import React from 'react';
import LandlordMainSidebar from './landlord-main-sidebar';
import LandlordTopbarHeader from './landlord-topbar-header';
import { SidebarProvider, SidebarInset } from '@/app/admin/components/ui/sidebar';

interface LandlordLayoutClientRootProps {
  children: React.ReactNode;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
    isVerifiedLandlord: boolean;
    landlordApprovedAt: Date | null;
    phoneNumber?: string | null;
    city?: string | null;
    region?: string | null;
    bio?: string | null;
  };
}

export default function LandlordLayoutClientRoot({
  children,
  user,
}: LandlordLayoutClientRootProps) {
  return (
    <div className="h-screen overflow-hidden bg-background">
      <SidebarProvider defaultOpen={true}>
        <LandlordMainSidebar />
        <SidebarInset className="flex flex-col h-screen overflow-y-auto">
          <LandlordTopbarHeader user={user} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
            <div className="w-full px-4 py-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
