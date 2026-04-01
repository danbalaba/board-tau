'use client';

import React from 'react';
import { SidebarProvider, SidebarInset } from '@/app/admin/components/ui/sidebar';
import LandlordSidebar from './components/landlord-sidebar';
import LandlordTopbar from './components/landlord-topbar';

interface LandlordLayoutClientProps {
  children: React.ReactNode;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
    isVerifiedLandlord: boolean;
    landlordApprovedAt: Date | null;
  };
}

export default function LandlordLayoutClient({
  children,
  user,
}: LandlordLayoutClientProps) {
  return (
    <div className="h-screen overflow-hidden bg-background">
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
    </div>
  );
}
