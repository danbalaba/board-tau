import React from 'react';
import Input from '../inputs/Input';
import Textarea from '../inputs/Textarea';
import { Controller } from 'react-hook-form';
import ReactSelect from 'react-select';
import { User, Phone, Mail, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandlordInfoStepProps {
  register: any;
  errors: any;
  watch: any;
  control: any;
}

const LandlordInfoStep: React.FC<LandlordInfoStepProps> = ({ register, errors, watch, control }) => {
  return (
    <div className="space-y-6">
      <motion.div
        className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl p-6 border border-primary/20 dark:border-primary/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-primary dark:text-primary" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Your Information</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tell us about yourself to get started
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Personal Details</span>
          </h4>

           <div className="space-y-6">
            <Input
              label="Full Name"
              id="contactInfo.fullName"
              type="text"
              register={register}
              errors={errors}
              watch={watch}
              required
              placeholder="Enter your full name"
              useStaticLabel={true}
              validationRules={{
                required: "Full name is required",
                minLength: { value: 3, message: "Full name must be at least 3 characters" },
                pattern: {
                  value: /^[a-zA-ZñÑ\s-]+$/,
                  message: "Name can only contain letters, spaces, and hyphens"
                }
              }}
            />
            <Input
              label="Phone Number"
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
                pattern: {
                  value: /^[+\d\s()-]{10,20}$/,
                  message: "Please enter a valid phone number (e.g., +63 912 345 6789)"
                }
              }}
            />
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
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address"
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Emergency Contact</span>
          </h4>

          <div className="space-y-6">
            <Input
              label="Emergency Contact Name"
              id="contactInfo.emergencyContact.name"
              type="text"
              register={register}
              errors={errors}
              watch={watch}
              required
              placeholder="Contact person's name"
              useStaticLabel={true}
              validationRules={{
                required: "Emergency contact name is required",
                minLength: { value: 3, message: "Name must be at least 3 characters" },
                pattern: {
                  value: /^[a-zA-ZñÑ\s-]+$/,
                  message: "Name can only contain letters, spaces, and hyphens"
                }
              }}
            />
            <div className="relative z-50">
              <label className="block text-[15px] font-medium text-text-primary dark:text-gray-100 mb-2">
                Relationship <span className="text-red-500">*</span>
              </label>
              <Controller
                name="contactInfo.emergencyContact.relationship"
                control={control}
                rules={{ required: "Please select a relationship" }}
                render={({ field }) => (
                  <ReactSelect
                    {...field}
                    options={[
                      { value: 'spouse', label: 'Spouse' },
                      { value: 'child', label: 'Child' },
                      { value: 'parent', label: 'Parent' },
                      { value: 'sibling', label: 'Sibling' },
                      { value: 'friend', label: 'Friend' },
                      { value: 'other', label: 'Other' },
                    ]}
                    value={field.value ? { value: field.value, label: field.value.charAt(0).toUpperCase() + field.value.slice(1) } : null}
                    onChange={(val: any) => field.onChange(val?.value)}
                    placeholder="Select relationship..."
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
                    instanceId="relationship-select"
                  />
                )}
              />
              {errors?.contactInfo?.emergencyContact?.relationship && (
                <p className="mt-1.5 text-xs text-red-500">{errors.contactInfo.emergencyContact.relationship.message}</p>
              )}
            </div>
            <Input
              label="Emergency Phone Number"
              id="contactInfo.emergencyContact.phoneNumber"
              type="tel"
              register={register}
              errors={errors}
              watch={watch}
              required
              placeholder="(+63) 9XX-XXXXXXX"
              icon={Phone}
              useStaticLabel={true}
              validationRules={{
                required: "Emergency phone number is required",
                pattern: {
                  value: /^[+\d\s()-]{10,20}$/,
                  message: "Please enter a valid phone number (e.g., +63 912 345 6789)"
                }
              }}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Your Experience</h4>
        <Textarea
          label="Tell us about your experience as a landlord"
          id="businessInfo.businessDescription"
          register={register}
          errors={errors}
          watch={watch}
          required
          rows={4}
          placeholder="Share your experience managing properties... What types of properties have you managed before? How long have you been in the rental business?"
          validationRules={{
            required: "Please describe your experience as a landlord",
            minLength: { value: 50, message: "Description must be at least 50 characters" },
            pattern: {
              value: /^[^<>;={}\[\]\\]+$/,
              message: "Special characters like < > ; = { } [ ] \\ are not allowed for security reasons"
            }
          }}
        />
      </motion.div>

      <motion.div
        className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Important Note</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              All information provided will be kept confidential and used for verification purposes only. We take data security seriously.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LandlordInfoStep;
