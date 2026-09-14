"use client";

import React from 'react';
import Input from '../../inputs/Input';
import { Controller } from 'react-hook-form';
import ReactSelect, { components } from 'react-select';
import { User, Phone, Mail, UserCheck, Lock, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helper';
import {
  validateFullName,
  validatePhoneNumber,
  validateEmail,
} from '../HostApplicationUtils';

interface LandlordIdentityStepProps {
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

const ownershipRoleOptions = [
  { value: 'OWNER', label: 'Property Owner' },
  { value: 'CO_OWNER_FAMILY', label: 'Co-Owner or Family Member' },
  { value: 'AUTHORIZED_CARETAKER', label: 'Property Manager or Caretaker' },
  { value: 'SUBLESSOR', label: 'Primary Tenant (Sub-leasing)' },
];

const LandlordIdentityStep: React.FC<LandlordIdentityStepProps> = ({
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
            <UserCheck className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-base md:text-lg lg:text-xl font-[family-name:var(--font-outfit)]">
              Tell Us About Yourself
            </h3>
            <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              Enter your contact details so boarders & support can reach you.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#2f7d6d]/10 text-[#2f7d6d] dark:text-[#4fa89a] text-xs font-black uppercase tracking-widest">
          Step 1 of 8
        </span>
      </div>

      {/* Compact 2-Column Inputs Grid */}
      <div className="space-y-4 md:space-y-5 mt-5 md:mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <Input
            label="Full Name"
            id="contactInfo.fullName"
            type="text"
            register={register}
            errors={errors}
            watch={watch}
            required
            placeholder="e.g. Juan De La Cruz"
            icon={User}
            useStaticLabel={true}
            validationRules={{
              required: "Full name is required",
              validate: validateFullName,
            }}
          />

          <Input
            label="Mobile / Phone Number"
            id="contactInfo.phoneNumber"
            type="tel"
            register={register}
            errors={errors}
            watch={watch}
            required
            placeholder="(+63) 9XX-XXXXXXX"
            icon={Phone}
            useStaticLabel={true}
            validationRules={{
              required: "Phone number is required",
              validate: validatePhoneNumber,
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <Input
            label="Email Address"
            id="contactInfo.email"
            type="email"
            register={register}
            errors={errors}
            watch={watch}
            required
            placeholder="your@email.com"
            icon={Mail}
            useStaticLabel={true}
            validationRules={{
              required: "Email address is required",
              validate: validateEmail,
            }}
          />

          <div>
            <label className={cn(
              "block text-xs font-black uppercase tracking-widest mb-1.5 ml-1 transition-colors",
              errors?.contactInfo?.ownershipRole ? "text-red-500" : "text-gray-500 dark:text-gray-400"
            )}>
              Your Role for this Property <span className="text-red-500">*</span>
            </label>
            <Controller
              name="contactInfo.ownershipRole"
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field }) => {
                const selectedOpt = ownershipRoleOptions.find(o => o.value === field.value) || null;
                const hasError = !!errors?.contactInfo?.ownershipRole;
                return (
                  <ReactSelect
                    {...field}
                    options={ownershipRoleOptions}
                    value={selectedOpt}
                    onChange={(val: any) => field.onChange(val?.value)}
                    placeholder="Select your role..."
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
                    instanceId="ownership-role-select"
                  />
                );
              }}
            />
            {errors?.contactInfo?.ownershipRole && (
              <p className="text-red-500 text-[10px] font-black mt-1.5 ml-2 flex items-center gap-1 uppercase tracking-[0.1em]">
                <AlertCircle size={10} />
                <span>{errors.contactInfo.ownershipRole.message}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Security Guarantee Note */}
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-auto">
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-[#2f7d6d] dark:text-[#4fa89a]" />
          <span>Confidential & encrypted under BoardTAU host privacy standards</span>
        </div>
      </div>
    </motion.div>
  );
};

export default LandlordIdentityStep;
