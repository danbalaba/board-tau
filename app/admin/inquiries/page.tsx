import React from 'react';
import DashboardCard from '../components/common/DashboardCard';
import { requireAdmin } from '@/lib/admin';
import { getAdminInquiries } from '@/services/admin';
import AdminInquiriesClient from '../components/pages/inquiries/AdminInquiriesClient';

const AdminInquiries: React.FC = async () => {
  await requireAdmin();

  const { inquiries } = await getAdminInquiries({});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Inquiries</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage student inquiries and inquiries.
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Export CSV
        </button>
      </div>

      <AdminInquiriesClient inquiries={inquiries} />
    </div>
  );
};

export default AdminInquiries;
