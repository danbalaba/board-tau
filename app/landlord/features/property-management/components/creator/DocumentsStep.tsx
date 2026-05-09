'use client';

import React, { useState } from 'react';
import FileUpload from '@/components/common/FileUpload';
import MediaPreviewOverlay from '@/components/common/MediaPreviewOverlay';
import { motion } from 'framer-motion';
import { ShieldCheck, Info } from 'lucide-react';

interface DocumentsStepProps {
  register: any;
  errors: any;
  watch?: any;
  control?: any;
  uploadedFiles: Record<string, File>;
  onFileUpload: (documentType: string, file: File) => void;
}

const DocumentsStep: React.FC<DocumentsStepProps> = ({
  register,
  errors,
  watch,
  control,
  uploadedFiles,
  onFileUpload
}) => {
  // Preview State
  const [previewData, setPreviewData] = useState<{ isOpen: boolean; image: string; title: string }>({
    isOpen: false,
    image: '',
    title: ''
  });

  const handlePreview = (url: string, title: string) => {
    if (!url) return;
    setPreviewData({
      isOpen: true,
      image: url,
      title
    });
  };

  const docFields = [
    { id: 'governmentId', label: 'Government ID', description: 'Valid Passport, Driver\'s License, or National ID' },
    { id: 'businessPermit', label: 'Business Permit', description: 'Current year Business/Mayor\'s Permit' },
    { id: 'landTitle', label: 'Land Title / Lease Agreement', description: 'Proof of ownership or valid lease contract' },
    { id: 'barangayClearance', label: 'Barangay Clearance', description: 'Recent clearance from the local barangay' },
    { id: 'fireSafetyCertificate', label: 'Fire Safety Certificate', description: 'FSIC for the current year' },
    { id: 'otherDocuments', label: 'Additional Documents (Optional)', description: 'Any other supporting legal papers', optional: true },
  ];

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10 flex items-start gap-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Legal Check</h4>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1 leading-relaxed">
            Please upload clear, readable copies. All documents are encrypted and only accessible by our verification team.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        {docFields.map((field) => (
          <div key={field.id} className="relative group" id={`documents.${field.id}`}>
            <FileUpload
              label={field.label}
              id={`documents.${field.id}`}
              onFileSelect={(file: File) => onFileUpload(field.id, file)}
              fileName={uploadedFiles[field.id]?.name}
              fileUrl={watch(`documents.${field.id}`)}
              required={!field.optional}
              accept="image/jpeg,image/png"
              description={field.description}
              errors={errors?.documents?.[field.id]}
              onPreview={() => handlePreview(watch(`documents.${field.id}`), field.label)}
            />
            {!watch(`documents.${field.id}`) && (
              <div className="absolute top-8 right-8 pointer-events-none">
                {field.optional ? (
                  <span className="text-[8px] font-black text-amber-500/60 uppercase tracking-[0.2em] border border-amber-500/20 px-2 py-1 rounded-md bg-amber-500/5">Optional</span>
                ) : (
                  <span className="text-[8px] font-black text-rose-500 uppercase tracking-[0.2em] border border-rose-500/30 px-2 py-1 rounded-md bg-rose-500/5 shadow-sm">Required</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <Info size={16} className="text-gray-400" />
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          File formats: JPG or PNG • Max size: 5MB per file
        </p>
      </div>

      {/* Premium Preview Overlay */}
      <MediaPreviewOverlay
        isOpen={previewData.isOpen}
        onClose={() => setPreviewData(prev => ({ ...prev, isOpen: false }))}
        images={[previewData.image]}
        currentIndex={0}
        title={previewData.title}
      />
    </div>
  );
};

export default DocumentsStep;
