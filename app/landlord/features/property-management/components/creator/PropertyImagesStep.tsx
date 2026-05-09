'use client';

import React, { useState } from 'react';
import { Upload, Image, X, Eye, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import MediaPreviewOverlay from '@/components/common/MediaPreviewOverlay';
import { cn } from '@/utils/helper';
import SafeImage from '@/components/common/SafeImage';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_PROPERTY_IMAGES = 20;
const MAX_ROOM_IMAGES = 5;

const PROPERTY_CATEGORIES = [
  { id: 'Bedroom', label: 'Bedroom', icon: Image, description: 'Sleeping areas' },
  { id: 'Kitchen', label: 'Kitchen', icon: Upload, description: 'Cooking space' },
  { id: 'Bathroom', label: 'Bathroom', icon: Eye, description: 'Shared toilets' },
  { id: 'Common Area', label: 'Common Area', icon: Image, description: 'Lobby / Lounge' },
  { id: 'Exterior', label: 'Exterior', icon: Image, description: 'Facade / Gate' },
  { id: 'General', label: 'General', icon: Image, description: 'Other photos' },
];

const getSafeImageSrc = (image: string): string => {
  if (!image || typeof image !== 'string') return '';
  const lower = image.toLowerCase();
  const isSafeProtocol = lower.startsWith('blob:') || lower.startsWith('https://') || lower.startsWith('http://');
  const hasDangerousChars = /[<>"'`();\\]/.test(image);
  if (isSafeProtocol && !hasDangerousChars) return image;
  return '';
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
  const [dragOver, setDragOver] = useState<number | 'property' | null>(null);

  // Preview State
  const [previewData, setPreviewData] = useState<{ isOpen: boolean; images: string[]; index: number; title: string }>({
    isOpen: false,
    images: [],
    index: 0,
    title: ''
  });

  const rooms = watch('propertyConfig.rooms') || [];

  const validateFiles = (files: File[], currentCount: number, limit: number) => {
    const validFiles: File[] = [];
    if (currentCount >= limit) {
      toast.error(`Maximum limit of ${limit} images reached.`);
      return [];
    }
    const filesToAdd = files.slice(0, limit - currentCount);
    for (const file of filesToAdd) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is invalid. Only JPG and PNG allowed.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 5MB size limit.`);
        continue;
      }
      validFiles.push(file);
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

  const handlePropertyImageUpload = (category: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentCount = (propertyImages[category] || []).length;
    const validFiles = validateFiles(files, currentCount, 10); // 10 per category max

    if (validFiles.length > 0) {
      const newImages = validFiles.map(file => URL.createObjectURL(file));
      
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

  const handleRoomImageUpload = (roomIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentRoomCount = (roomImages[roomIndex] || []).length;
    const validFiles = validateFiles(files, currentRoomCount, MAX_ROOM_IMAGES);
    if (validFiles.length > 0) {
      const newImages = validFiles.map(file => URL.createObjectURL(file));
      const updatedRoomImages = { ...roomImages, [roomIndex]: [...(roomImages[roomIndex] || []), ...newImages] };
      const updatedRoomFiles = { ...internalRoomFiles, [roomIndex]: [...(internalRoomFiles[roomIndex] || []), ...validFiles] };
      setRoomImages(updatedRoomImages);
      setInternalRoomFiles(updatedRoomFiles);
      if (onRoomFilesChange) onRoomFilesChange(roomIndex, updatedRoomFiles[roomIndex]);
      syncToForm(propertyImages, updatedRoomImages);
      clearErrors(`propertyImages.rooms.${roomIndex}`);
    }
    // Clear input value to allow re-uploading the same file
    if (e.target) e.target.value = '';
  };

  const removePropertyImage = (category: string, index: number) => {
    const updatedImages = {
      ...propertyImages,
      [category]: propertyImages[category].filter((_, i) => i !== index)
    };
    
    const updatedFiles = {
      ...internalPropertyFiles,
      [category]: internalPropertyFiles[category].filter((_, i) => i !== index)
    };

    setPropertyImages(updatedImages);
    setInternalPropertyFiles(updatedFiles);
    if (onPropertyFilesChange) onPropertyFilesChange(updatedFiles);
    syncToForm(updatedImages, roomImages);
  };

  const removeRoomImage = (roomIndex: number, imageIndex: number) => {
    const updatedRoomImages = { ...roomImages, [roomIndex]: roomImages[roomIndex].filter((_, i) => i !== imageIndex) };
    const updatedRoomFiles = { ...internalRoomFiles, [roomIndex]: internalRoomFiles[roomIndex].filter((_, i) => i !== imageIndex) };
    setRoomImages(updatedRoomImages);
    setInternalRoomFiles(updatedRoomFiles);
    if (onRoomFilesChange) onRoomFilesChange(roomIndex, updatedRoomFiles[roomIndex]);
    syncToForm(propertyImages, updatedRoomImages);
  };

  const openPreview = (images: string[], index: number, title: string) => {
    setPreviewData({ isOpen: true, images, index, title });
  };

  return (
    <div className="space-y-6">
      <motion.div className="bg-primary/5 dark:bg-primary/10 rounded-3xl p-8 border border-primary/20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-inner"><Image size={24} /></div>
          <div>
            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Property Gallery</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Photos are the first thing tenants look at!</p>
          </div>
        </div>
      </motion.div>

      {/* Property Images */}
      <motion.div 
        id="propertyImages.property"
        className={cn(
          "bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 border shadow-xl transition-all duration-300",
          errors?.propertyImages?.property ? "border-rose-500 ring-4 ring-rose-500/5" : "border-gray-100 dark:border-gray-700"
        )}
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <h4 className={cn("font-black uppercase tracking-widest text-xs", errors?.propertyImages?.property ? "text-rose-500" : "text-gray-900 dark:text-white")}>
                Core Property Photos <span className="text-rose-500">*</span>
              </h4>
           </div>
           <span className={cn(
             "text-[10px] font-black px-4 py-1.5 rounded-full uppercase border",
             errors?.propertyImages?.property ? "bg-rose-500 text-white border-rose-500 animate-pulse" : "bg-primary/10 text-primary border-primary/20"
           )}>
             At least 3 required
           </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROPERTY_CATEGORIES.map((cat) => {
            const catImages = propertyImages[cat.id] || [];
            const hasError = errors?.propertyImages?.property?.[cat.id];
            
            return (
              <div 
                key={cat.id}
                className={cn(
                  "flex flex-col bg-gray-50/50 dark:bg-gray-900/50 rounded-[2rem] border-2 border-dashed transition-all p-6",
                  dragOver === cat.id ? "border-primary bg-primary/5" : "border-gray-200 dark:border-gray-800 hover:border-primary/20",
                  hasError ? "border-rose-500 bg-rose-500/5" : ""
                )}
                onDragOver={(e) => { e.preventDefault(); setDragOver(cat.id as any); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => { e.preventDefault(); setDragOver(null); handlePropertyImageUpload(cat.id, { target: { files: e.dataTransfer.files } } as any); }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-primary">
                      <cat.icon size={18} />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-900 dark:text-white">{cat.label}</h5>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">{cat.description}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => document.getElementById(`upload-${cat.id}`)?.click()}
                    className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <Upload size={14} />
                  </button>
                  <input 
                    type="file" 
                    id={`upload-${cat.id}`}
                    multiple 
                    className="hidden" 
                    onChange={(e) => handlePropertyImageUpload(cat.id, e)} 
                  />
                </div>

                {/* Thumbnail Strip */}
                <div className="flex flex-wrap gap-2 min-h-[60px]">
                  {catImages.length > 0 ? (
                    catImages.map((img, idx) => (
                      <div key={idx} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <SafeImage src={getSafeImageSrc(img)} alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                          <button type="button" onClick={() => removePropertyImage(cat.id, idx)} className="p-1 bg-rose-500 text-white rounded-md"><X size={10} /></button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                       <p className="text-[8px] font-black uppercase tracking-widest">No Photos</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {errors?.propertyImages?.property && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-8 p-4 bg-rose-500/10 border-l-4 border-rose-500 rounded-r-xl flex items-center gap-3"
          >
            <AlertCircle className="text-rose-500" size={18} />
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.1em]">
              Please upload at least 3 property images in total.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Room Images */}
      {rooms.length > 0 && (
        <div className="space-y-8 mt-12">
           <div className="flex items-center gap-4 px-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-inner"><Image size={20} /></div>
              <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] text-xs">Room-by-Room Photos</h4>
           </div>

           <div className="grid grid-cols-1 gap-8">
              {rooms.map((room: any, index: number) => {
                const roomError = errors?.propertyImages?.rooms?.[index] || (errors?.propertyImages?.rooms as any)?.[index.toString()];
                return (
                  <motion.div 
                    key={index} 
                    id={`propertyImages.rooms.${index}`}
                    className={cn(
                      "bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 border shadow-xl overflow-hidden relative group transition-all duration-300",
                      roomError ? "border-rose-500 ring-4 ring-rose-500/5" : "border-gray-100 dark:border-gray-700"
                    )}
                  >
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center font-black text-gray-400 text-sm shadow-inner">{index + 1}</div>
                          <div>
                             <h5 className={cn("font-black uppercase tracking-widest text-[11px]", roomError ? "text-rose-500" : "text-gray-900 dark:text-white")}>{room.name || `Room ${index + 1}`} Gallery</h5>
                             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{room.roomType} UNIT</p>
                          </div>
                       </div>
                       <span className={cn(
                         "text-[9px] font-black px-4 py-1.5 rounded-full uppercase border",
                         roomError ? "bg-rose-500 text-white border-rose-500 animate-pulse" : "text-amber-600 bg-amber-500/5 border-amber-500/10"
                       )}>
                         {roomError ? "Missing Image" : "Max 5 Photos"}
                       </span>
                    </div>

                    <div
                      className={cn(
                        "border-4 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer",
                        dragOver === index ? "border-amber-500 bg-amber-500/5" : "border-gray-200 dark:border-gray-700 hover:border-amber-500/30",
                        roomError && "border-rose-500 bg-rose-500/5"
                      )}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(index); }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={(e) => { e.preventDefault(); setDragOver(null); handleRoomImageUpload(index, { target: { files: e.dataTransfer.files } } as any); }}
                      onClick={() => document.getElementById(`room-upload-${index}`)?.click()}
                    >
                      <input type="file" accept="image/*" multiple onChange={(e) => handleRoomImageUpload(index, e)} className="hidden" id={`room-upload-${index}`} />
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm",
                        roomError ? "bg-rose-500/10 text-rose-500" : "bg-gray-50 dark:bg-gray-900 text-gray-300"
                      )}>
                        <Upload size={24} strokeWidth={2.5} />
                      </div>
                      <p className={cn("text-[11px] font-black uppercase tracking-tight", roomError ? "text-rose-600" : "text-gray-900 dark:text-white")}>
                        {roomError ? "Room Image Required" : "Add Room Photos"}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Max 5 images • JPG/PNG • Under 5MB</p>
                    </div>

                    {(roomImages[index] || []).length > 0 && (
                      <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {roomImages[index].map((image, imgIndex) => (
                          <div key={imgIndex} className="relative group aspect-square rounded-[1.2rem] overflow-hidden border-2 border-gray-100 dark:border-gray-700 shadow-sm">
                            <SafeImage src={getSafeImageSrc(image)} alt="" className="transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5 backdrop-blur-[2px]">
                               <button type="button" onClick={() => openPreview(roomImages[index], imgIndex, `Room ${index + 1}`)} className="p-2.5 bg-white/20 text-white rounded-xl hover:bg-white/40"><Eye size={16} /></button>
                               <button type="button" onClick={() => removeRoomImage(index, imgIndex)} className="p-2.5 bg-rose-500/80 text-white rounded-xl hover:bg-rose-500"><X size={16} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {roomError && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mt-6 p-4 bg-rose-500/10 border-l-4 border-rose-500 rounded-r-xl flex items-center gap-3"
                      >
                        <AlertCircle className="text-rose-500" size={16} />
                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.1em]">
                          {roomError.message || `Please upload at least 1 image for Room ${index + 1}`}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
           </div>
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
