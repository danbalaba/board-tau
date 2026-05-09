'use client';
import React, { useState } from 'react';
import { 
  DollarSign, 
  Tag, 
  Maximize2, 
  ShowerHead, 
  Bath, 
  Bed, 
  Users, 
  Wand2, 
  X,
  CheckCircle2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactSelect from 'react-select';
import { cn } from '@/utils/helper';
import { ROOM_TYPES, ROOM_TYPE_LABELS } from '@/data/roomTypes';
import { 
  BATHROOM_ARRANGEMENTS, 
  BATHROOM_ARRANGEMENT_LABELS,
  bedTypeOptions as CENTRAL_BED_TYPES,
  roomAmenities as SHARED_ROOM_AMENITIES
} from '@/data/roomAmenities';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

interface BulkConfigureModalProps {
  onClose: () => void;
  onApply: (template: any) => void;
  roomCount: number;
  commonBathroomCount: number;
}

// Field error state type
interface FieldErrors {
  roomType?: string;
  price?: string;
  reservationFee?: string;
  size?: string;
  bedType?: string;
  bedCount?: string;
  bathroomArrangement?: string;
}

const selectClassNames = {
  control: (state: any) =>
    `!bg-white dark:!bg-gray-800 !border ${state.isFocused ? '!border-primary !ring-1 !ring-primary shadow-lg shadow-primary/10' : '!border-gray-200 dark:!border-gray-700'} !rounded-2xl !p-[5px] !shadow-sm transition-all text-[15px]`,
  singleValue: () => `!text-text-primary dark:!text-gray-100 font-bold`,
  menu: () => `!bg-white dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-2xl !rounded-2xl !mt-2 z-[60] overflow-hidden`,
  option: (state: any) => `!cursor-pointer ${state.isSelected ? '!bg-primary/10 !text-primary font-black' : state.isFocused ? '!bg-gray-100 dark:!bg-gray-700 !text-text-primary dark:!text-gray-100' : '!bg-transparent dark:!bg-transparent !text-text-primary dark:!text-gray-100'} !px-4 !py-3 !text-xs uppercase tracking-widest transition-colors`,
};

// Error control classes shared across all inline inputs
const errorControlClass = (hasError: boolean) =>
  cn(
    'w-full bg-gray-50 dark:bg-gray-900 border rounded-2xl p-4 text-sm font-bold transition-all outline-none',
    hasError
      ? 'border-red-500 ring-1 ring-red-500/20 focus:ring-red-500/30 focus:border-red-500'
      : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary'
  );

// Select wrapper error style
const errorSelectClass = (hasError: boolean): any => ({
  control: (state: any) =>
    cn(
      '!bg-white dark:!bg-gray-800 !border !rounded-2xl !p-[5px] !shadow-sm transition-all text-[15px]',
      hasError
        ? '!border-red-500 !ring-1 !ring-red-500/20'
        : state.isFocused
        ? '!border-primary !ring-1 !ring-primary shadow-lg shadow-primary/10'
        : '!border-gray-200 dark:!border-gray-700'
    ),
  singleValue: () => `!text-text-primary dark:!text-gray-100 font-bold`,
  menu: () => `!bg-white dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-2xl !rounded-2xl !mt-2 z-[60] overflow-hidden`,
  option: (state: any) => `!cursor-pointer ${state.isSelected ? '!bg-primary/10 !text-primary font-black' : state.isFocused ? '!bg-gray-100 dark:!bg-gray-700' : '!bg-transparent dark:!bg-transparent'} !px-4 !py-3 !text-xs uppercase tracking-widest transition-colors`,
});

const roomTypeOptions = [
  { value: ROOM_TYPES.SOLO, label: ROOM_TYPE_LABELS.SOLO },
  { value: ROOM_TYPES.BEDSPACE, label: ROOM_TYPE_LABELS.BEDSPACE },
];

const bathroomOptions = [
  {
    value: BATHROOM_ARRANGEMENTS.PRIVATE,
    icon: <ShowerHead className="w-5 h-5" />,
    label: 'Own Private CR',
    description: 'Inside room unit',
  },
  {
    value: BATHROOM_ARRANGEMENTS.COMMON,
    icon: <Bath className="w-5 h-5" />,
    label: 'Common Bathroom',
    description: "Building hallway CR",
  },
];

// Inline field error message component
const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="text-red-500 text-[9px] font-black mt-1 ml-1 uppercase tracking-[0.1em]">
      {message}
    </p>
  ) : null;

