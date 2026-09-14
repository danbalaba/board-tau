"use client";

import React from 'react';
import Input from '../../inputs/Input';
import { Controller } from 'react-hook-form';
import ReactSelect, { components } from 'react-select';
import { Building2, Shield, Lock, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helper';
import { validateBusinessName } from '../HostApplicationUtils';

interface EstablishmentInfoStepProps {
  register: any;
  errors: any;
  watch: any;
  control: any;
}

const CustomDropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <div
        className={cn(
          "w-7 h-7 rounded-xl flex items-center justify-center transition-transform duration-300 mr-0.5",
          props.selectProps.menuIsOpen
            ? "bg-[#2f7d6d]/20 text-[#2f7d6d] rotate-180"
            : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-[#2f7d6d]"
        )}
      >
        <ChevronDown size={14} strokeWidth={3} />
      </div>
    </components.DropdownIndicator>
  );
};

const CustomOption = (props: any) => {
  return (
    <components.Option {...props}>
      <div className="flex items-center justify-between w-full">
        <span className="truncate font-extrabold text-xs md:text-sm tracking-tight">{props.data.label}</span>
        {props.isSelected && (
          <div className="shrink-0 w-5 h-5 rounded-full bg-[#2f7d6d]/20 flex items-center justify-center">
            <Check size={12} className="text-[#2f7d6d]" strokeWidth={3.5} />
          </div>
        )}
      </div>
    </components.Option>
  );
};

const propertyTypeOptions = [
  { value: 'boarding-house', label: 'Boarding House' },
  { value: 'dormitory', label: 'Dormitory' },
  { value: 'apartment', label: 'Apartment Building' },
  { value: 'hostel', label: 'Hostel / Transient' },
];

const experienceLevelOptions = [
  { value: 'less-than-1', label: 'First-Time Landlord (< 1 year)' },
  { value: '1-3-years', label: 'Experienced (1 - 3 years)' },
  { value: '3-5-years', label: 'Established (3 - 5 years)' },
  { value: '5-plus-years', label: 'Veteran Landlord (5+ years)' },
];

