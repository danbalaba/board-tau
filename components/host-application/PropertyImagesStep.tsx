import React, { useState } from 'react';
import { Upload, Image, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_PROPERTY_IMAGES = 10;
const MAX_ROOM_IMAGES = 5;

/**
 * Only allow http, https, or blob URLs as image sources.
 * Explicitly rejects data: URIs and any other schemes to prevent XSS.
 */
const getSafeImageSrc = (image: string): string => {
  if (!image || typeof image !== 'string') return '';
  
  // Explicitly validate the resulting string is a safe protocol and contains no HTML-like characters
  // Rejects < > " ' ` ( ) ; \ to satisfy aggressive CodeQL DOM-based XSS rules.
  const lower = image.toLowerCase();
  const isSafeProtocol = lower.startsWith('blob:') || lower.startsWith('https://') || lower.startsWith('http://');
  const hasDangerousChars = /[<>"'`();\\]/.test(image);

  if (isSafeProtocol && !hasDangerousChars) {
    return image;
  }
  
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
  onPropertyFilesChange?: (files: File[]) => void;
  onRoomFilesChange?: (roomIndex: number, files: File[]) => void;
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
  onRoomFilesChange
}) => {
  const toast = useResponsiveToast();
  
  // Get initial values from form to preserve state when navigating back
  const initialData = getValues('propertyImages') || { property: [], rooms: {} };
  
  const [propertyImages, setPropertyImages] = useState<string[]>(initialData.property || []);
  const [roomImages, setRoomImages] = useState<Record<number, string[]>>(initialData.rooms || {});
  
  // Also keep track of File objects for parents that need them (like Landlord dashboard)
  const [internalPropertyFiles, setInternalPropertyFiles] = useState<File[]>([]);
  const [internalRoomFiles, setInternalRoomFiles] = useState<Record<number, File[]>>({});

  const [dragOver, setDragOver] = useState<number | 'property' | null>(null);

  const rooms = watch('propertyConfig.rooms') || [];

  const validateFiles = (files: File[], currentCount: number, limit: number) => {
    const validFiles: File[] = [];
    
    if (currentCount >= limit) {
      toast.error(`Maximum limit of ${limit} images reached.`, { id: 'limit-error' });
      return [];
    }

    const totalAfterAdd = currentCount + files.length;
    if (totalAfterAdd > limit) {
      toast.error(`You can only add ${limit - currentCount} more images. Total limit is ${limit}.`, { id: 'count-error' });
    }

    const filesToAdd = files.slice(0, limit - currentCount);

    for (const file of filesToAdd) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is an invalid file type. Only JPG, PNG, and WEBP allowed.`, { id: `type-error-${file.name}` });
        continue;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds the 5MB size limit.`, { id: `size-error-${file.name}` });
        continue;
      }
      
      validFiles.push(file);
    }

    return validFiles;
  };

  const syncToForm = (newPropertyImages: string[], newRoomImages: Record<number, string[]>) => {
    setValue('propertyImages', {
      property: newPropertyImages,
      rooms: newRoomImages
    }, { shouldValidate: true });

    // Real-time error clearing
    if (newPropertyImages.length >= 3) {
      clearErrors('propertyImages.property');
    }

    // Check each room and clear specific error if requirement met
    Object.entries(newRoomImages).forEach(([roomIdx, images]) => {
      if (images.length >= 1) {
        clearErrors(`propertyImages.rooms[${roomIdx}]`);
      }
    });

    // Check if ALL room requirements are met to clear the general room error
    const someRoomMissingImages = rooms.some((_: any, idx: number) => (newRoomImages[idx] || []).length < 1);
    if (!someRoomMissingImages) {
      clearErrors('propertyImages.rooms');
    }
  };

  const handlePropertyImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = validateFiles(files, propertyImages.length, MAX_PROPERTY_IMAGES);
    
    if (validFiles.length > 0) {
      const newImages = validFiles.map(file => file.type.startsWith('image/') ? URL.createObjectURL(file) : '');
      const updated = [...propertyImages, ...newImages];
      const updatedFiles = [...internalPropertyFiles, ...validFiles];
      
      setPropertyImages(updated);
      setInternalPropertyFiles(updatedFiles);
      if (onPropertyFilesChange) onPropertyFilesChange(updatedFiles);
      
      syncToForm(updated, roomImages);
      toast.success(`Successfully added ${validFiles.length} images.`);
    }
  };

  const handleRoomImageUpload = (roomIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentRoomCount = (roomImages[roomIndex] || []).length;
    const validFiles = validateFiles(files, currentRoomCount, MAX_ROOM_IMAGES);
    
    if (validFiles.length > 0) {
      const newImages = validFiles.map(file => file.type.startsWith('image/') ? URL.createObjectURL(file) : '');
      const updatedRoomImages = {
        ...roomImages,
        [roomIndex]: [...(roomImages[roomIndex] || []), ...newImages]
      };
      const updatedRoomFiles = {
        ...internalRoomFiles,
        [roomIndex]: [...(internalRoomFiles[roomIndex] || []), ...validFiles]
      };
      
      setRoomImages(updatedRoomImages);
      setInternalRoomFiles(updatedRoomFiles);
      if (onRoomFilesChange) onRoomFilesChange(roomIndex, updatedRoomFiles[roomIndex]);
      
      syncToForm(propertyImages, updatedRoomImages);
      toast.success(`Successfully added ${validFiles.length} room images.`);
    }
  };

  const removePropertyImage = (index: number) => {
    const updated = propertyImages.filter((_, i) => i !== index);
    const updatedFiles = internalPropertyFiles.filter((_, i) => i !== index);
    
    setPropertyImages(updated);
    setInternalPropertyFiles(updatedFiles);
    if (onPropertyFilesChange) onPropertyFilesChange(updatedFiles);
    
    syncToForm(updated, roomImages);
    toast.success('Property image removed');
  };

  const removeRoomImage = (roomIndex: number, imageIndex: number) => {
    const updatedRoomImages = {
      ...roomImages,
      [roomIndex]: roomImages[roomIndex].filter((_, i) => i !== imageIndex)
    };
    const updatedRoomFiles = {
      ...internalRoomFiles,
      [roomIndex]: internalRoomFiles[roomIndex].filter((_, i) => i !== imageIndex)
    };
    
    setRoomImages(updatedRoomImages);
    setInternalRoomFiles(updatedRoomFiles);
    if (onRoomFilesChange) onRoomFilesChange(roomIndex, updatedRoomFiles[roomIndex]);
    
    syncToForm(propertyImages, updatedRoomImages);
    toast.success('Room image removed');
  };

  const handleDragOver = (e: React.DragEvent, id: number | 'property') => {
    e.preventDefault();
    setDragOver(id);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, id: number | 'property') => {
    e.preventDefault();
    setDragOver(null);
    const files = Array.from(e.dataTransfer.files || []);
    
    if (id === 'property') {
      const validFiles = validateFiles(files, propertyImages.length, MAX_PROPERTY_IMAGES);
      if (validFiles.length > 0) {
        const newImages = validFiles.map(file => file.type.startsWith('image/') ? URL.createObjectURL(file) : '');
        const updated = [...propertyImages, ...newImages];
        setPropertyImages(updated);
        syncToForm(updated, roomImages);
        toast.success(`Successfully uploaded ${validFiles.length} property images.`);
      }
    } else {
      const roomIndex = id;
      const currentRoomCount = (roomImages[roomIndex] || []).length;
      const validFiles = validateFiles(files, currentRoomCount, MAX_ROOM_IMAGES);
      if (validFiles.length > 0) {
        const newImages = validFiles.map(file => file.type.startsWith('image/') ? URL.createObjectURL(file) : '');
        const updatedRoomImages = {
          ...roomImages,
          [roomIndex]: [...(roomImages[roomIndex] || []), ...newImages]
        };
        setRoomImages(updatedRoomImages);
        syncToForm(propertyImages, updatedRoomImages);
        toast.success(`Successfully uploaded ${validFiles.length} images for Room ${roomIndex + 1}.`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="bg-gradient-to-r from-blue/10 to-blue/5 dark:from-blue/20 dark:to-blue/10 rounded-xl p-6 border border-blue/20 dark:border-blue/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3">
          <Image className="w-6 h-6 text-blue dark:text-blue" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Property & Room Images</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload images of your property and rooms to attract tenants
            </p>
          </div>
        </div>
      </motion.div>

      {/* Property Images */}
      <motion.div
        id="propertyImages.property"
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm scroll-mt-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Image className="w-5 h-5" />
          <span>Property Images <span className="text-red-500">*</span></span>
        </h4>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver === 'property'
              ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600'
          } ${errors?.propertyImages?.property ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : ''}`}
          onDragOver={(e) => handleDragOver(e, 'property')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'property')}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Drag and drop images here, or click to browse
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Supported formats: JPG, PNG (Max 5MB per image)
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handlePropertyImageUpload}
            className="hidden"
            id="property-images-upload"
          />
          <label
            htmlFor="property-images-upload"
            className="px-4 py-2 bg-primary dark:bg-primary text-white dark:text-white rounded-lg cursor-pointer hover:bg-primary-hover dark:hover:bg-primary-hover transition-colors"
          >
            Choose Files
          </label>
        </div>

        {/* Property Images Preview */}
        {propertyImages.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {propertyImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={getSafeImageSrc(image)}
                  alt={`Property ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePropertyImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {errors?.propertyImages?.property && (
          <p className="mt-3 text-sm text-red-500 font-medium">
            {errors.propertyImages.property.message}
          </p>
        )}
      </motion.div>

      {/* Room Images */}
      {rooms.map((room: any, roomIndex: number) => (
        <motion.div
          key={roomIndex}
          id={`propertyImages.rooms[${roomIndex}]`}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm scroll-mt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 + roomIndex * 0.1 }}
        >
          <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Image className="w-5 h-5" />
            <span>Room {roomIndex + 1} Images <span className="text-red-500">*</span></span>
          </h4>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver === roomIndex
                ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600'
            } ${errors?.propertyImages?.rooms?.[roomIndex] ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : ''}`}
            onDragOver={(e) => handleDragOver(e, roomIndex)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, roomIndex)}
          >
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Drag and drop images here, or click to browse
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
              Supported formats: JPG, PNG (Max 5MB per image)
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={(e) => handleRoomImageUpload(roomIndex, e)}
              className="hidden"
              id={`room-${roomIndex}-images-upload`}
            />
            <label
              htmlFor={`room-${roomIndex}-images-upload`}
              className="px-4 py-2 bg-primary dark:bg-primary text-white dark:text-white rounded-lg cursor-pointer hover:bg-primary-hover dark:hover:bg-primary-hover transition-colors"
            >
              Choose Files
            </label>
          </div>

          {/* Room Images Preview */}
          {roomImages[roomIndex] && roomImages[roomIndex].length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              {roomImages[roomIndex].map((image, imageIndex) => (
                <div key={imageIndex} className="relative group">
                  <img
                    src={getSafeImageSrc(image)}
                    alt={`Room ${roomIndex + 1} - ${imageIndex + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeRoomImage(roomIndex, imageIndex)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors?.propertyImages?.rooms?.[roomIndex] && (
            <p className="mt-3 text-sm text-red-500 font-medium">
              {errors.propertyImages.rooms[roomIndex].message}
            </p>
          )}
        </motion.div>
      ))}

      <motion.div
        className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-start space-x-3">
          <Image className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Image Tips</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              • Use clear, well-lit photos
              <br />• Include exterior and interior shots
              <br />• Highlight key amenities (rooms, bathrooms, kitchen)
              <br />• Upload at least 3-5 high-quality images for best results
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PropertyImagesStep;
