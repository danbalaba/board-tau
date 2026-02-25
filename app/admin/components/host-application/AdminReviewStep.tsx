'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, User, Home, MapPin, FileText, Shield } from 'lucide-react';

interface AdminReviewStepProps {
  application: any;
}

const AdminReviewStep: React.FC<AdminReviewStepProps> = ({ application }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-900/30 p-6 rounded-xl border border-teal-200 dark:border-teal-800">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          <div>
            <h3 className="font-semibold text-teal-900 dark:text-teal-100">Application Review</h3>
            <p className="text-sm text-teal-700 dark:text-teal-300">
              Complete application review before taking action
            </p>
          </div>
        </div>
      </div>

      {/* Landlord Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Landlord Information</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
            <p className="text-gray-900 dark:text-white">{application.contactInfo?.fullName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
            <p className="text-gray-900 dark:text-white">{application.contactInfo?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Phone</label>
            <p className="text-gray-900 dark:text-white">{application.contactInfo?.phoneNumber}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Business Name</label>
            <p className="text-gray-900 dark:text-white">{application.businessInfo?.businessName}</p>
          </div>
        </div>
      </div>

      {/* Property Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Home className="w-5 h-5" />
          <span>Property Information</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Property Name</label>
            <p className="text-gray-900 dark:text-white">{application.propertyInfo?.propertyName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Category</label>
            <p className="text-gray-900 dark:text-white">{application.propertyInfo?.category}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Price</label>
            <p className="text-gray-900 dark:text-white">₱{application.propertyInfo?.price?.toLocaleString()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Lease Terms</label>
            <p className="text-gray-900 dark:text-white">{application.propertyInfo?.leaseTerms}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
            <p className="text-gray-900 dark:text-white">{application.propertyInfo?.description}</p>
          </div>
        </div>
      </div>

      {/* Property Location */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Property Location</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Address</label>
            <p className="text-gray-900 dark:text-white">{application.location?.address}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">City</label>
            <p className="text-gray-900 dark:text-white">{application.location?.city}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Province</label>
            <p className="text-gray-900 dark:text-white">{application.location?.province}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Zip Code</label>
            <p className="text-gray-900 dark:text-white">{application.location?.zipCode}</p>
          </div>
        </div>
      </div>

      {/* Property Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Property Configuration</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Rooms</label>
            <p className="text-gray-900 dark:text-white">{application.propertyConfig?.totalRooms}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Bathrooms</label>
            <p className="text-gray-900 dark:text-white">{application.propertyConfig?.bathroomCount} ({application.propertyConfig?.bathroomType})</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Amenities</label>
            <p className="text-gray-900 dark:text-white">{application.propertyConfig?.amenities?.join(', ')}</p>
          </div>
        </div>
      </div>

      {/* Documents Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Documents</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Government ID</span>
            {application.documents?.governmentId ? (
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Business Permit</span>
            {application.documents?.businessPermit ? (
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Land Title</span>
            {application.documents?.landTitle ? (
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Barangay Clearance</span>
            {application.documents?.barangayClearance ? (
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Fire Safety Certificate</span>
            {application.documents?.fireSafetyCertificate ? (
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
            )}
          </div>
        </div>
      </div>

      {/* Final Review Message */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Important Note</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Please review all information carefully before approving or rejecting this host application. The decision
              will affect the user's ability to list properties on the platform.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminReviewStep;