const BulkConfigureModal: React.FC<BulkConfigureModalProps> = ({ onClose, onApply, roomCount, commonBathroomCount }) => {
  const toast = useResponsiveToast();

  const [template, setTemplate] = useState({
    roomType: '',
    bedType: '',
    price: '',
    reservationFee: '',
    bedCount: '',
    size: '',
    bathroomArrangement: '',
    amenities: [] as string[],
    capacity: '0',
  });

  // Inline field error state — mirrors RoomConfigStep's React Hook Form errors
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const getBedTypeOptions = (roomType: string) => {
    if (roomType === ROOM_TYPES.SOLO) {
      return CENTRAL_BED_TYPES.filter(o => ['SINGLE', 'DOUBLE', 'QUEEN'].includes(o.value));
    }
    if (roomType === ROOM_TYPES.BEDSPACE) {
      return CENTRAL_BED_TYPES.filter(o => ['SINGLE', 'BUNK'].includes(o.value));
    }
    return CENTRAL_BED_TYPES;
  };

  const handleRoomTypeChange = (val: any) => {
    const newType = val.value;
    const isSolo = newType === ROOM_TYPES.SOLO;
    const bedType = isSolo ? 'SINGLE' : 'BUNK';
    const multiplier = bedType === 'BUNK' ? 2 : 1;
    const capacity = template.bedCount ? (parseInt(template.bedCount) * multiplier).toString() : '0';
    clearFieldError('roomType');
    setTemplate(prev => ({ ...prev, roomType: newType, bedType, capacity }));
  };

  const handleBeddingChange = (field: 'bedType' | 'bedCount', value: string) => {
    clearFieldError(field);
    setTemplate(prev => {
      const newTemplate = { ...prev, [field]: value };
      const multiplier = newTemplate.bedType === 'BUNK' ? 2 : 1;
      const calculatedCapacity = (parseInt(newTemplate.bedCount) || 0) * multiplier;
      return { ...newTemplate, capacity: calculatedCapacity.toString() };
    });
  };

  const handleAmenityToggle = (value: string) => {
    setTemplate(prev => ({
      ...prev,
      amenities: prev.amenities.includes(value)
        ? prev.amenities.filter(a => a !== value)
        : [...prev.amenities, value]
    }));
  };

  const handleApplyClick = () => {
    const newErrors: FieldErrors = {};

    // Room Type
    if (!template.roomType) {
      newErrors.roomType = 'Room type is required';
    }

    // Price
    if (!template.price) {
      newErrors.price = 'Monthly price is required';
    } else {
      const price = parseInt(template.price);
      if (isNaN(price) || price < 500) newErrors.price = 'Minimum price is ₱500';
      else if (price > 50000) newErrors.price = 'Maximum price is ₱50,000';
    }

    // Reservation Fee
    if (!template.reservationFee) {
      newErrors.reservationFee = 'Reservation fee is required';
    } else {
      const fee = parseInt(template.reservationFee);
      if (isNaN(fee) || fee < 500) newErrors.reservationFee = 'Minimum fee is ₱500';
      else if (fee > 50000) newErrors.reservationFee = 'Maximum fee is ₱50,000';
    }

    // Room Size
    if (!template.size) {
      newErrors.size = 'Room size is required';
    } else {
      const size = parseFloat(template.size);
      if (isNaN(size) || size < 5) newErrors.size = 'Minimum size is 5 SQM';
      else if (size > 100) newErrors.size = 'Maximum size is 100 SQM';
    }

    // Bed Type
    if (!template.bedType) {
      newErrors.bedType = 'Bed type is required';
    }

    // Bed Count
    if (!template.bedCount) {
      newErrors.bedCount = 'Bed count is required';
    } else {
      const beds = parseInt(template.bedCount);
      if (isNaN(beds) || beds < 1) newErrors.bedCount = 'Minimum is 1 bed';
      else if (beds > 10) newErrors.bedCount = 'Maximum is 10 beds';
    }

    // Bathroom Arrangement
    if (!template.bathroomArrangement) {
      newErrors.bathroomArrangement = 'Please select a bathroom setup';
    }

    // If any errors, set state, show toast and scroll to first error field
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      toast.error('Please fix the highlighted fields before applying.');

      // Field ID map for scroll targeting
      const fieldIdMap: Record<string, string> = {
        roomType: 'bulk-roomType',
        price: 'bulk-price',
        reservationFee: 'bulk-reservationFee',
        size: 'bulk-size',
        bedType: 'bulk-bedType',
        bedCount: 'bulk-bedCount',
        bathroomArrangement: 'bulk-bathroom',
      };
      const firstErrorKey = Object.keys(newErrors)[0];
      const targetId = fieldIdMap[firstErrorKey];
      if (targetId) {
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('animate-shake');
            setTimeout(() => el.classList.remove('animate-shake'), 700);
          }
        }, 80);
      }
      return;
    }

    setFieldErrors({});
    onApply(template);
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-800 sticky top-0 z-[70]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary animate-pulse">
            <Wand2 size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Group Setup Wizard</h3>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Apply settings to all {roomCount} units at once</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
          <X size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="px-10 py-10 space-y-12 pb-32">
        {/* Warning Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-[2rem] p-6 flex items-center gap-5 shadow-inner"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
            <Info size={24} />
          </div>
          <div>
            <p className="text-[11px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest leading-relaxed">
              Global Overwrite Warning
            </p>
            <p className="text-[10px] font-bold text-amber-700/60 dark:text-amber-400/60 uppercase tracking-tighter mt-0.5 leading-relaxed">
              Applying these settings will replace existing data for <span className="text-amber-600 font-black">all {roomCount} units</span>. This action is irreversible.
            </p>
          </div>
        </motion.div>

        {/* Section 1: Types & Pricing */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
              <div className="w-8 h-[2px] bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              Pricing & Room Type
            </h4>
            <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-full border border-primary/20">Step 01</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Room Type */}
            <div id="bulk-roomType" className="space-y-3">
              <label className={cn(
                "block text-[10px] font-black uppercase tracking-[0.2em] ml-1",
                fieldErrors.roomType ? "text-red-500" : "text-gray-400"
              )}>
                Unit Category <span className="text-red-500">*</span>
              </label>
              <ReactSelect
                options={roomTypeOptions}
                placeholder="Select category..."
                classNames={errorSelectClass(!!fieldErrors.roomType)}
                onChange={handleRoomTypeChange}
              />
              <FieldError message={fieldErrors.roomType} />
            </div>

            {/* Monthly Price */}
            <div id="bulk-price" className="space-y-3">
              <label className={cn(
                "block text-[10px] font-black uppercase tracking-[0.2em] ml-1",
                fieldErrors.price ? "text-red-500" : "text-gray-400"
              )}>
                Monthly Rental (PHP) <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input
                  type="number"
                  placeholder="e.g. 8500"
                  className={cn(errorControlClass(!!fieldErrors.price), "h-14 bg-white dark:bg-gray-800 border-2")}
                  value={template.price}
                  onChange={(e) => {
                    clearFieldError('price');
                    setTemplate({ ...template, price: e.target.value });
                  }}
                />
                <DollarSign size={18} className={cn("absolute right-5 top-1/2 -translate-y-1/2 transition-colors", fieldErrors.price ? "text-red-400" : "text-gray-300 group-focus-within:text-primary")} />
              </div>
              <FieldError message={fieldErrors.price} />
            </div>

            {/* Reservation Fee */}
            <div id="bulk-reservationFee" className="space-y-3">
              <label className={cn(
                "block text-[10px] font-black uppercase tracking-[0.2em] ml-1",
                fieldErrors.reservationFee ? "text-red-500" : "text-gray-400"
              )}>
                Reservation Fee <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input
                  type="number"
                  placeholder="e.g. 500"
                  className={cn(errorControlClass(!!fieldErrors.reservationFee), "h-14 bg-white dark:bg-gray-800 border-2")}
                  value={template.reservationFee}
                  onChange={(e) => {
                    clearFieldError('reservationFee');
                    setTemplate({ ...template, reservationFee: e.target.value });
                  }}
                />
                <Tag size={18} className={cn("absolute right-5 top-1/2 -translate-y-1/2 transition-colors", fieldErrors.reservationFee ? "text-red-400" : "text-gray-300 group-focus-within:text-primary")} />
              </div>
              <FieldError message={fieldErrors.reservationFee} />
            </div>

            {/* Room Size */}
            <div id="bulk-size" className="space-y-3">
              <label className={cn(
                "block text-[10px] font-black uppercase tracking-[0.2em] ml-1",
                fieldErrors.size ? "text-red-500" : "text-gray-400"
              )}>
                Floor Area (SQM) <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 15"
                  className={cn(errorControlClass(!!fieldErrors.size), "h-14 bg-white dark:bg-gray-800 border-2")}
                  value={template.size}
                  onChange={(e) => {
                    clearFieldError('size');
                    setTemplate({ ...template, size: e.target.value });
                  }}
                />
                <Maximize2 size={18} className={cn("absolute right-5 top-1/2 -translate-y-1/2 transition-colors", fieldErrors.size ? "text-red-400" : "text-gray-300 group-focus-within:text-primary")} />
              </div>
              <FieldError message={fieldErrors.size} />
            </div>
          </div>
        </motion.div>

        {/* Section 2: Bedding Setup */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
              <div className="w-8 h-[2px] bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              Bed Types
            </h4>
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">Step 02</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bed Type */}
            <div className="space-y-3">
              <label className={cn(
                "block text-[10px] font-black uppercase tracking-[0.2em] ml-1",
                fieldErrors.bedType ? "text-red-500" : "text-gray-400"
              )}>
                Bed Types <span className="text-red-500">*</span>
              </label>
              <ReactSelect
                options={getBedTypeOptions(template.roomType)}
                placeholder="Select bed type..."
                classNames={errorSelectClass(!!fieldErrors.bedType)}
                value={CENTRAL_BED_TYPES.find(o => o.value === template.bedType) || null}
                onChange={(val: any) => { clearFieldError('bedType'); handleBeddingChange('bedType', val.value); }}
              />
              <FieldError message={fieldErrors.bedType} />
            </div>

            {/* Bed Count */}
            <div className="space-y-3">
              <label className={cn(
                "block text-[10px] font-black uppercase tracking-[0.2em] ml-1",
                fieldErrors.bedCount ? "text-red-500" : "text-gray-400"
              )}>
                Beds per Room <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input
                  id="bulk-bedCount"
                  type="number"
                  placeholder="e.g. 1"
                  className={cn(errorControlClass(!!fieldErrors.bedCount), "h-14 bg-white dark:bg-gray-800 border-2")}
                  value={template.bedCount}
                  onChange={(e) => { clearFieldError('bedCount'); handleBeddingChange('bedCount', e.target.value); }}
                />
                <Bed size={18} className={cn("absolute right-5 top-1/2 -translate-y-1/2 transition-colors", fieldErrors.bedCount ? "text-red-400" : "text-gray-300 group-focus-within:text-primary")} />
              </div>
              <FieldError message={fieldErrors.bedCount} />
            </div>

            {/* Calculated Capacity */}
            <div className="space-y-3">
              {(() => {
                const bedCountNum = parseInt(template.bedCount) || 0;
                const isInvalid = template.bedCount !== '' && (bedCountNum < 1 || bedCountNum > 10);
                return (
                  <>
                    <label className={cn(
                      "block text-[10px] font-black uppercase tracking-[0.2em] ml-1",
                      isInvalid ? "text-rose-500" : "text-indigo-600"
                    )}>
                      Total Guests Allowed
                    </label>
                    <div className={cn(
                      "h-14 w-full rounded-[1.2rem] px-5 text-[11px] font-black flex items-center justify-between transition-all duration-500 border-2",
                      isInvalid
                        ? "bg-rose-500/5 border-rose-500/20 text-rose-500"
                        : "bg-indigo-500/5 border-indigo-500/20 text-indigo-600 shadow-xl shadow-indigo-500/5"
                    )}>
                      <span>{isInvalid ? '-- PAX' : `${template.capacity} PAX TOTAL`}</span>
                      <Users size={18} className={cn("opacity-40", isInvalid ? "text-rose-500" : "text-indigo-600")} />
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </motion.div>

        {/* Section 3: Bathroom Setup */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
              <div className="w-8 h-[2px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              Bathroom Setup
            </h4>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">Step 03</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bathroomOptions.map(option => {
              const isSelected = template.bathroomArrangement === option.value;
              const isDisabled = option.value === BATHROOM_ARRANGEMENTS.COMMON && commonBathroomCount === 0;
              const hasError = !!fieldErrors.bathroomArrangement && !isDisabled;

              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) {
                      clearFieldError('bathroomArrangement');
                      setTemplate({ ...template, bathroomArrangement: option.value });
                    }
                  }}
                  className={cn(
                    "group/opt flex flex-col items-center text-center p-8 rounded-[2.5rem] border-2 transition-all duration-500",
                    isSelected
                      ? "border-blue-600 bg-blue-600/5 dark:bg-blue-600/10 shadow-2xl shadow-blue-600/10"
                      : hasError
                      ? "border-rose-500 bg-rose-500/5"
                      : "border-gray-50 dark:border-gray-800 bg-white dark:bg-transparent hover:border-blue-600/30",
                    isDisabled && "opacity-40 grayscale cursor-not-allowed border-dashed bg-gray-50/50"
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500",
                    isSelected ? "bg-blue-600 text-white scale-110 rotate-6 shadow-lg shadow-blue-600/30" : "bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover/opt:bg-blue-600/10 group-hover/opt:text-blue-600"
                  )}>
                    {option.icon}
                  </div>
                  <span className={cn("text-[11px] font-black uppercase tracking-widest mb-1.5", isSelected ? "text-blue-600" : "text-gray-900 dark:text-white")}>
                    {option.label}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter leading-relaxed">
                    {isDisabled ? "Building profile has no common facilities" : option.description}
                  </span>
                </button>
              );
            })}
          </div>
          <FieldError message={fieldErrors.bathroomArrangement} />
        </motion.div>

        {/* Section 4: Unit Amenities */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
              <div className="w-8 h-[2px] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Unit Amenities
            </h4>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">Final Phase</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SHARED_ROOM_AMENITIES.map((amenity, i) => {
              const isSelected = template.amenities.includes(amenity.value);
              const Icon = amenity.icon;
              return (
                <motion.button
                  key={amenity.value}
                  type="button"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAmenityToggle(amenity.value)}
                  className={cn(
                    "flex items-center gap-3 p-5 rounded-[1.5rem] border-2 transition-all duration-500",
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 shadow-xl shadow-emerald-500/5"
                      : "border-gray-50 dark:border-gray-800 bg-white dark:bg-transparent hover:border-emerald-500/20"
                  )}
                >
                  <Icon size={16} className={cn("transition-transform duration-500", isSelected ? "text-emerald-500 rotate-6" : "text-gray-400")} />
                  <span className="text-[10px] font-black uppercase tracking-tight truncate">{amenity.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-8 py-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between mt-auto">
        <button
          onClick={onClose}
          className="px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-700 transition-colors"
        >
          Discard Changes
        </button>
        <button
          onClick={handleApplyClick}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
        >
          <CheckCircle2 size={16} />
          Apply to all {roomCount} units
        </button>
      </div>
    </div>
  );
};

export default BulkConfigureModal;
