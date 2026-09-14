'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Image, X, Eye, AlertCircle, Camera, CheckCircle2, Bed, Utensils, ShowerHead, Sofa, Building2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import MediaPreviewOverlay from '@/components/common/MediaPreviewOverlay';
import { cn } from '@/utils/helper';
import SafeImage from '@/components/common/SafeImage';
import { getCachedRoomTypes, getSyncRoomTypes } from '@/lib/landlordTaxonomyCache';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_ROOM_IMAGES = 5;

const PROPERTY_CATEGORIES = [
  { id: 'Exterior', label: 'Exterior', icon: Building2, description: 'Building Facade / Cover', required: true },
  { id: 'Kitchen', label: 'Kitchen', icon: Utensils, description: 'Cooking space' },
  { id: 'Bathroom', label: 'Bathroom', icon: ShowerHead, description: 'Shared / CR' },
  { id: 'Common Area', label: 'Common Area', icon: Sofa, description: 'Lobby / Lounge' },
  { id: 'Other', label: 'Other', icon: Image, description: 'Other shared facilities' },
];

const getSafeImageSrc = (image: string): string => {
  if (!image || typeof image !== 'string') return '';
  const lower = image.toLowerCase();
  const isSafeProtocol = lower.startsWith('data:image/') || lower.startsWith('blob:') || lower.startsWith('https://') || lower.startsWith('http://');
  const hasDangerousChars = /[<>"'`();\\]/.test(image) && !lower.startsWith('data:image/');
  if (isSafeProtocol && !hasDangerousChars) return image;
  return '';
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });
};

interface PropertyImagesStepProps {
  register: any;
  errors: any;
  watch: any;
  control: any;
  getValues: any;
  setValue: any;
  clearErrors: any;
  onPropertyFilesChange?: (files: Record<string, File[]>) => void;
  onRoomFilesChange?: (roomIndex: number, files: File[]) => void;
  propertyFiles?: Record<string, File[]>;
  roomFiles?: Record<number, File[]>;
}

