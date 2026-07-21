import React from 'react';
import Input from '@/components/inputs/Input';
import Textarea from '@/components/inputs/Textarea';
import Checkbox from '@/components/inputs/Checkbox';
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
  const businessDesc = watch('businessInfo.businessDescription') || '';
  const propertyDesc = watch('propertyInfo.description') || '';

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
           <span>Business Details</span>
        </h4>

        <div className="space-y-8">
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
              // Strict alphanumeric + space + hyphen only
              e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s-]/g, '');
            }}
            validationRules={{
              required: "Business name is required",
              minLength: { value: 3, message: "Min 3 characters" }
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="relative" id="businessInfo.businessType">
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
                      { value: 'dormitory', label: 'Dormitory' }
                    ]}
                    value={field.value ? { value: field.value, label: field.value.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') } : null}
                    onChange={(val: any) => field.onChange(val?.value)}
                    placeholder="Select type..."
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

            <div className="relative" id="businessInfo.yearsExperience">
              <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                Years of Experience <span className="text-red-500">*</span>
              </label>
              <Controller
                name="businessInfo.yearsExperience"
                control={control}
                rules={{ required: "Required" }}
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
                      control: (state) => `!bg-white dark:!bg-gray-800 !border ${state.isFocused ? '!border-primary !ring-1 !ring-primary shadow-lg shadow-primary/10' : '!border-gray-200 dark:!border-gray-700'} !rounded-2xl !p-[5px] !shadow-sm transition-all text-[15px]`,
                      singleValue: () => `!text-text-primary dark:!text-gray-100 font-bold`,
                      menu: () => `!bg-white dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-2xl !rounded-2xl !mt-2 z-[60] overflow-hidden`,
                      menuList: () => `!p-0`,
                      option: (state) => `!cursor-pointer ${state.isSelected ? '!bg-primary/10 !text-primary font-black' : state.isFocused ? '!bg-gray-100 dark:!bg-gray-700 !text-text-primary dark:!text-gray-100' : '!bg-transparent dark:!bg-transparent !text-text-primary dark:!text-gray-100'} !px-4 !py-3 !text-xs uppercase tracking-widest transition-colors`,
                    }}
                    instanceId="experience-select"
                  />
                )}
              />
              {errors?.businessInfo?.yearsExperience && <p className="mt-1.5 text-xs text-red-500 font-bold">{errors.businessInfo.yearsExperience.message}</p>}
            </div>
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
            onInput={(e: any) => {
              // Block dangerous programming characters (XSS/SQLi)
              e.target.value = e.target.value.replace(/[<>=;{}[\]]/g, '');
            }}
            validationRules={{
              minLength: { value: 100, message: "Mission description must be at least 100 characters" }
            }}
          />
          <div className={`mt-1 mb-2 text-[10px] font-black tracking-wider text-right uppercase ${businessDesc.length < 100 ? 'text-red-500' : 'text-emerald-500'}`}>
            {businessDesc.length} / 100 minimum characters
          </div>
          {/* Mission Guide */}
          <div className="mt-3 flex gap-3 p-4 bg-sky-50/50 dark:bg-sky-900/10 rounded-2xl border border-sky-100 dark:border-sky-800/20">
            <Info size={16} className="text-sky-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-sky-700/80 dark:text-sky-400/80 leading-relaxed uppercase tracking-tight">
              Tip: Share your story! Landlords who mention their "why" and commitment to student safety often see 30% higher engagement.
            </p>
          </div>
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

        <div className="space-y-8">
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
              // Strict alphanumeric + space + hyphen only
              e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s-]/g, '');
            }}
          />
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
                // Block dangerous programming characters (XSS/SQLi)
                e.target.value = e.target.value.replace(/[<>=;{}[\]]/g, '');
              }}
              validationRules={{
                minLength: { value: 100, message: "Property description must be at least 100 characters" }
              }}
            />
            <div className={`mt-1 mb-2 text-[10px] font-black tracking-wider text-right uppercase ${propertyDesc.length < 100 ? 'text-red-500' : 'text-emerald-500'}`}>
              {propertyDesc.length} / 100 minimum characters
            </div>
            {/* Description Guide */}
            <div className="mt-3 flex gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/20">
              <Info size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-[9px] font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-400 mb-0.5">Visibility Tip</h5>
                <p className="text-[10px] font-bold text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed uppercase tracking-tight">
                  Be detailed! Mentioning specific landmarks near TAU or unique features of your compound helps you stand out in search results.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="flex flex-col justify-center">
              <label className="block text-[11px] font-black uppercase tracking-widest text-primary mb-2 ml-1 flex items-center gap-2">
                <Tag size={14} className="rotate-90" />
                Property Category
              </label>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  Categories are automatically assigned by our system based on your property's price, amenities, and rules to ensure accurate tagging for students.
                </p>
              </div>
            </div>
            <div>
              <Input 
                label="Main Starting Price (PHP)" 
                id="propertyInfo.price" 
                type="number" 
                register={register} 
                errors={errors} 
                watch={watch} 
                required 
                placeholder="15000" 
                icon={DollarSign} 
                useStaticLabel 
                validationRules={{
                  min: { value: 500, message: "Price must be at least 500 PHP" },
                  max: { value: 50000, message: "Price cannot exceed 50,000 PHP" }
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>


    </div>
  );
};

export default PropertyBasicStep;

