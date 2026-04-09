import React, { useState, useEffect } from 'react';
import Input from '../inputs/Input';
import Textarea from '../inputs/Textarea';
import Checkbox from '../inputs/Checkbox';
import Button from '../common/Button';
import { Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import { Plus, Minus, Bed, Bath, Users, CheckCircle, PlusCircle, Loader2, ShowerHead, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROOM_TYPES, ROOM_TYPE_LABELS } from '@/data/roomTypes';
import { 
  BATHROOM_ARRANGEMENTS, 
  BATHROOM_ARRANGEMENT_LABELS, 
  roomAmenities, 
  bedTypeOptions as CENTRAL_BED_TYPES 
} from '@/data/roomAmenities';
import Modal from '../modals/Modal';
import { cn } from '@/utils/helper';

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
  availableSlots: '1',
  reservationFee: '500',
  description: '',
  amenities: [],
});

// react-select shared classNames
const selectClassNames = {
  control: (state: any) =>
    `!bg-white dark:!bg-gray-800 !border ${state.isFocused ? '!border-primary !ring-1 !ring-primary shadow-lg shadow-primary/10' : '!border-gray-200 dark:!border-gray-700'} !rounded-2xl !p-[5px] !shadow-sm transition-all text-[15px]`,
  singleValue: () => `!text-text-primary dark:!text-gray-100 font-bold`,
  menu: () => `!bg-white dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-2xl !rounded-2xl !mt-2 z-[60] overflow-hidden`,
  menuList: () => `!p-0 !bg-white dark:!bg-gray-800`,
  option: (state: any) =>
    `!cursor-pointer ${state.isSelected ? '!bg-primary/10 !text-primary font-black' : state.isFocused ? '!bg-gray-100 dark:!bg-gray-700 !text-text-primary dark:!text-gray-100' : '!bg-transparent dark:!bg-transparent !text-text-primary dark:!text-gray-100'} !px-4 !py-3 !text-xs uppercase tracking-widest transition-colors`,
};

const roomTypeOptions = [
  { value: ROOM_TYPES.SOLO, label: ROOM_TYPE_LABELS.SOLO },
  { value: ROOM_TYPES.BEDSPACE, label: ROOM_TYPE_LABELS.BEDSPACE },
];

