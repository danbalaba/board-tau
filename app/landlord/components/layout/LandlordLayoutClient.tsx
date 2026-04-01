'use client';

import React from 'react';
import LandlordSidebar from './LandlordSidebar';
import LandlordTopbar from './LandlordTopbar';
import { SidebarProvider, SidebarInset } from '@/app/admin/components/ui/sidebar';

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
          <div className="w-full px-4 py-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
