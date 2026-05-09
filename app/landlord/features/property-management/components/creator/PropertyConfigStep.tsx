import React from 'react';
import Input from '@/components/inputs/Input';
import Checkbox from '@/components/inputs/Checkbox';
import { Bath, CheckCircle, ShieldCheck, ListChecks, Info, PlusCircle, HelpCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Modal from '@/components/modals/Modal';
import CustomSharedAmenityModal from './CustomSharedAmenityModal';
import CustomRuleModal from './CustomRuleModal';
import CustomFeatureModal from './CustomFeatureModal';
import { motion } from 'framer-motion';
import { amenities as AMENITY_LIST } from '@/data/amenities';
import { rulesPreferences as RULE_LIST } from '@/data/rulesPreferences';
import { advancedFilters as ADVANCED_LIST } from '@/data/advancedFilters';

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
  getValues,
  setValue
}) => {
  const [showCustomAmenityModal, setShowCustomAmenityModal] = React.useState(false);
  const [showCustomRuleModal, setShowCustomRuleModal] = React.useState(false);
  const [showCustomFeatureModal, setShowCustomFeatureModal] = React.useState(false);
  return (
    <div className="space-y-8">
      {/* Step Header */}
      <motion.div
        className="bg-gradient-to-r from-purple-500/10 to-transparent dark:from-purple-500/20 rounded-2xl p-6 border border-purple-500/20 dark:border-purple-500/30 shadow-sm"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm">Property Setup</h3>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">
              Define the rules, amenities, and security of your compound
            </p>
          </div>
        </div>
      </motion.div>

      {/* Property Basics */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center space-x-2">
          <div className="w-6 h-[2px] bg-gray-200 dark:bg-gray-700" />
          <span>Compound Structure</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Total Rooms Available"
            id="propertyConfig.totalRooms"
            type="number"
            register={register}
            errors={errors}
            watch={watch}
            required
            placeholder="e.g., 12"
            useStaticLabel={true}
            min={1}
            max={50}
            onKeyDown={(e: any) => { if (['e', 'E'].includes(e.key)) e.preventDefault(); }}
            validationRules={{
              min: { value: 1, message: "Must have at least 1 room" },
              max: { value: 50, message: "Maximum 50 rooms allowed" }
            }}
          />
          <Input
            label="Common Bathrooms (CR)"
            id="propertyConfig.bathroomCount"
            type="number"
            register={register}
            errors={errors}
            watch={watch}
            required
            placeholder="e.g., 2"
            icon={Bath}
            useStaticLabel={true}
            min={0}
            max={10}
            onKeyDown={(e: any) => { if (['e', 'E'].includes(e.key)) e.preventDefault(); }}
            validationRules={{
              min: { value: 0, message: "Cannot be negative" },
              max: { value: 10, message: "Maximum 10 common bathrooms allowed" }
            }}
          />
        </div>
      </motion.div>

      {/* Rules & Preferences */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center space-x-2">
            <div className="w-6 h-[2px] bg-primary" />
            <span>Rules & Preferences</span>
          </h4>
          <span className="text-[9px] font-black bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-gray-400 uppercase">Tenant Selection</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RULE_LIST.map((rule) => {
            const Icon = rule.icon;
            return (
              <div key={rule.value} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 transition-all">
                <Icon size={18} className="text-gray-400 flex-shrink-0" />
                <Checkbox
                  id={`propertyConfig.${rule.value}`}
                  label={rule.label}
                  register={register}
                  watch={watch}
                  className="flex-1 text-[13px] font-bold"
                />
              </div>
            );
          })}
          {Array.isArray(watch('propertyConfig.rules')) && watch('propertyConfig.rules').map((cr: any) => {
            if (typeof cr !== 'string') return null;
            const [label, iconName] = cr.includes('|') ? cr.split('|') : [cr, 'AlertCircle'];
            const Icon = (LucideIcons as any)[iconName] || HelpCircle;
            return (
              <div key={cr} className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/20 transition-all">
                <Icon size={18} className="text-primary flex-shrink-0" />
                <Checkbox
                  id="propertyConfig.rules"
                  label={label}
                  value={cr}
                  register={register}
                  watch={watch}
                  className="flex-1 text-[13px] font-bold text-primary"
                />
              </div>
            );
          })}
          <button 
            type="button" 
            onClick={() => setShowCustomRuleModal(true)}
            className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-primary/50 hover:text-primary transition-all"
          >
            <PlusCircle size={16} /> Add Custom Rule
          </button>
        </div>
      </motion.div>

      {/* Advanced Features (Scoring Multipliers) */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-600 flex items-center space-x-2">
            <div className="w-6 h-[2px] bg-amber-500" />
            <span>Premium Features (Search Boosters)</span>
          </h4>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 rounded-full border border-amber-100 dark:border-amber-500/20">
             <ShieldCheck size={10} className="text-amber-500" />
             <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase">Boosts Search Rank</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ADVANCED_LIST.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.value} className="flex items-center gap-3 p-4 bg-amber-50/30 dark:bg-amber-500/5 rounded-2xl border border-amber-100/50 dark:border-amber-500/10 hover:border-amber-500/30 transition-all">
                <Icon size={18} className="text-amber-500 flex-shrink-0" />
                <Checkbox
                  id={`propertyConfig.${feature.value}`}
                  label={feature.label}
                  register={register}
                  watch={watch}
                  className="flex-1 text-[13px] font-bold text-gray-700 dark:text-gray-300"
                />
              </div>
            );
          })}
          {Array.isArray(watch('propertyConfig.features')) && watch('propertyConfig.features').map((cf: any) => {
            if (typeof cf !== 'string') return null;
            const [label, iconName] = cf.includes('|') ? cf.split('|') : [cf, 'Shield'];
            const Icon = (LucideIcons as any)[iconName] || HelpCircle;
            return (
              <div key={cf} className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 transition-all">
                <Icon size={18} className="text-amber-600 flex-shrink-0" />
                <Checkbox
                  id="propertyConfig.features"
                  label={label}
                  value={cf}
                  register={register}
                  watch={watch}
                  className="flex-1 text-[13px] font-bold text-amber-700"
                />
              </div>
            );
          })}
          <button 
            type="button" 
            onClick={() => setShowCustomFeatureModal(true)}
            className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-amber-200 dark:border-amber-900/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-amber-600/60 hover:border-amber-500 hover:text-amber-600 transition-all"
          >
            <PlusCircle size={16} /> Add Custom Feature
          </button>
        </div>
      </motion.div>

      {/* Property Amenities */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center space-x-2">
            <div className="w-6 h-[2px] bg-blue-500" />
            <span>Shared Amenities</span>
          </h4>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 rounded-full border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
             <ListChecks size={10} />
             <span className="text-[9px] font-black uppercase tracking-widest leading-none">Whole Property Features</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {AMENITY_LIST.map((amenity) => {
            const Icon = amenity.icon;
            return (
              <div key={amenity.value} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-700/50">
                <Icon size={16} className="text-blue-500 opacity-70" />
                <Checkbox 
                  id="propertyConfig.amenities" 
                  label={amenity.label} 
                  value={amenity.value} 
                  register={register} 
                  watch={watch}
                  className="text-[13px] font-medium" 
                />
              </div>
            );
          })}
          {Array.isArray(watch('propertyConfig.amenities')) && 
            watch('propertyConfig.amenities')
              .filter((a: any) => typeof a === 'string' && !AMENITY_LIST.some(p => p.value === a))
              .map((ca: string) => {
                const [label, iconName] = ca.includes('|') ? ca.split('|') : [ca, 'HelpCircle'];
                const Icon = (LucideIcons as any)[iconName] || HelpCircle;
                return (
                  <div key={ca} className="flex items-center gap-3 py-2 border-b border-blue-100 dark:border-blue-900/30">
                    <Icon size={16} className="text-blue-600" />
                    <Checkbox 
                      id="propertyConfig.amenities" 
                      label={label} 
                      value={ca} 
                      register={register} 
                      watch={watch}
                      className="text-[13px] font-bold text-blue-700" 
                    />
                  </div>
                );
              })}
        </div>
        <button 
          type="button" 
          onClick={() => setShowCustomAmenityModal(true)}
          className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:gap-3 transition-all"
        >
          <PlusCircle size={14} /> Add Property Amenity
        </button>
      </motion.div>

      {/* Helpful Info */}
      <motion.div
        className="bg-sky-50 dark:bg-sky-900/20 rounded-2xl p-6 border border-sky-100 dark:border-sky-800/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="flex gap-4">
          <div className="p-2 bg-sky-500/10 rounded-lg h-fit">
            <Info className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h5 className="text-[11px] font-black uppercase tracking-widest text-sky-800 dark:text-sky-400 mb-1">Consistency Check</h5>
            <p className="text-xs font-bold text-sky-700 dark:text-sky-300 leading-relaxed max-w-xl">
              These amenities are synchronized with student search filters. Selecting relevant features like "WiFi" or "CCTV" significantly improves your visibility to potential tenants.
            </p>
          </div>
        </div>
      </motion.div>
      {/* Custom Modals */}
      <Modal isOpen={showCustomAmenityModal} onClose={() => setShowCustomAmenityModal(false)} width="md">
        <CustomSharedAmenityModal setValue={setValue} getValues={getValues} onClose={() => setShowCustomAmenityModal(false)} />
      </Modal>

      <Modal isOpen={showCustomRuleModal} onClose={() => setShowCustomRuleModal(false)} width="md">
        <CustomRuleModal setValue={setValue} getValues={getValues} onClose={() => setShowCustomRuleModal(false)} />
      </Modal>

      <Modal isOpen={showCustomFeatureModal} onClose={() => setShowCustomFeatureModal(false)} width="md">
        <CustomFeatureModal setValue={setValue} getValues={getValues} onClose={() => setShowCustomFeatureModal(false)} />
      </Modal>
    </div>
  );
};

export default PropertyConfigStep;

