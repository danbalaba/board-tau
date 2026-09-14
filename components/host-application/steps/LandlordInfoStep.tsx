import React from 'react';
import Input from '../../inputs/Input';
import { Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import { User, Phone, Mail, UserCheck, Shield, Building2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/helper';
import { motion } from 'framer-motion';
import {
  validateFullName,
  validatePhoneNumber,
  validateEmail,
  validateBusinessName,
} from '../HostApplicationUtils';

interface LandlordInfoStepProps {
  register: any;
  errors: any;
  watch: any;
  control: any;
}

const LandlordInfoStep: React.FC<LandlordInfoStepProps> = ({ register, errors, watch, control }) => {
  return (
    <div className="space-y-6">
      {/* Step Header */}
      <motion.div
        className="bg-gradient-to-r from-primary/10 to-transparent dark:from-primary/20 rounded-2xl p-5 border border-primary/20 dark:border-primary/30 shadow-sm"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center space-x-3.5 pr-14 sm:pr-0">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary dark:text-[#4fa89a]">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-xs">
              Landlord Profiling
            </h3>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
              Personal contact information and property background
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main 2-Column Responsive Layout */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {/* Personal Identity Details Card */}
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 md:p-7 border border-gray-100 dark:border-slate-700 shadow-sm space-y-6">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-primary dark:text-[#4fa89a] flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-slate-700">
            <User className="w-4 h-4" />
            <span>Identity Details</span>
          </h4>

          <div className="space-y-5">
            <Input
              label="Full Legal Name"
              id="contactInfo.fullName"
              type="text"
              register={register}
              errors={errors}
              watch={watch}
              required
              placeholder="e.g. Juan De La Cruz"
              useStaticLabel={true}
              validationRules={{
                required: "Full name is required",
                validate: validateFullName,
              }}
            />

            <Input
              label="Primary Contact No."
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
                required: "Contact number is required",
                validate: validatePhoneNumber,
              }}
            />

            <Input
              label="Official Email"
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
                required: "Email is required",
                validate: validateEmail,
              }}
            />

            <div>
              <label className={cn(
                "block text-[11px] font-bold uppercase tracking-widest mb-1.5 ml-1 transition-colors",
                errors?.contactInfo?.ownershipRole ? "text-red-500" : "text-gray-400"
              )}>
                Property Relationship / Role <span className="text-red-500">*</span>
              </label>
              <Controller
                name="contactInfo.ownershipRole"
                control={control}
                rules={{ required: "Property relationship is required" }}
                render={({ field }) => {
                  const hasError = !!errors?.contactInfo?.ownershipRole;
                  return (
                    <ReactSelect
                      {...field}
                      options={[
                        { value: 'OWNER', label: 'Property Owner (Title Holder)' },
                        { value: 'CO_OWNER_FAMILY', label: 'Co-Owner / Family Representative' },
                        { value: 'AUTHORIZED_CARETAKER', label: 'Authorized Manager / Caretaker' },
                        { value: 'SUBLESSOR', label: 'Master Tenant / Sub-lessor' },
                      ]}
                      value={field.value ? {
                        value: field.value,
                        label: field.value === 'OWNER' ? 'Property Owner (Title Holder)' :
                               field.value === 'CO_OWNER_FAMILY' ? 'Co-Owner / Family Representative' :
                               field.value === 'AUTHORIZED_CARETAKER' ? 'Authorized Manager / Caretaker' : 'Master Tenant / Sub-lessor'
                      } : null}
                      onChange={(val: any) => field.onChange(val?.value)}
                      placeholder="Select role..."
                      classNames={{
                        control: (state) =>
                          cn(
                            "!bg-white dark:!bg-slate-800 !border-2 !rounded-2xl !p-1 text-[14px] transition-all",
                            hasError
                              ? "!border-red-500 dark:!border-red-500 !ring-4 !ring-red-500/20 !bg-red-50/30 dark:!bg-red-950/30"
                              : state.isFocused
                              ? "!border-primary !ring-4 !ring-primary/10 shadow-sm"
                              : "!border-gray-200 dark:!border-slate-700"
                          ),
                        singleValue: () => `!text-slate-800 dark:!text-slate-100 font-semibold`,
                        menu: () => `!bg-white dark:!bg-slate-800 !border !border-gray-200 dark:!border-slate-700 !shadow-xl !rounded-2xl !mt-1 z-[60] overflow-hidden`,
                        menuList: () => `!p-0 !bg-white dark:!bg-slate-800`,
                        option: (state) => `!cursor-pointer ${state.isSelected ? '!bg-primary/10 !text-primary font-bold' : state.isFocused ? '!bg-gray-100 dark:!bg-slate-700 !text-slate-800 dark:!text-slate-100' : '!bg-transparent !text-slate-700 dark:!text-slate-200'} !px-4 !py-2.5 !text-xs uppercase tracking-wider transition-colors`,
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

        {/* Business & Property Profile Card */}
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 md:p-7 border border-gray-100 dark:border-slate-700 shadow-sm space-y-6">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-primary dark:text-[#4fa89a] flex items-center space-x-2 pb-2 border-b border-gray-100 dark:border-slate-700">
            <Building2 className="w-4 h-4" />
            <span>Establishment Background</span>
          </h4>

          <div className="space-y-5">
            <Input
              label="Business / Establishment Name"
              id="businessInfo.businessName"
              register={register}
              errors={errors}
              watch={watch}
              required
              placeholder="e.g. De La Cruz Student Boarding"
              useStaticLabel={true}
              validationRules={{
                required: "Establishment name is required",
                validate: validateBusinessName,
              }}
            />

            <div>
              <label className={cn(
                "block text-[11px] font-bold uppercase tracking-widest mb-1.5 ml-1 transition-colors",
                errors?.businessInfo?.businessType ? "text-red-500" : "text-gray-400"
              )}>
                Property Type <span className="text-red-500">*</span>
              </label>
              <Controller
                name="businessInfo.businessType"
                control={control}
                rules={{ required: "Property type is required" }}
                render={({ field }) => {
                  const hasError = !!errors?.businessInfo?.businessType;
                  return (
                    <ReactSelect
                      {...field}
                      options={[
                        { value: 'boarding-house', label: 'Boarding House' },
                        { value: 'dormitory', label: 'Dormitory' },
                        { value: 'apartment', label: 'Apartment Building' },
                        { value: 'hostel', label: 'Hostel / Transient' },
                      ]}
                      value={field.value ? { value: field.value, label: field.value.replace(/-/g, ' ').toUpperCase() } : null}
                      onChange={(val: any) => field.onChange(val?.value)}
                      placeholder="Select property type..."
                      classNames={{
                        control: (state) =>
                          cn(
                            "!bg-white dark:!bg-slate-800 !border-2 !rounded-2xl !p-1 text-[14px] transition-all",
                            hasError
                              ? "!border-red-500 dark:!border-red-500 !ring-4 !ring-red-500/20 !bg-red-50/30 dark:!bg-red-950/30"
                              : state.isFocused
                              ? "!border-primary !ring-4 !ring-primary/10 shadow-sm"
                              : "!border-gray-200 dark:!border-slate-700"
                          ),
                        singleValue: () => `!text-slate-800 dark:!text-slate-100 font-semibold`,
                        menu: () => `!bg-white dark:!bg-slate-800 !border !border-gray-200 dark:!border-slate-700 !shadow-xl !rounded-2xl !mt-1 z-[60] overflow-hidden`,
                        menuList: () => `!p-0 !bg-white dark:!bg-slate-800`,
                        option: (state) => `!cursor-pointer ${state.isSelected ? '!bg-primary/10 !text-primary font-bold' : state.isFocused ? '!bg-gray-100 dark:!bg-slate-700 !text-slate-800 dark:!text-slate-100' : '!bg-transparent !text-slate-700 dark:!text-slate-200'} !px-4 !py-2.5 !text-xs uppercase tracking-wider transition-colors`,
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

            <div>
              <label className={cn(
                "block text-[11px] font-bold uppercase tracking-widest mb-1.5 ml-1 transition-colors",
                errors?.businessInfo?.yearsExperience ? "text-red-500" : "text-gray-400"
              )}>
                Landlord Experience Level <span className="text-red-500">*</span>
              </label>
              <Controller
                name="businessInfo.yearsExperience"
                control={control}
                rules={{ required: "Experience level is required" }}
                render={({ field }) => {
                  const hasError = !!errors?.businessInfo?.yearsExperience;
                  return (
                    <ReactSelect
                      {...field}
                      options={[
                        { value: 'less-than-1', label: 'First-Time Landlord (< 1 year)' },
                        { value: '1-3-years', label: 'Experienced (1 - 3 years)' },
                        { value: '3-5-years', label: 'Established (3 - 5 years)' },
                        { value: '5-plus-years', label: 'Veteran Landlord (5+ years)' },
                      ]}
                      value={field.value ? {
                        value: field.value,
                        label: field.value === 'less-than-1' ? 'First-Time Landlord (< 1 year)' :
                               field.value === '1-3-years' ? 'Experienced (1 - 3 years)' :
                               field.value === '3-5-years' ? 'Established (3 - 5 years)' : 'Veteran Landlord (5+ years)'
                      } : null}
                      onChange={(val: any) => field.onChange(val?.value)}
                      placeholder="Select experience level..."
                      classNames={{
                        control: (state) =>
                          cn(
                            "!bg-white dark:!bg-slate-800 !border-2 !rounded-2xl !p-1 text-[14px] transition-all",
                            hasError
                              ? "!border-red-500 dark:!border-red-500 !ring-4 !ring-red-500/20 !bg-red-50/30 dark:!bg-red-950/30"
                              : state.isFocused
                              ? "!border-primary !ring-4 !ring-primary/10 shadow-sm"
                              : "!border-gray-200 dark:!border-slate-700"
                          ),
                        singleValue: () => `!text-slate-800 dark:!text-slate-100 font-semibold`,
                        menu: () => `!bg-white dark:!bg-slate-800 !border !border-gray-200 dark:!border-slate-700 !shadow-xl !rounded-2xl !mt-1 z-[60] overflow-hidden`,
                        menuList: () => `!p-0 !bg-white dark:!bg-slate-800`,
                        option: (state) => `!cursor-pointer ${state.isSelected ? '!bg-primary/10 !text-primary font-bold' : state.isFocused ? '!bg-gray-100 dark:!bg-slate-700 !text-slate-800 dark:!text-slate-100' : '!bg-transparent !text-slate-700 dark:!text-slate-200'} !px-4 !py-2.5 !text-xs uppercase tracking-wider transition-colors`,
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

            <div className="pt-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5 opacity-80">
              <Shield size={12} className="text-primary" />
              <span>Data is encrypted & protected under BoardTAU Host Policy</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LandlordInfoStep;
