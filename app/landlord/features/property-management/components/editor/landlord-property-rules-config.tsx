'use client';
import { ShieldCheck, Plus, HelpCircle, AlertCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PropertyFormSection, LocalCheckbox } from './shared-ui';
import { cn } from '@/utils/helper';

interface LandlordPropertyRulesConfigProps {
  formData: any;
  setFormData: (data: any) => void;
  setActiveSection: (id: string) => void;
  onAddCustomRule?: () => void;
  onAddCustomFeature?: () => void;
}

export function LandlordPropertyRulesConfig({
  formData,
  setFormData,
  setActiveSection,
  onAddCustomRule,
  onAddCustomFeature
}: LandlordPropertyRulesConfigProps) {

  const handleCustomRuleToggle = (rule: string) => {
    setFormData((prev: any) => ({
      ...prev,
      rules: {
        ...prev.rules,
        customRules: prev.rules.customRules.includes(rule)
          ? prev.rules.customRules.filter((r: string) => r !== rule)
          : [...prev.rules.customRules, rule]
      }
    }));
  };

  const handleCustomFeatureToggle = (feature: string) => {
    setFormData((prev: any) => ({
      ...prev,
      features: {
        ...prev.features,
        customFeatures: prev.features.customFeatures.includes(feature)
          ? prev.features.customFeatures.filter((f: string) => f !== feature)
          : [...prev.features.customFeatures, feature]
      }
    }));
  };

  return (
    <PropertyFormSection 
      id="config" 
      title="Listing Rules" 
      icon={ShieldCheck} 
      description="Security & occupancy conditions" 
      setActiveSection={setActiveSection}
    >
      <div className="space-y-16">
        {/* House Rules Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center space-x-3">
              <div className="w-8 h-[2px] bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              <span>Standard House Rules</span>
            </h4>
            <span className="px-3 py-1 bg-purple-500/10 text-purple-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-purple-500/20">Behavioral Policy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <LocalCheckbox 
              id="femaleOnly" 
              label="Female Only" 
              checked={formData.rules.femaleOnly} 
              onChange={() => setFormData((prev: any) => ({ ...prev, rules: { ...prev.rules, femaleOnly: !prev.rules.femaleOnly, maleOnly: false } }))}
            />
            <LocalCheckbox 
              id="maleOnly" 
              label="Male Only" 
              checked={formData.rules.maleOnly} 
              onChange={() => setFormData((prev: any) => ({ ...prev, rules: { ...prev.rules, maleOnly: !prev.rules.maleOnly, femaleOnly: false } }))}
            />
            <LocalCheckbox 
              id="visitorsAllowed" 
              label="Visitors Allowed" 
              checked={formData.rules.visitorsAllowed} 
              onChange={() => setFormData((prev: any) => ({ ...prev, rules: { ...prev.rules, visitorsAllowed: !prev.rules.visitorsAllowed } }))}
            />
            <LocalCheckbox 
              id="petsAllowed" 
              label="Pets Allowed" 
              checked={formData.rules.petsAllowed} 
              onChange={() => setFormData((prev: any) => ({ ...prev, rules: { ...prev.rules, petsAllowed: !prev.rules.petsAllowed } }))}
            />
            <LocalCheckbox 
              id="smokingAllowed" 
              label="Smoking Allowed" 
              checked={formData.rules.smokingAllowed} 
              onChange={() => setFormData((prev: any) => ({ ...prev, rules: { ...prev.rules, smokingAllowed: !prev.rules.smokingAllowed } }))}
            />
            <LocalCheckbox 
              id="noCurfew" 
              label="No Curfew" 
              checked={formData.rules.noCurfew} 
              onChange={() => setFormData((prev: any) => ({ ...prev, rules: { ...prev.rules, noCurfew: !prev.rules.noCurfew } }))}
            />
          </div>

          {/* Custom Rules List with Motion */}
          <div className="flex flex-wrap gap-3 mt-8">
            <AnimatePresence mode="popLayout">
              {formData.rules.customRules?.map((cr: string, i: number) => {
                const [label, iconName] = cr.includes('|') ? cr.split('|') : [cr, 'AlertCircle'];
                const Icon = (LucideIcons as any)[iconName] || AlertCircle;
                return (
                  <motion.button
                    layout
                    key={cr}
                    initial={{ opacity: 0, scale: 0.8, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: 10 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    type="button"
                    onClick={() => handleCustomRuleToggle(cr)}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-purple-500 text-white shadow-lg shadow-purple-500/20 text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                    <Icon size={14} className="rotate-12" />
                    {label}
                    <LucideIcons.X size={12} className="ml-1 opacity-60" />
                  </motion.button>
                );
              })}
              <motion.button
                layout
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onAddCustomRule}
                className="flex items-center gap-2.5 px-5 py-3 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] hover:border-purple-500/50 hover:text-purple-600 hover:bg-purple-500/5 transition-all"
              >
                <Plus size={14} />
                Define Custom Rule
              </motion.button>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-t border-gray-100 dark:border-gray-800 pt-12 space-y-8"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center space-x-3">
              <div className="w-8 h-[2px] bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <span>Security & Resilience</span>
            </h4>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">Environmental Specs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <LocalCheckbox 
              id="security24h" 
              label="24/7 Security" 
              checked={formData.features.security24h} 
              onChange={() => setFormData((prev: any) => ({ ...prev, features: { ...prev.features, security24h: !prev.features.security24h } }))}
            />
            <LocalCheckbox 
              id="cctv" 
              label="CCTV Surveillance" 
              checked={formData.features.cctv} 
              onChange={() => setFormData((prev: any) => ({ ...prev, features: { ...prev.features, cctv: !prev.features.cctv } }))}
            />
            <LocalCheckbox 
              id="fireSafety" 
              label="Fire Safety Kit" 
              checked={formData.features.fireSafety} 
              onChange={() => setFormData((prev: any) => ({ ...prev, features: { ...prev.features, fireSafety: !prev.features.fireSafety } }))}
            />
            <LocalCheckbox 
              id="nearTransport" 
              label="Near Transport" 
              checked={formData.features.nearTransport} 
              onChange={() => setFormData((prev: any) => ({ ...prev, features: { ...prev.features, nearTransport: !prev.features.nearTransport } }))}
            />
            <LocalCheckbox 
              id="floodFree" 
              label="Flood Free" 
              checked={formData.features.floodFree} 
              onChange={() => setFormData((prev: any) => ({ ...prev, features: { ...prev.features, floodFree: !prev.features.floodFree } }))}
            />
            <LocalCheckbox 
              id="backupPower" 
              label="Backup Power" 
              checked={formData.features.backupPower} 
              onChange={() => setFormData((prev: any) => ({ ...prev, features: { ...prev.features, backupPower: !prev.features.backupPower } }))}
            />
          </div>

          {/* Custom Features List with Motion */}
          <div className="flex flex-wrap gap-3 mt-8">
            <AnimatePresence mode="popLayout">
              {formData.features.customFeatures?.map((cf: string, i: number) => {
                const [label, iconName] = cf.includes('|') ? cf.split('|') : [cf, 'ShieldCheck'];
                const Icon = (LucideIcons as any)[iconName] || ShieldCheck;
                return (
                  <motion.button
                    layout
                    key={cf}
                    initial={{ opacity: 0, scale: 0.8, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: 10 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    type="button"
                    onClick={() => handleCustomFeatureToggle(cf)}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20 text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                    <Icon size={14} className="rotate-12" />
                    {label}
                    <LucideIcons.X size={12} className="ml-1 opacity-60" />
                  </motion.button>
                );
              })}
              <motion.button
                layout
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onAddCustomFeature}
                className="flex items-center gap-2.5 px-5 py-3 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] hover:border-amber-500/50 hover:text-amber-600 hover:bg-amber-500/5 transition-all"
              >
                <Plus size={14} />
                Specify Security Spec
              </motion.button>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </PropertyFormSection>
  );
}
