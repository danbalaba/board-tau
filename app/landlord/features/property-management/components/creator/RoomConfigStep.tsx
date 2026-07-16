'use client';

import React, { useState, useEffect } from 'react';
import Input from '@/components/inputs/Input';
import Textarea from '@/components/inputs/Textarea';
import Checkbox from '@/components/inputs/Checkbox';
import Button from '@/components/common/Button';
import { Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import { Plus, Minus, Bed, Bath, Users, CheckCircle, PlusCircle, Loader2, ShowerHead, Info, HelpCircle, Copy, ClipboardPaste, CheckCircle2, Wand2, LayoutGrid } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROOM_TYPES, ROOM_TYPE_LABELS } from '@/data/roomTypes';
import {
  BATHROOM_ARRANGEMENTS,
  BATHROOM_ARRANGEMENT_LABELS,
  roomAmenities,
  bedTypeOptions as CENTRAL_BED_TYPES
} from '@/data/roomAmenities';
import Modal from '@/components/modals/Modal';
import CustomAmenityModal from './CustomAmenityModal';
import { cn } from '@/utils/helper';
import { RoomType } from '../../hooks/use-property-creator-logic';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import BulkConfigureModal from './BulkConfigureModal';

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
  roomType: '',
  bathroomArrangement: '',
  price: '',
  bedType: '',
  bedCount: '',
  capacity: '',
  size: '',
  availableSlots: '',
  reservationFee: '',
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
    label: 'Own Private CR',
    description: 'Dedicated bathroom inside the room unit',
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
  const toast = useResponsiveToast();
  const [showCustomAmenityModal, setShowCustomAmenityModal] = useState(false);
  const [activeRoomIndex, setActiveRoomIndex] = useState<number | null>(null);
  const [copiedConfig, setCopiedConfig] = useState<any>(null);
  const [justCopied, setJustCopied] = useState<number | null>(null);

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCopy = (index: number) => {
    const roomData = getValues(`propertyConfig.rooms[${index}]`);
    setCopiedConfig(roomData);
    setJustCopied(index);
    toast.success(`Room ${index + 1} configuration copied!`);
    setTimeout(() => setJustCopied(null), 2000);
  };

  const handlePaste = (index: number) => {
    if (!copiedConfig) {
      toast.info("Please copy a room configuration first.");
      return;
    }

    Object.entries(copiedConfig).forEach(([key, value]) => {
      setValue(`propertyConfig.rooms[${index}].${key}`, value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    });
    toast.success(`Settings applied to Room ${index + 1}!`);
  };

  const handleBulkApply = (template: any) => {
    setIsLoading(true);
    const rooms = getValues('propertyConfig.rooms') || [];

    const updatedRooms = rooms.map((room: any) => {
      const bedCount = parseInt(template.bedCount) || 0;
      const multiplier = template.bedType === 'BUNK' ? 2 : 1;
      const capacity = (bedCount * multiplier).toString();

      return {
        ...room,
        ...template,
        capacity: capacity,
        availableSlots: capacity,
      };
    });

    setValue('propertyConfig.rooms', updatedRooms, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });

    setTimeout(() => {
      setIsLoading(false);
      setShowBulkModal(false);
      toast.success(`Successfully configured all ${rooms.length} units!`);
    }, 800);
  };

  // Auto-scroll to new room when added
  const prevFieldsLength = React.useRef(fields.length);
  useEffect(() => {
    if (fields.length > prevFieldsLength.current) {
      setTimeout(() => {
        const lastRoomId = `room-card-${fields.length - 1}`;
        const element = document.getElementById(lastRoomId);
        if (element) {
          // Use scrollIntoView for a more reliable "glide" effect
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Add a premium success highlight
          element.classList.add('animate-glow-success');
          setTimeout(() => element.classList.remove('animate-glow-success'), 2000);
        }
      }, 150); // Slight delay to ensure the DOM has rendered the new card
    }
    prevFieldsLength.current = fields.length;
  }, [fields.length]);

  const getBedTypeOptions = (roomType: string) => {
    if (roomType === ROOM_TYPES.SOLO) {
      return CENTRAL_BED_TYPES.filter(o => ['SINGLE', 'DOUBLE', 'QUEEN'].includes(o.value));
    }
    if (roomType === ROOM_TYPES.BEDSPACE) {
      return CENTRAL_BED_TYPES.filter(o => ['SINGLE', 'BUNK'].includes(o.value));
    }
    return CENTRAL_BED_TYPES;
  };

  const handleRoomTypeChange = (index: number, newType: string) => {
    const isSolo = newType === ROOM_TYPES.SOLO;
    const bedType = isSolo ? 'SINGLE' : 'BUNK';
    const bedCount = isSolo ? '1' : '1'; // Default to 1 bed for both initially

    // Calculate capacity based on 1 bunk bed = 2 pax
    const multiplier = bedType === 'BUNK' ? 2 : 1;
    const capacity = (parseInt(bedCount) * multiplier).toString();

    setValue(`propertyConfig.rooms[${index}].bedType`, bedType);
    setValue(`propertyConfig.rooms[${index}].bedCount`, bedCount);
    setValue(`propertyConfig.rooms[${index}].capacity`, capacity);
    setValue(`propertyConfig.rooms[${index}].availableSlots`, capacity);
  };

  useEffect(() => {
    const subscription = watch((value: any, { name }: { name?: string }) => {
      // Check if either bedCount or bedType changed
      if (name?.includes('bedCount') || name?.includes('bedType')) {
        const indexMatch = name.match(/rooms\[(\d+)\]/);
        if (indexMatch) {
          const index = parseInt(indexMatch[1]);
          const room = value?.propertyConfig?.rooms?.[index];

          if (room && room.bedCount !== undefined && room.bedType !== undefined) {
            const multiplier = room.bedType === 'BUNK' ? 2 : 1;
            const calculatedCapacity = (parseInt(room.bedCount) || 0) * multiplier;

            setValue(`propertyConfig.rooms[${index}].capacity`, calculatedCapacity.toString());
            setValue(`propertyConfig.rooms[${index}].availableSlots`, calculatedCapacity.toString());
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const getApplicableAmenities = (roomType: string) => {
    return roomAmenities.filter(a => !a.applicableTo || a.applicableTo.includes(roomType as any));
  };

  return (
    <div className="space-y-12">
      {/* Intro Header */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-700 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 rounded-xl shadow-inner">
            <Bed className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm">Room Setup</h3>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">
              Specify Room Setup, pricing, and room-level details
            </p>
          </div>
        </div>
      </motion.div>

      {/* Header Controls */}
      <div className="flex flex-col gap-8 py-6 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
              <Users size={22} />
            </div>
            <div className="flex flex-col">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white leading-none">Individual Room Setup</h4>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2 opacity-60">
                {fields.length} {fields.length === 1 ? 'Active Unit' : 'Active Units'}
              </span>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              const nextTotal = fields.length + 1;
              setValue('propertyConfig.totalRooms', nextTotal.toString(), { shouldValidate: true });
              append(defaultRoom());
              toast.success(`Unit ${nextTotal} added to inventory!`);
            }}
            className="flex items-center justify-center text-[10px] font-black uppercase py-3.5 px-7 gap-2 shadow-lg shadow-primary/10 bg-emerald-600 hover:bg-emerald-700 border-none text-white transition-all transform hover:scale-[1.02] active:scale-95 w-fit h-fit ml-auto"
          >
            <Plus size={14} />
            Add New Unit
          </Button>
        </div>

        <div className="h-[1px] bg-gray-100 dark:bg-gray-800/60 w-full" />

        <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[2rem] gap-6 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-primary/10 rounded-2xl text-primary">
              <Wand2 size={28} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Bulk Configuration Magic</h4>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Apply the same setup to all active rooms in one click</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-3 px-10 py-4 bg-gray-900 dark:bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 group"
          >
            <LayoutGrid size={16} className="group-hover:rotate-12 transition-transform" />
            Configure All {fields.length} Units
          </button>
        </div>
      </div>

      {/* Individual Room Cards */}
      <div className="grid grid-cols-1 gap-12">
        {fields.map((field, index) => {
          const currentRoomType = watch(`propertyConfig.rooms[${index}].roomType`);
          const currentBathroom = watch(`propertyConfig.rooms[${index}].bathroomArrangement`);
          const roomError = errors?.propertyConfig?.rooms?.[index];

          return (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-3xl border transition-all duration-500 overflow-hidden shadow-sm",
                roomError ? "border-rose-500 ring-4 ring-rose-500/5 shadow-rose-500/10" : "border-gray-200 dark:border-gray-700 hover:border-primary/30"
              )}
              id={`room-card-${index}`}
            >
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

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-100 dark:border-gray-700 shadow-sm mr-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(index)}
                      className={cn(
                        "p-2 rounded-lg transition-all flex items-center gap-2",
                        justCopied === index ? "text-emerald-500 bg-emerald-500/10" : "text-gray-400 hover:text-primary hover:bg-primary/5"
                      )}
                      title="Copy configuration"
                    >
                      {justCopied === index ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      {justCopied === index && <span className="text-[10px] font-black uppercase tracking-widest">Copied!</span>}
                    </button>

                    <div className="w-[1px] h-4 bg-gray-100 dark:bg-gray-700 mx-1" />

                    <button
                      type="button"
                      onClick={() => handlePaste(index)}
                      disabled={!copiedConfig}
                      className={cn(
                        "p-2 rounded-lg transition-all flex items-center gap-2",
                        !copiedConfig ? "opacity-30 cursor-not-allowed" : "text-gray-400 hover:text-amber-500 hover:bg-amber-500/5"
                      )}
                      title={copiedConfig ? "Paste configuration" : "Copy a room first to paste"}
                    >
                      <ClipboardPaste size={16} />
                      {copiedConfig && <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Paste</span>}
                    </button>
                  </div>

                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextTotal = fields.length - 1;
                        setValue('propertyConfig.totalRooms', nextTotal.toString(), { shouldValidate: true });
                        remove(index);
                        toast.error(`Unit ${index + 1} removed from inventory.`);
                      }}
                      className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors shadow-sm"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div id={`propertyConfig.rooms[${index}].roomType`}>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Room Type</label>
                      <Controller
                        name={`propertyConfig.rooms[${index}].roomType`}
                        control={control}
                        rules={{ required: "Room type is required" }}
                        render={({ field }) => (
                          <ReactSelect
                            {...field}
                            options={roomTypeOptions}
                            value={roomTypeOptions.find(o => o.value === field.value)}
                            onChange={(val: any) => {
                              field.onChange(val?.value);
                              handleRoomTypeChange(index, val?.value);
                            }}
                            placeholder="Select room type..."
                            classNames={selectClassNames}
                            isSearchable={false}
                            instanceId={`room-type-${index}`}
                          />
                        )}
                      />
                      {errors?.propertyConfig?.rooms?.[index]?.roomType && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase tracking-widest">{errors.propertyConfig.rooms[index].roomType.message}</p>
                      )}
                    </div>

                    <div id={`propertyConfig.rooms[${index}].bedType`}>
                      <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Bed Type</label>
                      <Controller
                        name={`propertyConfig.rooms[${index}].bedType`}
                        control={control}
                        rules={{ required: "Bed type is required" }}
                        render={({ field }) => {
                          const opts = getBedTypeOptions(currentRoomType);
                          return (
                            <ReactSelect
                              {...field}
                              options={opts}
                              value={opts.find(o => o.value === field.value)}
                              onChange={(val: any) => field.onChange(val?.value)}
                              placeholder="Select bed type..."
                              classNames={selectClassNames}
                              isSearchable={false}
                              instanceId={`bed-type-${index}`}
                            />
                          );
                        }}
                      />
                      {errors?.propertyConfig?.rooms?.[index]?.bedType && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase tracking-widest">{errors.propertyConfig.rooms[index].bedType.message}</p>
                      )}
                    </div>

                    <Input
                      label="Price (PHP)"
                      id={`propertyConfig.rooms[${index}].price`}
                      name={`propertyConfig.rooms[${index}].price`}
                      type="number"
                      register={register}
                      errors={errors}
                      required
                      min={500}
                      max={50000}
                      placeholder="e.g. 8500"
                      useStaticLabel
                      onKeyDown={(e: any) => {
                        if (['e', 'E'].includes(e.key)) e.preventDefault();
                      }}
                      validationRules={{
                        required: "Price is required",
                        min: { value: 500, message: "Min 500 PHP" },
                        max: { value: 50000, message: "Max 50,000 PHP" }
                      }}
                    />
                    <Input
                      label="Reservation Fee"
                      id={`propertyConfig.rooms[${index}].reservationFee`}
                      name={`propertyConfig.rooms[${index}].reservationFee`}
                      type="number"
                      register={register}
                      errors={errors}
                      required
                      min={500}
                      max={50000}
                      placeholder="e.g. 500"
                      useStaticLabel
                      onKeyDown={(e: any) => {
                        if (['e', 'E'].includes(e.key)) e.preventDefault();
                      }}
                      validationRules={{
                        required: "Fee is required",
                        min: { value: 500, message: "Min 500 PHP" },
                        max: { value: 50000, message: "Max 50,000 PHP" }
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-3xl border border-gray-100 dark:border-gray-700/50">
                    <Input
                      label="Bed Count"
                      id={`propertyConfig.rooms[${index}].bedCount`}
                      name={`propertyConfig.rooms[${index}].bedCount`}
                      type="number"
                      register={register}
                      errors={errors}
                      required
                      min={1}
                      max={10}
                      placeholder="e.g. 1"
                      useStaticLabel
                      validationRules={{
                        min: { value: 1, message: 'Must be 1 to 10 beds' },
                        max: { value: 10, message: 'Must be 1 to 10 beds' }
                      }}
                    />
                    <div className="space-y-2">
                       <label className={cn(
                        "text-[10px] font-black uppercase tracking-widest ml-1",
                        watch(`propertyConfig.rooms[${index}].bedCount`) !== '' && (parseInt(watch(`propertyConfig.rooms[${index}].bedCount`)) < 1 || parseInt(watch(`propertyConfig.rooms[${index}].bedCount`)) > 10) ? "text-rose-500" : "text-primary"
                      )}>Total Guests Allowed</label>
                      <div className="relative group">
                        <div className={cn(
                          "w-full rounded-2xl p-4 text-sm font-black flex items-center justify-between",
                          watch(`propertyConfig.rooms[${index}].bedCount`) !== '' && (parseInt(watch(`propertyConfig.rooms[${index}].bedCount`)) < 1 || parseInt(watch(`propertyConfig.rooms[${index}].bedCount`)) > 10)
                            ? "bg-rose-500/5 border border-rose-500/20 text-rose-500"
                            : "bg-primary/5 border border-primary/20 text-primary"
                        )}>
                          {watch(`propertyConfig.rooms[${index}].bedCount`) !== '' && (parseInt(watch(`propertyConfig.rooms[${index}].bedCount`)) < 1 || parseInt(watch(`propertyConfig.rooms[${index}].bedCount`)) > 10)
                            ? '-- PAX'
                            : `${watch(`propertyConfig.rooms[${index}].capacity`) || '0'} PAX`}
                        </div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <Users size={16} className={cn(
                            "opacity-40",
                            watch(`propertyConfig.rooms[${index}].bedCount`) !== '' && (parseInt(watch(`propertyConfig.rooms[${index}].bedCount`)) < 1 || parseInt(watch(`propertyConfig.rooms[${index}].bedCount`)) > 10) ? "text-rose-500" : "text-primary"
                          )} />
                        </div>
                      </div>
                      <p className={cn(
                        "text-[8px] font-bold uppercase tracking-widest ml-1",
                        watch(`propertyConfig.rooms[${index}].bedCount`) !== '' && (parseInt(watch(`propertyConfig.rooms[${index}].bedCount`)) < 1 || parseInt(watch(`propertyConfig.rooms[${index}].bedCount`)) > 10) ? "text-rose-400" : "text-gray-400"
                      )}>Auto-calculated based on beds</p>
                    </div>
                    <Input
                      label="Size (Sqm)"
                      id={`propertyConfig.rooms[${index}].size`}
                      name={`propertyConfig.rooms[${index}].size`}
                      type="number"
                      register={register}
                      errors={errors}
                      step="0.1"
                      placeholder="e.g. 15"
                      useStaticLabel
                      validationRules={{
                        required: "Size is required",
                        min: { value: 5, message: "Min 5 sqm" },
                        max: { value: 100, message: "Max 100 sqm" }
                      }}
                    />
                  </div>

                  <div>
                    {/* Normalize bracket path to dot path, same as Input.tsx getError() */}
                    {(() => {
                      const fieldPath = `propertyConfig.rooms[${index}].bathroomArrangement`;
                      const normalizedPath = fieldPath.replace(/\[(\d+)\]/g, '.$1');
                      const bathroomError = normalizedPath.split('.').reduce((obj: any, key: string) => obj && obj[key], errors);
                      return (
                        <>
                          <h6 className={cn(
                            "text-[11px] font-black uppercase tracking-widest mb-5 flex items-center gap-2",
                            bathroomError ? "text-red-500" : "text-primary"
                          )}>
                            <ShowerHead size={14} />Bathroom Setup <span className="text-red-500">*</span>
                          </h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id={`propertyConfig.rooms[${index}].bathroomArrangement`}>
                            {bathroomOptions.map(option => {
                              const isSelected = currentBathroom === option.value;
                              const commonBathroomCount = parseInt(watch('propertyConfig.bathroomCount')) || 0;

                              // Smart disabling logic
                              let isDisabled = false;
                              let disabledMessage = "";

                              if (option.value === BATHROOM_ARRANGEMENTS.COMMON && commonBathroomCount === 0) {
                                isDisabled = true;
                                disabledMessage = "Building has no common CR";
                              }

                              return (
                                <label
                                  key={option.value}
                                  className={cn(
                                    "flex flex-col items-center text-center p-6 rounded-3xl border-2 transition-all cursor-pointer group relative overflow-hidden",
                                    isSelected
                                      ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-lg"
                                      : bathroomError && !isDisabled
                                      ? "border-red-500 bg-red-500/5 hover:border-red-400"
                                      : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/20",
                                    isDisabled && "opacity-60 cursor-not-allowed border-dashed bg-gray-50/50 dark:bg-gray-900/50"
                                  )}
                                >
                                  <input
                                    type="radio"
                                    {...register(`propertyConfig.rooms[${index}].bathroomArrangement`, { required: "Please select a bathroom setup" })}
                                    value={option.value}
                                    className="hidden"
                                    disabled={isDisabled}
                                  />
                                  <div className={cn("mb-3 p-3 rounded-2xl transition-all", isSelected ? "bg-primary text-white scale-110" : "bg-gray-50 dark:bg-gray-900 text-gray-400 group-hover:scale-110")}>
                                    {option.icon}
                                  </div>
                                  <span className={cn("text-[10px] font-black uppercase tracking-widest mb-1", isSelected ? "text-primary" : "text-gray-500")}>
                                    {option.label}
                                  </span>
                                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                                    {isDisabled ? (
                                      <span className="text-amber-600 dark:text-amber-400 font-black">{disabledMessage}</span>
                                    ) : option.description}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                          {bathroomError && (
                            <p className="text-red-500 text-[9px] font-black mt-2 ml-1 uppercase tracking-[0.1em]">
                              {(bathroomError as any)?.message || 'Please select a bathroom setup'}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <div>
                    <h6 className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-5 flex items-center justify-between">
                      Unit-Specific Amenities
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {watch(`propertyConfig.rooms[${index}].amenities`)?.length || 0} SELECTED
                      </span>
                    </h6>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-1">
                      {[
                        ...getApplicableAmenities(currentRoomType),
                        ...(watch(`propertyConfig.rooms[${index}].amenities`) || [])
                          .filter((a: string) => a.includes('|'))
                          .map((a: string) => {
                            let label = a;
                            let iconName = null;
                            
                            if (a.includes('||')) {
                              [label, iconName] = a.split('||').map(s => s.trim());
                            } else if (a.includes('|')) {
                              [label, iconName] = a.split('|').map(s => s.trim());
                            }

                            return {
                              label,
                              value: a,
                              icon: (iconName && (LucideIcons as any)[iconName]) || 
                                    (iconName && (LucideIcons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1)]) || 
                                    HelpCircle,
                              isCustom: true
                            };
                          })
                      ].map((amenity: any) => {
                        const Icon = amenity.icon;
                        return (
                          <div key={amenity.value} className={cn(
                            "py-2 border-b border-gray-50 dark:border-gray-800 transition-all",
                            amenity.isCustom && "bg-blue-50/30 dark:bg-blue-500/5 rounded-lg px-2 -ml-2"
                          )}>
                            <Checkbox
                              id={`propertyConfig.rooms[${index}].amenities`}
                              label={amenity.label}
                              value={amenity.value}
                              register={register}
                              watch={watch}
                              className={cn("text-[12px] font-bold", amenity.isCustom ? "text-blue-600" : "text-gray-700")}
                              icon={<Icon size={14} />}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-8 w-full py-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[1.5rem] flex items-center justify-center gap-3 text-gray-400 hover:text-blue-600 hover:border-blue-500/50 transition-all group shadow-sm bg-gray-50/30 dark:bg-transparent"
                      onClick={() => {
                        setActiveRoomIndex(index);
                        setShowCustomAmenityModal(true);
                      }}
                    >
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all">
                        <Plus size={14} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Custom Unit Feature</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Modal isOpen={showCustomAmenityModal} onClose={() => setShowCustomAmenityModal(false)}>
        <CustomAmenityModal
          setValue={setValue}
          getValues={getValues}
          selectedRoomIndex={activeRoomIndex !== null ? activeRoomIndex : -1}
          onClose={() => setShowCustomAmenityModal(false)}
        />
      </Modal>

      <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} width="xl" closeOnOutsideClick={false}>
        <BulkConfigureModal
          roomCount={fields.length}
          onClose={() => setShowBulkModal(false)}
          onApply={handleBulkApply}
          commonBathroomCount={parseInt(watch('propertyConfig.bathroomCount')) || 0}
        />
      </Modal>
    </div>
  );
};

export default RoomConfigStep;
