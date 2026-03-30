import React from 'react';
import Input from '../inputs/Input';
import Textarea from '../inputs/Textarea';
import Checkbox from '../inputs/Checkbox';
import { Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import { Building2, Tag, MapPin, DollarSign } from 'lucide-react';
import { IconCheck, IconChecks, IconX } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { categories } from '@/utils/constants';
import { cn } from '@/utils/helper';

interface PropertyBasicStepProps {
  register: any;
  errors: any;
  watch: any;
  control: any;
  setValue: any;
}

const PropertyBasicStep: React.FC<PropertyBasicStepProps> = ({ register, errors, watch, control, setValue }) => {
  return (
    <div className="space-y-6">
      <motion.div
        className="bg-gradient-to-r from-accent/10 to-accent/5 dark:from-accent/20 dark:to-accent/10 rounded-xl p-6 border border-accent/20 dark:border-accent/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3">
          <Building2 className="w-6 h-6 text-accent dark:text-accent" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Property Information</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tell us about your property and business
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Tag className="w-5 h-5" />
          <span>Business Details</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Business Name"
            id="businessInfo.businessName"
            type="text"
            register={register}
            errors={errors}
            watch={watch}
            required
            placeholder="e.g. 'University Suites Boarding House'"
            useStaticLabel={true}
            validationRules={{
              required: "Business name is required",
              pattern: {
                value: /^[a-zA-ZñÑ\s-]+$/,
                message: "Business name can only contain letters, spaces, and hyphens"
              }
            }}
          />
          <div className="relative z-50">
            <label className="block text-[15px] font-medium text-text-primary dark:text-gray-100 mb-2">
              Business Type <span className="text-red-500">*</span>
            </label>
            <Controller
              name="businessInfo.businessType"
              control={control}
              rules={{ required: "Please select a business type" }}
              render={({ field }) => (
                <ReactSelect
                  {...field}
                  options={[
                    { value: 'boarding-house', label: 'Boarding House' },
                    { value: 'apartment', label: 'Apartment' },
                    { value: 'dormitory', label: 'Dormitory' },
                    { value: 'bed-spacer', label: 'Bed Spacer' }
                  ]}
                  value={field.value ? { value: field.value, label: field.value.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') } : null}
                  onChange={(val: any) => field.onChange(val?.value)}
                  placeholder="Select business type..."
                  classNames={{
                    control: (state) => `!bg-white dark:!bg-gray-800 !border ${state.isFocused ? '!border-primary !ring-1 !ring-primary' : '!border-gray-200 dark:!border-gray-700'} !rounded-xl !p-[5px] !shadow-sm transition-all text-[15px]`,
                    singleValue: () => `!text-text-primary dark:!text-gray-100`,
                    menu: () => `!bg-white dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-xl !rounded-xl !mt-1 z-50 overflow-hidden`,
                    menuList: () => `!p-0`,
                    option: (state) => `!cursor-pointer ${state.isSelected ? '!bg-primary/10 !text-primary dark:!text-primary font-medium' : state.isFocused ? '!bg-gray-100 dark:!bg-gray-700 !text-text-primary dark:!text-gray-100' : '!bg-transparent dark:!bg-transparent !text-text-primary dark:!text-gray-100'} !px-3 !py-2 !text-sm transition-colors`,
                    indicatorSeparator: () => `!bg-gray-200 dark:!bg-gray-700`,
                    dropdownIndicator: () => `!text-gray-400 dark:!text-gray-500 hover:!text-primary`,
                    placeholder: () => `!text-gray-400 dark:!text-gray-500 p-1`,
                    input: () => `dark:!text-gray-100`
                  }}
                  menuPlacement="auto"
                  instanceId="business-type-select"
                />
              )}
            />
            {errors?.businessInfo?.businessType && (
              <p className="mt-1.5 text-xs text-red-500">{errors.businessInfo.businessType.message}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Textarea
            label="Business Description"
            id="businessInfo.businessDescription"
            register={register}
            errors={errors}
            watch={watch}
            required
            rows={3}
            placeholder="Describe your boarding house business... What makes your property unique? What amenities do you offer?"
            validationRules={{
              required: "Business description is required",
              pattern: {
                value: /^[^<>;={}\[\]\\]+$/,
                message: "Special characters like < > ; = { } [ ] \\ are not allowed for security reasons"
              }
            }}
          />
        </div>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Building2 className="w-5 h-5" />
          <span>Property Details</span>
        </h4>

        <div className="space-y-6">
          <Input
            label="Property Name"
            id="propertyInfo.propertyName"
            type="text"
            register={register}
            errors={errors}
            watch={watch}
            required
            placeholder="e.g. 'Tau Residence'"
            useStaticLabel={true}
            validationRules={{
              required: "Property name is required",
              pattern: {
                value: /^[a-zA-ZñÑ\s-]+$/,
                message: "Property name can only contain letters, spaces, and hyphens"
              }
            }}
          />

          <Textarea
            label="Property Description"
            id="propertyInfo.description"
            register={register}
            errors={errors}
            watch={watch}
            required
            rows={4}
            placeholder="Describe your property in detail... Include information about the location, features, amenities, and what makes it attractive to tenants."
            validationRules={{
              required: "Property description is required",
              pattern: {
                value: /^[^<>;={}\[\]\\]+$/,
                message: "Special characters like < > ; = { } [ ] \\ are not allowed for security reasons"
              }
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Property Categories (Select all that apply)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const currentCats = watch('propertyInfo.category') || [];
                    const allVals = categories.map(c => c.value);
                    setValue('propertyInfo.category', currentCats.length === allVals.length ? [] : allVals, { shouldValidate: true });
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300",
                    (watch('propertyInfo.category') || []).length === categories.length
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:border-primary/40 hover:text-primary"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {(watch('propertyInfo.category') || []).length === categories.length ? (
                      <motion.span key="deselect" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5">
                        <IconX size={10} strokeWidth={4} /> Deselect All
                      </motion.span>
                    ) : (
                      <motion.span key="select" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5">
                        <IconChecks size={10} strokeWidth={3} /> Select All
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
                {categories.map((category) => (
                  <Checkbox
                    key={category.value}
                    id="propertyInfo.category"
                    label={category.label}
                    value={category.value}
                    register={register}
                    watch={watch}
                  />
                ))}
              </div>
            </div>
            <Input
              label="Monthly Price (PHP)"
              id="propertyInfo.price"
              type="number"
              register={register}
              errors={errors}
              watch={watch}
              required
              placeholder="15000"
              icon={DollarSign}
              useStaticLabel={true}
            />
          </div>

          <div className="relative z-40">
            <label className="block text-[15px] font-medium text-text-primary dark:text-gray-100 mb-2">
              Lease Terms <span className="text-red-500">*</span>
            </label>
            <Controller
              name="propertyInfo.leaseTerms"
              control={control}
              rules={{ required: "Please select lease terms" }}
              render={({ field }) => (
                <ReactSelect
                  {...field}
                  options={[
                    { value: '1-month', label: '1 Month' },
                    { value: '3-months', label: '3 Months' },
                    { value: '6-months', label: '6 Months' },
                    { value: '12-months', label: '12 Months' }
                  ]}
                  value={field.value ? { value: field.value, label: field.value.replace('-', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) } : null}
                  onChange={(val: any) => field.onChange(val?.value)}
                  placeholder="Select lease terms..."
                  classNames={{
                    control: (state) => `!bg-white dark:!bg-gray-800 !border ${state.isFocused ? '!border-primary !ring-1 !ring-primary' : '!border-gray-200 dark:!border-gray-700'} !rounded-xl !p-[5px] !shadow-sm transition-all text-[15px]`,
                    singleValue: () => `!text-text-primary dark:!text-gray-100`,
                    menu: () => `!bg-white dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-xl !rounded-xl !mt-1 z-50 overflow-hidden`,
                    menuList: () => `!p-0`,
                    option: (state) => `!cursor-pointer ${state.isSelected ? '!bg-primary/10 !text-primary dark:!text-primary font-medium' : state.isFocused ? '!bg-gray-100 dark:!bg-gray-700 !text-text-primary dark:!text-gray-100' : '!bg-transparent dark:!bg-transparent !text-text-primary dark:!text-gray-100'} !px-3 !py-2 !text-sm transition-colors`,
                    indicatorSeparator: () => `!bg-gray-200 dark:!bg-gray-700`,
                    dropdownIndicator: () => `!text-gray-400 dark:!text-gray-500 hover:!text-primary`,
                    placeholder: () => `!text-gray-400 dark:!text-gray-500 p-1`,
                    input: () => `dark:!text-gray-100`
                  }}
                  menuPlacement="auto"
                  instanceId="lease-terms-select"
                />
              )}
            />
            {errors?.propertyInfo?.leaseTerms && (
              <p className="mt-1.5 text-xs text-red-500">{errors.propertyInfo.leaseTerms.message}</p>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Tips for Success</h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Be as detailed as possible in your description. Include information about nearby universities, transportation, and local amenities to attract more tenants.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PropertyBasicStep;