const PropertyImagesStep: React.FC<PropertyImagesStepProps> = ({
  register,
  errors,
  watch,
  control,
  getValues,
  setValue,
  clearErrors,
  onPropertyFilesChange,
  onRoomFilesChange,
  propertyFiles = {},
  roomFiles = {}
}) => {
  const toast = useResponsiveToast();
  const initialData = getValues('propertyImages') || { property: [], rooms: {} };
  
  const [propertyImages, setPropertyImages] = useState<Record<string, string[]>>(
    Array.isArray(initialData.property) ? {} : (initialData.property || {})
  );
  const [roomImages, setRoomImages] = useState<Record<number, string[]>>(initialData.rooms || {});
  const [internalPropertyFiles, setInternalPropertyFiles] = useState<Record<string, File[]>>((propertyFiles as any) || {});
  const [internalRoomFiles, setInternalRoomFiles] = useState<Record<number, File[]>>((roomFiles as any) || {});
  const [dragOver, setDragOver] = useState<number | string | null>(null);

  // File level validation error state
  const [fileError, setFileError] = useState<{ category?: string; roomIndex?: number; message: string } | null>(null);

  // Sub-step tabs state
  const [activeCoreTab, setActiveCoreTab] = useState<string>('Bedroom');
  const [activeRoomTab, setActiveRoomTab] = useState<number>(0);

  const propertyTypeId = watch('propertyBasic.propertyTypeId') || getValues('propertyBasic.propertyTypeId') || '';
  const rooms = watch('propertyConfig.rooms') || [];

  // Auto-switch tab to room with error on form validation failure
  useEffect(() => {
    if (errors?.propertyImages?.rooms) {
      const errorRoomIndex = rooms.findIndex((_: any, idx: number) => {
        return !!(errors?.propertyImages?.rooms?.[idx] || (errors?.propertyImages?.rooms as any)?.[idx.toString()]);
      });
      if (errorRoomIndex !== -1 && errorRoomIndex !== activeRoomTab) {
        setActiveRoomTab(errorRoomIndex);
      }
    }
  }, [errors?.propertyImages?.rooms]);

  // Auto-switch tab to missing category on form validation failure
  useEffect(() => {
    if (errors?.propertyImages?.propertyCategoryMissing || errors?.propertyImages?.property) {
      const missingCat = PROPERTY_CATEGORIES.find(cat => {
        const list = propertyImages[cat.id] || [];
        return !Array.isArray(list) || list.length === 0;
      });
      if (missingCat && missingCat.id !== activeCoreTab) {
        setActiveCoreTab(missingCat.id);
      }
    }
  }, [errors?.propertyImages?.propertyCategoryMissing, errors?.propertyImages?.property]);

  // Taxonomy Cache to resolve room type labels dynamically
  const [taxonomyRoomTypes, setTaxonomyRoomTypes] = useState<any[]>(() => {
    return (propertyTypeId ? getSyncRoomTypes(propertyTypeId) : []) || [];
  });

  useEffect(() => {
    if (propertyTypeId) {
      getCachedRoomTypes(propertyTypeId).then(types => {
        if (Array.isArray(types) && types.length > 0) {
          setTaxonomyRoomTypes(types);
        }
      }).catch(() => {});
    }
  }, [propertyTypeId]);

  // Preview State
  const [previewData, setPreviewData] = useState<{ isOpen: boolean; images: string[]; index: number; title: string }>({
    isOpen: false,
    images: [],
    index: 0,
    title: ''
  });

  const validateFiles = (files: File[], currentCount: number, limit: number, context: { category?: string; roomIndex?: number }) => {
    const validFiles: File[] = [];
    if (currentCount >= limit) {
      const msg = `Maximum limit of ${limit} images reached for this section.`;
      toast.error(msg);
      setFileError({ ...context, message: msg });
      return [];
    }
    const filesToAdd = files.slice(0, limit - currentCount);
    for (const file of filesToAdd) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        const msg = `${file.name} is an unsupported format. Only JPG and PNG images are allowed.`;
        toast.error(msg);
        setFileError({ ...context, message: msg });
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        const msg = `${file.name} (${sizeMB}MB) exceeds the 5MB size limit.`;
        toast.error(msg);
        setFileError({ ...context, message: msg });
        continue;
      }
      validFiles.push(file);
    }
    if (validFiles.length > 0) {
      setFileError(null);
    }
    return validFiles;
  };

  const syncToForm = (newPropertyImages: Record<string, string[]>, newRoomImages: Record<number, string[]>) => {
    setValue('propertyImages', { 
      property: newPropertyImages, 
      rooms: newRoomImages 
    }, { shouldValidate: true });
    
    const flattenedProperty = Object.values(newPropertyImages).flat();
    if (flattenedProperty.length >= 3) clearErrors('propertyImages.property');
  };

  const handlePropertyImageUpload = async (category: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentCount = (propertyImages[category] || []).length;
    const validFiles = validateFiles(files, currentCount, 10, { category }); // 10 per category max

    if (validFiles.length > 0) {
      const newImages = await Promise.all(validFiles.map(file => fileToBase64(file)));
      
      const updatedImages = {
        ...propertyImages,
        [category]: [...(propertyImages[category] || []), ...newImages]
      };
      
      const updatedFiles = {
        ...internalPropertyFiles,
        [category]: [...(internalPropertyFiles[category] || []), ...validFiles]
      };

      setPropertyImages(updatedImages);
      setInternalPropertyFiles(updatedFiles);
      if (onPropertyFilesChange) onPropertyFilesChange(updatedFiles);
      syncToForm(updatedImages, roomImages);
    }
    if (e.target) e.target.value = '';
  };

  const handleRoomImageUpload = async (roomIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentRoomCount = (roomImages[roomIndex] || []).length;
    const validFiles = validateFiles(files, currentRoomCount, MAX_ROOM_IMAGES, { roomIndex });
    if (validFiles.length > 0) {
      const newImages = await Promise.all(validFiles.map(file => fileToBase64(file)));
      const updatedRoomImages = { ...roomImages, [roomIndex]: [...(roomImages[roomIndex] || []), ...newImages] };
      const updatedRoomFiles = { ...internalRoomFiles, [roomIndex]: [...(internalRoomFiles[roomIndex] || []), ...validFiles] };
      setRoomImages(updatedRoomImages);
      setInternalRoomFiles(updatedRoomFiles);
      if (onRoomFilesChange) onRoomFilesChange(roomIndex, updatedRoomFiles[roomIndex]);
      syncToForm(propertyImages, updatedRoomImages);
      clearErrors(`propertyImages.rooms.${roomIndex}`);
    }
    if (e.target) e.target.value = '';
  };

  const removePropertyImage = (category: string, index: number) => {
    const categoryImages = propertyImages[category] || [];
    const updatedImages = {
      ...propertyImages,
      [category]: categoryImages.filter((_, i) => i !== index)
    };
    
    const categoryFiles = internalPropertyFiles[category] || [];
    const updatedFiles = {
      ...internalPropertyFiles,
      [category]: categoryFiles.filter((_, i) => i !== index)
    };

    setPropertyImages(updatedImages);
    setInternalPropertyFiles(updatedFiles);
    if (onPropertyFilesChange) onPropertyFilesChange(updatedFiles);
    syncToForm(updatedImages, roomImages);
  };

  const removeRoomImage = (roomIndex: number, imageIndex: number) => {
    const roomImgs = roomImages[roomIndex] || [];
    const updatedRoomImages = { 
      ...roomImages, 
      [roomIndex]: roomImgs.filter((_, i) => i !== imageIndex) 
    };
    
    const roomFls = internalRoomFiles[roomIndex] || [];
    const updatedRoomFiles = { 
      ...internalRoomFiles, 
      [roomIndex]: roomFls.filter((_, i) => i !== imageIndex) 
    };

    setRoomImages(updatedRoomImages);
    setInternalRoomFiles(updatedRoomFiles);
    if (onRoomFilesChange) onRoomFilesChange(roomIndex, updatedRoomFiles[roomIndex]);
    syncToForm(propertyImages, updatedRoomImages);
  };

  const openPreview = (images: string[], index: number, title: string) => {
    setPreviewData({ isOpen: true, images, index, title });
  };

  const totalCorePhotosCount = Object.values(propertyImages).flat().length;
  const uploadedCategoriesCount = PROPERTY_CATEGORIES.filter(cat => (propertyImages[cat.id] || []).length > 0).length;
  const isCorePhotosValid = uploadedCategoriesCount === 6;

  const getRoomDetails = (room: any, index: number) => {
    const rawType = room.roomType || '';
    const matched = taxonomyRoomTypes.find((t: any) => t.id === rawType || t.value === rawType || t.code === rawType);
    
    const typeLabel = matched 
      ? (matched.name || matched.label) 
      : (rawType && !/^[a-f0-9]{24}$/i.test(rawType) ? rawType : 'Unit');
    
    const isFlatRate = matched?.isFlatRate ?? (rawType === 'SOLO');
    const unitTitle = room.name || `${isFlatRate ? 'Unit' : 'Room'} ${index + 1} Gallery`;
    
    const specs = [
      typeLabel,
      room.size ? `${room.size} SQM` : null,
      room.price ? `₱${Number(room.price).toLocaleString()}/mo` : null
    ].filter(Boolean).join(' • ');

    return { unitTitle, specs, isFlatRate };
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <motion.div 
        className="bg-primary/5 dark:bg-primary/10 rounded-none sm:rounded-3xl p-4 sm:p-8 border-x-0 sm:border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary shadow-inner shrink-0">
            <Camera size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xs sm:text-lg">Property Gallery</h3>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">High quality photos attract up to 3x more inquiries from students!</p>
          </div>
        </div>
      </motion.div>

      {/* CORE PROPERTY PHOTOS (Organized Sub-Step Category Tabs) */}
      <motion.div 
        id="propertyImages.property"
        className={cn(
          "bg-white dark:bg-slate-900 rounded-none sm:rounded-[2.5rem] p-4 sm:p-8 border-x-0 sm:border-2 shadow-xl transition-all duration-300 space-y-4 sm:space-y-6",
          (errors?.propertyImages?.property || errors?.propertyImages?.propertyCategoryMissing) ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5" : "border-slate-200 dark:border-slate-800"
        )}
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
      >
        {/* Header and Progress Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className={cn("font-black uppercase tracking-widest text-xs flex items-center gap-2", (errors?.propertyImages?.property || errors?.propertyImages?.propertyCategoryMissing) ? "text-rose-500" : "text-slate-900 dark:text-white")}>
              <Image size={16} className="text-primary" />
              Core Property Photos <span className="text-rose-500">*</span>
            </h4>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
              Upload at least 1 Exterior photo (building facade/cover). Kitchen, Bathroom, Common Area, and Other are optional.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-500", isCorePhotosValid ? "bg-primary" : "bg-amber-500")}
                  style={{ width: `${Math.min(100, (uploadedCategoriesCount / 5) * 100)}%` }}
                />
              </div>
            </div>
            <span className={cn(
              "text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase border flex items-center gap-1.5",
              (errors?.propertyImages?.property || errors?.propertyImages?.propertyCategoryMissing)
                ? "bg-rose-500 text-white border-rose-500 animate-pulse shadow-md shadow-rose-500/20"
                : isCorePhotosValid
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            )}>
              {isCorePhotosValid ? <CheckCircle2 size={13} /> : null}
              {uploadedCategoriesCount} / 5 Categories Completed
            </span>
          </div>
        </div>

        {/* Sub-Step Category Tabs Bar (Light & Dark Adaptive Container) */}
        <div className="p-2 sm:p-2.5 bg-white dark:bg-gray-800/90 rounded-none sm:rounded-[2rem] border-x-0 sm:border border-gray-200 dark:border-gray-700/80 shadow-md">
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {PROPERTY_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const count = (propertyImages[cat.id] || []).length;
              const isActive = activeCoreTab === cat.id;
              const hasCategoryError = !!(errors?.propertyImages?.propertyCategoryMissing || errors?.propertyImages?.property);
              const isComplete = count > 0;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCoreTab(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer select-none shrink-0 min-w-[120px] sm:min-w-[135px] justify-center",
                    isActive
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-[1.02]"
                      : hasCategoryError && count === 0
                      ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 font-extrabold"
                      : isComplete
                      ? "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/60 text-teal-600 dark:text-teal-400 font-extrabold"
                      : "bg-gray-50 dark:bg-gray-900/60 border-gray-200/80 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold"
                  )}
                >
                  <Icon size={15} className={cn(isActive ? "text-white" : isComplete ? "text-teal-600 dark:text-teal-400" : hasCategoryError ? "text-rose-500" : "text-gray-400")} />
                  <span>{cat.label}</span>
                  {isComplete && <CheckCircle2 size={15} className={cn("shrink-0 ml-0.5", isActive ? "text-white" : "text-teal-600 dark:text-teal-400")} />}
                  {hasCategoryError && count === 0 && <AlertCircle size={15} className="text-rose-500 shrink-0 ml-0.5 animate-pulse" />}
                  <span className={cn(
                    "ml-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase shrink-0",
                    isActive 
                      ? "bg-white/20 text-white" 
                      : isComplete 
                      ? "bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300" 
                      : hasCategoryError
                      ? "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300"
                      : "bg-gray-200/80 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Category Gallery Workspace */}
        {(() => {
          const currentCat = PROPERTY_CATEGORIES.find(c => c.id === activeCoreTab) || PROPERTY_CATEGORIES[0];
          const catImages = propertyImages[currentCat.id] || [];
          const IconComp = currentCat.icon;
          const hasError = !!errors?.propertyImages?.property && totalCorePhotosCount < 3;

          return (
            <div className="space-y-4 sm:space-y-6 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="p-2.5 sm:p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                    <IconComp size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">{currentCat.label} Gallery</h5>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">{currentCat.description} ({catImages.length} uploaded)</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => document.getElementById(`upload-tab-${currentCat.id}`)?.click()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
                >
                  <Plus size={15} /> Add {currentCat.label} Photos
                </button>
                <input 
                  type="file" 
                  id={`upload-tab-${currentCat.id}`}
                  multiple 
                  accept="image/jpeg,image/png"
                  className="hidden" 
                  onChange={(e) => handlePropertyImageUpload(currentCat.id, e)} 
                />
              </div>

              {/* Large Dropzone & Full Photo Grid */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center transition-all cursor-pointer select-none",
                  dragOver === currentCat.id 
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                    : "border-slate-200 dark:border-slate-800 hover:border-primary/40 bg-slate-50/40 dark:bg-slate-900/40",
                  hasError && catImages.length === 0 && "border-rose-500 bg-rose-500/5"
                )}
                onDragOver={(e) => { e.preventDefault(); setDragOver(currentCat.id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => { e.preventDefault(); setDragOver(null); handlePropertyImageUpload(currentCat.id, { target: { files: e.dataTransfer.files } } as any); }}
                onClick={() => document.getElementById(`upload-tab-${currentCat.id}`)?.click()}
              >
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-primary/10 text-primary rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2.5 sm:mb-3">
                  <Upload size={20} className="sm:w-6 sm:h-6" />
                </div>
                <p className="text-[11px] sm:text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">Drag & drop or click to upload {currentCat.label} photos</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Up to 10 images • JPG/PNG • Under 5MB each</p>
              </div>

              {/* File Specific Error Message (Format / Size Error) */}
              {fileError && fileError.category === currentCat.id && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 bg-rose-500/10 border-l-4 border-rose-500 rounded-r-2xl flex items-center gap-2.5"
                >
                  <AlertCircle className="text-rose-500 shrink-0" size={16} />
                  <p className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    {fileError.message}
                  </p>
                </motion.div>
              )}

              {catImages.length > 0 && (
                <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2.5 sm:gap-4 pt-2">
                  {catImages.map((img, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => openPreview(catImages, idx, `${currentCat.label} Photos`)}
                      className="relative group w-full aspect-square sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-800 cursor-pointer"
                    >
                      <SafeImage src={getSafeImageSrc(img)} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      
                      <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[1px]">
                        <div className="p-2 bg-white/30 text-white rounded-xl backdrop-blur-md">
                          <Eye size={18} />
                        </div>
                      </div>

                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          removePropertyImage(currentCat.id, idx);
                        }} 
                        className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 bg-slate-900/80 hover:bg-rose-500 text-white/90 hover:text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 hover:border-rose-500 shadow-md transition-all hover:scale-110 cursor-pointer z-10"
                        title="Remove photo"
                      >
                        <X size={12} className="stroke-[2.5]" />
                      </button>

                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 sm:bottom-1.5 sm:left-1.5 px-1.5 py-0.5 rounded-md bg-primary/90 text-white text-[8px] font-black uppercase tracking-wider shadow-sm backdrop-blur-sm">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {errors?.propertyImages?.property && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-rose-500/10 border-l-4 border-rose-500 rounded-r-2xl flex items-center gap-3"
          >
            <AlertCircle className="text-rose-500 shrink-0" size={18} />
            <p className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Please upload at least 3 property images in total across core categories.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* ROOM & UNIT GALLERIES (Sub-Step Unit Tabs) */}
      {rooms.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                <Bed size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">Room & Unit Galleries</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Upload photos specific to individual room units</p>
              </div>
            </div>
          </div>

          {/* Room Sub-Step Navigation Bar (Light & Dark Adaptive Container) */}
          <div className="p-2 sm:p-2.5 bg-white dark:bg-gray-800/90 rounded-none sm:rounded-[2rem] border-x-0 sm:border border-gray-200 dark:border-gray-700/80 shadow-md">
            <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {rooms.map((room: any, index: number) => {
                const { isFlatRate } = getRoomDetails(room, index);
                const roomPhotoList = roomImages[index] || [];
                const isActive = activeRoomTab === index;
                const hasPhotos = roomPhotoList.length > 0;
                const roomError = errors?.propertyImages?.rooms?.[index] || (errors?.propertyImages?.rooms as any)?.[index.toString()];

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveRoomTab(index)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer select-none shrink-0 min-w-[120px] sm:min-w-[135px] justify-center",
                      isActive
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-[1.02]"
                        : roomError
                        ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 font-extrabold"
                        : hasPhotos
                        ? "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/60 text-teal-600 dark:text-teal-400 font-extrabold"
                        : "bg-gray-50 dark:bg-gray-900/60 border-gray-200/80 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold"
                    )}
                  >
                    <Bed size={15} className={cn(isActive ? "text-white" : hasPhotos ? "text-teal-600 dark:text-teal-400" : roomError ? "text-rose-500" : "text-gray-400")} />
                    <span>{isFlatRate ? 'Unit' : 'Room'} {index + 1}</span>
                    {hasPhotos && <CheckCircle2 size={15} className={cn("shrink-0 ml-0.5", isActive ? "text-white" : "text-teal-600 dark:text-teal-400")} />}
                    {roomError && <AlertCircle size={15} className="text-rose-500 shrink-0 ml-0.5 animate-pulse" />}
                    <span className={cn(
                      "ml-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase shrink-0",
                      isActive
                        ? "bg-white/20 text-white"
                        : roomError
                        ? "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300"
                        : hasPhotos
                        ? "bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300"
                        : "bg-gray-200/80 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    )}>
                      {roomPhotoList.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Unit Sub-Tab Workspace */}
          {(() => {
            const actualIndex = typeof activeRoomTab === 'number' && activeRoomTab < rooms.length ? activeRoomTab : 0;
            const room = rooms[actualIndex];
            if (!room) return null;
            const roomError = errors?.propertyImages?.rooms?.[actualIndex] || (errors?.propertyImages?.rooms as any)?.[actualIndex.toString()];
            const { unitTitle, specs } = getRoomDetails(room, actualIndex);
            const roomPhotoList = roomImages[actualIndex] || [];

            return (
              <motion.div 
                key={actualIndex} 
                id={`propertyImages.rooms.${actualIndex}`}
                className={cn(
                  "bg-white dark:bg-slate-900 rounded-none sm:rounded-[2.5rem] p-4 sm:p-8 border-x-0 sm:border-2 shadow-xl overflow-hidden relative group transition-all duration-300 space-y-4 sm:space-y-6",
                  roomError ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5" : "border-slate-200 dark:border-slate-800"
                )}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 text-primary font-black rounded-xl sm:rounded-2xl flex items-center justify-center text-xs sm:text-sm shadow-inner shrink-0">
                      {actualIndex + 1}
                    </div>
                    <div className="min-w-0">
                      <h5 className={cn("font-black uppercase tracking-wider text-xs sm:text-sm truncate", roomError ? "text-rose-500" : "text-slate-900 dark:text-white")}>
                        {unitTitle}
                      </h5>
                      <p className="text-[10px] sm:text-[11px] font-extrabold text-primary uppercase tracking-wider mt-0.5 truncate">
                        {specs}
                      </p>
                    </div>
                  </div>

                  <span className={cn(
                    "text-[9px] sm:text-[10px] font-black px-3 py-1 sm:px-4 sm:py-1.5 rounded-full uppercase border flex items-center gap-1 shrink-0 ml-2",
                    roomError 
                      ? "bg-rose-500 text-white border-rose-500 animate-pulse shadow-md shadow-rose-500/20" 
                      : roomPhotoList.length > 0
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "text-slate-500 bg-slate-100 dark:bg-slate-800 border-transparent"
                  )}>
                    {roomError ? "Missing Photo" : `${roomPhotoList.length} / ${MAX_ROOM_IMAGES} Photos`}
                  </span>
                </div>

                {/* Dropzone Container */}
                <div
                  className={cn(
                    "border-2 border-dashed rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center transition-all cursor-pointer select-none",
                    dragOver === actualIndex 
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                      : "border-slate-200 dark:border-slate-800 hover:border-primary/40 bg-slate-50/40 dark:bg-slate-900/40",
                    roomError && "border-rose-500 bg-rose-500/5"
                  )}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(actualIndex); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(null); handleRoomImageUpload(actualIndex, { target: { files: e.dataTransfer.files } } as any); }}
                  onClick={() => document.getElementById(`room-upload-${actualIndex}`)?.click()}
                >
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png" 
                    multiple 
                    onChange={(e) => handleRoomImageUpload(actualIndex, e)} 
                    className="hidden" 
                    id={`room-upload-${actualIndex}`} 
                  />
                  <div className={cn(
                    "w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2.5 sm:mb-3 shadow-sm transition-transform group-hover:scale-105",
                    roomError ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"
                  )}>
                    <Upload size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                  </div>
                  <p className={cn("text-[11px] sm:text-xs font-black uppercase tracking-wider", roomError ? "text-rose-600" : "text-slate-900 dark:text-white")}>
                    {roomError ? "At least 1 photo required for this unit" : "Click or drag photos to upload"}
                  </p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Up to 5 images • JPG/PNG • Under 5MB each
                  </p>
                </div>

                {/* File Specific Error Message (Format / Size Error) */}
                {fileError && fileError.roomIndex === actualIndex && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-rose-500/10 border-l-4 border-rose-500 rounded-r-2xl flex items-center gap-2.5"
                  >
                    <AlertCircle className="text-rose-500 shrink-0" size={16} />
                    <p className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      {fileError.message}
                    </p>
                  </motion.div>
                )}

                {/* Room Thumbnail Gallery */}
                {roomPhotoList.length > 0 && (
                  <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2.5 sm:gap-4 pt-2">
                    {roomPhotoList.map((image, imgIndex) => (
                      <div 
                        key={imgIndex} 
                        onClick={() => openPreview(roomPhotoList, imgIndex, `${unitTitle} - Photo ${imgIndex + 1}`)}
                        className="relative group w-full aspect-square sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-800 cursor-pointer"
                      >
                        <SafeImage src={getSafeImageSrc(image)} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        
                        <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[1px]">
                          <div className="p-2 bg-white/30 text-white rounded-xl backdrop-blur-md">
                            <Eye size={18} />
                          </div>
                        </div>

                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRoomImage(actualIndex, imgIndex);
                          }} 
                          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 bg-slate-900/80 hover:bg-rose-500 text-white/90 hover:text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 hover:border-rose-500 shadow-md transition-all hover:scale-110 cursor-pointer z-10"
                          title="Remove photo"
                        >
                          <X size={12} className="stroke-[2.5]" />
                        </button>

                        {imgIndex === 0 && (
                          <span className="absolute bottom-1 left-1 sm:bottom-1.5 sm:left-1.5 px-1.5 py-0.5 rounded-md bg-primary/90 text-white text-[8px] font-black uppercase tracking-wider shadow-sm backdrop-blur-sm">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {roomError && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-rose-500/10 border-l-4 border-rose-500 rounded-r-2xl flex items-center gap-3"
                  >
                    <AlertCircle className="text-rose-500 shrink-0" size={16} />
                    <p className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      {roomError.message || `Please upload at least 1 image for ${unitTitle}`}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            );
          })()}
        </div>
      )}

      {/* Preview Overlay */}
      <MediaPreviewOverlay
        isOpen={previewData.isOpen}
        onClose={() => setPreviewData(prev => ({ ...prev, isOpen: false }))}
        images={previewData.images}
        currentIndex={previewData.index}
        onNavigate={(newIdx) => setPreviewData(prev => ({ ...prev, index: newIdx }))}
        title={previewData.title}
      />
    </div>
  );
};

export default PropertyImagesStep;
