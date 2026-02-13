import React from 'react';
import AdminDashboardClient from './components/dashboard/AdminDashboardClient';
import { requireAdmin } from '@/lib/admin';

const AdminDashboard: React.FC = async () => {
  await requireAdmin();

  return <AdminDashboardClient />;
};

export default AdminDashboard;
