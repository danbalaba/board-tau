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

import { ModernSearch } from '@/components/common/ModernSearch';

export default function LandlordLayoutClient({
  children,
  user,
}: LandlordLayoutClientProps) {
  return (
    <ModernSearch>
      <SidebarProvider defaultOpen={true}>
        <LandlordSidebar />
        <SidebarInset>
          <LandlordTopbar user={user} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background pt-16">
            <div className="w-full px-4 py-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ModernSearch>
  );
}
