'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Tag, MapPin, DollarSign, Briefcase, Clock } from 'lucide-react';

interface AdminPropertyBasicStepProps {
  application: any;
}

const AdminPropertyBasicStep: React.FC<AdminPropertyBasicStepProps> = ({ application }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
        <div className="flex items-center space-x-3">
          <Home className="w-6 h-6 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">Property Information</h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Basic details about the property
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Property Details */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Home className="w-5 h-5" />
              <span>Property Details</span>
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Property Name
                </label>
                <p className="text-gray-900 dark:text-white">{application.propertyInfo?.propertyName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Property Category
                </label>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                  application.propertyInfo?.category === 'Student-Friendly'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : application.propertyInfo?.category === 'Family / Visitor Friendly'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : application.propertyInfo?.category === 'Budget Boarding House'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : application.propertyInfo?.category === 'Private Boarding House'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {application.propertyInfo?.category}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Property Description
                </label>
                <p className="text-gray-900 dark:text-white">{application.propertyInfo?.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing and Terms */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Pricing and Terms</span>
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Monthly Price
                </label>
                <p className="text-gray-900 dark:text-white">₱{application.propertyInfo?.price?.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Room Type
                </label>
                <p className="text-gray-900 dark:text-white">{application.propertyInfo?.roomType}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Lease Terms
                </label>
                <p className="text-gray-900 dark:text-white">{application.propertyInfo?.leaseTerms}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPropertyBasicStep;
