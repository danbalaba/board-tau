import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LayoutContentClient from './LayoutContentClient';
import { db } from '@/lib/db';

interface LayoutContentProps {
  children: React.ReactNode;
}

const LayoutContent: React.FC<LayoutContentProps> = async ({ children }) => {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (error: any) {
    // Next.js uses DYNAMIC_SERVER_USAGE to signal dynamic bailout during static analysis; rethrow it so Next.js handles it cleanly.
    if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.message?.includes('DYNAMIC_SERVER_USAGE')) {
      throw error;
    }
    console.error("LayoutContent getServerSession error:", error);
  }
  
  // Real-time user data fetching from DB to ensure Navbar always has 
  // the latest image/role even if the session JWT is stale.
  let dbUser = null;
  try {
    if (session?.user?.email) {
      dbUser = await db.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        }
      });
    }
  } catch (error) {
    console.error("LayoutContent dbUser lookup error:", error);
  }

  // Merge session data with real-time DB data as fallback
  const user = dbUser ? {
    ...session?.user,
    ...dbUser,
  } : session?.user;

  return <LayoutContentClient user={user as any} children={children} />;
};

export default LayoutContent;
