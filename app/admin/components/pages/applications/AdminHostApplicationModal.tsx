'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, FileText, Home, User, MapPin, Upload, CheckCircle, AlertCircle, Building2, Info, ArrowRight, X } from 'lucide-react';

import Button from '@/components/common/Button';
import AdminLandlordInfoStep from '@/app/admin/components/host-application/AdminLandlordInfoStep';
import AdminPropertyBasicStep from '@/app/admin/components/host-application/AdminPropertyBasicStep';
import AdminLocationStep from '@/app/admin/components/host-application/AdminLocationStep';
import AdminPropertyConfigStep from '@/app/admin/components/host-application/AdminPropertyConfigStep';
import AdminDocumentsStep from '@/app/admin/components/host-application/AdminDocumentsStep';
import AdminReviewStep from '@/app/admin/components/host-application/AdminReviewStep';

const STEPS = {
  LANDLORD_INFO: 1,
  PROPERTY_BASIC: 2,
  LOCATION: 3,
  PROPERTY_CONFIG: 4,
  DOCUMENTS: 5,
  REVIEW: 6
};

interface AdminHostApplicationModalProps {
  application: any;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

const AdminHostApplicationModal: React.FC<AdminHostApplicationModalProps> = ({
  application,
  onClose,
  onApprove,
  onReject
}) => {
  const [step, setStep] = useState(STEPS.LANDLORD_INFO);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const nextStep = () => {
    if (step < Object.keys(STEPS).length) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case STEPS.LANDLORD_INFO: return 'Landlord Information';
      case STEPS.PROPERTY_BASIC: return 'Property Information';
      case STEPS.LOCATION: return 'Property Location';
      case STEPS.PROPERTY_CONFIG: return 'Property Configuration';
      case STEPS.DOCUMENTS: return 'Required Documents';
      case STEPS.REVIEW: return 'Review Application';
      default: return 'Unknown Step';
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case STEPS.LANDLORD_INFO: return <User className="w-6 h-6" />;
      case STEPS.PROPERTY_BASIC: return <Building2 className="w-6 h-6" />;
      case STEPS.LOCATION: return <MapPin className="w-6 h-6" />;
      case STEPS.PROPERTY_CONFIG: return <FileText className="w-6 h-6" />;
      case STEPS.DOCUMENTS: return <Upload className="w-6 h-6" />;
      case STEPS.REVIEW: return <CheckCircle className="w-6 h-6" />;
      default: return <AlertCircle className="w-6 h-6" />;
    }
  };

  const stepConfig = [
    { id: STEPS.LANDLORD_INFO, label: 'Landlord Info', icon: <User className="w-4 h-4" /> },
    { id: STEPS.PROPERTY_BASIC, label: 'Property Basics', icon: <Building2 className="w-4 h-4" /> },
    { id: STEPS.LOCATION, label: 'Location', icon: <MapPin className="w-4 h-4" /> },
    { id: STEPS.PROPERTY_CONFIG, label: 'Configuration', icon: <FileText className="w-4 h-4" /> },
    { id: STEPS.DOCUMENTS, label: 'Documents', icon: <Upload className="w-4 h-4" /> },
    { id: STEPS.REVIEW, label: 'Review', icon: <CheckCircle className="w-4 h-4" /> }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-full h-full flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <div className="hidden md:flex w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Host Application</h2>
                <div className="space-y-1">
                  {stepConfig.map((config) => (
                    <div
                      key={config.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 cursor-pointer group ${
                        config.id < step
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : config.id === step
                          ? 'bg-primary dark:bg-primary/20 text-white dark:text-primary border border-primary dark:border-primary'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                      onClick={() => setStep(config.id)}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        config.id < step
                          ? 'bg-green-500 text-white'
                          : config.id === step
                          ? 'bg-white dark:bg-primary text-primary dark:text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                      }`}>
                        {config.id < step ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          config.icon
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        config.id === step ? 'text-white dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {config.label}
                      </span>
                      {config.id === step && (
                        <motion.div
                          className="ml-auto"
                          animate={{ x: [0, 4, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="mt-auto p-6">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary dark:bg-primary transition-all duration-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((step - 1) / (Object.keys(STEPS).length - 1)) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Step {step} of {Object.keys(STEPS).length}
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary dark:bg-primary text-white dark:text-white p-2 rounded-lg">
                    {getStepIcon()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getStepTitle()}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {step === STEPS.LANDLORD_INFO && "Landlord's personal and business information"}
                      {step === STEPS.PROPERTY_BASIC && "Property details and specifications"}
                      {step === STEPS.LOCATION && "Property location and address"}
                      {step === STEPS.PROPERTY_CONFIG && "Property configuration and amenities"}
                      {step === STEPS.DOCUMENTS && "Required documents for verification"}
                      {step === STEPS.REVIEW && "Review the complete application"}
                    </p>
                  </div>
                </div>
                {step > 1 && (
                  <Button
                    type="button"
                    onClick={prevStep}
                    size="small"
                    className="bg-primary dark:bg-primary text-white dark:text-white hover:bg-primary/90 dark:hover:bg-primary/90 flex items-center space-x-1 w-auto min-w-[100px]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>
                )}
              </div>

              {/* Mobile Progress Indicator */}
              <div className="md:hidden px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary dark:bg-primary transition-all duration-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((step - 1) / (Object.keys(STEPS).length - 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {step === STEPS.LANDLORD_INFO && (
                  <AdminLandlordInfoStep application={application} />
                )}

                {step === STEPS.PROPERTY_BASIC && (
                  <AdminPropertyBasicStep application={application} />
                )}

                {step === STEPS.LOCATION && (
                  <AdminLocationStep application={application} />
                )}

                {step === STEPS.PROPERTY_CONFIG && (
                  <AdminPropertyConfigStep application={application} />
                )}

                {step === STEPS.DOCUMENTS && (
                  <AdminDocumentsStep application={application} />
                )}

                {step === STEPS.REVIEW && (
                  <AdminReviewStep application={application} />
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={onClose}
                    size="small"
                    className="bg-gray-500 dark:bg-gray-600 text-white dark:text-white hover:bg-gray-600 dark:hover:bg-gray-700"
                  >
                    Close
                  </Button>
                </div>

                {step === STEPS.REVIEW && (
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={onReject}
                      size="small"
                      className="bg-red-500 dark:bg-red-600 text-white dark:text-white hover:bg-red-600 dark:hover:bg-red-700"
                    >
                      Reject
                    </Button>
                    <Button
                      type="button"
                      onClick={onApprove}
                      size="small"
                      className="bg-green-500 dark:bg-green-600 text-white dark:text-white hover:bg-green-600 dark:hover:bg-green-700"
                    >
                      Approve
                    </Button>
                  </div>
                )}

                {step < Object.keys(STEPS).length && step !== STEPS.REVIEW && (
                  <Button
                    type="button"
                    onClick={nextStep}
                    size="small"
                    className="bg-primary dark:bg-primary text-white dark:text-white hover:bg-primary/90 dark:hover:bg-primary/90 flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminHostApplicationModal;
