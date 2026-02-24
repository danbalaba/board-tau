import React from 'react';
import Input from '../inputs/Input';
import Select from '../inputs/Select';
import Textarea from '../inputs/Textarea';
import { Bath, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface PropertyConfigStepProps {
  register: any;
  errors: any;
  watch: any;
  control: any;
  getValues: any;
}

const PropertyConfigStep: React.FC<PropertyConfigStepProps> = ({
  register,
  errors,
  watch,
  control,
  getValues
}) => {
  return (
    <div className="space-y-6">
      <motion.div
        className="bg-gradient-to-r from-purple/10 to-purple/5 dark:from-purple/20 dark:to-purple/10 rounded-xl p-6 border border-purple/20 dark:border-purple/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-purple dark:text-purple" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Property Configuration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure your property details
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
          <CheckCircle className="w-5 h-5" />
          <span>Property Basics</span>
        </h4>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Total Rooms Available"
              id="propertyConfig.totalRooms"
              type="number"
              register={register}
              errors={errors}
              watch={watch}
              min="1"
              max="50"
              required
              placeholder="10"
              useStaticLabel={true}
            />
            <Input
              label="Number of Bathrooms"
              id="propertyConfig.bathroomCount"
              type="number"
              register={register}
              errors={errors}
              watch={watch}
              min="1"
              required
              placeholder="2"
              icon={Bath}
              useStaticLabel={true}
            />
          </div>

          <Select
            label="Bathroom Type"
            id="propertyConfig.bathroomType"
            register={register}
            errors={errors}
            options={[
              { value: 'shared', label: 'Shared' },
              { value: 'private', label: 'Private' },
              { value: 'both', label: 'Both' }
            ]}
            required
          />
        </div>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Rules & Preferences</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="femaleOnly"
              {...register('propertyConfig.femaleOnly', { required: false })}
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="femaleOnly" className="text-sm text-gray-700 dark:text-gray-300">
              Female-only
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="maleOnly"
              {...register('propertyConfig.maleOnly', { required: false })}
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="maleOnly" className="text-sm text-gray-700 dark:text-gray-300">
              Male-only
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="visitorsAllowed"
              {...register('propertyConfig.visitorsAllowed', { required: false })}
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="visitorsAllowed" className="text-sm text-gray-700 dark:text-gray-300">
              Visitors allowed
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="petsAllowed"
              {...register('propertyConfig.petsAllowed', { required: false })}
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="petsAllowed" className="text-sm text-gray-700 dark:text-gray-300">
              Pets allowed
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="smokingAllowed"
              {...register('propertyConfig.smokingAllowed', { required: false })}
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="smokingAllowed" className="text-sm text-gray-700 dark:text-gray-300">
              Smoking allowed
            </label>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Advanced Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="security24h"
              {...register('propertyConfig.security24h', { required: false })}
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="security24h" className="text-sm text-gray-700 dark:text-gray-300">
              24/7 security
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="cctv"
              {...register('propertyConfig.cctv', { required: false })}
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="cctv" className="text-sm text-gray-700 dark:text-gray-300">
              CCTV
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="fireSafety"
              {...register('propertyConfig.fireSafety', { required: false })}
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="fireSafety" className="text-sm text-gray-700 dark:text-gray-300">
              Fire safety equipment
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="nearTransport"
              {...register('propertyConfig.nearTransport', { required: false })}
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="nearTransport" className="text-sm text-gray-700 dark:text-gray-300">
              Near public transport
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="studyFriendly"
              {...register('propertyConfig.studyFriendly', { required: false })}
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="studyFriendly" className="text-sm text-gray-700 dark:text-gray-300">
              Study-friendly environment
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="quietEnvironment"
              {...register('propertyConfig.quietEnvironment', { required: false })}
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="quietEnvironment" className="text-sm text-gray-700 dark:text-gray-300">
              Quiet / noise-controlled
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="flexibleLease"
              {...register('propertyConfig.flexibleLease', { required: false })}
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="flexibleLease" className="text-sm text-gray-700 dark:text-gray-300">
              Flexible lease terms
            </label>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Amenities</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="amenity-wifi"
              {...register('propertyConfig.amenities', { required: false })}
              value="WiFi"
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="amenity-wifi" className="text-sm text-gray-700 dark:text-gray-300">
              WiFi
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="amenity-owncr"
              {...register('propertyConfig.amenities', { required: false })}
              value="Own CR"
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="amenity-owncr" className="text-sm text-gray-700 dark:text-gray-300">
              Own CR
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="amenity-sharedcr"
              {...register('propertyConfig.amenities', { required: false })}
              value="Shared CR"
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="amenity-sharedcr" className="text-sm text-gray-700 dark:text-gray-300">
              Shared CR
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="amenity-kitchen"
              {...register('propertyConfig.amenities', { required: false })}
              value="Kitchen Access"
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="amenity-kitchen" className="text-sm text-gray-700 dark:text-gray-300">
              Kitchen Access
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="amenity-laundry"
              {...register('propertyConfig.amenities', { required: false })}
              value="Laundry Area"
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="amenity-laundry" className="text-sm text-gray-700 dark:text-gray-300">
              Laundry Area
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="amenity-ac"
              {...register('propertyConfig.amenities', { required: false })}
              value="Air Conditioning"
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="amenity-ac" className="text-sm text-gray-700 dark:text-gray-300">
              Air Conditioning
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="amenity-waterheater"
              {...register('propertyConfig.amenities', { required: false })}
              value="Water Heater"
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="amenity-waterheater" className="text-sm text-gray-700 dark:text-gray-300">
              Water Heater
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="amenity-parking"
              {...register('propertyConfig.amenities', { required: false })}
              value="Parking"
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="amenity-parking" className="text-sm text-gray-700 dark:text-gray-300">
              Parking
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="amenity-cabletv"
              {...register('propertyConfig.amenities', { required: false })}
              value="Cable TV"
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="amenity-cabletv" className="text-sm text-gray-700 dark:text-gray-300">
              Cable TV
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PropertyConfigStep;
