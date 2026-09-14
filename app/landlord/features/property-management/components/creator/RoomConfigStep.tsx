'use client';

import React, { useState, useEffect, useRef } from 'react';
import Input from '@/components/inputs/Input';
import Checkbox from '@/components/inputs/Checkbox';
import Button from '@/components/common/Button';
import { Controller } from 'react-hook-form';
import ReactSelect, { components } from 'react-select';
import {
  Plus, Minus, Bed, Bath, Users, CheckCircle, PlusCircle, ShowerHead,
  HelpCircle, Copy, ClipboardPaste, CheckCircle2, Wand2, LayoutGrid,
  Utensils, Wind, Sofa, Sparkles, Flame, Refrigerator, Coffee, Check, ChevronDown, AlertCircle
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion } from 'framer-motion';
import { BATHROOM_ARRANGEMENTS, bedTypeOptions as CENTRAL_BED_TYPES } from '@/data/roomAmenities';
import axios from 'axios';
import { getCachedAttributes, getSyncAttributes, getCachedRoomTypes, getSyncRoomTypes } from '@/lib/landlordTaxonomyCache';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import BulkConfigureModal from './BulkConfigureModal';
import Modal from '@/components/modals/Modal';
import { cn } from '@/utils/helper';

export interface RoomType {
  roomType: string;
  bathroomArrangement: string;
  price: string;
  bedType: string;
  bedCount: string;
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
  append: (data: any) => void;
  remove: (index: number) => void;
  control: any;
  getValues: any;
  setValue: any;
  clearErrors?: any;
  onCustomNavChange?: (nav: { nextLabel: string; backLabel: string; onNext: () => void; onBack: () => void } | null) => void;
  onMainNext?: () => void;
  onMainBack?: () => void;
  defaultToLastRoom?: boolean;
}

const defaultRoom = (): RoomType => ({
  roomType: '',
  bathroomArrangement: '',
  price: '',
  bedType: '',
  bedCount: '1',
  capacity: '1',
  size: '',
  availableSlots: '1',
  reservationFee: '500',
  description: '',
  amenities: [],
});

const getSafeLucideIcon = (iconName: string, defaultIcon: any = CheckCircle2) => {
  if (!iconName) return defaultIcon;
  const IconObj = (LucideIcons as Record<string, any>)[iconName];
  if (IconObj && (typeof IconObj === 'function' || typeof IconObj === 'object')) {
    return IconObj;
  }
  return defaultIcon;
};

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
            <Check size={12} className="text-primary" strokeWidth={3.5} />
          </div>
        )}
      </div>
    </components.Option>
  );
};

const getSelectClassNames = (hasError?: boolean) => ({
  control: (state: any) =>
    cn(
      "!bg-white dark:!bg-gray-800 !border-2 !rounded-2xl !px-3.5 !py-2 !min-h-[52px] !h-[52px] !shadow-sm transition-all text-xs font-extrabold cursor-pointer flex items-center justify-between",
      hasError
        ? "!border-rose-500 !ring-4 !ring-rose-500/20 !bg-rose-50/30 dark:!bg-rose-950/30"
        : state.isFocused
        ? "!border-primary !ring-4 !ring-primary/10 shadow-lg shadow-primary/10"
        : "!border-gray-200 dark:!border-gray-700/50 hover:!border-primary/40"
    ),
  singleValue: () => "!text-gray-900 dark:!text-white font-extrabold text-xs uppercase tracking-wider",
  placeholder: () => "!text-gray-400 dark:!text-gray-500 font-bold text-xs",
  menu: () => "!bg-white dark:!bg-gray-800 !border-2 !border-gray-200 dark:!border-gray-700 !shadow-2xl !rounded-2xl !mt-2 z-[60] overflow-hidden p-1.5",
  menuList: () => "!p-0 !bg-white dark:!bg-gray-800",
  option: (state: any) =>
    cn(
      "!cursor-pointer !rounded-xl !px-3.5 !py-2.5 !text-xs !uppercase !tracking-wider transition-all !mb-1 last:!mb-0",
      state.isSelected
        ? "!bg-primary/10 !text-primary font-black"
        : state.isFocused
          ? "!bg-gray-100 dark:!bg-gray-700 !text-gray-900 dark:!text-white font-bold"
          : "!bg-transparent !text-gray-700 dark:!text-gray-300 font-bold"
    ),
});

const bathroomOptions = [
  {
    value: BATHROOM_ARRANGEMENTS.PRIVATE,
    icon: ShowerHead,
    label: 'Own Private CR',
    description: 'Dedicated bathroom inside the room unit',
  },
  {
    value: BATHROOM_ARRANGEMENTS.COMMON,
    icon: Bath,
    label: 'Common Bathroom',
    description: "Uses the building's main shared CR",
  },
];

