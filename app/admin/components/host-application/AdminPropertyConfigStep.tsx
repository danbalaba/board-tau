'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bed, Bath, Users, CheckCircle, Clock, Car, Shield, Wifi, Thermometer, Utensils } from 'lucide-react';

interface AdminPropertyConfigStepProps {
  application: any;
}

const AdminPropertyConfigStep: React.FC<AdminPropertyConfigStepProps> = ({ application }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
        <div className="flex items-center space-x-3">
          <Bed className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          <div>
            <h3 className="font-semibold text-orange-900 dark:text-orange-100">Property Configuration</h3>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Detailed configuration of the property
            </p>
          </div>
        </div>
      </div>

      {/* Property Basics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Bed className="w-5 h-5" />
              <span>Property Basics</span>
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Total Rooms
                </label>
                <p className="text-gray-900 dark:text-white">{application.propertyConfig?.totalRooms}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Number of Bathrooms
                </label>
                <p className="text-gray-900 dark:text-white">{application.propertyConfig?.bathroomCount}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Bathroom Type
                </label>
                <p className="text-gray-900 dark:text-white">{application.propertyConfig?.bathroomType}</p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Wifi className="w-5 h-5" />
              <span>Amenities</span>
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {application.propertyConfig?.amenities?.map((amenity: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                  <span className="text-sm text-gray-900 dark:text-white">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rules and Preferences */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Rules & Preferences</span>
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Female Only</span>
                {application.propertyConfig?.femaleOnly ? (
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">No</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Male Only</span>
                {application.propertyConfig?.maleOnly ? (
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">No</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Visitors Allowed</span>
                {application.propertyConfig?.visitorsAllowed ? (
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">No</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Pets Allowed</span>
                {application.propertyConfig?.petsAllowed ? (
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">No</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Smoking Allowed</span>
                {application.propertyConfig?.smokingAllowed ? (
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">No</span>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Advanced Features</span>
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">24/7 Security</span>
                {application.propertyConfig?.security24h ? (
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">No</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">CCTV</span>
                {application.propertyConfig?.cctv ? (
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">No</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Fire Safety</span>
                {application.propertyConfig?.fireSafety ? (
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">No</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Near Public Transport</span>
                {application.propertyConfig?.nearTransport ? (
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">No</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Study Friendly</span>
                {application.propertyConfig?.studyFriendly ? (
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">No</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Quiet Environment</span>
                {application.propertyConfig?.quietEnvironment ? (
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">No</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Flexible Lease</span>
                {application.propertyConfig?.flexibleLease ? (
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">No</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Types */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Room Types</span>
          </h4>

          <div className="space-y-4">
            {application.propertyConfig?.rooms?.map((room: any, index: number) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Room Type {index + 1}</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Type:</span>
                    <p className="font-medium">{room.roomType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Count:</span>
                    <p className="font-medium">{room.count}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Price:</span>
                    <p className="font-medium">₱{room.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Bed Type:</span>
                    <p className="font-medium">{room.bedType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Capacity:</span>
                    <p className="font-medium">{room.capacity} people</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 dark:text-gray-400">Description:</span>
                    <p className="font-medium">{room.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* House Rules */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>House Rules</span>
          </h4>

          <div className="grid grid-cols-2 gap-2">
            {application.propertyConfig?.rules?.map((rule: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                <span className="text-sm text-gray-900 dark:text-white">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPropertyConfigStep;
