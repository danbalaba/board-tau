'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building, Briefcase } from 'lucide-react';

interface AdminLandlordInfoStepProps {
  application: any;
}

const AdminLandlordInfoStep: React.FC<AdminLandlordInfoStepProps> = ({ application }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-3">
          <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Personal Information</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Landlord's personal details and contact information
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Contact Information</span>
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Full Name
                </label>
                <p className="text-gray-900 dark:text-white">{application.contactInfo?.fullName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Email Address
                </label>
                <p className="text-gray-900 dark:text-white">{application.contactInfo?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Phone Number
                </label>
                <p className="text-gray-900 dark:text-white">{application.contactInfo?.phoneNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Emergency Contact
                </label>
                <p className="text-gray-900 dark:text-white">
                  {application.contactInfo?.emergencyContact?.name} ({application.contactInfo?.emergencyContact?.relationship})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Emergency Phone
                </label>
                <p className="text-gray-900 dark:text-white">{application.contactInfo?.emergencyContact?.phoneNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Business Information</span>
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Business Name
                </label>
                <p className="text-gray-900 dark:text-white">{application.businessInfo?.businessName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Business Type
                </label>
                <p className="text-gray-900 dark:text-white">{application.businessInfo?.businessType}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Business Registration Number
                </label>
                <p className="text-gray-900 dark:text-white">{application.businessInfo?.businessRegistrationNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Tax Identification Number
                </label>
                <p className="text-gray-900 dark:text-white">{application.businessInfo?.taxIdentificationNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Years of Experience
                </label>
                <p className="text-gray-900 dark:text-white">{application.businessInfo?.yearsExperience}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Business Description
                </label>
                <p className="text-gray-900 dark:text-white">{application.businessInfo?.businessDescription}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminLandlordInfoStep;
