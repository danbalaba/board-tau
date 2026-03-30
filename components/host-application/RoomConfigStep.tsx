import React, { useState, useEffect } from 'react';
import Input from '../inputs/Input';
import Textarea from '../inputs/Textarea';
import Checkbox from '../inputs/Checkbox';
import Button from '../common/Button';
import { Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import { Plus, Minus, Bed, Bath, Users, CheckCircle, PlusCircle, Loader2, ShowerHead, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROOM_TYPES, ROOM_TYPE_LABELS } from '@/data/roomTypes';
import { ROOM_AMENITIES, ROOM_AMENITY_LABELS, BATHROOM_ARRANGEMENTS, BATHROOM_ARRANGEMENT_LABELS, roomAmenities } from '@/data/roomAmenities';
import Modal from '../modals/Modal';

interface RoomType {
  roomType: string;
  bathroomArrangement: string;
  price: string;
  bedType: string;
  capacity: string;
  size: string;
  availableSlots: string;
  reservationFee: string;
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

const defaultRoom = (): RoomType => ({
  roomType: ROOM_TYPES.SOLO,
  bathroomArrangement: BATHROOM_ARRANGEMENTS.PRIVATE,
  price: '',
  bedType: 'Single',
  capacity: '1',
  size: '',
  availableSlots: '',
  reservationFee: '500',
  description: '',
  amenities: [],
});

// react-select shared classNames
const selectClassNames = {
  control: (state: any) =>
    `!bg-white dark:!bg-gray-800 !border ${state.isFocused ? '!border-primary !ring-1 !ring-primary' : '!border-gray-200 dark:!border-gray-700'} !rounded-xl !p-[5px] !shadow-sm transition-all text-[15px]`,
  singleValue: () => `!text-text-primary dark:!text-gray-100`,
  menu: () => `!bg-white dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-xl !rounded-xl !mt-1 z-50 overflow-hidden`,
  menuList: () => `!p-0`,
  option: (state: any) =>
    `!cursor-pointer ${state.isSelected ? '!bg-primary/10 !text-primary font-medium' : state.isFocused ? '!bg-gray-100 dark:!bg-gray-700 !text-text-primary dark:!text-gray-100' : '!bg-transparent dark:!bg-transparent !text-text-primary dark:!text-gray-100'} !px-3 !py-2 !text-sm transition-colors`,
  indicatorSeparator: () => `!bg-gray-200 dark:!bg-gray-700`,
  dropdownIndicator: () => `!text-gray-400 dark:!text-gray-500 hover:!text-primary`,
  placeholder: () => `!text-gray-400 dark:!text-gray-500 p-1`,
  input: () => `dark:!text-gray-100`,
};

const roomTypeOptions = [
  { value: ROOM_TYPES.SOLO, label: ROOM_TYPE_LABELS.SOLO },
  { value: ROOM_TYPES.BEDSPACE, label: ROOM_TYPE_LABELS.BEDSPACE },
];

const bathroomOptions = [
  {
    value: BATHROOM_ARRANGEMENTS.PRIVATE,
    icon: <ShowerHead className="w-4 h-4 text-blue-500" />,
    label: 'Own private CR',
    description: 'Room has its own dedicated bathroom',
  },
  {
    value: BATHROOM_ARRANGEMENTS.SHARED_OCCUPANTS,
    icon: <Bath className="w-4 h-4 text-indigo-500" />,
    label: 'Shared CR (among occupants)',
    description: 'Bathroom inside room, shared by all beds in this room',
  },
  {
    value: BATHROOM_ARRANGEMENTS.COMMON,
    icon: <Bath className="w-4 h-4 text-gray-400" />,
    label: 'No CR — uses common bathroom',
    description: "Uses the building's shared common bathrooms",
  },
];

const RoomConfigStep: React.FC<RoomConfigStepProps> = ({
  register,
  errors,
  watch,
  fields,
  append,
  remove,
  control,
  getValues,
  setValue,
}) => {
  const [showCustomAmenityModal, setShowCustomAmenityModal] = useState(false);
  
  // Watch for changes in bedType, capacity, or roomType to sync availableSlots/totalCapacity
  useEffect(() => {
    const subscription = watch((value: any, { name }: { name?: string }) => {
      // Focus on room-level changes
      if (name?.startsWith('propertyConfig.rooms')) {
        const indexMatch = name.match(/rooms\[(\d+)\]/);
        if (indexMatch) {
          const index = parseInt(indexMatch[1], 10);
          const room = value.propertyConfig?.rooms?.[index];
          
          if (!room) return;

          const bedType = room.bedType;
          const bedCountNum = parseInt(room.capacity || '1', 10);
          const currentSlots = room.availableSlots;
          
          // Multiplier Logic:
          // Single = 1
          // Double / Queen / Bunk = 2
          const multiplier = (bedType === 'Double' || bedType === 'Queen' || bedType === 'Bunk') ? 2 : 1;
          const calculatedTotalCapacity = isNaN(bedCountNum) ? 0 : bedCountNum * multiplier;

          // If the Bed Type, Bed Count, or Room Type changed, update the capacity to reflect the reality
          // We always want the Total Room Capacity to sync with the Count * Multiplier by default
          if (name.endsWith('.capacity') || name.endsWith('.bedType') || name.endsWith('.roomType')) {
            setValue(`propertyConfig.rooms[${index}].availableSlots`, calculatedTotalCapacity.toString());
          } else if (name.endsWith('.availableSlots')) {
            // If user manually updates capacity, ensure it doesn't exceed the logical limit
            if (parseInt(currentSlots || '0', 10) > calculatedTotalCapacity) {
              setValue(`propertyConfig.rooms[${index}].availableSlots`, calculatedTotalCapacity.toString());
            }
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const handleSelectAllRoomAmenities = (index: number, roomType: string) => {
    const applicable = getApplicableAmenities(roomType).map(a => a.value);
    const current = watch(`propertyConfig.rooms[${index}].amenities`) || [];
    const isAllSelected = applicable.every(a => current.includes(a));
    
    // Merge existing custom amenities that are not in the applicable list
    const custom = current.filter((a: string) => !applicable.includes(a));
    const next = isAllSelected ? custom : [...new Set([...applicable, ...custom])];
    
    setValue(`propertyConfig.rooms[${index}].amenities`, next, { shouldValidate: true });
  };
  const [customAmenityText, setCustomAmenityText] = useState('');
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number>(-1);
  const [loadingIndices, setLoadingIndices] = useState<number[]>([]);
  const [bulkRoomType, setBulkRoomType] = useState<string>(ROOM_TYPES.SOLO);

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
        setValue('propertyConfig.rooms', updatedRooms);
      }
      setShowCustomAmenityModal(false);
    }
  };

  const getBedTypeOptions = (roomType: string) => {
    if (roomType === ROOM_TYPES.SOLO) {
      return [
        { value: 'Single', label: 'Single Bed' },
        { value: 'Double', label: 'Double Bed' },
        { value: 'Queen', label: 'Queen Bed' },
      ];
    }
    return [
      { value: 'Single', label: 'Single Bed' },
      { value: 'Bunk', label: 'Bunk Bed' },
    ];
  };

  const getApplicableAmenities = (roomType: string) =>
    roomAmenities.filter(a => !a.applicableTo || a.applicableTo.includes(roomType));

  const handleRoomTypeChange = (index: number, newRoomType: string) => {
    setLoadingIndices(prev => [...prev, index]);
    setValue(`propertyConfig.rooms[${index}].roomType`, newRoomType);
    setTimeout(() => {
      setLoadingIndices(prev => prev.filter(i => i !== index));
    }, 400);
  };

  // Bulk assign — set all rooms to the chosen room type
  const handleBulkAssign = () => {
    const currentRooms = getValues('propertyConfig.rooms');
    const updatedRooms = currentRooms.map((room: any) => ({
      ...room,
      roomType: bulkRoomType,
      bedType: bulkRoomType === ROOM_TYPES.SOLO ? 'Single' : 'Single',
      amenities: [],
    }));
    setValue('propertyConfig.rooms', updatedRooms);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
              Configure each room individually — type, price, bathroom, and amenities
            </p>
          </div>
        </div>
      </motion.div>

      {/* Room List */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Toolbar — Row 1: Title + Add Room button */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Rooms
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({fields.length} total)</span>
          </h4>
          <Button
            type="button"
            outline
            onClick={() => append(defaultRoom())}
            className="text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </Button>
        </div>

        {/* Toolbar — Row 2: Bulk Assign Helper */}
        <div className="flex items-center gap-2 mb-5 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap font-medium">Set all to:</span>
          <div className="w-40 flex-shrink-0">
            <ReactSelect
              options={roomTypeOptions}
              value={roomTypeOptions.find(o => o.value === bulkRoomType) || null}
              onChange={(val: any) => setBulkRoomType(val?.value || ROOM_TYPES.SOLO)}
              classNames={selectClassNames}
              isSearchable={false}
              instanceId="bulk-room-type"
            />
          </div>
          <Button
            type="button"
            outline
            onClick={handleBulkAssign}
            className="text-sm whitespace-nowrap"
          >
            Apply to All
          </Button>
          <p className="text-xs text-gray-400 dark:text-gray-500 ml-auto hidden sm:block">
            Tip: Use this to quickly set the same room type for all rooms
          </p>
        </div>

        {/* Room Cards */}
        <div className="space-y-4">
          {fields.map((field: any, index: number) => {
            const currentRoomType = watch(`propertyConfig.rooms[${index}].roomType`) || ROOM_TYPES.SOLO;
            const currentBathroom = watch(`propertyConfig.rooms[${index}].bathroomArrangement`) || BATHROOM_ARRANGEMENTS.PRIVATE;
            const isLoading = loadingIndices.includes(index);

            return (
              <motion.div
                key={field.id}
                className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-xl border border-gray-200 dark:border-gray-600"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Bed className="w-4 h-4 text-primary" />
                    Room {index + 1}
                  </h5>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); e.preventDefault(); remove(index); }}
                      className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Updating room configuration...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Row 1: Room Type + Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Room Type */}
                      <div>
                        <label className="block text-[15px] font-medium text-text-primary dark:text-gray-100 mb-2">
                          Room Type <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          name={`propertyConfig.rooms[${index}].roomType`}
                          control={control}
                          rules={{ required: 'Room type is required' }}
                          render={({ field }) => (
                            <ReactSelect
                              {...field}
                              options={roomTypeOptions}
                              value={roomTypeOptions.find(o => o.value === field.value) || null}
                              onChange={(val: any) => {
                                field.onChange(val?.value);
                                handleRoomTypeChange(index, val?.value);
                              }}
                              classNames={selectClassNames}
                              isSearchable={false}
                              placeholder="Select type..."
                              instanceId={`room-type-${index}`}
                            />
                          )}
                        />
                        {errors?.propertyConfig?.rooms?.[index]?.roomType && (
                          <p className="mt-1 text-xs text-red-500 font-medium">
                            {errors.propertyConfig.rooms[index].roomType.message}
                          </p>
                        )}
                      </div>

                      {/* Bed Type */}
                      <div>
                        <label className="block text-[15px] font-medium text-text-primary dark:text-gray-100 mb-2">
                          Bed Type <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          name={`propertyConfig.rooms[${index}].bedType`}
                          control={control}
                          rules={{ required: 'Bed type is required' }}
                          render={({ field }) => {
                            const opts = getBedTypeOptions(currentRoomType);
                            return (
                              <ReactSelect
                                {...field}
                                options={opts}
                                value={opts.find(o => o.value === field.value) || null}
                                onChange={(val: any) => field.onChange(val?.value)}
                                classNames={selectClassNames}
                                isSearchable={false}
                                placeholder="Select bed type..."
                                instanceId={`bed-type-${index}`}
                               />
                             );
                           }}
                         />
                         {errors?.propertyConfig?.rooms?.[index]?.bedType && (
                           <p className="mt-1 text-xs text-red-500 font-medium">
                             {errors.propertyConfig.rooms[index].bedType.message}
                           </p>
                         )}
                       </div>
                    </div>

                    {/* Row 2: Price + Reservation Fee */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label={currentRoomType === ROOM_TYPES.SOLO ? 'Price per Room (PHP)' : 'Price per Bed (PHP)'}
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
                      <Input
                        label="Reservation Fee (PHP)"
                        id={`propertyConfig.rooms[${index}].reservationFee`}
                        type="number"
                        register={register}
                        errors={errors}
                        watch={watch}
                        min="0"
                        required
                        placeholder="500"
                        useStaticLabel={true}
                      />
                    </div>

                    {/* Row 3: Type-specific fields */}
                    {currentRoomType === ROOM_TYPES.SOLO ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                         <Input
                          label="Bed Count"
                          id={`propertyConfig.rooms[${index}].capacity`}
                          type="number"
                          register={register}
                          errors={errors}
                          watch={watch}
                          min="1"
                          required
                          placeholder="1"
                          useStaticLabel={true}
                        />
                        <Input
                          label="Total Room Capacity"
                          id={`propertyConfig.rooms[${index}].availableSlots`}
                          type="number"
                          register={register}
                          errors={errors}
                          watch={watch}
                          min="1"
                          required
                          placeholder="1"
                          useStaticLabel={true}
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Bed Count"
                          id={`propertyConfig.rooms[${index}].capacity`}
                          type="number"
                          register={register}
                          errors={errors}
                          watch={watch}
                          min="1"
                          required
                          placeholder="1"
                          useStaticLabel={true}
                        />
                        <Input
                          label="Total Room Capacity"
                          id={`propertyConfig.rooms[${index}].availableSlots`}
                          type="number"
                          register={register}
                          errors={errors}
                          watch={watch}
                          min="1"
                          required
                          placeholder="2"
                          useStaticLabel={true}
                        />
                      </div>
                    )}

                    {/* Bathroom Arrangement */}
                    <div className="space-y-2">
                      <label className="block text-[15px] font-medium text-text-primary dark:text-gray-100">
                        <span className="flex items-center gap-2">
                          <Bath className="w-4 h-4" />
                          Bathroom Arrangement <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Select the bathroom setup for this specific room
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {bathroomOptions.map(option => {
                          const isSelected = currentBathroom === option.value;
                          return (
                            <label
                              key={option.value}
                              className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-primary/40 dark:hover:border-primary/40 bg-white dark:bg-gray-800'
                              }`}
                            >
                              <input
                                type="radio"
                                {...register(`propertyConfig.rooms[${index}].bathroomArrangement`, { required: true })}
                                value={option.value}
                                className="mt-0.5 accent-primary"
                              />
                              <div className="flex items-start gap-2">
                                <span className="mt-0.5 flex-shrink-0">{option.icon}</span>
                                <div>
                                  <p className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-gray-800 dark:text-gray-200'}`}>
                                    {option.label}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      {errors?.propertyConfig?.rooms?.[index]?.bathroomArrangement && (
                        <p className="mt-1 text-xs text-red-500 font-medium">
                          Bathroom arrangement is required
                        </p>
                      )}
                    </div>

                    {/* Room Amenities */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h6 className="font-medium text-gray-900 dark:text-white mb-0.5">Room Amenities</h6>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            Amenities specific to this room (bathroom handled above)
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectAllRoomAmenities(index, currentRoomType)}
                          className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
                        >
                          {getApplicableAmenities(currentRoomType).every(a => (watch(`propertyConfig.rooms[${index}].amenities`) || []).includes(a.value)) ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-2">
                        {getApplicableAmenities(currentRoomType).map((amenity) => (
                          <Checkbox
                            key={amenity.value}
                            id={`propertyConfig.rooms[${index}].amenities`}
                            label={amenity.label}
                            value={amenity.value}
                            register={register}
                            watch={watch}
                          />
                        ))}

                        {/* Custom amenities */}
                        {watch(`propertyConfig.rooms[${index}].amenities`)
                          ?.filter((a: string) => !getApplicableAmenities(currentRoomType).some(p => p.value === a))
                          .map((customAmenity: string) => (
                            <Checkbox
                              key={customAmenity}
                              id={`propertyConfig.rooms[${index}].amenities`}
                              label={customAmenity.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                              value={customAmenity}
                              register={register}
                              watch={watch}
                            />
                          ))}
                      </div>

                      <div className="mt-4">
                        <Button
                          type="button"
                          outline
                          onClick={() => handleAddCustomAmenity(index)}
                          className="text-sm flex items-center gap-1"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Add Custom Amenity
                        </Button>
                      </div>
                    </div>

                    {/* Room Description */}
                    <Textarea
                      label="Room Description"
                      id={`propertyConfig.rooms[${index}].description`}
                      register={register}
                      errors={errors}
                      watch={watch}
                      required
                      rows={3}
                      placeholder="Describe this room... Include features, amenities, and any special notes."
                    />
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 italic">
                      Take note: A detailed description helps students find exactly what they’re looking for.
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Tips Banner */}
      <motion.div
        className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Room Configuration Tips</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              • Each card above represents <strong>one specific room</strong> in your property<br />
              • Use the <strong>Bathroom Arrangement</strong> question to specify each room's CR setup<br />
              • The number of rooms is set in the previous step — use <strong>Apply to All</strong> to speed up setup<br />
              • Be specific about amenities to attract the right tenants
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
            onChange={(e: any) => setCustomAmenityText(e.target.value)}
            placeholder="e.g., Smart TV, Microwave"
            required
          />
          <div className="flex space-x-2 justify-end">
            <Button type="button" outline onClick={() => setShowCustomAmenityModal(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCustomAmenitySubmit} disabled={!customAmenityText.trim()}>
              Add Amenity
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoomConfigStep;
