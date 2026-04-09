import React from 'react';
import FileUpload from '../common/FileUpload';

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
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Required Documents</h4>
        <p className="text-sm text-blue-700">Please upload clear copies of the following documents. All documents will be kept confidential.</p>
      </div>

      <FileUpload
        label="Government ID"
        id="governmentId"
        onFileSelect={(file: File) => onFileUpload('governmentId', file)}
        fileName={uploadedFiles.governmentId?.name}
        required
        accept="image/jpeg,image/png"
        description="JPG or PNG (max. 5MB)"
        errors={errors?.documents?.governmentId}
      />

      <FileUpload
        label="Business Permit"
        id="businessPermit"
        onFileSelect={(file: File) => onFileUpload('businessPermit', file)}
        fileName={uploadedFiles.businessPermit?.name}
        required
        accept="image/jpeg,image/png"
        description="JPG or PNG (max. 5MB)"
        errors={errors?.documents?.businessPermit}
      />

      <FileUpload
        label="Land Title / Lease Agreement"
        id="landTitle"
        onFileSelect={(file: File) => onFileUpload('landTitle', file)}
        fileName={uploadedFiles.landTitle?.name}
        required
        accept="image/jpeg,image/png"
        description="JPG or PNG (max. 5MB)"
        errors={errors?.documents?.landTitle}
      />

      <FileUpload
        label="Barangay Clearance"
        id="barangayClearance"
        onFileSelect={(file: File) => onFileUpload('barangayClearance', file)}
        fileName={uploadedFiles.barangayClearance?.name}
        required
        accept="image/jpeg,image/png"
        description="JPG or PNG (max. 5MB)"
        errors={errors?.documents?.barangayClearance}
      />

      <FileUpload
        label="Fire Safety Certificate"
        id="fireSafetyCertificate"
        onFileSelect={(file: File) => onFileUpload('fireSafetyCertificate', file)}
        fileName={uploadedFiles.fireSafetyCertificate?.name}
        required
        accept="image/jpeg,image/png"
        description="JPG or PNG (max. 5MB)"
        errors={errors?.documents?.fireSafetyCertificate}
      />

      <FileUpload
        label="Additional Documents (Optional)"
        id="otherDocuments"
        onFileSelect={(file: File) => onFileUpload('otherDocuments', file)}
        fileName={uploadedFiles.otherDocuments?.name}
        accept="image/jpeg,image/png"
        description="JPG or PNG (max. 5MB)"
        errors={errors?.documents?.otherDocuments}
      />
    </div>
  );
};

export default DocumentsStep;
