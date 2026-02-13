'use client';

import React from 'react';
import LandlordSidebar from './LandlordSidebar';
import LandlordTopbar from './LandlordTopbar';

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
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <LandlordSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <LandlordTopbar user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
