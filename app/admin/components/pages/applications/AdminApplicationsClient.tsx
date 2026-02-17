'use client';

import React, { useState } from 'react';
import DataTable from '@/app/admin/components/common/DataTable';
import ConfirmModal from '@/app/admin/components/common/ConfirmModal';
import AdminHostApplicationModal from './AdminHostApplicationModal';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface HostApplication {
  id: string;
  userId: string;
  businessInfo: {
    businessName: string;
    businessType: string;
    businessRegistrationNumber: string;
    taxIdentificationNumber: string;
    businessDescription: string;
    yearsExperience: string;
  };
  propertyInfo: {
    propertyName: string;
    description: string;
    category: string;
    roomType: string;
    price: number;
    leaseTerms: string;
  };
  contactInfo: {
    fullName: string;
    phoneNumber: string;
    email: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phoneNumber: string;
    };
  };
  propertyConfig: {
    totalRooms: number;
    rooms: Array<{
      roomType: string;
      count: number;
      price: number;
      bedType: string;
      capacity: number;
      description?: string;
    }>;
    bathroomCount: number;
    bathroomType: string;
    amenities: string[];
    rules: string[];
    smokingAllowed: string;
    petsAllowed: string;
    visitorsAllowed: string;
    femaleOnly: boolean;
    maleOnly: boolean;
    security24h: boolean;
    cctv: boolean;
    fireSafety: boolean;
    nearTransport: boolean;
    studyFriendly: boolean;
    quietEnvironment: boolean;
    flexibleLease: boolean;
  };
  documents: {
    governmentId: string;
    businessPermit: string;
    landTitle: string;
    barangayClearance: string;
    fireSafetyCertificate: string;
    otherDocuments?: string;
  };
  status: string;
  adminNotes?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface AdminApplicationsClientProps {
  applications: HostApplication[];
  pagination: {
    current: number;
    total: number;
    perPage: number;
    totalPages: number;
  };
}

const AdminApplicationsClient: React.FC<AdminApplicationsClientProps> = ({
  applications,
  pagination
}) => {
  const [selectedApplication, setSelectedApplication] = useState<HostApplication | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleViewApplication = (application: HostApplication) => {
    setSelectedApplication(application);
    setIsViewModalOpen(true);
  };

  const handleApproveApplication = async () => {
    if (!selectedApplication) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/host-applications?id=${selectedApplication.id}&status=approved`, {
        method: 'PUT'
      });

      if (response.ok) {
        setIsApproveModalOpen(false);
        setSelectedApplication(null);
        // Refresh the page or update the applications list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error approving application:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectApplication = async () => {
    if (!selectedApplication) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/host-applications?id=${selectedApplication.id}&status=rejected`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (response.ok) {
        setIsRejectModalOpen(false);
        setSelectedApplication(null);
        setRejectionReason('');
        // Refresh the page or update the applications list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'user',
      title: 'Applicant',
      sortable: true,
      render: (value: any, row: HostApplication) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
            {row.user.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{row.user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{row.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'businessName',
      title: 'Business Name',
      sortable: true,
      render: (value: any, row: HostApplication) => (
        <p className="text-gray-900 dark:text-white">{row.businessInfo.businessName}</p>
      ),
    },
    {
      key: 'propertyName',
      title: 'Property Name',
      sortable: true,
      render: (value: any, row: HostApplication) => (
        <p className="text-gray-900 dark:text-white">{row.propertyInfo.propertyName}</p>
      ),
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true,
      render: (value: any, row: HostApplication) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs">
          {row.propertyInfo.category}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: any, row: HostApplication) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.status === 'approved'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : row.status === 'rejected'
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Submitted At',
      sortable: true,
      render: (value: any, row: HostApplication) => (
        <p className="text-gray-900 dark:text-white">
          {new Date(row.createdAt).toLocaleDateString()}
        </p>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      render: (value: any, row: HostApplication) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleViewApplication(row)}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
            title="View Application"
          >
            <FaEye size={16} />
          </button>
          {row.status === 'pending' && (
            <>
              <button
                type="button"
                onClick={() => {
                  setSelectedApplication(row);
                  setIsApproveModalOpen(true);
                }}
                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                title="Approve Application"
              >
                <FaCheck size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedApplication(row);
                  setIsRejectModalOpen(true);
                }}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                title="Reject Application"
              >
                <FaTimes size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={applications}
        loading={false}
        pagination={{
          current: pagination.current,
          total: pagination.total,
          perPage: pagination.perPage,
          onPageChange: () => {}
        }}
      />

      {/* View Application Modal */}
      {isViewModalOpen && selectedApplication && (
        <AdminHostApplicationModal
          application={selectedApplication}
          onClose={() => setIsViewModalOpen(false)}
          onApprove={handleApproveApplication}
          onReject={handleRejectApplication}
        />
      )}

      {/* Approve Application Modal */}
      {isApproveModalOpen && selectedApplication && (
        <ConfirmModal
          open={isApproveModalOpen}
          title="Approve Host Application"
          message="Are you sure you want to approve this host application? The user will be notified via email and their account will be upgraded to landlord status."
          confirmLabel="Approve"
          onConfirm={handleApproveApplication}
          onCancel={() => setIsApproveModalOpen(false)}
          loading={isLoading}
        />
      )}

      {/* Reject Application Modal */}
      {isRejectModalOpen && selectedApplication && (
        <ConfirmModal
          open={isRejectModalOpen}
          title="Reject Host Application"
          message={
            <div className="space-y-4">
              <p>Are you sure you want to reject this host application? Please provide a reason for rejection.</p>
              <div>
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rejection Reason
                </label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter rejection reason..."
                />
              </div>
            </div>
          }
          confirmLabel="Reject"
          onConfirm={handleRejectApplication}
          onCancel={() => setIsRejectModalOpen(false)}
          loading={isLoading}
        />
      )}
    </>
  );
};

export default AdminApplicationsClient;
