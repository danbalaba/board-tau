'use client';

import React, { useState } from 'react';
import MediaPreviewOverlay from '@/components/common/MediaPreviewOverlay';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Building2, 
  Home, 
  Flame, 
  FolderPlus, 
  Eye, 
  RefreshCw, 
  FileCheck,
  LayoutGrid,
  Info,
  Lock
} from 'lucide-react';
import { cn } from '@/utils/helper';
import SafeImage from '@/components/common/SafeImage';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

interface DocumentsStepProps {
  register: any;
  errors: any;
  watch?: any;
  control?: any;
  uploadedFiles: Record<string, File>;
  onFileUpload: (documentType: string, file: File) => void;
}

const DOCUMENT_CATEGORIES = [
  {
    id: 'governmentId',
    label: 'Government ID',
    description: "Valid Passport, Driver's License, or National ID",
    icon: FileText,
    category: 'IDENTITY',
    optional: false
  },
  {
    id: 'businessPermit',
    label: 'Business Permit',
    description: "Current year Business or Mayor's Permit",
    icon: Building2,
    category: 'IDENTITY',
    optional: false
  },
  {
    id: 'landTitle',
    label: 'Land Title / Lease Agreement',
    description: 'Proof of ownership or valid lease contract',
    icon: Home,
    category: 'PROPERTY',
    optional: false
  },
  {
    id: 'barangayClearance',
    label: 'Barangay Clearance',
    description: 'Recent clearance from local barangay',
    icon: ShieldCheck,
    category: 'PROPERTY',
    optional: false
  },
  {
    id: 'fireSafetyCertificate',
    label: 'Fire Safety Certificate',
    description: 'FSIC certificate for current year',
    icon: Flame,
    category: 'PROPERTY',
    optional: false
  },
  {
    id: 'otherDocuments',
    label: 'Additional Documents',
    description: 'Any other supporting legal papers',
    icon: FolderPlus,
    category: 'ADDITIONAL',
    optional: true
  }
];

const SUB_TABS = [
  { id: 'ALL', label: 'All Documents', icon: LayoutGrid },
  { id: 'IDENTITY', label: 'Identity & Permits', icon: FileText },
  { id: 'PROPERTY', label: 'Property & Safety', icon: Home },
  { id: 'ADDITIONAL', label: 'Additional (Optional)', icon: FolderPlus }
];

