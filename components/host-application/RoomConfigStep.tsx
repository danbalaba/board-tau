import React, { useState, useEffect } from 'react';
import Input from '../inputs/Input';
import Select from '../inputs/Select';
import Textarea from '../inputs/Textarea';
import Button from '../common/Button';
import { Plus, Minus, Bed, Bath, Users, CheckCircle, PlusCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROOM_TYPES, ROOM_TYPE_LABELS } from '@/data/roomTypes';
import { ROOM_AMENITIES, ROOM_AMENITY_LABELS, roomAmenities } from '@/data/roomAmenities';
import Modal from '../modals/Modal';

interface RoomType {
  roomType: string;
  count: string;
  price: string;
  bedType: string;
  capacity: string;
  size: string;
  availableSlots: string;
  description: string;
  amenities: string[];
}

interface RoomConfigStepProps {
  register: any;
  errors: any;
  watch: any;
  fields: any[];
  append: (value: RoomType) => void;
  remove: (index: number) => void;
  control: any;
  getValues: any;
  setValue: any;
}

const RoomConfigStep: React.FC<RoomConfigStepProps> = ({
  register,
  errors,
  watch,
  fields,
  append,
  remove,
  control,
  getValues,
  setValue
}) => {
  const [showCustomAmenityModal, setShowCustomAmenityModal] = useState(false);
  const [customAmenityText, setCustomAmenityText] = useState('');
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number>(-1);
  const [loadingIndices, setLoadingIndices] = useState<number[]>([]);

  const handleAddCustomAmenity = (roomIndex: number) => {
    setSelectedRoomIndex(roomIndex);
    setCustomAmenityText('');
    setShowCustomAmenityModal(true);
  };

  const handleCustomAmenitySubmit = () => {
    if (customAmenityText.trim() && selectedRoomIndex !== -1) {
      const currentRooms = getValues('propertyConfig.rooms');
      const updatedRooms = [...currentRooms];
      const customAmenity = customAmenityText.trim().toUpperCase().replace(/\s+/g, '_');

      if (!updatedRooms[selectedRoomIndex].amenities.includes(customAmenity)) {
        updatedRooms[selectedRoomIndex].amenities.push(customAmenity);
        setValue('propertyConfig.rooms', updatedRooms); // Update the form state
      }

      setShowCustomAmenityModal(false);
    }
  };

  // Bed type options per room type
  const getBedTypeOptions = (roomType: string) => {
    if (roomType === ROOM_TYPES.SOLO) {
      return [
        { value: 'Single', label: 'Single Bed' },
        { value: 'Double', label: 'Double Bed' },
        { value: 'Queen', label: 'Queen Bed' }
      ];
    } else if (roomType === ROOM_TYPES.BEDSPACE) {
      return [
        { value: 'Single', label: 'Single Bed' },
        { value: 'Bunk', label: 'Bunk Bed' }
      ];
    }
    return [];
  };

  // Amenities per room type
  const getApplicableAmenities = (roomType: string) => {
    return roomAmenities.filter(amenity =>
      !amenity.applicableTo || amenity.applicableTo.includes(roomType)
    );
  };

  // Handle room type change with loading animation
  const handleRoomTypeChange = (index: number, newRoomType: string) => {
    setLoadingIndices(prev => [...prev, index]);
    // Update form value
    setValue(`propertyConfig.rooms[${index}].roomType`, newRoomType);
    // Simulate loading time for animation
    setTimeout(() => {
      setLoadingIndices(prev => prev.filter(i => i !== index));
    }, 500);
  };



  return (
    <div className="space-y-6">
      <motion.div
        className="bg-gradient-to-r from-purple/10 to-purple/5 dark:from-purple/20 dark:to-purple/10 rounded-xl p-6 border border-purple/20 dark:border-purple/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3">
          <Bed className="w-6 h-6 text-purple dark:text-purple" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Room Configuration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure your property's rooms, types, and amenities
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Room Types</span>
          </h4>
          <Button
            type="button"
            outline
            onClick={() => append({
              roomType: ROOM_TYPES.SOLO,
              count: '',
              price: '',
              bedType: 'Single',
              capacity: '1',
              size: '',
              availableSlots: '',
              description: '',
              amenities: []
            })}
            className="text-sm flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Room Type</span>
          </Button>
        </div>

        {fields.map((field: any, index: number) => {
          const currentRoomType = watch(`propertyConfig.rooms[${index}].roomType`) || ROOM_TYPES.SOLO;
          const isLoading = loadingIndices.includes(index);

          return (
            <motion.div
              key={field.id}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <div className="flex items-start justify-between mb-3">
                <h5 className="font-medium text-gray-900 dark:text-white">Room Type {index + 1}</h5>
                 {fields.length > 1 && (
                  <Button
                    type="button"
                    outline
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      remove(index);
                    }}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center space-x-1"
                  >
                    <Minus className="w-4 h-4" />
                    <span>Remove</span>
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading room configuration...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                      label="Room Type"
                      id={`propertyConfig.rooms[${index}].roomType`}
                      register={register}
                      errors={errors}
                      options={[
                        { value: ROOM_TYPES.SOLO, label: ROOM_TYPE_LABELS.SOLO },
                        { value: ROOM_TYPES.BEDSPACE, label: ROOM_TYPE_LABELS.BEDSPACE }
                      ]}
                      required
                      onChange={(value) => handleRoomTypeChange(index, value)}
                    />

                    <Input
                      label="Number of Rooms"
                      id={`propertyConfig.rooms[${index}].count`}
                      type="number"
                      register={register}
                      errors={errors}
                      watch={watch}
                      min="1"
                      required
                      placeholder="5"
                      useStaticLabel={true}
                    />

                    <Input
                      label={currentRoomType === ROOM_TYPES.SOLO ? "Price per Room (PHP)" : "Price per Bed (PHP)"}
                      id={`propertyConfig.rooms[${index}].price`}
                      type="number"
                      register={register}
                      errors={errors}
                      watch={watch}
                      min="100"
                      required
                      placeholder="15000"
                      useStaticLabel={true}
                    />

                    <Select
                      label="Bed Type"
                      id={`propertyConfig.rooms[${index}].bedType`}
                      register={register}
                      errors={errors}
                      options={getBedTypeOptions(currentRoomType)}
                      required
                    />

                    {currentRoomType === ROOM_TYPES.SOLO ? (
                      <>
                        <Input
                          label="Room Size (sq. meters)"
                          id={`propertyConfig.rooms[${index}].size`}
                          type="number"
                          register={register}
                          errors={errors}
                          watch={watch}
                          min="1"
                          step="0.1"
                          required
                          placeholder="12"
                          useStaticLabel={true}
                        />

                        <Select
                          label="Maximum Capacity"
                          id={`propertyConfig.rooms[${index}].capacity`}
                          register={register}
                          errors={errors}
                          options={[
                            { value: '1', label: '1 person' },
                            { value: '2', label: '2 people' },
                            { value: '3', label: '3 people' },
                            { value: '4', label: '4 people' },
                            { value: '5+', label: '5+ people' }
                          ]}
                          required
                        />
                      </>
                    ) : (
                      <>
                        <Input
                          label="Bed Count / Capacity"
                          id={`propertyConfig.rooms[${index}].capacity`}
                          type="number"
                          register={register}
                          errors={errors}
                          watch={watch}
                          min="1"
                          required
                          placeholder="4"
                          useStaticLabel={true}
                        />

                        <Input
                          label="Available Slots"
                          id={`propertyConfig.rooms[${index}].availableSlots`}
                          type="number"
                          register={register}
                          errors={errors}
                          watch={watch}
                          min="0"
                          required
                          placeholder="3"
                          useStaticLabel={true}
                        />
                      </>
                    )}
                  </div>

                  <div className="mb-6">
                    <h6 className="font-medium text-gray-900 dark:text-white mb-3">Room Amenities</h6>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {/* Predefined amenities */}
                      {getApplicableAmenities(currentRoomType).map((amenity) => {
                        return (
                          <div key={amenity.value} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`room-${index}-amenity-${amenity.value}`}
                              {...register(`propertyConfig.rooms[${index}].amenities`, { required: false })}
                              value={amenity.value}
                              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
                            />
                            <label
                              htmlFor={`room-${index}-amenity-${amenity.value}`}
                              className="text-sm text-gray-700 dark:text-gray-300"
                            >
                              {amenity.label}
                            </label>
                          </div>
                        );
                      })}
                      {/* Custom amenities */}
                      {watch(`propertyConfig.rooms[${index}].amenities`)?.filter((amenity: string) => 
                        !getApplicableAmenities(currentRoomType).some(predefined => predefined.value === amenity)
                      ).map((customAmenity: string) => {
                        return (
                          <div key={customAmenity} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`room-${index}-amenity-${customAmenity}`}
                              {...register(`propertyConfig.rooms[${index}].amenities`, { required: false })}
                              value={customAmenity}
                              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
                            />
                            <label
                              htmlFor={`room-${index}-amenity-${customAmenity}`}
                              className="text-sm text-gray-700 dark:text-gray-300"
                            >
                              {customAmenity.replace(/_/g, ' ').toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </label>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4">
                      <Button
                        type="button"
                        outline
                        onClick={() => handleAddCustomAmenity(index)}
                        className="text-sm flex items-center space-x-1"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Add Custom Amenity</span>
                      </Button>
                    </div>
                  </div>

                  <Textarea
                    label="Room Description"
                    id={`propertyConfig.rooms[${index}].description`}
                    register={register}
                    errors={errors}
                    watch={watch}
                    required
                    rows={3}
                    placeholder="Describe this room type... Include features, amenities, and special considerations."
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Room Configuration Tips</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              • Add all room types your property offers
              <br />• Be specific about room amenities to attract tenants
              <br />• Use clear descriptions to help tenants understand what each room offers
              <br />• Set competitive prices based on market rates
            </p>
          </div>
        </div>
      </motion.div>

      {/* Custom Amenity Modal */}
      <Modal
        isOpen={showCustomAmenityModal}
        onClose={() => setShowCustomAmenityModal(false)}
        title="Add Custom Amenity"
        width="sm"
      >
        <div className="space-y-4">
          <Input
            label="Amenity Name"
            id="customAmenity"
            type="text"
            value={customAmenityText}
            onChange={(e) => setCustomAmenityText(e.target.value)}
            placeholder="e.g., Smart TV, Microwave"
            required
          />
          <div className="flex space-x-2 justify-end">
            <Button
              type="button"
              outline
              onClick={() => setShowCustomAmenityModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCustomAmenitySubmit}
              disabled={!customAmenityText.trim()}
            >
              Add Amenity
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoomConfigStep;
