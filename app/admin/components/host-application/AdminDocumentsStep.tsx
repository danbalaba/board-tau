'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, FileCheck, FileX, Upload, Shield } from 'lucide-react';

interface AdminDocumentsStepProps {
  application: any;
}

const AdminDocumentsStep: React.FC<AdminDocumentsStepProps> = ({ application }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 p-6 rounded-xl border border-red-200 dark:border-red-800">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">Required Documents</h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              Documents submitted for verification
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Government ID</span>
            </h4>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Uploaded File
                </label>
                <p className="text-gray-900 dark:text-white">
                  {application.documents?.governmentId ? 'Document uploaded' : 'No document uploaded'}
                </p>
              </div>
              {application.documents?.governmentId ? (
                <FileCheck className="w-5 h-5 text-green-500 dark:text-green-400" />
              ) : (
                <FileX className="w-5 h-5 text-red-500 dark:text-red-400" />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Business Permit</span>
            </h4>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Uploaded File
                </label>
                <p className="text-gray-900 dark:text-white">
                  {application.documents?.businessPermit ? 'Document uploaded' : 'No document uploaded'}
                </p>
              </div>
              {application.documents?.businessPermit ? (
                <FileCheck className="w-5 h-5 text-green-500 dark:text-green-400" />
              ) : (
                <FileX className="w-5 h-5 text-red-500 dark:text-red-400" />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Land Title</span>
            </h4>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Uploaded File
                </label>
                <p className="text-gray-900 dark:text-white">
                  {application.documents?.landTitle ? 'Document uploaded' : 'No document uploaded'}
                </p>
              </div>
              {application.documents?.landTitle ? (
                <FileCheck className="w-5 h-5 text-green-500 dark:text-green-400" />
              ) : (
                <FileX className="w-5 h-5 text-red-500 dark:text-red-400" />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Barangay Clearance</span>
            </h4>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Uploaded File
                </label>
                <p className="text-gray-900 dark:text-white">
                  {application.documents?.barangayClearance ? 'Document uploaded' : 'No document uploaded'}
                </p>
              </div>
              {application.documents?.barangayClearance ? (
                <FileCheck className="w-5 h-5 text-green-500 dark:text-green-400" />
              ) : (
                <FileX className="w-5 h-5 text-red-500 dark:text-red-400" />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Fire Safety Certificate</span>
            </h4>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Uploaded File
                </label>
                <p className="text-gray-900 dark:text-white">
                  {application.documents?.fireSafetyCertificate ? 'Document uploaded' : 'No document uploaded'}
                </p>
              </div>
              {application.documents?.fireSafetyCertificate ? (
                <FileCheck className="w-5 h-5 text-green-500 dark:text-green-400" />
              ) : (
                <FileX className="w-5 h-5 text-red-500 dark:text-red-400" />
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Other Documents</span>
            </h4>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Uploaded File
                </label>
                <p className="text-gray-900 dark:text-white">
                  {application.documents?.otherDocuments ? 'Document uploaded' : 'No document uploaded'}
                </p>
              </div>
              {application.documents?.otherDocuments ? (
                <FileCheck className="w-5 h-5 text-green-500 dark:text-green-400" />
              ) : (
                <FileX className="w-5 h-5 text-red-500 dark:text-red-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Document Verification</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              All documents will be verified during the approval process. Please ensure all required documents are
              uploaded and legible.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDocumentsStep;
