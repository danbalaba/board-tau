'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Search, Map } from 'lucide-react';

interface AdminLocationStepProps {
  application: any;
}

const AdminLocationStep: React.FC<AdminLocationStepProps> = ({ application }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
        <div className="flex items-center space-x-3">
          <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-100">Property Location</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Location details of the property
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Address Details */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Address Information</span>
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Complete Address
                </label>
                <p className="text-gray-900 dark:text-white">{application.location?.address}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  City
                </label>
                <p className="text-gray-900 dark:text-white">{application.location?.city}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Province
                </label>
                <p className="text-gray-900 dark:text-white">{application.location?.province}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Zip Code
                </label>
                <p className="text-gray-900 dark:text-white">{application.location?.zipCode}</p>
              </div>

              {application.location?.coordinates && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Coordinates
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {application.location?.coordinates[0].toFixed(6)}, {application.location?.coordinates[1].toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Map className="w-5 h-5" />
              <span>Property on Map</span>
            </h4>

            <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Map view would be displayed here</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Coordinates: {application.location?.coordinates?.[0]?.toFixed(4)}, {application.location?.coordinates?.[1]?.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminLocationStep;
