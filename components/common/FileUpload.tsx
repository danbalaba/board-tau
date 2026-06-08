import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/utils/helper";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";

export interface FileUploadProps {
  id: string;
  label: string;
  onFileSelect: (file: File) => void;
  fileName?: string;
  required?: boolean;
  errors?: any;
  description?: string;
  accept?: string;
  fileUrl?: string;
  onPreview?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  id,
  label,
  onFileSelect,
  fileName,
  fileUrl,
  required = false,
  errors,
  description,
  accept,
  onPreview,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const toast = useResponsiveToast();
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const validateFile = (file: File) => {
    const fileType = file.type;
    const fileName = file.name;
    const fileExtension = '.' + fileName.split('.').pop()?.toLowerCase();

    // 1. Type Check
    const acceptTypes = accept || ".pdf,.jpg,.jpeg,.png";
    const allowedSpecs = acceptTypes.split(',').map(s => s.trim().toLowerCase());
    
    let isTypeAllowed = false;
    for (const spec of allowedSpecs) {
      if (spec.startsWith('.')) {
        // Extension check (e.g. .pdf, .jpg)
        if (fileExtension === spec) {
          isTypeAllowed = true;
          break;
        }
      } else if (spec.includes('/*')) {
        // Wildcard MIME type check (e.g. image/*)
        const mimeGroup = spec.split('/')[0];
        if (fileType.startsWith(mimeGroup + '/')) {
          isTypeAllowed = true;
          break;
        }
      } else {
        // Direct MIME type check (e.g. image/jpeg, application/pdf)
        if (fileType === spec) {
          isTypeAllowed = true;
          break;
        }
      }
    }

    if (!isTypeAllowed) {
      let allowedLabel = "valid document formats";
      if (acceptTypes.includes("image/")) {
        allowedLabel = "JPG, PNG, or WEBP images";
      } else if (acceptTypes.includes("pdf")) {
        allowedLabel = "PDF, JPG, or PNG files";
      }
      
      toast.error(`${fileName} is an invalid file type. Only ${allowedLabel} allowed.`, { id: 'file-upload-error' });
      return false;
    }

    // 2. Size Check
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File "${fileName}" is too large. Maximum size is 5MB.`, { id: 'file-upload-error' });
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
    // Clear value to allow re-uploading same file
    if (e.target) e.target.value = '';
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Reset the file input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onFileSelect(null as any);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPreview) {
      onPreview();
    } else if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className="w-full">
      <label htmlFor={id} className={cn(
        "block text-sm font-medium mb-2 transition-all duration-200",
        errors ? "text-red-500" : "text-gray-700 dark:text-gray-300"
      )}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {!fileName ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-blue-50 dark:bg-blue-900/20"
              : errors
              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className={cn(
            "w-8 h-8 mx-auto mb-3",
            errors ? "text-red-500" : "text-gray-400 dark:text-gray-500"
          )} />
          <p className={cn(
            "text-sm mb-1",
            errors ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"
          )}>
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {description || "PDF, JPG, or PNG (max. 5MB)"}
          </p>
        </div>
      ) : (
        <div className={cn(
          "flex items-center justify-between p-4 border rounded-lg transition-colors group relative",
          errors
            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
            : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600"
        )}>
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              errors
                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            )}>
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <button
                type="button"
                onClick={handlePreview}
                className={cn(
                  "text-sm font-bold block text-left hover:underline decoration-2 underline-offset-4 decoration-primary/30",
                  errors ? "text-red-900 dark:text-red-100" : "text-gray-900 dark:text-gray-100"
                )}
                title="Click to view full document"
              >
                {fileName}
              </button>
              <button 
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-xs text-gray-500 dark:text-gray-400 font-bold hover:text-primary transition-colors flex items-center gap-1 mt-0.5"
              >
                Click to change
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="p-2 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept || ".pdf,.jpg,.jpeg,.png"}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error message */}
      {errors && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          {typeof errors === 'string'
            ? errors
            : (errors as any).message || "Please upload a valid file"}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