const bathroomOptions = [
  {
    value: BATHROOM_ARRANGEMENTS.PRIVATE,
    icon: <ShowerHead className="w-5 h-5 text-blue-500" />,
    label: 'Own private CR',
    description: 'Room has its own dedicated bathroom',
  },
  {
    value: BATHROOM_ARRANGEMENTS.SHARED_OCCUPANTS,
    icon: <Bath className="w-5 h-5 text-indigo-500" />,
    label: 'Shared CR (Occupants)',
    description: 'Bathroom shared by beds in this unit',
  },
  {
    value: BATHROOM_ARRANGEMENTS.COMMON,
    icon: <Bath className="w-5 h-5 text-gray-400" />,
    label: 'Common Bathroom',
    description: "Uses the building's main shared CR",
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
  
  // Watch for changes and sync slots
  useEffect(() => {
    const subscription = watch((value: any, { name }: { name?: string }) => {
      if (name?.startsWith('propertyConfig.rooms')) {
        const indexMatch = name.match(/rooms\[(\d+)\]/);
        if (indexMatch) {
          const index = parseInt(indexMatch[1], 10);
          const room = value.propertyConfig?.rooms?.[index];
          if (!room) return;

          const bedType = room.bedType;
          const bedCountNum = parseInt(room.capacity || '1', 10);
          const multiplier = (bedType === 'Double' || bedType === 'Bunk Bed') ? 2 : 1;
          const calculatedTotalSlots = isNaN(bedCountNum) ? 0 : bedCountNum * multiplier;

          if (name.endsWith('.capacity') || name.endsWith('.bedType') || name.endsWith('.roomType')) {
            setValue(`propertyConfig.rooms[${index}].availableSlots`, calculatedTotalSlots.toString());
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

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
      const customAmenity = customAmenityText.trim().replace(/\s+/g, '_');
      if (!updatedRooms[selectedRoomIndex].amenities.includes(customAmenity)) {
        updatedRooms[selectedRoomIndex].amenities.push(customAmenity);
        setValue('propertyConfig.rooms', updatedRooms);
      }
      setShowCustomAmenityModal(false);
    }
  };

  const getBedTypeOptions = (roomType: string) => {
    if (roomType === ROOM_TYPES.SOLO) {
      return CENTRAL_BED_TYPES.filter(o => o.value !== 'Bunk Bed');
    }
    return CENTRAL_BED_TYPES.filter(o => o.value === 'Single' || o.value === 'Bunk Bed');
  };

  const getApplicableAmenities = (roomType: string) =>
    roomAmenities.filter(a => !a.applicableTo || a.applicableTo.includes(roomType));

  const handleRoomTypeChange = (index: number, newRoomType: string) => {
    setLoadingIndices(prev => [...prev, index]);
    setValue(`propertyConfig.rooms[index].roomType`, newRoomType);
    setTimeout(() => {
      setLoadingIndices(prev => prev.filter(i => i !== index));
    }, 400);
  };

  const handleBulkAssign = () => {
    const currentRooms = getValues('propertyConfig.rooms');
    const updatedRooms = currentRooms.map((room: any) => ({
      ...room,
      roomType: bulkRoomType,
      bedType: 'Single',
      amenities: [],
    }));
    setValue('propertyConfig.rooms', updatedRooms);
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <motion.div
        className="bg-gradient-to-r from-blue-500/10 to-transparent dark:from-blue-500/20 rounded-2xl p-6 border border-blue-500/20 dark:border-blue-500/30 shadow-sm"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Bed className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm">Room Configuration</h3>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">
              Specify inventory, pricing, and room-level details
            </p>
          </div>
        </div>
      </motion.div>

      {/* Header Controls */}
      <div className="flex flex-col gap-8 py-6 px-4">
        {/* Row 1: Title & Main Action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-sm">
              <Users size={22} />
            </div>
            <div className="flex flex-col">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white leading-none">Individual Room Inventory</h4>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2 opacity-60">
                {fields.length} {fields.length === 1 ? 'Active Unit' : 'Active Units'}
              </span>
            </div>
          </div>
          <Button 
            type="button" 
            onClick={() => append(defaultRoom())} 
            className="flex items-center justify-center text-[10px] font-black uppercase py-3.5 px-7 gap-2 shadow-lg shadow-primary/10 bg-emerald-600 hover:bg-emerald-700 border-none text-white transition-all transform hover:scale-[1.02] active:scale-95 w-fit h-fit ml-auto"
          >
            <Plus size={14} /> 
            Add New Unit
          </Button>
        </div>

        <div className="h-[1px] bg-gray-100 dark:bg-gray-800/60 w-full" />

        {/* Row 2: Bulk Operations */}
        <div className="space-y-6">
          <div className="flex flex-col xl:flex-row xl:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary/20 rounded-full" />
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 whitespace-nowrap">Bulk Configure:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 flex-1">
              {/* Controls Group */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                <div className="flex-1 min-w-[200px]">
                  <ReactSelect
                    options={roomTypeOptions}
                    value={roomTypeOptions.find(o => o.value === bulkRoomType)}
                    onChange={(val: any) => setBulkRoomType(val?.value)}
                    classNames={selectClassNames}
                    isSearchable={false}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    styles={{ 
                      menuPortal: base => ({ ...base, zIndex: 9999 }),
                      control: (base) => ({ ...base, minHeight: '52px' })
                    }}
                    instanceId="bulk-room-type"
                  />
                </div>
                <Button 
                  type="button" 
                  outline 
                  onClick={handleBulkAssign} 
                  className="text-[10px] font-black uppercase py-4 px-6 whitespace-nowrap border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 h-[52px] rounded-2xl"
                >
                  Apply to All
                </Button>
                <Button 
                  type="button" 
                  outline 
                  onClick={() => {
                    // Reset to a single empty room
                    const emptyRooms = [defaultRoom()];
                    setValue('propertyConfig.rooms', emptyRooms);
                  }} 
                  className="text-[10px] font-black uppercase py-4 px-6 whitespace-nowrap border-rose-100 dark:border-rose-900/30 text-rose-500 bg-rose-50/30 dark:bg-rose-500/5 hover:bg-rose-100 dark:hover:bg-rose-500/10 h-[52px] rounded-2xl"
                >
                  Clear Units
                </Button>
              </div>
            </div>
          </div>

          {/* Tip Box */}
          <div className="bg-sky-50/50 dark:bg-sky-500/5 px-6 py-4 rounded-2xl border border-sky-100/50 dark:border-sky-500/10 flex items-center gap-4 mx-2">
            <div className="p-2 bg-sky-500/10 rounded-xl text-sky-600">
              <Info size={18} />
            </div>
            <p className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-widest leading-relaxed">
              Tip: Use the bulk configuration tools to quickly categorize type, bed layout, and basic amenities across all active units at once.
            </p>
          </div>
        </div>
      </div>

      {/* Room List grid */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {fields.map((field, index) => {
            const currentRoomType = watch(`propertyConfig.rooms[${index}].roomType`) || ROOM_TYPES.SOLO;
            const currentBathroom = watch(`propertyConfig.rooms[${index}].bathroomArrangement`) || BATHROOM_ARRANGEMENTS.PRIVATE;
            const isLoading = loadingIndices.includes(index);

            return (
              <motion.div
                key={field.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={cn(
                  "bg-white dark:bg-gray-800 rounded-3xl border transition-all duration-500 overflow-hidden shadow-sm",
                  isLoading ? "border-primary/50 opacity-80" : "border-gray-200 dark:border-gray-700 hover:border-primary/30"
                )}
              >
                {/* Card Title Bar */}
                <div className="px-8 py-5 bg-gray-50/50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center font-black text-primary shadow-sm text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h5 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-[11px]">Room Details</h5>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{currentRoomType} Category</p>
                    </div>
                  </div>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)} className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"><Minus className="w-4 h-4" /></button>
                  )}
                </div>

                <div className="p-8">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="w-10 h-10 text-primary animate-spin" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Updating Configuration...</p>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {/* Grid Row 1: Core Specs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                         <div>
                          <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Room Type</label>
                          <Controller
                            name={`propertyConfig.rooms[${index}].roomType`}
                            control={control}
                            render={({ field }) => (
                              <ReactSelect
                                {...field}
                                options={roomTypeOptions}
                                value={roomTypeOptions.find(o => o.value === field.value)}
                                onChange={(val: any) => {
                                  field.onChange(val?.value);
                                  handleRoomTypeChange(index, val?.value);
                                }}
                                classNames={selectClassNames}
                                isSearchable={false}
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                instanceId={`room-type-${index}`}
                              />
                            )}
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Bed Type</label>
                          <Controller
                            name={`propertyConfig.rooms[${index}].bedType`}
                            control={control}
                            render={({ field }) => {
                              const opts = getBedTypeOptions(currentRoomType);
                              return (
                                <ReactSelect
                                  {...field}
                                  options={opts}
                                  value={opts.find(o => o.value === field.value)}
                                  onChange={(val: any) => field.onChange(val?.value)}
                                  classNames={selectClassNames}
                                  isSearchable={false}
                                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                  styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                  instanceId={`bed-type-${index}`}
                                 />
                               );
                             }}
                           />
                        </div>

                        <Input label="Price (PHP)" id={`propertyConfig.rooms[${index}].price`} type="number" register={register} errors={errors} watch={watch} required placeholder="Monthly rent" useStaticLabel />
                        <Input label="Res. Fee" id={`propertyConfig.rooms[${index}].reservationFee`} type="number" register={register} errors={errors} watch={watch} required useStaticLabel />
                      </div>

                      {/* Row 2: Capacity & Size */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl border border-gray-100 dark:border-gray-700/50">
                        <Input label="Bed Count" id={`propertyConfig.rooms[${index}].capacity`} type="number" register={register} errors={errors} watch={watch} required useStaticLabel />
                        <Input label={currentRoomType === ROOM_TYPES.SOLO ? "Max Occupants" : "Total Beds"} id={`propertyConfig.rooms[${index}].availableSlots`} type="number" register={register} errors={errors} watch={watch} required useStaticLabel />
                        <Input label="Size (Sqm)" id={`propertyConfig.rooms[${index}].size`} type="number" register={register} errors={errors} watch={watch} step="0.5" placeholder="e.g. 15" useStaticLabel />
                      </div>

                      {/* Bathroom Section */}
                      <div>
                        <h6 className="text-[11px] font-black uppercase tracking-widest text-primary mb-5 flex items-center gap-2"><ShowerHead size={14} />Bathroom Setup</h6>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {bathroomOptions.map(option => {
                            const isSelected = currentBathroom === option.value;
                            return (
                              <label key={option.value} className={cn("flex flex-col items-center text-center p-6 rounded-3xl border-2 transition-all cursor-pointer group", isSelected ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-lg" : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/20")}>
                                <input type="radio" {...register(`propertyConfig.rooms[${index}].bathroomArrangement`, { required: true })} value={option.value} className="hidden" />
                                <div className={cn("mb-3 p-3 rounded-2xl transition-all", isSelected ? "bg-primary text-white scale-110" : "bg-gray-50 dark:bg-gray-900 text-gray-400 group-hover:scale-110")}>{option.icon}</div>
                                <span className={cn("text-[10px] font-black uppercase tracking-widest mb-1", isSelected ? "text-primary" : "text-gray-500")}>{option.label}</span>
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{option.description}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Amenities Section */}
                      <div>
                        <h6 className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-5">Unit-Specific Amenities</h6>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-1">
                          {getApplicableAmenities(currentRoomType).map((amenity) => (
                            <div key={amenity.value} className="py-2 border-b border-gray-50 dark:border-gray-800">
                               <Checkbox id={`propertyConfig.rooms[${index}].amenities`} label={amenity.label} value={amenity.value} register={register} watch={watch} className="text-[12px] font-bold" />
                            </div>
                          ))}
                          {watch(`propertyConfig.rooms[${index}].amenities`)?.filter((a: any) => !getApplicableAmenities(currentRoomType).some(p => p.value === a)).map((ca: string) => (
                             <div key={ca} className="py-2 border-b border-gray-50 dark:border-gray-800">
                               <Checkbox id={`propertyConfig.rooms[${index}].amenities`} label={ca.replace(/_/g, ' ')} value={ca} register={register} watch={watch} className="text-[12px] font-bold text-primary" />
                             </div>
                          ))}
                        </div>
                        <button type="button" onClick={() => handleAddCustomAmenity(index)} className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-3 transition-all"><PlusCircle size={14} /> Add Additional Feature</button>
                      </div>

                        <Textarea 
                          label="Unit Description" 
                          id={`propertyConfig.rooms[${index}].description`} 
                          register={register} 
                          errors={errors} 
                          watch={watch} 
                          required 
                          rows={3} 
                          placeholder="Describe the vibe of this unit..." 
                          validationRules={{
                             minLength: { value: 50, message: "Room description must be at least 50 characters" }
                          }}
                        />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Info Tip */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-sky-50 dark:bg-sky-900/20 rounded-2xl p-6 border border-sky-100 dark:border-sky-800/50 flex gap-4">
        <div className="p-2 bg-sky-500/10 rounded-xl h-fit text-sky-600"><Info size={20} /></div>
        <div>
          <h5 className="text-[11px] font-black uppercase tracking-widest text-sky-800 dark:text-sky-400 mb-1">Standardized Inventory</h5>
          <p className="text-xs font-bold text-sky-700 dark:text-sky-300 leading-relaxed max-w-2xl">
            Room categories (Solo vs. Bedspace) and Bed Types are used by the Heuristic Scoring Algorithm to match you with student preferences. Be precise about the "Total Capacity" to ensure your availability counts are accurate.
          </p>
        </div>
      </motion.div>

      {/* Custom Amenity Modal */}
      <Modal isOpen={showCustomAmenityModal} onClose={() => setShowCustomAmenityModal(false)} title="Add Room Feature" width="sm">
        <div className="space-y-6 p-2">
          <Input label="Feature Title" id="customAmenity" type="text" value={customAmenityText} onChange={(e: any) => setCustomAmenityText(e.target.value)} placeholder="e.g. Balcony, Study Corner" required />
          <div className="flex gap-4">
            <Button type="button" outline onClick={() => setShowCustomAmenityModal(false)} className="flex-1 uppercase text-[10px] font-black">Cancel</Button>
            <Button type="button" onClick={handleCustomAmenitySubmit} disabled={!customAmenityText.trim()} className="flex-1 uppercase text-[10px] font-black shadow-lg shadow-primary/20">Add to Unit</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoomConfigStep;
