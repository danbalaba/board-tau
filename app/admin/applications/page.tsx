import React from 'react';
import DashboardCard from '../components/common/DashboardCard';
import { requireAdmin } from '@/lib/admin';
import { getHostApplications } from '@/services/landlord/applications';
import AdminApplicationsClient from '../components/pages/applications/AdminApplicationsClient';

const AdminApplications: React.FC = async () => {
  await requireAdmin();

  const { applications, total, page, limit, totalPages } = await getHostApplications({
    status: 'pending',
    page: 1,
    limit: 10
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Host Applications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and manage host applications submitted by users.
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Export CSV
        </button>
      </div>

      <AdminApplicationsClient
        applications={applications as any}
        pagination={{
          current: page,
          total,
          perPage: limit,
          totalPages
        }}
      />
    </div>
  );
};

export default AdminApplications;