const DocumentsStep: React.FC<DocumentsStepProps> = ({
  register,
  errors,
  watch,
  control,
  uploadedFiles,
  onFileUpload
}) => {
  const toast = useResponsiveToast();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [fileError, setFileError] = useState<{ id: string; message: string } | null>(null);

  // Preview State
  const [previewData, setPreviewData] = useState<{ isOpen: boolean; image: string; title: string }>({
    isOpen: false,
    image: '',
    title: ''
  });

  const getDocState = (fieldId: string) => {
    const file = uploadedFiles[fieldId];
    const formUrl = watch ? watch(`documents.${fieldId}`) : null;
    const url = file ? URL.createObjectURL(file) : (typeof formUrl === 'string' ? formUrl : '');
    const fileName = file ? file.name : (url ? `${DOCUMENT_CATEGORIES.find(d => d.id === fieldId)?.label}.png` : '');
    const fileSize = file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : '';
    const isUploaded = Boolean(file || (url && url.length > 0));

    return { file, url, fileName, fileSize, isUploaded };
  };

  // Required docs uploaded count
  const requiredDocs = DOCUMENT_CATEGORIES.filter(d => !d.optional);
  const uploadedRequiredCount = requiredDocs.filter(d => getDocState(d.id).isUploaded).length;
  const isAllRequiredUploaded = uploadedRequiredCount === requiredDocs.length;

  const handleFileDrop = (fieldId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!ALLOWED_TYPES.includes(file.type)) {
      const msg = `${file.name} is an unsupported file format. Only JPG and PNG images are allowed.`;
      toast.error(msg);
      setFileError({ id: fieldId, message: msg });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const msg = `${file.name} (${sizeMB}MB) exceeds the 5MB size limit.`;
      toast.error(msg);
      setFileError({ id: fieldId, message: msg });
      return;
    }

    setFileError(null);
    onFileUpload(fieldId, file);
    toast.success(`${DOCUMENT_CATEGORIES.find(d => d.id === fieldId)?.label} uploaded successfully!`);
  };

  const handlePreview = (url: string, title: string) => {
    if (!url) return;
    setPreviewData({
      isOpen: true,
      image: url,
      title
    });
  };

  const visibleFields = DOCUMENT_CATEGORIES.filter(field => {
    if (activeTab === 'ALL') return true;
    return field.category === activeTab;
  });

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Encrypted Security Header Banner */}
      <motion.div 
        className="bg-primary/5 dark:bg-primary/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary shadow-inner shrink-0">
            <ShieldCheck size={22} className="sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm sm:text-base">Legal Verification</h3>
              <span className="text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest flex items-center gap-1 shrink-0">
                <Lock size={10} /> 256-Bit Encrypted
              </span>
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5 leading-relaxed">
              Upload clear legal documents. Files are strictly encrypted and accessed only by our verification team.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Verification Card Container */}
      <motion.div 
        className="bg-white dark:bg-slate-900/90 rounded-none sm:rounded-[2.5rem] p-4 sm:p-8 border-x-0 sm:border border-slate-200 dark:border-slate-800/80 shadow-md sm:shadow-xl space-y-4 sm:space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header & Progress Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
              <FileCheck size={16} className="text-primary shrink-0" />
              Document Verification Progress
            </h4>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              5 required legal documents for property approval
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <div className="w-full sm:w-28 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-500", isAllRequiredUploaded ? "bg-primary" : "bg-amber-500")}
                  style={{ width: `${(uploadedRequiredCount / 5) * 100}%` }}
                />
              </div>
            </div>
            <span className={cn(
              "text-[10px] font-black px-3 py-1 sm:px-4 sm:py-1.5 rounded-full uppercase border flex items-center gap-1.5 shrink-0",
              isAllRequiredUploaded
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            )}>
              {isAllRequiredUploaded ? <CheckCircle2 size={13} /> : null}
              {uploadedRequiredCount} / 5 Required Uploaded
            </span>
          </div>
        </div>

        {/* Sub-Step Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b border-slate-100 dark:border-slate-800">
          {SUB_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            // Count for this subtab
            const tabFields = DOCUMENT_CATEGORIES.filter(d => tab.id === 'ALL' || d.category === tab.id);
            const tabUploadedCount = tabFields.filter(d => getDocState(d.id).isUploaded).length;
            const tabHasError = tabFields.some(d => errors?.documents?.[d.id]);

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer select-none shrink-0",
                  isActive
                    ? tabHasError
                      ? "bg-rose-500 text-white border-rose-500 shadow-sm animate-pulse"
                      : "bg-primary text-white border-primary shadow-sm"
                    : tabHasError
                    ? "bg-rose-500/10 border-rose-500 text-rose-500 font-extrabold animate-pulse"
                    : tabUploadedCount > 0
                    ? "bg-primary/10 border-primary/30 text-primary font-extrabold"
                    : "bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {tabUploadedCount > 0 && !isActive && !tabHasError ? (
                  <CheckCircle2 size={14} className="text-primary shrink-0" />
                ) : tabHasError ? (
                  <AlertCircle size={14} className={cn("shrink-0", isActive ? "text-white" : "text-rose-500")} />
                ) : (
                  <Icon size={14} className={cn(isActive ? "text-white" : "shrink-0")} />
                )}
                <span>{tab.label}</span>
                <span className={cn(
                  "ml-1 px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase shrink-0",
                  isActive ? "bg-white/20 text-white" : tabHasError ? "bg-rose-500/20 text-rose-500" : "bg-primary/20 text-primary"
                )}>
                  {tabUploadedCount}/{tabFields.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2-Column Responsive Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
          {visibleFields.map((field) => {
            const { file, url, fileName, fileSize, isUploaded } = getDocState(field.id);
            const isError = Boolean(errors?.documents?.[field.id]);
            const isCustomFileError = fileError?.id === field.id;
            const IconComponent = field.icon;

            return (
              <motion.div
                key={field.id}
                id={`documents.${field.id}`}
                layout
                className={cn(
                  "flex flex-col bg-slate-50/60 dark:bg-slate-900/60 rounded-2xl sm:rounded-3xl border-2 transition-all p-4 sm:p-6 space-y-3 sm:space-y-4 relative group",
                  isUploaded
                    ? "border-primary/40 bg-primary/5 dark:bg-primary/10"
                    : isError
                    ? "border-rose-500 bg-rose-500/5 ring-4 ring-rose-500/10"
                    : dragOver === field.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-slate-200 dark:border-slate-800 border-dashed hover:border-primary/40"
                )}
                onDragOver={(e) => { e.preventDefault(); setDragOver(field.id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(null);
                  handleFileDrop(field.id, e.dataTransfer.files);
                }}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className={cn(
                      "p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-sm border shrink-0 transition-colors",
                      isUploaded
                        ? "bg-primary text-white border-primary"
                        : isError
                        ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                        : "bg-white dark:bg-slate-800 text-primary border-slate-200/80 dark:border-slate-700/80"
                    )}>
                      <IconComponent size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className={cn(
                        "text-xs sm:text-sm font-black uppercase tracking-wider truncate sm:whitespace-normal",
                        isError ? "text-rose-500" : "text-slate-900 dark:text-white"
                      )}>
                        {field.label} {field.optional ? '' : <span className="text-rose-500">*</span>}
                      </h5>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 leading-tight line-clamp-1 sm:line-clamp-2">
                        {field.description}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={cn(
                    "text-[9px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider border shrink-0 flex items-center gap-1",
                    isUploaded
                      ? "bg-primary/10 text-primary border-primary/20"
                      : isError
                      ? "bg-rose-500 text-white border-rose-500 animate-pulse shadow-md shadow-rose-500/20"
                      : field.optional
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                  )}>
                    {isUploaded ? (
                      <>
                        <CheckCircle2 size={11} /> Uploaded
                      </>
                    ) : isError ? (
                      'Required'
                    ) : field.optional ? (
                      'Optional'
                    ) : (
                      'Required'
                    )}
                  </span>
                </div>

                {/* Uploaded File View or Dropzone View */}
                {isUploaded ? (
                  <div className="space-y-4 pt-1">
                    {/* File Info Box */}
                    <div className="flex items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-slate-800/80 rounded-xl sm:rounded-2xl border border-primary/20 shadow-sm">
                      <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden min-w-0 flex-1">
                        {url ? (
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-900">
                            <SafeImage src={url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FileText size={18} />
                          </div>
                        )}
                        <div className="truncate min-w-0 flex-1">
                          <p className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-wider">{fileName}</p>
                          {fileSize && <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{fileSize}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
                        {url && (
                          <button
                            type="button"
                            onClick={() => handlePreview(url, field.label)}
                            className="p-1.5 sm:p-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg sm:rounded-xl transition-all shadow-sm cursor-pointer"
                            title="Preview Document"
                          >
                            <Eye size={14} className="sm:w-3.5 sm:h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => document.getElementById(`file-input-${field.id}`)?.click()}
                          className="p-1.5 sm:p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg sm:rounded-xl transition-all shadow-sm cursor-pointer"
                          title="Replace Document"
                        >
                          <RefreshCw size={14} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Dropzone View */
                  <div
                    onClick={() => document.getElementById(`file-input-${field.id}`)?.click()}
                    className={cn(
                      "py-4 sm:py-6 px-3 sm:px-4 border-2 border-dashed rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all text-center select-none active:scale-[0.99]",
                      isError
                        ? "border-rose-500/60 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500"
                        : "border-slate-200 dark:border-slate-800 hover:border-primary/40 bg-white/50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 hover:text-primary"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105",
                      isError ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"
                    )}>
                      <Upload size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className={cn("text-[11px] sm:text-xs font-black uppercase tracking-wider", isError ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white")}>
                        {isError ? `Please upload ${field.label}` : 'Click or tap to upload file'}
                      </p>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        JPG or PNG format • Max 5MB
                      </p>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  id={`file-input-${field.id}`}
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    handleFileDrop(field.id, e.target.files);
                    if (e.target) e.target.value = '';
                  }}
                />

                {/* File Error (Format / Size) */}
                {isCustomFileError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-rose-500/10 border-l-4 border-rose-500 rounded-r-xl flex items-center gap-2"
                  >
                    <AlertCircle className="text-rose-500 shrink-0" size={15} />
                    <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      {fileError.message}
                    </p>
                  </motion.div>
                )}

                {/* Validation Error on Submit */}
                {isError && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-rose-500/10 border-l-4 border-rose-500 rounded-r-xl flex items-center gap-2"
                  >
                    <AlertCircle className="text-rose-500 shrink-0" size={15} />
                    <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      {errors?.documents?.[field.id]?.message || `${field.label} is required for property approval`}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Info Footnote */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <Info size={16} className="text-primary shrink-0" />
        <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-relaxed">
          Accepted File Formats: <span className="text-slate-900 dark:text-white font-black">JPG, PNG</span> • Maximum File Size: <span className="text-slate-900 dark:text-white font-black">5MB per document</span>
        </p>
      </div>

      {/* Lightbox Preview Modal */}
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
