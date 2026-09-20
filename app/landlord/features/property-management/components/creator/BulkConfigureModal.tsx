'use client';
import React, { useState, useEffect } from 'react';
import ReactSelect, { components } from 'react-select';
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
  Info,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Building2,
  LayoutGrid,
  Wind,
  Sofa,
  Utensils
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import { 
  BATHROOM_ARRANGEMENTS, 
  bedTypeOptions as CENTRAL_BED_TYPES 
} from '@/utils/constants';
import { getActiveAttributes, getActiveSubGroups } from '@/services/taxonomy';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { getCachedRoomTypes, getSyncRoomTypes } from '@/lib/landlordTaxonomyCache';
import { getDynamicIcon } from '@/lib/iconResolver';

interface BulkConfigureModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onApply: (template: any) => void;
  roomCount?: number;
  totalRooms?: number;
  commonBathroomCount?: number;
  propertyTypeId?: string;
  isLoading?: boolean;
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

const CustomDropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <div className={cn(
        "w-7 h-7 rounded-xl flex items-center justify-center transition-transform duration-300 mr-1",
        props.selectProps.menuIsOpen
          ? "bg-primary/20 text-primary rotate-180"
          : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-primary"
      )}>
        <ChevronDown size={14} strokeWidth={3} />
      </div>
    </components.DropdownIndicator>
  );
};

const CustomOption = (props: any) => {
  return (
    <components.Option {...props}>
      <div className="flex items-center justify-between w-full">
        <span className="truncate font-extrabold text-xs tracking-tight">{props.data.label}</span>
        {props.isSelected && (
          <div className="shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
            <Check size={12} className="text-primary dark:text-primary" strokeWidth={3.5} />
          </div>
        )}
      </div>
    </components.Option>
  );
};

const errorControlClass = (hasError: boolean) =>
  cn(
    'w-full bg-gray-50 dark:bg-slate-900 border rounded-2xl p-4 text-sm font-bold transition-all outline-none text-slate-900 dark:text-white',
    hasError
      ? 'border-red-500 ring-1 ring-red-500/20 focus:ring-red-500/30 focus:border-red-500'
      : 'border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary'
  );

const errorSelectClass = (hasError: boolean): any => ({
  control: (state: any) =>
    cn(
      '!bg-white dark:!bg-slate-900 !border-2 !rounded-2xl !p-1.5 !shadow-sm transition-all text-xs font-extrabold cursor-pointer',
      hasError
        ? '!border-red-500 !ring-4 !ring-red-500/20'
        : state.isFocused
        ? '!border-primary !ring-4 !ring-primary/10 shadow-lg shadow-primary/10'
        : '!border-slate-200 dark:!border-slate-800 hover:!border-primary/40'
    ),
  singleValue: () => '!text-slate-900 dark:!text-white font-black text-xs uppercase tracking-wider',
  menu: () => '!bg-white dark:!bg-slate-900 !border-2 !border-slate-200 dark:!border-slate-800 !shadow-2xl !rounded-2xl !mt-2 z-[100] overflow-hidden p-1.5',
  menuList: () => '!p-0 !bg-white dark:!bg-slate-900',
  option: (state: any) =>
    cn(
      '!cursor-pointer !rounded-xl !px-3.5 !py-2.5 !text-xs !uppercase !tracking-wider transition-all !mb-1 last:!mb-0',
      state.isSelected
        ? '!bg-primary/10 !text-primary dark:!text-primary font-black'
        : state.isFocused
        ? '!bg-slate-100 dark:!bg-slate-800 !text-slate-900 dark:!text-white font-bold'
        : '!bg-transparent !text-slate-700 dark:!text-slate-300 font-bold'
    ),
});

const DEFAULT_ROOM_TYPE_OPTIONS = [
  { value: 'SOLO', label: 'Private Solo Room', isFlatRate: true },
  { value: 'BEDSPACE', label: 'Bedspace / Shared Room', isFlatRate: false },
];

