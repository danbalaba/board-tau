import React from 'react';
import DashboardCard from '../components/common/DashboardCard';
import { requireAdmin } from '@/lib/admin';
import AdminUsersClient from '../components/pages/users/AdminUsersClient';
import { db } from '@/lib/db';

const AdminUsers: React.FC = async () => {
  await requireAdmin();

  // Fetch real user data directly from database
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      emailVerified: true,
      isVerifiedLandlord: true,
      phoneNumber: true,
      businessName: true,
      image: true,
    },
  });

  // Transform user data
  const transformedUsers = users.map((user) => ({
    id: user.id,
    name: user.name || 'Unknown',
    email: user.email || '',
    role: user.role || 'User',
    status: user.isActive ? 'Active' : 'Inactive',
    lastLogin: 'Never', // Last login tracking coming soon
    created: user.createdAt.toISOString().split('T')[0],
    emailVerified: !!user.emailVerified,
    isVerifiedLandlord: user.isVerifiedLandlord,
    phoneNumber: user.phoneNumber || 'N/A',
    businessName: user.businessName || 'N/A',
    image: user.image || null,
  }));

  const pagination = {
    current: 1,
    total: transformedUsers.length,
    perPage: 10,
    totalPages: Math.ceil(transformedUsers.length / 10),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Users</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage user accounts.
        </p>
      </div>

      <AdminUsersClient
        users={transformedUsers}
        pagination={pagination}
      />
    </div>
  );
};

export default AdminUsers;
