'use client';

import React, { useEffect, useState } from 'react';
import Input from '@/components/inputs/Input';
import Textarea from '@/components/inputs/Textarea';
import { Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import { 
  Building2, Tag, DollarSign, Briefcase, LayoutGrid, Info, 
  Building, Home, Sparkles, Check, AlertCircle, ShieldCheck
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import HelpTooltip from '@/components/common/HelpTooltip';

import { getCachedPropertyTypes, getSyncPropertyTypes } from '@/lib/landlordTaxonomyCache';
import { formatCleanTitle } from '@/lib/utils';

interface PropertyBasicStepProps {
  register: any;
  errors: any;
  watch: any;
  control: any;
  setValue?: any;
  clearErrors?: any;
  isEditMode?: boolean;
}

const getSafeLucideIcon = (iconName: string) => {
  if (!iconName) return Building;
  const IconObj = (LucideIcons as Record<string, any>)[iconName];
  if (!IconObj) return Building;
  if (typeof IconObj === 'function' || typeof IconObj === 'object') {
    return IconObj;
  }
  return Building;
};

const DEFAULT_PROPERTY_TYPES = [
  { id: "bh-1", name: "Boarding House", icon: "Home", description: "Multi-room residential building with per-head sharing bedspace & solo rooms." },
  { id: "apt-2", name: "Apartment", icon: "Building", description: "Self-contained whole unit rented at a flat rate, studio & multi-bedroom." },
  { id: "dorm-3", name: "Dormitory", icon: "Building2", description: "Student-focused communal accommodation with shared facilities." },
  { id: "trans-4", name: "Transient House", icon: "Tent", description: "Short-term temporary stay lodging for guests and visiting students." },
  { id: "agri-5", name: "Agri-Hostel", icon: "Trees", description: "Specialized eco-friendly accommodation near agricultural facilities." },
];

export default function PropertyBasicStep({ 
  register, 
  errors, 
  watch, 
  control, 
  setValue,
  clearErrors,
  isEditMode = false
}: PropertyBasicStepProps) {
  const [propertyTypes, setPropertyTypes] = useState<any[]>(() => getSyncPropertyTypes() || []);
  const [isLoading, setIsLoading] = useState<boolean>(() => !getSyncPropertyTypes() || getSyncPropertyTypes()!.length === 0);

  useEffect(() => {
    let isMounted = true;
    const sync = getSyncPropertyTypes();
    if (sync && sync.length > 0) {
      setPropertyTypes(sync);
      setIsLoading(false);
      return;
    }

    async function loadPropertyTypes() {
      try {
        const types = await getCachedPropertyTypes();
        if (isMounted) {
          if (types && types.length > 0) {
            setPropertyTypes(types);
          } else {
            setPropertyTypes(DEFAULT_PROPERTY_TYPES);
          }
        }
      } catch (err) {
        if (isMounted) {
          setPropertyTypes(DEFAULT_PROPERTY_TYPES);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPropertyTypes();
    return () => {
      isMounted = false;
    };
  }, []);

  const businessDesc = watch('businessInfo.businessDescription') || '';
  const propertyDesc = watch('propertyInfo.description') || '';
  const selectedTypeId = watch('propertyInfo.propertyTypeId') || watch('businessInfo.businessType');
  const selectedPropertyType = propertyTypes.find(pt => pt.id === selectedTypeId || pt.name === selectedTypeId);

  // Card Level Error Detection
  const hasCard1Error = !!(
    errors?.businessInfo?.businessName ||
    errors?.businessInfo?.yearsExperience ||
    errors?.businessInfo?.businessDescription
  );

  const hasCard2Error = !!(
    errors?.businessInfo?.businessType ||
    errors?.propertyInfo?.propertyTypeId
  );

  const hasCard3Error = !!(
    errors?.propertyInfo?.propertyName ||
    errors?.propertyInfo?.price ||
    errors?.propertyInfo?.description
  );

  const hasExperienceError = !!errors?.businessInfo?.yearsExperience;

  const handleSelectCategory = (pt: any) => {
    if (setValue) {
      setValue('businessInfo.businessType', pt.id, { shouldValidate: true, shouldDirty: true });
      setValue('propertyInfo.propertyTypeId', pt.id, { shouldValidate: true, shouldDirty: true });
      setValue('propertyInfo.category', pt.name || pt.id, { shouldValidate: true, shouldDirty: true });
    }
    if (clearErrors) {
      clearErrors('businessInfo.businessType');
      clearErrors('propertyInfo.propertyTypeId');
      clearErrors('propertyInfo.category');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-10">
      {/* Step Banner */}
      <motion.div
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 rounded-none sm:rounded-3xl p-4 sm:p-8 border-x-0 sm:border border-primary/20 dark:border-primary/30 shadow-sm"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2.5 sm:p-3.5 bg-primary/10 rounded-xl sm:rounded-2xl text-primary shadow-inner shrink-0">
            <Building2 className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs sm:text-base">
              Step 1: Property Identity & Essentials
            </h3>
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 leading-snug">
              Establish your brand identity, select property type, and configure main details
            </p>
          </div>
        </div>
      </motion.div>

      {/* 💼 CARD 1: BUSINESS BACKGROUND (Admin Moderation & Verification Data) - Hidden in Edit Mode */}
      {!isEditMode && (
        <motion.div
        className={`bg-white dark:bg-gray-800 rounded-none sm:rounded-[2.5rem] p-4 sm:p-10 border-x-0 sm:border-2 transition-all space-y-5 sm:space-y-8 ${
          hasCard1Error 
            ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5 shadow-rose-500/10" 
            : "border-gray-200 dark:border-gray-700 shadow-sm"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-100 dark:border-gray-700 pb-4 sm:pb-5">
          <div className="flex items-center space-x-3">
            <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${hasCard1Error ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"}`}>
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className={`text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] ${hasCard1Error ? "text-rose-500" : "text-gray-900 dark:text-white"}`}>
                1. Business Background {hasCard1Error && <span className="text-rose-500 ml-0.5">*</span>}
              </h4>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                Admin moderation & verification details for host trust badge
              </p>
            </div>
          </div>
          <span className={`self-start sm:self-auto px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg shrink-0 ${hasCard1Error ? "bg-rose-500/20 text-rose-500" : "bg-primary/10 text-primary"}`}>
            Verification Data
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          <Input
            label="Registered Business Name"
            id="businessInfo.businessName"
            type="text"
            register={register}
            errors={errors}
            watch={watch}
            required
            placeholder="e.g. 'TAU Garden Boarding House'"
            useStaticLabel={true}
            onInput={(e: any) => {
              e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s-]/g, '');
            }}
            onBlur={(e: any) => {
              if (e.target.value && setValue) {
                const formatted = formatCleanTitle(e.target.value);
                if (formatted !== e.target.value) {
                  setValue('businessInfo.businessName', formatted, { shouldValidate: true, shouldTouch: true });
                }
              }
            }}
            validationRules={{
              required: "Business name must be at least 3 characters",
              minLength: { value: 3, message: "Business name must be at least 3 characters" }
            }}
          />

          <div className="relative" id="businessInfo.yearsExperience">
            <label className={`block text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${hasExperienceError ? "text-rose-500" : "text-slate-700 dark:text-gray-300"}`}>
              Years of Experience <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <Controller
              name="businessInfo.yearsExperience"
              control={control}
              rules={{ required: "Please select years of experience" }}
              render={({ field }) => (
                <ReactSelect
                  {...field}
                  options={[
                    { value: 'less-than-1', label: 'Less than 1 year' },
                    { value: '1-2', label: '1 - 2 years' },
                    { value: '3-5', label: '3 - 5 years' },
                    { value: '5-plus', label: '5+ years' }
                  ]}
                  value={field.value ? { value: field.value, label: field.value === 'less-than-1' ? 'Less than 1 year' : field.value === '5-plus' ? '5+ years' : `${field.value} years` } : null}
                  onChange={(val: any) => field.onChange(val?.value)}
                  placeholder="Select experience..."
                  classNames={{
                    control: (state) => `!bg-white dark:!bg-gray-800 !border ${hasExperienceError ? '!border-rose-500 !ring-4 !ring-rose-500/20 !bg-rose-50/20 dark:!bg-rose-950/20' : state.isFocused ? '!border-primary !ring-1 !ring-primary' : '!border-gray-200 dark:!border-gray-700'} !rounded-2xl !p-[5px] !shadow-sm transition-all text-[15px]`,
                    singleValue: () => `!text-text-primary dark:!text-gray-100 font-bold`,
                    menu: () => `!bg-white dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-2xl !rounded-2xl !mt-2 z-[60] overflow-hidden`,
                    menuList: () => `!p-0`,
                    option: (state) => `!cursor-pointer ${state.isSelected ? '!bg-primary/10 !text-primary font-black' : state.isFocused ? '!bg-gray-100 dark:!bg-gray-700 !text-text-primary dark:!text-gray-100' : '!bg-transparent'} !px-4 !py-3 !text-xs uppercase tracking-widest transition-colors`,
                  }}
                  instanceId="experience-select"
                />
              )}
            />
            {errors?.businessInfo?.yearsExperience && (
              <p className="mt-1.5 text-[10px] text-rose-500 font-black uppercase tracking-wider flex items-center gap-1">
                <AlertCircle size={10} />
                {errors.businessInfo.yearsExperience.message || "Please select years of experience"}
              </p>
            )}
          </div>
        </div>

        <div>
          <Textarea 
            label="Tell us your mission" 
            id="businessInfo.businessDescription" 
            register={register} 
            errors={errors} 
            watch={watch} 
            required 
            rows={3} 
            placeholder="Describe your boarding house business... What makes your property unique?" 
            onInput={(e: any) => {
              e.target.value = e.target.value.replace(/[<>=;{}[\]]/g, '');
            }}
            validationRules={{
              required: "Mission description must be at least 100 characters",
              minLength: { value: 100, message: "Mission description must be at least 100 characters" }
            }}
          />
          <div className={`mt-1 text-[10px] font-black tracking-wider text-right uppercase ${businessDesc.length < 100 ? 'text-rose-500' : 'text-primary'}`}>
            {businessDesc.length} / 100 minimum characters
          </div>
        </div>
      </motion.div>
      )}

      {/* 🏷️ CARD 2: ACCOMMODATION CATEGORY (Visual Category Cards with Red Border Validation) */}
      <motion.div
        id="businessInfo.businessType"
        className={`bg-white dark:bg-gray-800 rounded-none sm:rounded-[2.5rem] p-4 sm:p-10 border-x-0 sm:border-2 transition-all space-y-5 sm:space-y-8 ${
          hasCard2Error 
            ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5 shadow-rose-500/10" 
            : "border-gray-200 dark:border-gray-700 shadow-sm"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-100 dark:border-gray-700 pb-4 sm:pb-5">
          <div className="flex items-center space-x-3">
            <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${hasCard2Error ? "bg-rose-500/10 text-rose-500" : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"}`}>
              <Tag className="w-4 h-4 sm:w-5 sm:h-5 rotate-90" />
            </div>
            <div>
              <h4 className={`text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] ${hasCard2Error ? "text-rose-500" : "text-gray-900 dark:text-white"}`}>
                2. Property Type <span className="text-rose-500 ml-0.5">*</span>
              </h4>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                Select the primary property type offered at your compound
              </p>
            </div>
          </div>
          <span className={`self-start sm:self-auto px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg shrink-0 ${hasCard2Error ? "bg-rose-500/20 text-rose-500" : "bg-blue-50 dark:bg-blue-900/30 text-blue-600"}`}>
            Public Student Filter
          </span>
        </div>

        {/* Inline Gray Skeleton Loader matching PropertyTypeStep.tsx */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between h-24 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-48" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Visual Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
              {propertyTypes.map((pt) => {
                const isSelected = selectedTypeId === pt.id || selectedTypeId === pt.name;
                const Icon = getSafeLucideIcon(pt.icon);

                return (
                  <div
                    key={pt.id}
                    onClick={() => handleSelectCategory(pt)}
                    className={`p-3 sm:p-5 rounded-xl sm:rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
                      isSelected
                        ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/10 scale-[1.01]"
                        : hasCard2Error
                        ? "border-rose-400/60 bg-rose-500/5 hover:border-rose-500"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all shrink-0 ${
                        isSelected 
                          ? "bg-primary text-white shadow-md shadow-primary/20 scale-105" 
                          : hasCard2Error
                          ? "bg-rose-500/10 text-rose-500"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 group-hover:bg-primary/10 group-hover:text-primary"
                      }`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`font-black text-xs sm:text-sm uppercase tracking-wide truncate ${
                            isSelected ? "text-primary dark:text-primary" : "text-gray-900 dark:text-white"
                          }`}>
                            {pt.name}
                          </span>
                          {pt.description && <HelpTooltip text={pt.description} />}
                        </div>
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-0.5 leading-snug line-clamp-2 sm:line-clamp-none">
                          {pt.description}
                        </span>
                      </div>
                    </div>

                    {/* Radio Check Indicator */}
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ml-2.5 sm:ml-3 ${
                      isSelected ? 'border-primary bg-primary text-white' : hasCard2Error ? 'border-rose-400' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Reassurance Banner using DB PropertyType.description */}
            {selectedPropertyType?.description && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3.5 sm:p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20 flex items-start gap-3"
              >
                <Sparkles size={18} className="text-primary shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Selected Property Type: {selectedPropertyType.name}
                  </h5>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed">
                    {selectedPropertyType.description}
                  </p>
                </div>
              </motion.div>
            )}

            {hasCard2Error && !selectedTypeId && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/90 p-3.5 rounded-2xl border border-rose-300 dark:border-rose-800 flex items-center gap-2 shadow-sm"
              >
                <AlertCircle size={16} className="text-rose-500 shrink-0" />
                <span>Please click and select a property type above before continuing.</span>
              </motion.p>
            )}
          </div>
        )}
      </motion.div>

      {/* 📝 CARD 3: PROPERTY ESSENTIALS (Public Listing Essentials) */}
      <motion.div
        className={`bg-white dark:bg-gray-800 rounded-none sm:rounded-[2.5rem] p-4 sm:p-10 border-x-0 sm:border-2 transition-all space-y-5 sm:space-y-8 ${
          hasCard3Error 
            ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5 shadow-rose-500/10" 
            : "border-gray-200 dark:border-gray-700 shadow-sm"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-100 dark:border-gray-700 pb-4 sm:pb-5">
          <div className="flex items-center space-x-3">
            <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${hasCard3Error ? "bg-rose-500/10 text-rose-500" : "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"}`}>
              <LayoutGrid size={20} />
            </div>
            <div>
              <h4 className={`text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] ${hasCard3Error ? "text-rose-500" : "text-gray-900 dark:text-white"}`}>
                3. Property Essentials {hasCard3Error && <span className="text-rose-500 ml-0.5">*</span>}
              </h4>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                Public listing title, description, and starting rate
              </p>
            </div>
          </div>
          <span className={`self-start sm:self-auto px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg shrink-0 ${hasCard3Error ? "bg-rose-500/20 text-rose-500" : "bg-purple-50 dark:bg-purple-900/30 text-purple-600"}`}>
            Public Card Details
          </span>
        </div>

        <div className="space-y-4 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            <Input 
              label="Listing Title" 
              id="propertyInfo.propertyName" 
              type="text" 
              register={register} 
              errors={errors} 
              watch={watch} 
              required 
              placeholder="e.g. 'Maligaya Residence'" 
              useStaticLabel 
              onInput={(e: any) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s-]/g, '');
              }}
              onBlur={(e: any) => {
                if (e.target.value && setValue) {
                  const formatted = formatCleanTitle(e.target.value);
                  if (formatted !== e.target.value) {
                    setValue('propertyInfo.propertyName', formatted, { shouldValidate: true, shouldTouch: true });
                  }
                }
              }}
              validationRules={{
                required: "Display name must be at least 3 characters",
                minLength: { value: 3, message: "Display name must be at least 3 characters" }
              }}
            />

            <Input 
              label="Estimated Starting Price (PHP)" 
              id="propertyInfo.price" 
              type="number" 
              register={register} 
              errors={errors} 
              watch={watch} 
              required 
              placeholder="e.g. 3500" 
              icon={DollarSign} 
              useStaticLabel 
              helpText="Initial starting estimate. When you configure your specific rooms in Step 4, your starting price will automatically sync to your lowest room rate!"
              validationRules={{
                required: "Please enter a valid starting price (min ₱500)",
                min: { value: 500, message: "Please enter a valid starting price (min ₱500)" },
                max: { value: 50000, message: "Price cannot exceed 50,000 PHP" }
              }}
            />
          </div>

          <div>
            <Textarea 
              label="Property Description" 
              id="propertyInfo.description" 
              register={register} 
              errors={errors} 
              watch={watch} 
              required 
              rows={4} 
              placeholder="Describe your property in detail... location, features, and what makes it attractive to TAU students." 
              onInput={(e: any) => {
                e.target.value = e.target.value.replace(/[<>=;{}[\]]/g, '');
              }}
              validationRules={{
                required: "Property description must be at least 100 characters",
                minLength: { value: 100, message: "Property description must be at least 100 characters" }
              }}
            />
            <div className={`mt-1 text-[10px] font-black tracking-wider text-right uppercase ${propertyDesc.length < 100 ? 'text-rose-500' : 'text-primary'}`}>
              {propertyDesc.length} / 100 minimum characters
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