export default function RoomConfigStep({
  register,
  errors,
  watch,
  fields,
  append,
  remove,
  control,
  getValues,
  setValue,
  clearErrors,
  onCustomNavChange,
  onMainNext,
  onMainBack,
  defaultToLastRoom = false,
}: RoomConfigStepProps) {
  const toast = useResponsiveToast();
  const [activeRoomIndex, setActiveRoomIndex] = useState<number | null>(null);
  const [copiedConfig, setCopiedConfig] = useState<any>(null);
  const [justCopied, setJustCopied] = useState<number | null>(null);

  const propertyTypeId = watch('businessInfo.businessType') || watch('propertyInfo.propertyTypeId');
  const [dynamicAttributes, setDynamicAttributes] = useState<any[]>(() => getSyncAttributes() || []);
  const [isLoadingAttrs, setIsLoadingAttrs] = useState<boolean>(() => !getSyncAttributes() || getSyncAttributes()!.length === 0);
  const [roomTypeOptions, setRoomTypeOptions] = useState<any[]>(() => (propertyTypeId ? getSyncRoomTypes(propertyTypeId) || [] : []));

  // Sub-step Room Tab State
  const [activeRoomTab, setActiveRoomTab] = useState<number>(() => (defaultToLastRoom && fields.length > 0 ? fields.length - 1 : 0));
  const [amenitiesExpanded, setAmenitiesExpanded] = useState<Record<number, boolean>>({});

  const lastNavKeyRef = useRef<string>('');

  // Sync Sub-step Navigation with Main Wizard Bottom Action Bar
  useEffect(() => {
    if (!onCustomNavChange) return;

    const isLastUnit = activeRoomTab >= fields.length - 1;
    const isFirstUnit = activeRoomTab === 0;

    const currentRoomTypeVal = watch(`propertyConfig.rooms[${activeRoomTab}].roomType`);
    const currentRoomTypeObj = roomTypeOptions.find(o => o.value === currentRoomTypeVal);
    const isCurrentFlatRate = currentRoomTypeObj?.isFlatRate ?? (currentRoomTypeVal === 'SOLO' || currentRoomTypeVal === 'STUDIO' || currentRoomTypeVal === 'WHOLE_HOUSE');

    const nextRoomTypeVal = watch(`propertyConfig.rooms[${activeRoomTab + 1}].roomType`);
    const nextRoomTypeObj = roomTypeOptions.find(o => o.value === nextRoomTypeVal);
    const isNextFlatRate = nextRoomTypeObj?.isFlatRate ?? isCurrentFlatRate;

    const currentTerm = isCurrentFlatRate ? 'UNIT' : 'ROOM';
    const nextTerm = isNextFlatRate ? 'UNIT' : 'ROOM';

    const nextLabel = isLastUnit ? 'NEXT: PHOTO UPLOADS ›' : `NEXT: ${nextTerm} ${activeRoomTab + 2} ›`;
    const backLabel = isFirstUnit ? '‹ BACK: CONTRACT SETUP' : `‹ BACK: ${currentTerm} ${activeRoomTab}`;

    const currentNavKey = `${activeRoomTab}-${fields.length}-${nextLabel}-${backLabel}`;
    if (lastNavKeyRef.current === currentNavKey) {
      return;
    }
    lastNavKeyRef.current = currentNavKey;

    onCustomNavChange({
      nextLabel,
      backLabel,
      onNext: () => {
        const currentRoom = getValues(`propertyConfig.rooms[${activeRoomTab}]`);
        const isRoomValid = Boolean(
          currentRoom?.roomType &&
          currentRoom?.bedType &&
          currentRoom?.price &&
          currentRoom?.reservationFee &&
          currentRoom?.bedCount &&
          currentRoom?.size &&
          currentRoom?.bathroomArrangement
        );

        if (!isRoomValid) {
          if (onMainNext) onMainNext(); // triggers form validation
          return;
        }

        if (isLastUnit) {
          if (onMainNext) onMainNext();
        } else {
          setActiveRoomTab(prev => Math.min(fields.length - 1, prev + 1));
        }
      },
      onBack: () => {
        if (isFirstUnit) {
          if (onMainBack) onMainBack();
        } else {
          setActiveRoomTab(prev => Math.max(0, prev - 1));
        }
      },
    });
  }, [activeRoomTab, fields.length, onCustomNavChange, onMainNext, onMainBack, getValues, watch, roomTypeOptions]);

  // Auto-switch tab to room unit with validation error
  useEffect(() => {
    if (errors?.propertyConfig?.rooms) {
      const errorIndex = fields.findIndex((_, idx) => !!errors?.propertyConfig?.rooms?.[idx]);
      if (errorIndex !== -1 && errorIndex !== activeRoomTab) {
        setActiveRoomTab(errorIndex);
      }
    }
  }, [errors?.propertyConfig?.rooms]);

  // Keep activeRoomTab within valid index range when rooms are added/removed
  useEffect(() => {
    if (activeRoomTab >= fields.length && fields.length > 0) {
      setActiveRoomTab(fields.length - 1);
    }
  }, [fields.length, activeRoomTab]);

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Active Unit Amenity Sub-Group Tab per Room Card Index
  const [activeUnitTab, setActiveUnitTab] = useState<Record<number, string>>({});

  const kitchenSetup = watch('propertyConfig.kitchenSetup') || 'SHARED';
  const bathroomSetup = watch('propertyConfig.bathroomSetup') || 'SHARED';

  const watchedRooms = watch('propertyConfig.rooms');
  const bathroomCount = watch('propertyConfig.bathroomCount');

  // 1. Auto-calculate property starting price based on Math.min of configured room prices
  useEffect(() => {
    if (Array.isArray(watchedRooms) && watchedRooms.length > 0) {
      const validPrices = watchedRooms
        .map((r: any) => parseFloat(r?.price))
        .filter((p: number) => !isNaN(p) && p > 0);

      if (validPrices.length > 0) {
        const minPrice = Math.min(...validPrices);
        if (getValues('propertyInfo.price') !== minPrice) {
          setValue('propertyInfo.price', minPrice, { shouldValidate: true });
        }
      }
    }
  }, [watchedRooms, setValue, getValues]);

  // 2. Auto-set bathroomArrangement to PRIVATE_CR when bathroomSetup === 'PRIVATE' or bathroomCount === 0
  useEffect(() => {
    const isPrivateOnly = bathroomSetup === 'PRIVATE' || (Number(bathroomCount) || 0) === 0;
    if (Array.isArray(watchedRooms) && watchedRooms.length > 0) {
      watchedRooms.forEach((r: any, idx: number) => {
        const roomTypeObj = roomTypeOptions.find(o => o.value === r?.roomType);
        const isFlatRate = roomTypeObj?.isFlatRate ?? false;

        if (isPrivateOnly || isFlatRate) {
          if (r?.bathroomArrangement !== BATHROOM_ARRANGEMENTS.PRIVATE) {
            setValue(`propertyConfig.rooms[${idx}].bathroomArrangement`, BATHROOM_ARRANGEMENTS.PRIVATE, {
              shouldValidate: true
            });
          }
        } else if (!r?.bathroomArrangement) {
          setValue(`propertyConfig.rooms[${idx}].bathroomArrangement`, BATHROOM_ARRANGEMENTS.COMMON, {
            shouldValidate: true
          });
        }
      });
    }
  }, [bathroomSetup, bathroomCount, watchedRooms, roomTypeOptions, setValue]);

  useEffect(() => {
    const sync = getSyncAttributes();
    if (sync && sync.length > 0) {
      setDynamicAttributes(sync);
      setIsLoadingAttrs(false);
      return;
    }

    getCachedAttributes().then(attrs => {
      setDynamicAttributes(attrs);
      setIsLoadingAttrs(false);
    });
  }, []);

  useEffect(() => {
    if (propertyTypeId) {
      const syncRoomTypes = getSyncRoomTypes(propertyTypeId);
      if (syncRoomTypes) {
        setRoomTypeOptions(syncRoomTypes);
        return;
      }

      getCachedRoomTypes(propertyTypeId).then(options => {
        setRoomTypeOptions(options || []);
      });
    }
  }, [propertyTypeId]);

  const handleCopy = (index: number) => {
    const roomData = getValues(`propertyConfig.rooms[${index}]`);
    setCopiedConfig(roomData);
    setJustCopied(index);
    toast.success(`Room ${index + 1} configuration copied!`);
    setTimeout(() => setJustCopied(null), 2000);
  };

  const handleAmenityToggle = (roomIndex: number, attrId: string) => {
    const currentAmenities: any[] = getValues(`propertyConfig.rooms[${roomIndex}].amenities`) || [];
    const exists = currentAmenities.some((item: any) => {
      const itemStr = typeof item === 'string' ? item : (item.id || item.attributeId || item.name || item.key);
      return itemStr === attrId;
    });

    const updated = exists
      ? currentAmenities.filter((item: any) => {
          const itemStr = typeof item === 'string' ? item : (item.id || item.attributeId || item.name || item.key);
          return itemStr !== attrId;
        })
      : [...currentAmenities, attrId];

    setValue(`propertyConfig.rooms[${roomIndex}].amenities`, updated, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
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

    if (clearErrors) {
      clearErrors(`propertyConfig.rooms[${index}]`);
    }

    toast.success(`Settings applied to Room ${index + 1}!`);
  };

  const handleBulkApply = (template: any) => {
    setIsLoading(true);
    const rooms = getValues('propertyConfig.rooms') || [];

    const updatedRooms = rooms.map((room: any) => {
      const bedCount = parseInt(template.bedCount) || 1;
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

    if (clearErrors) {
      clearErrors('propertyConfig.rooms');
    }

    setTimeout(() => {
      setIsLoading(false);
      setShowBulkModal(false);
      toast.success(`Successfully configured all ${rooms.length} units!`);
    }, 800);
  };

  const getBedTypeOptions = (roomTypeId: string) => {
    const rt = roomTypeOptions.find(o => o.value === roomTypeId);
    if (rt && Array.isArray(rt.bedSetups) && rt.bedSetups.length > 0) {
      return rt.bedSetups
        .filter((bs: any) => bs.code !== 'ANY' && !bs.name.toLowerCase().includes('any bed'))
        .map((bs: any) => ({
          value: bs.code,
          label: bs.name,
          paxCapacity: bs.paxCapacity
        }));
    }
    if (rt && rt.isFlatRate) {
      return CENTRAL_BED_TYPES.filter(o => ['SINGLE', 'DOUBLE', 'QUEEN'].includes(o.value));
    }
    return CENTRAL_BED_TYPES.filter(o => ['SINGLE', 'BUNK'].includes(o.value));
  };

  const handleRoomTypeChange = (index: number, newTypeId: string) => {
    const availableBedOptions = getBedTypeOptions(newTypeId);
    const rt = roomTypeOptions.find(o => o.value === newTypeId);
    const isFlatRate = rt?.isFlatRate;
    const defaultBedOption = availableBedOptions.length > 0 ? availableBedOptions[0].value : (isFlatRate ? 'SINGLE' : 'BUNK');
    const bedCount = watch(`propertyConfig.rooms[${index}].bedCount`) || '1';

    const isBunk = defaultBedOption.toUpperCase().includes('BUNK');
    const multiplier = isBunk ? 2 : 1;
    const capacity = (parseInt(bedCount) * multiplier).toString();

    setValue(`propertyConfig.rooms[${index}].bedType`, defaultBedOption, { shouldValidate: true });
    setValue(`propertyConfig.rooms[${index}].bedCount`, bedCount, { shouldValidate: true });
    setValue(`propertyConfig.rooms[${index}].capacity`, capacity, { shouldValidate: true });
    setValue(`propertyConfig.rooms[${index}].availableSlots`, capacity, { shouldValidate: true });
  };

  useEffect(() => {
    const subscription = watch((value: any, { name }: { name?: string }) => {
      if (name?.includes('bedCount') || name?.includes('bedType')) {
        const indexMatch = name.match(/rooms\[(\d+)\]/);
        if (indexMatch) {
          const index = parseInt(indexMatch[1]);
          const room = value?.propertyConfig?.rooms?.[index];

          if (room && room.bedCount !== undefined && room.bedType !== undefined) {
            const multiplier = room.bedType === 'BUNK' ? 2 : 1;
            const calculatedCapacity = (parseInt(room.bedCount) || 1) * multiplier;

            setValue(`propertyConfig.rooms[${index}].capacity`, calculatedCapacity.toString());
            setValue(`propertyConfig.rooms[${index}].availableSlots`, calculatedCapacity.toString());
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  if (isLoadingAttrs) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-44 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
          <div className="w-36 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 space-y-6">
          <div className="h-6 w-52 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800" />
            <div className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800" />
            <div className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800" />
            <div className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* 1. Bulk Configuration Header Card (At the Very Top) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-8 bg-white dark:bg-gray-800 border-x-0 sm:border border-gray-200 dark:border-gray-700 rounded-none sm:rounded-[2.5rem] gap-3 sm:gap-6 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="p-2.5 sm:p-3.5 bg-primary/10 rounded-xl sm:rounded-2xl text-primary shrink-0">
            <Wand2 className="w-5 h-5 sm:w-6.5 sm:h-6.5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs sm:text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              Bulk Configuration
              <span className="text-[9px] sm:text-[10px] font-black bg-primary/10 text-primary border border-primary/20 px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {fields.length} {fields.length === 1 ? 'Unit' : 'Units'}
              </span>
            </h4>
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">
              Apply setup, pricing, or amenities to all active rooms in one click
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowBulkModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:px-7 sm:py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 group cursor-pointer border-none shrink-0"
        >
          <LayoutGrid size={15} className="group-hover:rotate-12 transition-transform" />
          <span>Configure All {fields.length} Units</span>
        </button>
      </div>

      {/* 2. Sub-Step Room Unit Tabs Bar (Light & Dark Adaptive) */}
      <div className="p-2 sm:p-2.5 bg-white dark:bg-gray-800/90 rounded-none sm:rounded-[2rem] border-x-0 sm:border border-gray-200 dark:border-gray-700/80 shadow-md">
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {fields.map((field, idx) => {
            const isComplete = Boolean(
              watch(`propertyConfig.rooms[${idx}].roomType`) &&
              watch(`propertyConfig.rooms[${idx}].bedType`) &&
              watch(`propertyConfig.rooms[${idx}].price`)
            );
            const hasError = !!errors?.propertyConfig?.rooms?.[idx];
            const isActive = activeRoomTab === idx;
            const rTypeVal = watch(`propertyConfig.rooms[${idx}].roomType`);
            const rtObj = roomTypeOptions.find(o => o.value === rTypeVal);
            const isFlat = rtObj?.isFlatRate ?? (rTypeVal === 'SOLO' || rTypeVal === 'STUDIO' || rTypeVal === 'WHOLE_HOUSE');

            return (
              <button
                key={field.id}
                type="button"
                onClick={() => {
                  if (idx > activeRoomTab) {
                    const currentRoom = getValues(`propertyConfig.rooms[${activeRoomTab}]`);
                    const isRoomValid = Boolean(
                      currentRoom?.roomType &&
                      currentRoom?.bedType &&
                      currentRoom?.price &&
                      currentRoom?.reservationFee &&
                      currentRoom?.bedCount &&
                      currentRoom?.size &&
                      currentRoom?.bathroomArrangement
                    );
                    if (!isRoomValid) {
                      if (onMainNext) onMainNext();
                      return;
                    }
                  }
                  setActiveRoomTab(idx);
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer select-none shrink-0 min-w-[120px] sm:min-w-[135px] justify-center",
                  isActive
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-[1.02]"
                    : hasError
                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 font-extrabold"
                    : isComplete
                    ? "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/60 text-teal-600 dark:text-teal-400 font-extrabold"
                    : "bg-gray-50 dark:bg-gray-900/60 border-gray-200/80 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold"
                )}
              >
                <Bed size={15} className={cn(isActive ? "text-white" : isComplete ? "text-teal-600 dark:text-teal-400" : hasError ? "text-rose-500" : "text-gray-400")} />
                <span>{isFlat ? 'Unit' : 'Room'} {idx + 1}</span>
                {isComplete && <CheckCircle2 size={15} className={cn("shrink-0 ml-0.5", isActive ? "text-white" : "text-teal-600 dark:text-teal-400")} />}
                {hasError && <AlertCircle size={15} className="text-rose-500 shrink-0 ml-0.5 animate-pulse" />}
              </button>
            );
          })}

          {/* Add Unit/Room Pill */}
          <button
            type="button"
            onClick={() => {
              const nextTotal = fields.length + 1;
              setValue('propertyConfig.totalRooms', nextTotal.toString(), { shouldValidate: true });
              append(defaultRoom());
              setActiveRoomTab(fields.length);
              toast.success(`New layout added!`);
            }}
            className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-black uppercase tracking-wider bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Layout</span>
          </button>
        </div>
      </div>

      {/* Focused Active Room Unit Workspace */}
      <div className="grid grid-cols-1 gap-6 sm:gap-12">
        {fields.map((field, index) => {
          if (index !== activeRoomTab) return null;

          const currentRoomTypeVal = watch(`propertyConfig.rooms[${index}].roomType`);
          const selectedRoomType = roomTypeOptions.find(o => o.value === currentRoomTypeVal);
          const isFlatRate = selectedRoomType?.isFlatRate ?? false;
          const currentBathroom = watch(`propertyConfig.rooms[${index}].bathroomArrangement`);
          const roomError = errors?.propertyConfig?.rooms?.[index];

          // Dynamic Labels Matrix
          const roomTypeLabel = isFlatRate ? 'Unit Layout' : 'Room Category';
          const priceLabel = isFlatRate ? 'Monthly Unit Price (₱)' : 'Monthly Rate Per Head (₱)';
          const sizeLabel = isFlatRate ? 'Unit Area (Sqm)' : 'Room Size (Sqm)';
          const capacityLabel = isFlatRate ? 'Unit Capacity' : 'Bedspace Capacity';

          const hasInUnitKitchen = kitchenSetup === 'IN_UNIT';
          const hasPrivateCR = currentBathroom === BATHROOM_ARRANGEMENTS.PRIVATE || bathroomSetup === 'PRIVATE';

          const unitSubGroups = [
            ...(hasInUnitKitchen ? [{ key: 'KITCHEN_APP', label: 'Kitchen', icon: Utensils }] : []),
            ...(hasPrivateCR ? [{ key: 'BATHROOM_FIX', label: 'CR Features', icon: ShowerHead }] : []),
            { key: 'COOLING', label: 'Cooling & AC', icon: Wind },
            { key: 'FURNITURE', label: 'Furniture', icon: Sofa },
          ];

          const currentTab = activeUnitTab[index] || (unitSubGroups[0]?.key || 'COOLING');
          const currentRoomAmenities: string[] = watch(`propertyConfig.rooms[${index}].amenities`) || [];
          const isAmenitiesOpen = amenitiesExpanded[index] ?? true;

          return (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-none sm:rounded-[2.5rem] border-x-0 sm:border-2 transition-all duration-500 overflow-hidden shadow-sm space-y-5 sm:space-y-8 p-4 sm:p-10",
                roomError ? "border-rose-500 ring-4 ring-rose-500/5 shadow-rose-500/10" : "border-gray-200 dark:border-gray-700 hover:border-primary/30"
              )}
              id={`room-card-${index}`}
            >
              {/* Header */}
              <div className="pb-3.5 sm:pb-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary shadow-sm text-xs sm:text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-xs sm:text-lg flex items-center gap-2 truncate">
                      {isFlatRate ? `Unit ${index + 1} Details` : `Room ${index + 1} Details`}
                      {justCopied === index && (
                        <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 animate-pulse shrink-0">
                          Copied!
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5 truncate">
                      {selectedRoomType ? selectedRoomType.label : 'Select Category'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(index)}
                    title="Copy configuration"
                    className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-800 hover:bg-primary/10 hover:text-primary text-gray-600 dark:text-gray-400 rounded-xl text-xs font-bold transition-all border border-gray-200 dark:border-gray-700 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePaste(index)}
                    disabled={!copiedConfig}
                    title="Paste copied configuration"
                    className={cn(
                      "p-2 sm:p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                      copiedConfig
                        ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                        : "bg-gray-50 dark:bg-gray-800/40 text-gray-300 dark:text-gray-700 border-gray-100 dark:border-gray-800 cursor-not-allowed"
                    )}
                  >
                    <ClipboardPaste className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        remove(index);
                        const nextTotal = Math.max(1, fields.length - 1);
                        setValue('propertyConfig.totalRooms', nextTotal.toString(), { shouldValidate: true });
                        toast.success(`Unit ${index + 1} removed.`);
                      }}
                      className="p-2 sm:p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl text-xs font-bold transition-all border border-rose-100 dark:border-rose-900/50 cursor-pointer ml-1"
                    >
                      <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Form Inputs Grid (Compact 2-Column Pairing for Mobile) */}
              <div className="space-y-4 sm:space-y-6">
                {/* Row 1: Room Category & Bed Type (2-Column Pair) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  {/* 1. ROOM TYPE / CATEGORY DROPDOWN */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest block truncate">
                      {roomTypeLabel} <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <Controller
                      name={`propertyConfig.rooms[${index}].roomType`}
                      control={control}
                      rules={{ required: 'Room category is required' }}
                      render={({ field: selectField }) => {
                        const selectedOpt = selectField.value
                          ? roomTypeOptions.find(o => 
                              o.value === selectField.value || 
                              o.id === selectField.value || 
                              o.name === selectField.value || 
                              o.label === selectField.value || 
                              o.code === selectField.value
                            ) || null
                          : null;
                        return (
                          <ReactSelect
                            {...selectField}
                            options={roomTypeOptions}
                            value={selectedOpt}
                            onChange={(opt: any) => {
                              selectField.onChange(opt ? opt.value : '');
                              handleRoomTypeChange(index, opt ? opt.value : '');
                              if (clearErrors) {
                                clearErrors(`propertyConfig.rooms.${index}.roomType`);
                                clearErrors(`propertyConfig.rooms[${index}].roomType`);
                              }
                            }}
                            placeholder={isFlatRate ? "Select layout..." : "Select category..."}
                            unstyled
                            classNames={getSelectClassNames(!!errors?.propertyConfig?.rooms?.[index]?.roomType)}
                            components={{
                              DropdownIndicator: CustomDropdownIndicator,
                              Option: CustomOption,
                            }}
                          />
                        );
                      }}
                    />
                    {errors?.propertyConfig?.rooms?.[index]?.roomType && (
                      <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        <span>{errors.propertyConfig.rooms[index].roomType.message}</span>
                      </p>
                    )}
                  </div>

                  {/* 2. BED TYPE DROPDOWN */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest block truncate">
                      Bed Type <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <Controller
                      name={`propertyConfig.rooms[${index}].bedType`}
                      control={control}
                      rules={{ required: 'Bed type is required' }}
                      render={({ field: selectField }) => {
                        const opts = getBedTypeOptions(currentRoomTypeVal);
                        const selectedOpt = opts.find((o: any) => o.value === selectField.value) || null;
                        return (
                          <ReactSelect
                            {...selectField}
                            options={opts}
                            value={selectedOpt}
                            onChange={(opt: any) => {
                              selectField.onChange(opt ? opt.value : '');
                              if (clearErrors) {
                                clearErrors(`propertyConfig.rooms.${index}.bedType`);
                                clearErrors(`propertyConfig.rooms[${index}].bedType`);
                              }
                            }}
                            placeholder="Select bed type..."
                            unstyled
                            classNames={getSelectClassNames(!!errors?.propertyConfig?.rooms?.[index]?.bedType)}
                            components={{
                              DropdownIndicator: CustomDropdownIndicator,
                              Option: CustomOption,
                            }}
                          />
                        );
                      }}
                    />
                    {errors?.propertyConfig?.rooms?.[index]?.bedType && (
                      <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        <span>{errors.propertyConfig.rooms[index].bedType.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2: Monthly Price & Reservation Fee (2-Column Pair on Mobile) */}
                <div className="grid grid-cols-2 gap-3 sm:gap-6">
                  {/* 3. MONTHLY PRICE / RATE PER HEAD */}
                  <div className="space-y-1.5 min-w-0">
                    <Input
                      label={priceLabel}
                      id={`propertyConfig.rooms[${index}].price`}
                      type="number"
                      register={register}
                      errors={errors}
                      watch={watch}
                      required
                      placeholder="e.g. 8500"
                      useStaticLabel={true}
                      onKeyDown={(e: any) => { if (['e', 'E', '-', '+'].includes(e.key)) e.preventDefault(); }}
                      validationRules={{
                        required: "Price is required",
                        min: { value: 1, message: "Must be > 0" }
                      }}
                    />
                  </div>

                  {/* 4. RESERVATION FEE */}
                  <div className="space-y-1.5 min-w-0">
                    <Input
                      label="Reservation Fee (₱)"
                      id={`propertyConfig.rooms[${index}].reservationFee`}
                      type="number"
                      register={register}
                      errors={errors}
                      watch={watch}
                      required
                      placeholder="e.g. 500"
                      useStaticLabel={true}
                      onKeyDown={(e: any) => { if (['e', 'E', '-', '+'].includes(e.key)) e.preventDefault(); }}
                      validationRules={{
                        required: "Fee is required",
                        min: { value: 0, message: "Cannot be negative" }
                      }}
                    />
                  </div>
                </div>

                {/* Row 3: Bed Count & Capacity & Floor Area (Compact 3-Column Grid) */}
                <div className="grid grid-cols-3 gap-2 sm:gap-6">
                  {/* 5. BED COUNT */}
                  <div className="space-y-1.5 min-w-0">
                    <Input
                      label="Bed Count"
                      id={`propertyConfig.rooms[${index}].bedCount`}
                      type="number"
                      register={register}
                      errors={errors}
                      watch={watch}
                      required
                      placeholder="e.g. 1"
                      useStaticLabel={true}
                      onKeyDown={(e: any) => { if (['e', 'E', '-', '+'].includes(e.key)) e.preventDefault(); }}
                      validationRules={{
                        required: "Bed count required",
                        min: { value: 1, message: "Min 1 bed" }
                      }}
                    />
                  </div>

                  {/* 6. CAPACITY (AUTO CALCULATED) */}
                  <div className="space-y-1.5 min-w-0">
                    <label className="text-[10px] sm:text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest block truncate">
                      {capacityLabel}
                    </label>
                    <div className="bg-gray-100 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700/80 rounded-2xl px-2.5 sm:px-3.5 py-3 sm:p-3.5 flex items-center justify-between shadow-inner h-[52px]">
                      <span className="font-black text-[11px] sm:text-xs uppercase tracking-wider text-primary truncate">
                        {watch(`propertyConfig.rooms[${index}].capacity`) || 1} PAX
                      </span>
                      <Users size={14} className="text-gray-400 shrink-0 hidden sm:block" />
                    </div>
                  </div>

                  {/* 7. ROOM / UNIT FLOOR AREA (SQM) */}
                  <div className="space-y-1.5 min-w-0">
                    <Input
                      label={sizeLabel}
                      id={`propertyConfig.rooms[${index}].size`}
                      type="number"
                      register={register}
                      errors={errors}
                      watch={watch}
                      required
                      placeholder="e.g. 24"
                      useStaticLabel={true}
                      onKeyDown={(e: any) => { if (['e', 'E', '-', '+'].includes(e.key)) e.preventDefault(); }}
                      validationRules={{
                        required: "Area required",
                        min: { value: 1, message: "Min 1 SQM" }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 8. BATHROOM ARRANGEMENT CARDS (2-Column Mobile Grid) */}
              <div className="space-y-2.5 sm:space-y-3 pt-3.5 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
                <label className="text-[10px] sm:text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest block">
                  Bathroom Arrangement <span className="text-red-500 ml-0.5">*</span>
                </label>
                
                {(() => {
                  const bathroomErr = errors?.propertyConfig?.rooms?.[index]?.bathroomArrangement || (errors?.propertyConfig?.rooms as any)?.[`${index}`]?.bathroomArrangement;
                  const hasBathroomError = !!bathroomErr;

                  return (
                    <>
                      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                        {bathroomOptions.map((opt) => {
                          const OptionIcon = opt.icon;
                          const isSelected = currentBathroom === opt.value;
                          const isDisabled = opt.value === BATHROOM_ARRANGEMENTS.COMMON && (
                            watch('propertyConfig.bathroomSetup') === 'PRIVATE' ||
                            (Number(watch('propertyConfig.bathroomCount')) || 0) === 0
                          );

                          return (
                            <button
                              key={opt.value}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => {
                                setValue(`propertyConfig.rooms[${index}].bathroomArrangement`, opt.value, { shouldValidate: true });
                                if (clearErrors) {
                                  clearErrors(`propertyConfig.rooms.${index}.bathroomArrangement`);
                                  clearErrors(`propertyConfig.rooms[${index}].bathroomArrangement`);
                                }
                              }}
                              className={cn(
                                "p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-left transition-all flex flex-col sm:flex-row items-start gap-2.5 sm:gap-4 cursor-pointer select-none min-h-[64px]",
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary shadow-md ring-2 ring-primary/20 scale-[1.01]"
                                  : hasBathroomError
                                  ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20"
                                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 hover:border-primary/40 hover:bg-primary/5",
                                isDisabled && "opacity-40 cursor-not-allowed border-dashed bg-gray-50 dark:bg-gray-900/20"
                              )}
                            >
                              <div className={cn(
                                "p-2 sm:p-3 rounded-xl transition-colors shrink-0",
                                isSelected ? "bg-primary text-white shadow-md" : hasBathroomError ? "bg-rose-500/10 text-rose-500" : "bg-gray-100 dark:bg-gray-800 text-primary"
                              )}>
                                <OptionIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className={cn("font-black text-xs uppercase tracking-wider line-clamp-1", hasBathroomError && !isSelected ? "text-rose-500" : "text-gray-900 dark:text-white")}>{opt.label}</h5>
                                <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 mt-0.5 leading-tight line-clamp-2">{opt.description}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {hasBathroomError && (
                        <p className="text-[10px] font-bold text-rose-500 mt-1.5 flex items-center gap-1">
                          <AlertCircle size={12} />
                          <span>{bathroomErr?.message || 'Please select a bathroom arrangement'}</span>
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* 9. UNIT-SPECIFIC AMENITIES COLLAPSIBLE ACCORDION */}
              <div className="space-y-3 sm:space-y-4 pt-3.5 sm:pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setAmenitiesExpanded(prev => ({ ...prev, [index]: !isAmenitiesOpen }))}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/70 dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-all cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg sm:rounded-xl text-primary shrink-0">
                      <Sparkles size={15} className="group-hover:rotate-12 transition-transform" />
                    </div>
                    <div className="text-left min-w-0">
                      <h5 className="text-[10px] sm:text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider truncate">
                        {isFlatRate ? 'Unit-Specific Amenities' : 'Room-Specific Amenities'}
                      </h5>
                      <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 truncate">
                        {currentRoomAmenities.length} Selected
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold text-primary shrink-0 ml-2">
                    <span className="hidden sm:inline">{isAmenitiesOpen ? 'Collapse' : 'Configure'}</span>
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ChevronDown size={14} className={cn("transition-transform duration-300 stroke-[3px]", isAmenitiesOpen && "rotate-180")} />
                    </div>
                  </div>
                </button>

                {/* Collapsible Content */}
                {isAmenitiesOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 pt-1"
                  >
                    {/* Sub-Group Tabs Bar */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b border-gray-100 dark:border-gray-800">
                      {unitSubGroups.map(grp => {
                        const GrpIcon = grp.icon;
                        const isTabActive = currentTab === grp.key;

                        return (
                          <button
                            key={grp.key}
                            type="button"
                            onClick={() => setActiveUnitTab(prev => ({ ...prev, [index]: grp.key }))}
                            className={cn(
                              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer select-none",
                              isTabActive
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-gray-100 dark:bg-gray-800 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            )}
                          >
                            <GrpIcon size={14} className={isTabActive ? "text-white" : "text-primary shrink-0"} />
                            <span>{grp.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Amenities Grid for Selected Sub-Group (2-Column Mobile Grid) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                      {(() => {
                        return dynamicAttributes
                          .filter(a => {
                            if (a.setupContext === 'SHARED' || a.setupContext === 'COMMON_CR') return false;
                            const nameLower = (a.name || a.title || '').toLowerCase();
                            if (nameLower.startsWith('shared ') || nameLower.startsWith('regular common')) return false;

                            let matchesSubGroup = false;
                            if (currentTab === 'KITCHEN_APP') {
                              matchesSubGroup = a.subGroupKey === 'KITCHEN_APP' || a.subGroupKey === 'KITCHEN';
                            } else if (currentTab === 'BATHROOM_FIX') {
                              matchesSubGroup = a.subGroupKey === 'BATHROOM_FIX' || a.subGroupKey === 'BATHROOM' || a.subGroupKey === 'CR_FEATURES';
                            } else if (currentTab === 'COOLING') {
                              matchesSubGroup = a.subGroupKey === 'COOLING' || a.subGroupKey === 'AC' || a.subGroupKey === 'AIR_CONDITIONING';
                            } else if (currentTab === 'FURNITURE') {
                              matchesSubGroup = a.subGroupKey === 'FURNITURE' || a.subGroupKey === 'ROOM_FURNITURE';
                            } else {
                              matchesSubGroup = a.subGroupKey === currentTab;
                            }

                            return matchesSubGroup;
                          })
                          .map(attr => {
                            const Icon = getSafeLucideIcon(attr.icon, CheckCircle2);
                            const isChecked = currentRoomAmenities.some((item: any) => {
                              const itemStr = typeof item === 'string' ? item : (item.id || item.attributeId || item.name || item.key);
                              return itemStr === attr.id || itemStr === attr.name || itemStr === attr.key || itemStr === attr.title;
                            });

                            return (
                              <div
                                key={attr.id}
                                onClick={() => handleAmenityToggle(index, attr.id)}
                                className={cn(
                                  "flex items-center gap-2.5 p-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer select-none min-h-[56px]",
                                  isChecked
                                    ? "bg-primary/10 border-primary text-gray-900 dark:text-white shadow-sm ring-1 ring-primary/20"
                                    : "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 hover:border-primary/30"
                                )}
                              >
                                <div className={cn(
                                  "w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-md border-2 transition-all flex items-center justify-center shrink-0",
                                  isChecked ? "bg-primary border-primary text-white shadow-sm" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                                )}>
                                  {isChecked && <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" />}
                                </div>
                                <Icon size={16} className={cn("shrink-0 transition-colors", isChecked ? "text-primary" : "text-gray-400")} />
                                <span className={cn("text-xs flex-1 transition-colors leading-snug line-clamp-2", isChecked ? "text-gray-900 dark:text-white font-extrabold" : "text-gray-700 dark:text-gray-300 font-bold")}>
                                  {attr.name}
                                </span>
                              </div>
                            );
                          });
                      })()}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bulk Configuration Modal */}
      {showBulkModal && (
        <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} width="lg" hasFixedFooter fullOnMobile={true} closeOnOutsideClick={false}>
          <BulkConfigureModal
            onClose={() => setShowBulkModal(false)}
            onApply={handleBulkApply}
            roomCount={fields.length}
            propertyTypeId={propertyTypeId}
            commonBathroomCount={parseInt(bathroomCount) || 0}
          />
        </Modal>
      )}
    </div>
  );
}
