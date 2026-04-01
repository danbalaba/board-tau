import React from 'react';
import Input from '../inputs/Input';
import Textarea from '../inputs/Textarea';
import { Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import { User, Phone, Mail, Shield, UserCheck, ShieldAlert, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandlordInfoStepProps {
  register: any;
  errors: any;
  watch: any;
  control: any;
}

const LandlordInfoStep: React.FC<LandlordInfoStepProps> = ({ register, errors, watch, control }) => {
  return (
    <div className="space-y-8">
      {/* Step Header */}
      <motion.div
        className="bg-gradient-to-r from-primary/10 to-transparent dark:from-primary/20 rounded-2xl p-6 border border-primary/20 dark:border-primary/30 shadow-sm"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm">Landlord Profiling</h3>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">
              Personal contact information and business background
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Personal Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center space-x-2">
            <User className="w-4 h-4 opacity-40" />
            <span>Identity Details</span>
          </h4>

          <div className="space-y-10">
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
                minLength: { value: 3, message: "Too short" },
                pattern: { value: /^[a-zA-ZñÑ\s-]+$/, message: "Letters/spaces only" }
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
                required: "Required",
                pattern: { value: /^[+\d\s()-]{10,20}$/, message: "Invalid format" }
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
                required: "Required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" }
              }}
            />
          </div>
        </div>

        {/* Emergency Contact Card */}
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-500 mb-8 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 opacity-70" />
            <span>Emergency Bypass</span>
          </h4>

          <div className="space-y-10">
            <Input
              label="Alternative Contact Name"
              id="contactInfo.emergencyContact.name"
              type="text"
              register={register}
              errors={errors}
              watch={watch}
              required
              placeholder="Contact person's name"
              useStaticLabel={true}
            />
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                Relationship <span className="text-red-500">*</span>
              </label>
              <Controller
                name="contactInfo.emergencyContact.relationship"
                control={control}
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <ReactSelect
                    {...field}
                    options={[
                      { value: 'spouse', label: 'Spouse/Partner' },
                      { value: 'child', label: 'Child' },
                      { value: 'parent', label: 'Parent' },
                      { value: 'sibling', label: 'Sibling' },
                      { value: 'friend', label: 'Business Partner' },
                      { value: 'other', label: 'Other' },
                    ]}
                    value={field.value ? { value: field.value, label: field.value.charAt(0).toUpperCase() + field.value.slice(1) } : null}
                    onChange={(val: any) => field.onChange(val?.value)}
                    placeholder="Select relationship..."
                    classNames={{
                      control: (state) => `!bg-white dark:!bg-gray-800 !border ${state.isFocused ? '!border-primary !ring-1 !ring-primary shadow-lg shadow-primary/10' : '!border-gray-200 dark:!border-gray-700'} !rounded-2xl !p-[5px] !shadow-sm transition-all text-[15px]`,
                      singleValue: () => `!text-text-primary dark:!text-gray-100 font-bold`,
                      menu: () => `!bg-white dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-2xl !rounded-2xl !mt-2 z-[60] overflow-hidden`,
                      menuList: () => `!p-0 !bg-white dark:!bg-gray-800`,
                      option: (state) => `!cursor-pointer ${state.isSelected ? '!bg-primary/10 !text-primary font-black' : state.isFocused ? '!bg-gray-100 dark:!bg-gray-700 !text-text-primary dark:!text-gray-100' : '!bg-transparent dark:!bg-transparent !text-text-primary dark:!text-gray-100'} !px-4 !py-3 !text-xs uppercase tracking-widest transition-colors`,
                    }}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    instanceId="relationship-select"
                  />
                )}
              />
              {errors?.contactInfo?.emergencyContact?.relationship && <p className="mt-1.5 text-xs text-red-500 font-bold">{errors.contactInfo.emergencyContact.relationship.message}</p>}
            </div>
            <Input
              label="Secondary Contact No."
              id="contactInfo.emergencyContact.phoneNumber"
              type="tel"
              register={register}
              errors={errors}
              watch={watch}
              required
              placeholder="(+63) 9XX-XXXXXXX"
              icon={Phone}
              useStaticLabel={true}
            />
          </div>
        </div>
      </motion.div>

      {/* Experience Background */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-[2rem] p-10 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center space-x-2">
           <Shield className="w-4 h-4 opacity-40" />
           <span>Professional Background</span>
        </h4>
        <Textarea
          label="Relevant Landlord Experience"
          id="businessInfo.businessDescription"
          register={register}
          errors={errors}
          watch={watch}
          required
          rows={4}
          placeholder="Briefly describe your experience managing properties for students. This helps us verify your application faster."
          validationRules={{
            required: "Required",
            minLength: { value: 30, message: "Minimum 30 characters" }
          }}
        />
        <div className="mt-8 flex gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <div className="h-fit p-1.5 bg-primary/20 rounded-lg text-primary"><Info size={14} /></div>
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest italic opacity-70">
            Confidentiality Notice: your data is strictly used for host verification and will not be shared publicly without consent.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LandlordInfoStep;
