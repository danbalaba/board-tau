import React from 'react';
import Input from '../inputs/Input';
import Checkbox from '../inputs/Checkbox';
import { Bath, CheckCircle } from 'lucide-react';
import { IconCheck, IconChecks, IconX } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';


interface PropertyConfigStepProps {
  register: any;
  errors: any;
  watch: any;
  control: any;
  getValues: any;
  setValue: any;
}

const PropertyConfigStep: React.FC<PropertyConfigStepProps> = ({
  register,
  errors,
  watch,
  control,
  getValues,
  setValue
}) => {
  const currentAmenities = watch('propertyConfig.amenities') || [];

  const allAmenities = [
    "WiFi",
    "Laundry Area",
    "Parking",
    "Gated",
    "Kitchen Access",
    "Study Room",
    "Elevator",
    "Furnished",
    "Gym",
    "Water Heater"
  ];

  const currentRules = [
    watch('propertyConfig.femaleOnly'),
    watch('propertyConfig.maleOnly'),
    watch('propertyConfig.visitorsAllowed'),
    watch('propertyConfig.petsAllowed'),
    watch('propertyConfig.smokingAllowed')
  ];

  const currentFeatures = [
    watch('propertyConfig.security24h'),
    watch('propertyConfig.cctv'),
    watch('propertyConfig.fireSafety'),
    watch('propertyConfig.nearTransport'),
    watch('propertyConfig.studyFriendly'),
    watch('propertyConfig.quietEnvironment'),
    watch('propertyConfig.flexibleLease')
  ];

  const handleSelectRules = () => {
    const allRulesKeys = [
      'propertyConfig.femaleOnly',
      'propertyConfig.maleOnly',
      'propertyConfig.visitorsAllowed',
      'propertyConfig.petsAllowed',
      'propertyConfig.smokingAllowed'
    ];
    const isAllSelected = currentRules.every(Boolean);
    allRulesKeys.forEach(key => setValue(key, !isAllSelected, { shouldValidate: true }));
  };

  const handleSelectFeatures = () => {
    const allFeaturesKeys = [
      'propertyConfig.security24h',
      'propertyConfig.cctv',
      'propertyConfig.fireSafety',
      'propertyConfig.nearTransport',
      'propertyConfig.studyFriendly',
      'propertyConfig.quietEnvironment',
      'propertyConfig.flexibleLease'
    ];
    const isAllSelected = currentFeatures.every(Boolean);
    allFeaturesKeys.forEach(key => setValue(key, !isAllSelected, { shouldValidate: true }));
  };

  const handleSelectAll = () => {
    const isAllSelected = currentAmenities.length === allAmenities.length;
    setValue('propertyConfig.amenities', isAllSelected ? [] : allAmenities, { shouldValidate: true });
  };
  return (
    <div className="space-y-6 pb-10">
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
              label="Number of Common Bathrooms"
              id="propertyConfig.bathroomCount"
              type="number"
              register={register}
              errors={errors}
              watch={watch}
              min="0"
              required
              placeholder="2"
              icon={Bath}
              useStaticLabel={true}
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
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Rules & Preferences</h4>
          <button
            type="button"
            onClick={handleSelectRules}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300",
              currentRules.every(Boolean)
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:border-primary/40 hover:text-primary"
            )}
          >
            <AnimatePresence mode="wait">
              {currentRules.every(Boolean) ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-2">
          <Checkbox
            id="propertyConfig.femaleOnly"
            label="Female-only"
            register={register}
            watch={watch}
          />
          <Checkbox
            id="propertyConfig.maleOnly"
            label="Male-only"
            register={register}
            watch={watch}
          />
          <Checkbox
            id="propertyConfig.visitorsAllowed"
            label="Visitors allowed"
            register={register}
            watch={watch}
          />
          <Checkbox
            id="propertyConfig.petsAllowed"
            label="Pets allowed"
            register={register}
            watch={watch}
          />
          <Checkbox
            id="propertyConfig.smokingAllowed"
            label="Smoking allowed"
            register={register}
            watch={watch}
          />
        </div>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Advanced Features</h4>
          <button
            type="button"
            onClick={handleSelectFeatures}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300",
              currentFeatures.every(Boolean)
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:border-primary/40 hover:text-primary"
            )}
          >
            <AnimatePresence mode="wait">
              {currentFeatures.every(Boolean) ? (
                <motion.span key="deselect" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5">
                  <IconX size={10} strokeWidth={3.5} /> Deselect All
                </motion.span>
              ) : (
                <motion.span key="select" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5">
                  <IconChecks size={10} strokeWidth={2.5} /> Select All
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-2">
          <Checkbox
            id="propertyConfig.security24h"
            label="24/7 security"
            register={register}
            watch={watch}
          />
          <Checkbox
            id="propertyConfig.cctv"
            label="CCTV"
            register={register}
            watch={watch}
          />
          <Checkbox
            id="propertyConfig.fireSafety"
            label="Fire safety equipment"
            register={register}
            watch={watch}
          />
          <Checkbox
            id="propertyConfig.nearTransport"
            label="Near public transport"
            register={register}
            watch={watch}
          />
          <Checkbox
            id="propertyConfig.studyFriendly"
            label="Study-friendly environment"
            register={register}
            watch={watch}
          />
          <Checkbox
            id="propertyConfig.quietEnvironment"
            label="Quiet / noise-controlled"
            register={register}
            watch={watch}
          />
          <Checkbox
            id="propertyConfig.flexibleLease"
            label="Flexible lease terms"
            register={register}
            watch={watch}
          />
        </div>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Property Amenities</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Select amenities available for the entire property (listing-level)</p>
          </div>
          <button
            type="button"
            onClick={handleSelectAll}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300",
              currentAmenities.length === allAmenities.length
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:border-primary/40 hover:text-primary"
            )}
          >
            <AnimatePresence mode="wait">
              {currentAmenities.length === allAmenities.length ? (
                <motion.span key="deselect" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5">
                  <IconX size={10} strokeWidth={3.5} /> Deselect All
                </motion.span>
              ) : (
                <motion.span key="select" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5">
                  <IconChecks size={10} strokeWidth={2.5} /> Select All
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-2">
          <Checkbox id="propertyConfig.amenities" label="WiFi / Internet" value="WiFi" register={register} watch={watch} />
          <Checkbox id="propertyConfig.amenities" label="Laundry Area / Washer" value="Laundry Area" register={register} watch={watch} />
          <Checkbox id="propertyConfig.amenities" label="Parking / Garage" value="Parking" register={register} watch={watch} />
          <Checkbox id="propertyConfig.amenities" label="Gated / Secure" value="Gated" register={register} watch={watch} />
          <Checkbox id="propertyConfig.amenities" label="Kitchen / Shared Kitchen" value="Kitchen Access" register={register} watch={watch} />
          <Checkbox id="propertyConfig.amenities" label="Study Room / Common Area" value="Study Room" register={register} watch={watch} />
          <Checkbox id="propertyConfig.amenities" label="Elevator / Accessible" value="Elevator" register={register} watch={watch} />
          <Checkbox id="propertyConfig.amenities" label="Furnished" value="Furnished" register={register} watch={watch} />
          <Checkbox id="propertyConfig.amenities" label="Gym / Pool / Recreation" value="Gym" register={register} watch={watch} />
          <Checkbox id="propertyConfig.amenities" label="Water Heater" value="Water Heater" register={register} watch={watch} />
        </div>
      </motion.div>
    </div>
  );
};

export default PropertyConfigStep;

