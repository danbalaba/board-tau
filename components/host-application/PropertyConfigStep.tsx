import React from 'react';
import Input from '../inputs/Input';
import Select from '../inputs/Select';
import Textarea from '../inputs/Textarea';
import Button from '../common/Button';
import { Plus, Minus, Bed, Bath, Users, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface RoomType {
  roomType: string;
  count: string;
  price: string;
  bedType: string;
  capacity: string;
  description: string;
}

interface PropertyConfigStepProps {
  register: any;
  errors: any;
  watch: any;
  fields: any[];
  append: (value: RoomType) => void;
  remove: (index: number) => void;
  control: any;
  getValues: any;
}

const PropertyConfigStep: React.FC<PropertyConfigStepProps> = ({
  register,
  errors,
  watch,
  fields,
  append,
  remove,
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
          <Bed className="w-6 h-6 text-purple dark:text-purple" />
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
          <Bed className="w-5 h-5" />
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
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Room Types</span>
          </h4>
          <Button
            type="button"
            outline
            onClick={() => append({
              roomType: 'single',
              count: '',
              price: '',
              bedType: 'single',
              capacity: '1',
              description: ''
            })}
            className="text-sm flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Room Type</span>
          </Button>
        </div>

        {fields.map((field: any, index: number) => (
          <motion.div
            key={field.id}
            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
          >
            <div className="flex items-start justify-between mb-3">
              <h5 className="font-medium text-gray-900 dark:text-white">Room Type {index + 1}</h5>
               {fields.length > 1 && (
                <Button
                  type="button"
                  outline
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    remove(index);
                  }}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center space-x-1"
                >
                  <Minus className="w-4 h-4" />
                  <span>Remove</span>
                </Button>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Room Type"
                  id={`propertyConfig.rooms[${index}].roomType`}
                  register={register}
                  errors={errors}
                  options={[
                    { value: 'single', label: 'Single Room' },
                    { value: 'double', label: 'Double Room' },
                    { value: 'twin', label: 'Twin Room' },
                    { value: 'family', label: 'Family Room' },
                    { value: 'dorm', label: 'Dorm Bed' }
                  ]}
                  required
                />

                <Input
                  label="Number of Rooms"
                  id={`propertyConfig.rooms[${index}].count`}
                  type="number"
                  register={register}
                  errors={errors}
                  watch={watch}
                  min="1"
                  required
                  placeholder="5"
                  useStaticLabel={true}
                />

                <Input
                  label="Price per Month (PHP)"
                  id={`propertyConfig.rooms[${index}].price`}
                  type="number"
                  register={register}
                  errors={errors}
                  watch={watch}
                  min="1000"
                  required
                  placeholder="15000"
                  useStaticLabel={true}
                />

                <Select
                  label="Bed Type"
                  id={`propertyConfig.rooms[${index}].bedType`}
                  register={register}
                  errors={errors}
                  options={[
                    { value: 'single', label: 'Single Bed' },
                    { value: 'double', label: 'Double Bed' },
                    { value: 'bunk', label: 'Bunk Bed' },
                    { value: 'sofa', label: 'Sofa Bed' }
                  ]}
                  required
                />

                <Select
                  label="Maximum Capacity"
                  id={`propertyConfig.rooms[${index}].capacity`}
                  register={register}
                  errors={errors}
                  options={[
                    { value: '1', label: '1 person' },
                    { value: '2', label: '2 people' },
                    { value: '3', label: '3 people' },
                    { value: '4', label: '4 people' },
                    { value: '5+', label: '5+ people' }
                  ]}
                  required
                />
              </div>

              <Textarea
                label="Room Description"
                id={`propertyConfig.rooms[${index}].description`}
                register={register}
                errors={errors}
                watch={watch}
                required
                rows={3}
                placeholder="Describe this room type... Include features, amenities, and special considerations."
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

       <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
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
        transition={{ duration: 0.5, delay: 0.7 }}
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
              id="amenity-study"
              {...register('propertyConfig.amenities', { required: false })}
              value="Study Area / Quiet Room"
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="amenity-study" className="text-sm text-gray-700 dark:text-gray-300">
              Study Area / Quiet Room
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="amenity-gated"
              {...register('propertyConfig.amenities', { required: false })}
              value="Gated / Secure"
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="amenity-gated" className="text-sm text-gray-700 dark:text-gray-300">
              Gated / Secure
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
              id="amenity-curfew"
              {...register('propertyConfig.amenities', { required: false })}
              value="Curfew Enforced"
              className="w-4 h-4 text-primary dark:text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:focus:ring-primary"
            />
            <label htmlFor="amenity-curfew" className="text-sm text-gray-700 dark:text-gray-300">
              Curfew Enforced
            </label>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Important Tips</h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Clearly defining your house rules helps manage tenant expectations and reduces conflicts. Be specific about what is and isn't allowed on your property.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PropertyConfigStep;