const EstablishmentInfoStep: React.FC<EstablishmentInfoStepProps> = ({
  register,
  errors,
  watch,
  control,
}) => {
  return (
    <motion.div
      className="space-y-5 md:space-y-6 flex-1 flex flex-col justify-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Step Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#2f7d6d]/10 text-[#2f7d6d] dark:bg-[#2f7d6d]/20 dark:text-[#4fa89a] rounded-2xl shrink-0">
            <Building2 className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-base md:text-lg lg:text-xl font-[family-name:var(--font-outfit)]">
              Your Establishment Profile
            </h3>
            <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              Property name, accommodation type, and hosting experience level.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-[#4fa89a] text-xs font-black uppercase tracking-widest">
          Step 2 of 8
        </span>
      </div>

      <div className="space-y-4 md:space-y-5 mt-5 md:mt-6">
        {/* Establishment Name Input */}
        <div>
          <Input
            label="Establishment Name"
            id="businessInfo.businessName"
            register={register}
            errors={errors}
            watch={watch}
            required
            placeholder="e.g. De La Cruz Student Boarding House"
            icon={Building2}
            useStaticLabel={true}
            validationRules={{
              required: "Establishment name is required",
              validate: validateBusinessName,
            }}
          />
        </div>

        {/* 2-Column Selectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {/* Property Type Select */}
          <div>
            <label className={cn(
              "block text-xs font-black uppercase tracking-widest mb-1.5 ml-1 transition-colors",
              errors?.businessInfo?.businessType ? "text-red-500" : "text-gray-500 dark:text-gray-400"
            )}>
              Property Type <span className="text-red-500">*</span>
            </label>
            <Controller
              name="businessInfo.businessType"
              control={control}
              rules={{ required: "Property type is required" }}
              render={({ field }) => {
                const selectedOpt = propertyTypeOptions.find(o => o.value === field.value) || null;
                const hasError = !!errors?.businessInfo?.businessType;
                return (
                  <ReactSelect
                    {...field}
                    options={propertyTypeOptions}
                    value={selectedOpt}
                    onChange={(val: any) => field.onChange(val?.value)}
                    placeholder="Select property type..."
                    unstyled
                    classNames={{
                      control: (state) =>
                        cn(
                          "!bg-white dark:!bg-slate-800 !border-2 !rounded-2xl !px-3.5 !py-2 !min-h-[52px] !h-[52px] !shadow-sm transition-all text-xs md:text-sm font-extrabold cursor-pointer flex items-center justify-between",
                          hasError
                            ? "!border-red-500 dark:!border-red-500 !ring-4 !ring-red-500/20 !bg-red-50/30 dark:!bg-red-950/30"
                            : state.isFocused
                            ? "!border-[#2f7d6d] !ring-4 !ring-[#2f7d6d]/10 shadow-lg shadow-[#2f7d6d]/10"
                            : "!border-gray-200 dark:!border-slate-700 hover:!border-[#2f7d6d]/40"
                        ),
                      singleValue: () => "!text-slate-800 dark:!text-slate-100 font-extrabold text-xs md:text-sm",
                      placeholder: () => "!text-gray-400 dark:!text-gray-500 font-bold text-xs md:text-sm",
                      menu: () => "!bg-white dark:!bg-slate-800 !border-2 !border-gray-200 dark:!border-slate-700 !shadow-2xl !rounded-2xl !mt-2 z-[60] overflow-hidden p-1.5",
                      menuList: () => "!p-0 !bg-white dark:!bg-slate-800",
                      option: (state) =>
                        cn(
                          "!cursor-pointer !rounded-xl !px-3.5 !py-2.5 !text-xs md:!text-sm transition-all !mb-1 last:!mb-0",
                          state.isSelected
                            ? "!bg-[#2f7d6d]/10 !text-[#2f7d6d] font-black"
                            : state.isFocused
                            ? "!bg-gray-100 dark:!bg-slate-700 !text-slate-900 dark:!text-white font-bold"
                            : "!bg-transparent !text-slate-700 dark:!text-slate-300 font-bold"
                        ),
                    }}
                    components={{
                      DropdownIndicator: CustomDropdownIndicator,
                      Option: CustomOption,
                    }}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    instanceId="property-type-select"
                  />
                );
              }}
            />
            {errors?.businessInfo?.businessType && (
              <p className="text-red-500 text-[10px] font-black mt-1.5 ml-2 flex items-center gap-1 uppercase tracking-[0.1em]">
                <AlertCircle size={10} />
                <span>{errors.businessInfo.businessType.message}</span>
              </p>
            )}
          </div>

          {/* Experience Level Select */}
          <div>
            <label className={cn(
              "block text-xs font-black uppercase tracking-widest mb-1.5 ml-1 transition-colors",
              errors?.businessInfo?.yearsExperience ? "text-red-500" : "text-gray-500 dark:text-gray-400"
            )}>
              Hosting Experience <span className="text-red-500">*</span>
            </label>
            <Controller
              name="businessInfo.yearsExperience"
              control={control}
              rules={{ required: "Experience level is required" }}
              render={({ field }) => {
                const selectedOpt = experienceLevelOptions.find(o => o.value === field.value) || null;
                const hasError = !!errors?.businessInfo?.yearsExperience;
                return (
                  <ReactSelect
                    {...field}
                    options={experienceLevelOptions}
                    value={selectedOpt}
                    onChange={(val: any) => field.onChange(val?.value)}
                    placeholder="Select experience level..."
                    unstyled
                    classNames={{
                      control: (state) =>
                        cn(
                          "!bg-white dark:!bg-slate-800 !border-2 !rounded-2xl !px-3.5 !py-2 !min-h-[52px] !h-[52px] !shadow-sm transition-all text-xs md:text-sm font-extrabold cursor-pointer flex items-center justify-between",
                          hasError
                            ? "!border-red-500 dark:!border-red-500 !ring-4 !ring-red-500/20 !bg-red-50/30 dark:!bg-red-950/30"
                            : state.isFocused
                            ? "!border-[#2f7d6d] !ring-4 !ring-[#2f7d6d]/10 shadow-lg shadow-[#2f7d6d]/10"
                            : "!border-gray-200 dark:!border-slate-700 hover:!border-[#2f7d6d]/40"
                        ),
                      singleValue: () => "!text-slate-800 dark:!text-slate-100 font-extrabold text-xs md:text-sm",
                      placeholder: () => "!text-gray-400 dark:!text-gray-500 font-bold text-xs md:text-sm",
                      menu: () => "!bg-white dark:!bg-slate-800 !border-2 !border-gray-200 dark:!border-slate-700 !shadow-2xl !rounded-2xl !mt-2 z-[60] overflow-hidden p-1.5",
                      menuList: () => "!p-0 !bg-white dark:!bg-slate-800",
                      option: (state) =>
                        cn(
                          "!cursor-pointer !rounded-xl !px-3.5 !py-2.5 !text-xs md:!text-sm transition-all !mb-1 last:!mb-0",
                          state.isSelected
                            ? "!bg-[#2f7d6d]/10 !text-[#2f7d6d] font-black"
                            : state.isFocused
                            ? "!bg-gray-100 dark:!bg-slate-700 !text-slate-900 dark:!text-white font-bold"
                            : "!bg-transparent !text-slate-700 dark:!text-slate-300 font-bold"
                        ),
                    }}
                    components={{
                      DropdownIndicator: CustomDropdownIndicator,
                      Option: CustomOption,
                    }}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    instanceId="experience-level-select"
                  />
                );
              }}
            />
            {errors?.businessInfo?.yearsExperience && (
              <p className="text-red-500 text-[10px] font-black mt-1.5 ml-2 flex items-center gap-1 uppercase tracking-[0.1em]">
                <AlertCircle size={10} />
                <span>{errors.businessInfo.yearsExperience.message}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Guarantee Note */}
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-auto">
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-[#2f7d6d] dark:text-[#4fa89a]" />
          <span>Verified establishment listing on official BoardTAU portal</span>
        </div>
      </div>
    </motion.div>
  );
};

export default EstablishmentInfoStep;
