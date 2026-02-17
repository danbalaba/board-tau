import React from 'react';
import Input from '../inputs/Input';
import Textarea from '../inputs/Textarea';
import Select from '../inputs/Select';
import { Building2, Tag, MapPin, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface PropertyBasicStepProps {
  register: any;
  errors: any;
  watch: any;
}

const PropertyBasicStep: React.FC<PropertyBasicStepProps> = ({ register, errors, watch }) => {
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
          />
          <Select
            label="Business Type"
            id="businessInfo.businessType"
            register={register}
            errors={errors}
            options={[
              { value: 'boarding-house', label: 'Boarding House' },
              { value: 'apartment', label: 'Apartment' },
              { value: 'dormitory', label: 'Dormitory' },
              { value: 'bed-spacer', label: 'Bed Spacer' }
            ]}
            required
          />
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
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Property Category"
              id="propertyInfo.category"
              register={register}
              errors={errors}
              options={[
                { value: 'Student-Friendly', label: 'Student-Friendly' },
                { value: 'Female-Only', label: 'Female-Only' },
                { value: 'Male-Only', label: 'Male-Only' },
                { value: 'Budget Boarding House', label: 'Budget Boarding House' },
                { value: 'Private Boarding House', label: 'Private Boarding House' },
                { value: 'Family / Visitor Friendly', label: 'Family / Visitor Friendly' }
              ]}
              required
            />
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

          <Select
            label="Lease Terms"
            id="propertyInfo.leaseTerms"
            register={register}
            errors={errors}
            options={[
              { value: '1-month', label: '1 Month' },
              { value: '3-months', label: '3 Months' },
              { value: '6-months', label: '6 Months' },
              { value: '12-months', label: '12 Months' }
            ]}
            required
          />
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
