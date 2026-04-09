import React from 'react';
import Input from '../inputs/Input';
import Textarea from '../inputs/Textarea';
import Checkbox from '../inputs/Checkbox';
import { Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import { Building2, Tag, MapPin, DollarSign, Briefcase, LayoutGrid, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { categories as CATEGORY_LIST } from '@/utils/constants';

interface PropertyBasicStepProps {
  register: any;
  errors: any;
  watch: any;
  control: any;
}

const PropertyBasicStep: React.FC<PropertyBasicStepProps> = ({ register, errors, watch, control }) => {
  return (
    <div className="space-y-8">
      {/* Step Header */}
      <motion.div
        className="bg-gradient-to-r from-emerald-500/10 to-transparent dark:from-emerald-500/20 rounded-2xl p-6 border border-emerald-500/20 dark:border-emerald-500/30 shadow-sm"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm">Business Identity</h3>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">
              Tell us about your brand and the type of accommodation you offer
            </p>
          </div>
        </div>
      </motion.div>

      {/* Business Details */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-[2rem] p-10 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center space-x-2">
           <Briefcase className="w-4 h-4 opacity-40" />
           <span>Legal / Business Entity</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Input
            label="Business Name"
            id="businessInfo.businessName"
            type="text"
            register={register}
            errors={errors}
            watch={watch}
            required
            placeholder="e.g. 'TAU Garden Boarding House'"
            useStaticLabel={true}
            validationRules={{
              required: "Business name is required",
              pattern: { value: /^[a-zA-ZñÑ\s-]+$/, message: "Business name can only contain letters, spaces, and hyphens" }
            }}
          />
          <div className="relative">
            <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
              Business Type <span className="text-red-500">*</span>
            </label>
            <Controller
              name="businessInfo.businessType"
              control={control}
              rules={{ required: "Required" }}
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
                  placeholder="Select classification..."
                  classNames={{
                    control: (state) => `!bg-white dark:!bg-gray-800 !border ${state.isFocused ? '!border-primary !ring-1 !ring-primary shadow-lg shadow-primary/10' : '!border-gray-200 dark:!border-gray-700'} !rounded-2xl !p-[5px] !shadow-sm transition-all text-[15px]`,
                    singleValue: () => `!text-text-primary dark:!text-gray-100 font-bold`,
                    menu: () => `!bg-white dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-2xl !rounded-2xl !mt-2 z-[60] overflow-hidden`,
                    menuList: () => `!p-0`,
                    option: (state) => `!cursor-pointer ${state.isSelected ? '!bg-primary/10 !text-primary font-black' : state.isFocused ? '!bg-gray-100 dark:!bg-gray-700 !text-text-primary dark:!text-gray-100' : '!bg-transparent dark:!bg-transparent !text-text-primary dark:!text-gray-100'} !px-4 !py-3 !text-xs uppercase tracking-widest transition-colors`,
                  }}
                  instanceId="business-type-select"
                />
              )}
            />
            {errors?.businessInfo?.businessType && <p className="mt-1.5 text-xs text-red-500 font-bold">{errors.businessInfo.businessType.message}</p>}
          </div>
        </div>

        <div className="mt-10">
          <Textarea 
            label="Tell us your mission" 
            id="businessInfo.businessDescription" 
            register={register} 
            errors={errors} 
            watch={watch} 
            required 
            rows={3} 
            placeholder="Describe your boarding house business... What makes your property unique?" 
            validationRules={{
              minLength: { value: 100, message: "Mission description must be at least 100 characters" }
            }}
          />
        </div>
      </motion.div>

      {/* Property Details */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-[2rem] p-10 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center space-x-2">
           <LayoutGrid className="w-4 h-4 opacity-40" />
           <span>Property Essentials</span>
        </h4>

        <div className="space-y-10">
          <Input label="Public Display Name" id="propertyInfo.propertyName" type="text" register={register} errors={errors} watch={watch} required placeholder="e.g. 'Maligaya Residence'" useStaticLabel />
          <Textarea 
            label="Marketing Narrative" 
            id="propertyInfo.description" 
            register={register} 
            errors={errors} 
            watch={watch} 
            required 
            rows={4} 
            placeholder="Describe your property in detail... location, features, and what makes it attractive to TAU students." 
            validationRules={{
              minLength: { value: 100, message: "Property description must be at least 100 characters" }
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-gray-50 dark:border-gray-800 pt-10">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                <Tag size={14} className="rotate-90" />
                Classification Categories
              </label>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {CATEGORY_LIST.map((category) => (
                  <div key={category.value} className="py-1">
                    <Checkbox id="propertyInfo.category" label={category.label} value={category.value} register={register} watch={watch} className="text-[12px] font-bold" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-10">
              <Input label="Main Starting Price (PHP)" id="propertyInfo.price" type="number" register={register} errors={errors} watch={watch} required placeholder="15000" icon={DollarSign} useStaticLabel />
              <div className="relative">
                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Default Lease Term</label>
                <Controller
                  name="propertyInfo.leaseTerms"
                  control={control}
                  rules={{ required: "Required" }}
                  render={({ field }) => (
                    <ReactSelect
                      {...field}
                      options={[
                        { value: 'semester', label: '1 Semester' },
                        { value: '3-months', label: '3 Months' },
                        { value: '6-months', label: '6 Months' },
                        { value: '12-months', label: 'Full Year' }
                      ]}
                      value={field.value ? { value: field.value, label: field.value.replace('-', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) } : null}
                      onChange={(val: any) => field.onChange(val?.value)}
                      placeholder="e.g. 1 Semester"
                    classNames={{
                        control: (state) => `!bg-white dark:!bg-gray-800 !border ${state.isFocused ? '!border-primary !ring-1 !ring-primary shadow-lg shadow-primary/10' : '!border-gray-200 dark:!border-gray-700'} !rounded-2xl !p-[5px] !shadow-sm transition-all text-[15px]`,
                        singleValue: () => `!text-text-primary dark:!text-gray-100 font-bold`,
                        menu: () => `!bg-white dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-2xl !rounded-2xl !mt-2 z-[60] overflow-hidden`,
                        menuList: () => `!p-0 !bg-white dark:!bg-gray-800`,
                        option: (state) => `!cursor-pointer ${state.isSelected ? '!bg-primary/10 !text-primary font-black' : state.isFocused ? '!bg-gray-100 dark:!bg-gray-700 !text-text-primary dark:!text-gray-100' : '!bg-transparent dark:!bg-transparent !text-text-primary dark:!text-gray-100'} !px-4 !py-3 !text-xs uppercase tracking-widest transition-colors`,
                      }}
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                      instanceId="lease-terms-select"
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Helpful Info Tip */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-sky-50 dark:bg-sky-900/20 rounded-2xl p-6 border border-sky-100 dark:border-sky-800/50 flex gap-4">
        <div className="p-2 bg-sky-500/10 rounded-xl h-fit text-sky-600"><Info size={20} /></div>
        <div>
          <h5 className="text-[11px] font-black uppercase tracking-widest text-sky-800 dark:text-sky-400 mb-1">Impact on Visibility</h5>
          <p className="text-xs font-bold text-sky-700 dark:text-sky-300 leading-relaxed max-w-2xl">
            Categories like "Student-Friendly" and "Budget Boarding House" are major entry points for TAU students. Be honest with your classification to ensure your property appears in the most relevant search results.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PropertyBasicStep;