const bathroomOptions = [
  {
    value: BATHROOM_ARRANGEMENTS.PRIVATE,
    icon: <ShowerHead className="w-5 h-5" />,
    label: 'Own Private Bathroom',
    description: 'Inside room unit',
  },
  {
    value: BATHROOM_ARRANGEMENTS.COMMON,
    icon: <Bath className="w-5 h-5" />,
    label: 'Shared Common Bathroom',
    description: 'Building hallway facilities',
  },
];

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="text-red-500 text-[10px] font-black mt-1.5 ml-1 uppercase tracking-wider flex items-center gap-1">
      <AlertCircle size={12} />
      {message}
    </p>
  ) : null;

const BulkConfigureModal: React.FC<BulkConfigureModalProps> = ({ 
  onClose, 
  onApply, 
  roomCount, 
  totalRooms, 
  commonBathroomCount = 0,
  propertyTypeId
}) => {
  const activeRoomCount = totalRooms || roomCount || 1;
  const toast = useResponsiveToast();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [activeAmenityTab, setActiveAmenityTab] = useState<string>('KITCHEN_APP');

  const [roomTypeOptions, setRoomTypeOptions] = useState<any[]>(() => {
    if (propertyTypeId) {
      const sync = getSyncRoomTypes(propertyTypeId);
      if (sync && sync.length > 0) return sync;
    }
    return DEFAULT_ROOM_TYPE_OPTIONS;
  });

  useEffect(() => {
    if (propertyTypeId) {
      const sync = getSyncRoomTypes(propertyTypeId);
      if (sync && sync.length > 0) {
        setRoomTypeOptions(sync);
        return;
      }
      getCachedRoomTypes(propertyTypeId).then(options => {
        if (options && options.length > 0) setRoomTypeOptions(options);
      });
    }
  }, [propertyTypeId]);

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

  // Dynamic field labels driven by selectedRoomType.isFlatRate
  const selectedRoomTypeObj = roomTypeOptions.find((o: any) => o.value === template.roomType);
  const isFlatRate = selectedRoomTypeObj?.isFlatRate ?? (template.roomType.toUpperCase() === 'SOLO');

  const roomTypeLabel = isFlatRate ? 'Unit Layout' : 'Room Category';
  const priceLabel = isFlatRate ? 'Monthly Unit Price (₱)' : 'Monthly Rate Per Head (₱)';
  const sizeLabel = isFlatRate ? 'Unit Floor Area (SQM)' : 'Room Size (SQM)';
  const capacityLabel = isFlatRate ? 'Total Unit Capacity' : 'Total Bedspace Capacity';

  const [dynamicAttributes, setDynamicAttributes] = React.useState<any[]>([]);
  const [dbSubGroups, setDbSubGroups] = React.useState<any[]>([]);
  const [isLoadingAttrs, setIsLoadingAttrs] = React.useState(true);

  React.useEffect(() => {
    getActiveAttributes().then(attrs => {
      setDynamicAttributes(attrs.filter((a: any) => a.type === 'ROOM_AMENITY'));
      setIsLoadingAttrs(false);
    });
    getActiveSubGroups().then(sgs => {
      setDbSubGroups(sgs || []);
    });
  }, []);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const getBedTypeOptions = (roomTypeId: string) => {
    const rt = roomTypeOptions.find(o => o.value === roomTypeId);
    if (rt && Array.isArray(rt.bedSetups) && rt.bedSetups.length > 0) {
      return rt.bedSetups
        .filter((bs: any) => bs.code !== 'ANY' && !bs.name.toLowerCase().includes('any bed'))
        .map((bs: any) => ({
          value: bs.code,
          label: bs.name,
        }));
    }
    if (rt && rt.isFlatRate) {
      return CENTRAL_BED_TYPES.filter(o => ['SINGLE', 'DOUBLE', 'QUEEN'].includes(o.value));
    }
    return CENTRAL_BED_TYPES.filter(o => ['SINGLE', 'BUNK'].includes(o.value));
  };

  const handleRoomTypeChange = (val: any) => {
    const newType = val.value;
    const rt = roomTypeOptions.find(o => o.value === newType);
    const flatRate = rt?.isFlatRate ?? (newType.toUpperCase() === 'SOLO');

    const availableBedOptions = getBedTypeOptions(newType);
    const defaultBedType = availableBedOptions.length > 0 ? availableBedOptions[0].value : (flatRate ? 'SINGLE' : 'BUNK');

    const isBunk = defaultBedType.toUpperCase().includes('BUNK');
    const multiplier = isBunk ? 2 : 1;
    const capacity = template.bedCount ? (parseInt(template.bedCount) * multiplier).toString() : '0';
    
    // Apartments/Studios or properties with 0 common CRs auto-set private bathroom. Otherwise preserve selection or leave empty for mandatory choice.
    const bathroomArrangement = flatRate || commonBathroomCount === 0 
      ? BATHROOM_ARRANGEMENTS.PRIVATE 
      : template.bathroomArrangement;

    clearFieldError('roomType');
    clearFieldError('bedType');
    clearFieldError('bathroomArrangement');

    setTemplate(prev => ({ 
      ...prev, 
      roomType: newType, 
      bedType: defaultBedType, 
      capacity,
      bathroomArrangement
    }));
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

  const validateStep = (step: number): boolean => {
    const newErrors: FieldErrors = {};

    if (step === 1) {
      if (!template.roomType) newErrors.roomType = 'Please select a unit layout / category';

      if (!template.price) {
        newErrors.price = 'Monthly price is required';
      } else {
        const price = parseInt(template.price);
        if (isNaN(price) || price < 500) newErrors.price = 'Minimum price is ₱500';
        else if (price > 500000) newErrors.price = 'Maximum price is ₱500,000';
      }

      if (!template.reservationFee) {
        newErrors.reservationFee = 'Reservation fee is required';
      } else {
        const fee = parseInt(template.reservationFee);
        if (isNaN(fee) || fee < 100) newErrors.reservationFee = 'Minimum fee is ₱100';
        else if (fee > 50000) newErrors.reservationFee = 'Maximum fee is ₱50,000';
      }

      if (!template.size) {
        newErrors.size = 'Floor space is required';
      } else {
        const size = parseFloat(template.size);
        if (isNaN(size) || size < 5) newErrors.size = 'Minimum area is 5 SQM';
        else if (size > 100) newErrors.size = 'Maximum area is 100 SQM';
      }
    }

    if (step === 2) {
      if (!template.bedType) newErrors.bedType = 'Please select a bed type';

      if (!template.bedCount) {
        newErrors.bedCount = 'Bed count is required';
      } else {
        const beds = parseInt(template.bedCount);
        if (isNaN(beds) || beds < 1) newErrors.bedCount = 'Minimum is 1 bed';
        else if (beds > 10) newErrors.bedCount = 'Maximum is 10 beds';
      }
    }

    if (step === 3) {
      if (!template.bathroomArrangement) {
        newErrors.bathroomArrangement = 'Please select a bathroom setup option';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return false;
    }

    setFieldErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => (prev < 5 ? (prev + 1) as any : 5));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => (prev > 1 ? (prev - 1) as any : 1));
  };

  const handleApplyClick = () => {
    for (let s = 1; s <= 3; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s as any);
        return;
      }
    }
    onApply(template);
  };

  return (
    <motion.div 
      className="flex flex-col text-slate-800 dark:text-slate-200 w-full p-4 sm:p-7 space-y-3.5 sm:space-y-5 h-full sm:h-auto max-h-none sm:max-h-[88vh] bg-white dark:bg-slate-900 rounded-none sm:rounded-3xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="shrink-0 space-y-3">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Wand2 size={20} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                Bulk Unit Configuration
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 truncate">
                Apply consistent settings to all {activeRoomCount} units at once.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-black uppercase tracking-wider shrink-0">
              Step {currentStep} of 5
            </div>
            <button 
              type="button"
              onClick={onClose} 
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Wizard Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
          <motion.div
            className="bg-primary h-full rounded-full transition-all duration-300"
            initial={{ width: "20%" }}
            animate={{ width: `${currentStep * 20}%` }}
          />
        </div>
      </div>

      {/* Step Container (Auto-sizing, no inner scrollbar overflowing modal) */}
      <div className="flex-1 overflow-y-auto pr-1 py-1 space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <AnimatePresence mode="wait">

          {/* STEP 1: Basic Info & Pricing (Dynamic Labels based on isFlatRate) */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-6"
            >
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
                <Sparkles size={18} className="text-primary shrink-0" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Select unit layout and pricing rules to apply across all {activeRoomCount} units.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-6">
                {/* Dynamic Room Category / Unit Layout */}
                <div id="bulk-roomType" className="col-span-2 space-y-1.5 sm:space-y-2">
                  <label className="block text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1">
                    {roomTypeLabel} <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <ReactSelect
                    options={roomTypeOptions}
                    placeholder="Select category / layout..."
                    classNames={errorSelectClass(!!fieldErrors.roomType)}
                    components={{
                      DropdownIndicator: CustomDropdownIndicator,
                      Option: CustomOption,
                      IndicatorSeparator: () => null,
                    }}
                    value={roomTypeOptions.find(o => o.value === template.roomType) || null}
                    onChange={handleRoomTypeChange}
                    menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base: any) => ({ ...base, zIndex: 99999 })
                    }}
                  />
                  <FieldError message={fieldErrors.roomType} />
                </div>

                {/* Dynamic Monthly Price Label */}
                <div id="bulk-price" className="space-y-1.5 sm:space-y-2 min-w-0">
                  <label className="block text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1 truncate">
                    {priceLabel} <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      placeholder="e.g. 8500"
                      className={errorControlClass(!!fieldErrors.price)}
                      value={template.price}
                      onChange={(e) => {
                        clearFieldError('price');
                        setTemplate({ ...template, price: e.target.value });
                      }}
                    />
                    <DollarSign size={16} className={cn("absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 transition-colors", fieldErrors.price ? "text-red-400" : "text-slate-400 group-focus-within:text-primary")} />
                  </div>
                  <FieldError message={fieldErrors.price} />
                </div>

                {/* Reservation Fee */}
                <div id="bulk-reservationFee" className="space-y-1.5 sm:space-y-2 min-w-0">
                  <label className="block text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1 truncate">
                    Reservation Fee (₱) <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      placeholder="e.g. 1000"
                      className={errorControlClass(!!fieldErrors.reservationFee)}
                      value={template.reservationFee}
                      onChange={(e) => {
                        clearFieldError('reservationFee');
                        setTemplate({ ...template, reservationFee: e.target.value });
                      }}
                    />
                    <Tag size={16} className={cn("absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 transition-colors", fieldErrors.reservationFee ? "text-red-400" : "text-slate-400 group-focus-within:text-primary")} />
                  </div>
                  <FieldError message={fieldErrors.reservationFee} />
                </div>

                {/* Dynamic Floor Space Label */}
                <div id="bulk-size" className="col-span-2 space-y-1.5 sm:space-y-2">
                  <label className="block text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1">
                    {sizeLabel} <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 15"
                      className={errorControlClass(!!fieldErrors.size)}
                      value={template.size}
                      onChange={(e) => {
                        clearFieldError('size');
                        setTemplate({ ...template, size: e.target.value });
                      }}
                    />
                    <Maximize2 size={16} className={cn("absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 transition-colors", fieldErrors.size ? "text-red-400" : "text-slate-400 group-focus-within:text-primary")} />
                  </div>
                  <FieldError message={fieldErrors.size} />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Bedding & Capacity */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-6"
            >
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
                <Bed size={18} className="text-primary shrink-0" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Configure bedding details. Total capacity is calculated automatically based on bed type.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
                {/* Bed Type */}
                <div id="bulk-bedType" className="col-span-2 sm:col-span-1 space-y-1.5 sm:space-y-2">
                  <label className="block text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1">
                    Bed Type <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  {(() => {
                    const bedOpts = getBedTypeOptions(template.roomType);
                    const selectedBedOpt = bedOpts.find((o: any) => o.value === template.bedType) || (bedOpts.length > 0 ? bedOpts[0] : null);

                    return (
                      <ReactSelect
                        options={bedOpts}
                        placeholder="Select bed type..."
                        classNames={errorSelectClass(!!fieldErrors.bedType)}
                        components={{
                          DropdownIndicator: CustomDropdownIndicator,
                          Option: CustomOption,
                          IndicatorSeparator: () => null,
                        }}
                        value={selectedBedOpt}
                        onChange={(val: any) => { clearFieldError('bedType'); handleBeddingChange('bedType', val?.value || ''); }}
                        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                        menuPosition="fixed"
                        styles={{
                          menuPortal: (base: any) => ({ ...base, zIndex: 99999 })
                        }}
                      />
                    );
                  })()}
                  <FieldError message={fieldErrors.bedType} />
                </div>

                {/* Beds per Room */}
                <div id="bulk-bedCount" className="space-y-1.5 sm:space-y-2 min-w-0">
                  <label className="block text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1">
                    Bed Count <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      placeholder="e.g. 1"
                      className={errorControlClass(!!fieldErrors.bedCount)}
                      value={template.bedCount}
                      onChange={(e) => { clearFieldError('bedCount'); handleBeddingChange('bedCount', e.target.value); }}
                    />
                    <Bed size={16} className={cn("absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 transition-colors", fieldErrors.bedCount ? "text-red-400" : "text-slate-400 group-focus-within:text-primary")} />
                  </div>
                  <FieldError message={fieldErrors.bedCount} />
                </div>

                {/* Dynamic Capacity Counter Label */}
                <div className="space-y-1.5 sm:space-y-2 min-w-0">
                  <label className="block text-[10px] sm:text-xs font-black uppercase tracking-wider text-primary ml-1 truncate">
                    {capacityLabel}
                  </label>
                  <div className="h-[54px] w-full rounded-2xl px-3 sm:px-5 bg-primary/10 border-2 border-primary/30 text-primary font-black text-[11px] sm:text-xs flex items-center justify-between shadow-sm">
                    <span className="truncate">{template.capacity} GUESTS</span>
                    <Users size={16} className="text-primary opacity-80 shrink-0 hidden sm:block" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Bathroom Setup */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-6"
            >
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
                <ShowerHead size={18} className="text-primary shrink-0" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Select how bathroom facilities are arranged for these units.
                </p>
              </div>

              <div id="bulk-bathroom" className="grid grid-cols-2 gap-3 sm:gap-5">
                {bathroomOptions.map(option => {
                  const isSelected = template.bathroomArrangement === option.value;
                  const isDisabled = option.value === BATHROOM_ARRANGEMENTS.COMMON && commonBathroomCount === 0;
                  const hasError = !!fieldErrors.bathroomArrangement && !isSelected;

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
                        "flex flex-col sm:flex-row items-start gap-2.5 sm:gap-4 p-3.5 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer text-left select-none min-h-[64px]",
                        isSelected
                          ? "border-primary bg-primary/10 dark:bg-primary/15 shadow-md ring-1 ring-primary/20"
                          : hasError
                          ? "border-red-500 bg-red-500/5 ring-1 ring-red-500/20"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-primary/40",
                        isDisabled && "opacity-40 cursor-not-allowed border-dashed bg-slate-50 dark:bg-slate-900/20"
                      )}
                    >
                      <div className={cn(
                        "p-2 sm:p-3 rounded-xl transition-all shrink-0 mt-0.5",
                        isSelected ? "bg-primary text-white shadow-md shadow-primary/20" : hasError ? "bg-red-500/10 text-red-500" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      )}>
                        {option.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={cn("text-[11px] sm:text-xs font-black uppercase tracking-wider line-clamp-1", isSelected ? "text-primary dark:text-primary font-extrabold" : hasError ? "text-red-500" : "text-slate-800 dark:text-slate-200")}>
                          {option.label}
                        </h4>
                        <p className={cn("text-[10px] sm:text-[11px] font-semibold mt-0.5 leading-tight line-clamp-2", isSelected ? "text-primary/80 dark:text-primary/80" : "text-slate-500 dark:text-slate-400")}>
                          {isDisabled ? "No common CR registered" : option.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <FieldError message={fieldErrors.bathroomArrangement} />
            </motion.div>
          )}

          {/* STEP 4: Unit Amenities (Organized Sub-Group Sub-Step Tabs) */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-primary shrink-0" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Select in-unit amenities to include in all {activeRoomCount} units.
                  </p>
                </div>
                <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase rounded-full shrink-0">
                  {template.amenities.length} Selected
                </span>
              </div>

              {/* Sub-Group Navigation Pills (Matching RoomConfigStep.tsx) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b border-slate-100 dark:border-slate-800">
                {(() => {
                  const hasInUnitKitchen = true;
                  const hasPrivateCR = template.bathroomArrangement === BATHROOM_ARRANGEMENTS.PRIVATE || commonBathroomCount === 0;

                  const unitSubGroups: any[] = [];
                  if (hasInUnitKitchen) {
                    unitSubGroups.push({ key: 'KITCHEN_APP', label: 'Kitchen', icon: Utensils });
                  }
                  if (hasPrivateCR) {
                    unitSubGroups.push({ key: 'BATHROOM_FIX', label: 'CR Features', icon: ShowerHead });
                  }

                  const defaultSubGroups = [
                    { key: 'COOLING', label: 'Cooling & AC', icon: Wind },
                    { key: 'FURNITURE', label: 'Furniture', icon: Sofa },
                  ];

                  defaultSubGroups.forEach(item => {
                    if (!unitSubGroups.some(existing => existing.key === item.key)) {
                      unitSubGroups.push(item);
                    }
                  });

                  const dbRoomSgs = dbSubGroups
                    .filter((sg: any) => {
                      if (sg.type !== 'ROOM_AMENITY' || sg.key === 'KITCHEN_APP' || sg.key === 'BATHROOM_FIX') return false;

                      const matchingAttrs = dynamicAttributes.filter((a: any) => {
                        if (a.type !== 'ROOM_AMENITY') return false;
                        if (a.subGroupKey !== sg.key) return false;
                        if (a.setupContext === 'SHARED' || a.setupContext === 'COMMON_CR') return false;
                        if (propertyTypeId && !a.isUniversal && a.propertyTypeIds && a.propertyTypeIds.length > 0) {
                          if (!a.propertyTypeIds.includes(propertyTypeId)) return false;
                        }
                        return true;
                      });

                      return matchingAttrs.length > 0;
                    })
                    .map((sg: any) => ({
                      key: sg.key,
                      label: sg.tabLabel || sg.title || sg.key,
                      icon: getDynamicIcon(sg.icon, Sparkles),
                    }));

                  dbRoomSgs.forEach((dbSg: any) => {
                    if (!unitSubGroups.some(existing => existing.key === dbSg.key)) {
                      unitSubGroups.push(dbSg);
                    }
                  });

                  const currentTab = unitSubGroups.some(g => g.key === activeAmenityTab) ? activeAmenityTab : (unitSubGroups[0]?.key || 'COOLING');

                  return unitSubGroups.map(sg => {
                    const Icon = sg.icon;
                    const isActive = currentTab === sg.key;

                    const selectedCountInGroup = dynamicAttributes
                      .filter((a: any) => {
                        if (a.type !== 'ROOM_AMENITY') return false;
                        if (propertyTypeId && !a.isUniversal && a.propertyTypeIds && a.propertyTypeIds.length > 0) {
                          if (!a.propertyTypeIds.includes(propertyTypeId)) return false;
                        }
                        if (sg.key === 'KITCHEN_APP') return a.subGroupKey === 'KITCHEN_APP' && a.setupContext === 'IN_UNIT';
                        if (sg.key === 'BATHROOM_FIX') return a.subGroupKey === 'BATHROOM_FIX' && a.setupContext === 'PRIVATE';
                        return a.subGroupKey === sg.key && a.setupContext !== 'SHARED' && a.setupContext !== 'COMMON_CR';
                      })
                      .filter((a: any) => template.amenities.includes(a.id)).length;

                    const hasSelections = selectedCountInGroup > 0;

                    return (
                      <button
                        key={sg.key}
                        type="button"
                        onClick={() => setActiveAmenityTab(sg.key)}
                        className={cn(
                          "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer select-none",
                          isActive
                            ? "bg-primary text-white border-primary shadow-sm"
                            : hasSelections
                            ? "bg-primary/10 border-primary/30 text-primary font-extrabold"
                            : "bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        {hasSelections && !isActive ? (
                          <CheckCircle2 size={14} className="text-primary shrink-0" />
                        ) : (
                          <Icon size={14} className={cn(isActive ? "text-white" : "shrink-0")} />
                        )}
                        <span>{sg.label}</span>
                        {hasSelections && (
                          <span className={cn(
                            "ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-black",
                            isActive ? "bg-white/20 text-white" : "bg-primary/20 text-primary"
                          )}>
                            {selectedCountInGroup}
                          </span>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Filtered Active Sub-Group Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {isLoadingAttrs ? (
                  <p className="text-xs text-slate-500 font-bold uppercase animate-pulse col-span-full py-8 text-center">Loading Amenities...</p>
                ) : (() => {
                  const currentTab = activeAmenityTab;
                  const filteredAmenities = dynamicAttributes.filter((a: any) => {
                    if (a.type !== 'ROOM_AMENITY') return false;
                    if (propertyTypeId && !a.isUniversal && a.propertyTypeIds && a.propertyTypeIds.length > 0) {
                      if (!a.propertyTypeIds.includes(propertyTypeId)) return false;
                    }
                    if (currentTab === 'KITCHEN_APP') return a.subGroupKey === 'KITCHEN_APP' && a.setupContext === 'IN_UNIT';
                    if (currentTab === 'BATHROOM_FIX') return a.subGroupKey === 'BATHROOM_FIX' && a.setupContext === 'PRIVATE';
                    return a.subGroupKey === currentTab && a.setupContext !== 'SHARED' && a.setupContext !== 'COMMON_CR';
                  });

                  if (filteredAmenities.length === 0) {
                    return (
                      <p className="text-xs text-slate-400 font-bold uppercase col-span-full py-6 text-center">
                        No amenities listed under this category.
                      </p>
                    );
                  }

                  return filteredAmenities.map((amenity: any) => {
                    const isSelected = template.amenities.includes(amenity.id);
                    const IconComp = getDynamicIcon(amenity.icon, CheckCircle2);

                    return (
                      <div
                        key={amenity.id}
                        onClick={() => handleAmenityToggle(amenity.id)}
                        className={cn(
                          "flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none",
                          isSelected
                            ? "bg-primary/10 border-primary text-slate-900 dark:text-white shadow-sm ring-1 ring-primary/20 font-extrabold"
                            : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-primary/30"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded-md border-2 transition-all flex items-center justify-center shrink-0",
                          isSelected ? "bg-primary border-primary text-white" : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                        )}>
                          {isSelected && <Check className="w-3 h-3 text-white stroke-[3.5px]" />}
                        </div>
                        <IconComp size={15} className={cn("shrink-0", isSelected ? "text-primary" : "text-slate-400")} />
                        <span className="text-xs truncate font-bold">{amenity.name}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </motion.div>
          )}

          {/* STEP 5: Summary & Confirm */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-6"
            >
              {/* Overwrite Warning Banner */}
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Info size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-amber-800 dark:text-amber-400">
                    Ready to Apply Bulk Settings
                  </h4>
                  <p className="text-[11px] font-bold text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                    This configuration will be applied to <span className="font-black text-amber-800 dark:text-amber-300">all {activeRoomCount} units</span> in your inventory. You can still fine-tune individual units afterwards.
                  </p>
                </div>
              </div>

              {/* Summary Cards Grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 block truncate">{roomTypeLabel.replace(' *', '')} & Size</span>
                  <p className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white truncate">
                    {selectedRoomTypeObj?.label || template.roomType} • {template.size} SQM
                  </p>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 block truncate">Monthly Rent & Fee</span>
                  <p className="text-[11px] sm:text-xs font-black text-primary truncate">
                    ₱{template.price} / mo (₱{template.reservationFee} fee)
                  </p>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 block truncate">Bedding & {capacityLabel}</span>
                  <p className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white truncate">
                    {template.bedCount}x {CENTRAL_BED_TYPES.find(b => b.value === template.bedType)?.label || template.bedType} ({template.capacity} Pax)
                  </p>
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 block truncate">Bathroom Setup</span>
                  <p className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white truncate">
                    {template.bathroomArrangement === BATHROOM_ARRANGEMENTS.PRIVATE ? 'Own Private CR' : 'Shared Common CR'}
                  </p>
                </div>
              </div>

              {/* Selected Amenities Summary Grouped by Sub-Group Category */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Selected In-Unit Amenities
                  </span>
                  <span className="px-3 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase">
                    {template.amenities.length} Total Selected
                  </span>
                </div>

                {template.amenities.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'KITCHEN_APP', label: 'Kitchen Appliances', icon: Utensils },
                      { key: 'BATHROOM_FIX', label: 'CR & Bathroom Features', icon: ShowerHead },
                      { key: 'COOLING', label: 'Cooling & AC', icon: Wind },
                      { key: 'FURNITURE', label: 'Furniture & Storage', icon: Sofa },
                    ].map(group => {
                      const GroupIcon = group.icon;
                      const groupAmenities = template.amenities
                        .map(aId => dynamicAttributes.find(a => a.id === aId))
                        .filter(attr => attr && attr.subGroupKey === group.key);

                      if (groupAmenities.length === 0) return null;

                      return (
                        <div key={group.key} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                              <GroupIcon size={14} className="text-primary" />
                              <span>{group.label}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">
                              {groupAmenities.length} item{groupAmenities.length === 1 ? '' : 's'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {groupAmenities.map(attr => (
                              <span key={attr.id} className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-[11px] font-bold border border-primary/20 flex items-center gap-1.5">
                                <Check size={11} className="stroke-[3]" />
                                {attr.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-xs italic text-slate-400 font-medium">No in-unit amenities selected for bulk setup.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Modal Footer Controls */}
      <div className="shrink-0 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl sm:rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft size={16} /> Back
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            Discard
          </button>
        )}

        {currentStep < 5 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-5 sm:px-7 py-2.5 sm:py-3 bg-primary hover:bg-primary/90 text-white rounded-xl sm:rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-primary/20 flex items-center gap-1.5 cursor-pointer border-none"
          >
            <span>Next Step</span>
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleApplyClick}
            className="px-5 sm:px-8 py-3 sm:py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl sm:rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-primary/20 flex items-center gap-1.5 cursor-pointer border-none hover:scale-105 active:scale-95"
          >
            <CheckCircle2 size={16} />
            <span>Apply to All {activeRoomCount} Units</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default BulkConfigureModal;
