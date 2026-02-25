import React, { useState } from 'react';
import { Upload, Image, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface PropertyImagesStepProps {
  register: any;
  errors: any;
  watch: any;
  control: any;
  getValues: any;
}

const PropertyImagesStep: React.FC<PropertyImagesStepProps> = ({
  register,
  errors,
  watch,
  control,
  getValues
}) => {
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [roomImages, setRoomImages] = useState<Record<number, string[]>>({});
  const [dragOver, setDragOver] = useState(false);

  const rooms = watch('propertyConfig.rooms') || [];

  const handlePropertyImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => URL.createObjectURL(file));
    setPropertyImages(prev => [...prev, ...newImages]);
  };

  const handleRoomImageUpload = (roomIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => URL.createObjectURL(file));
    setRoomImages(prev => ({
      ...prev,
      [roomIndex]: [...(prev[roomIndex] || []), ...newImages]
    }));
  };

  const removePropertyImage = (index: number) => {
    setPropertyImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeRoomImage = (roomIndex: number, imageIndex: number) => {
    setRoomImages(prev => ({
      ...prev,
      [roomIndex]: prev[roomIndex].filter((_, i) => i !== imageIndex)
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    const newImages = files.map(file => URL.createObjectURL(file));
    setPropertyImages(prev => [...prev, ...newImages]);
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
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Image className="w-5 h-5" />
          <span>Property Images</span>
        </h4>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Drag and drop images here, or click to browse
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Supported formats: JPG, PNG, WEBP (Max 5MB per image)
          </p>
          <input
            type="file"
            accept="image/*"
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
                  src={image}
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
      </motion.div>

      {/* Room Images */}
      {rooms.map((room: any, roomIndex: number) => (
        <motion.div
          key={roomIndex}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 + roomIndex * 0.1 }}
        >
          <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Image className="w-5 h-5" />
            <span>Room {roomIndex + 1} Images</span>
          </h4>

          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const files = Array.from(e.dataTransfer.files || []);
              const newImages = files.map(file => URL.createObjectURL(file));
              setRoomImages(prev => ({
                ...prev,
                [roomIndex]: [...(prev[roomIndex] || []), ...newImages]
              }));
            }}
          >
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Drag and drop images here, or click to browse
            </p>
            <input
              type="file"
              accept="image/*"
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
                    src={image}
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
