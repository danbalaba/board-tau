import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LayoutContentClient from './LayoutContentClient';

interface LayoutContentProps {
  children: React.ReactNode;
}

const LayoutContent: React.FC<LayoutContentProps> = async ({ children }) => {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return <LayoutContentClient user={user} children={children} />;
};

export default LayoutContent;
