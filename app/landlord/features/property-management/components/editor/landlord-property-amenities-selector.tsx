'use client';
import { Wifi, Plus, HelpCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import { PropertyFormSection } from './shared-ui';
import { amenities as AMENITY_LIST } from "@/data/amenities";

interface LandlordPropertyAmenitiesSelectorProps {
  formData: any;
  setFormData: (data: any) => void;
  setActiveSection: (id: string) => void;
  onAddCustom?: () => void;
}

export function LandlordPropertyAmenitiesSelector({
  formData,
  setFormData,
  setActiveSection,
  onAddCustom
}: LandlordPropertyAmenitiesSelectorProps) {
  
  const handleAmenityToggle = (amenityValue: string) => {
    setFormData((prev: any) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityValue)
        ? prev.amenities.filter((a: string) => a !== amenityValue)
        : [...prev.amenities, amenityValue]
    }));
  };

  const handleCustomToggle = (amenityValue: string) => {
    setFormData((prev: any) => ({
      ...prev,
      customAmenities: prev.customAmenities.includes(amenityValue)
        ? prev.customAmenities.filter((a: string) => a !== amenityValue)
        : [...prev.customAmenities, amenityValue]
    }));
  };

  const AMENITY_GROUPS = [
    { 
      name: 'Connectivity & Security', 
      items: AMENITY_LIST.filter((a: any) => ['WiFi', 'Gated / Secure'].includes(a.value)) 
    },
    { 
      name: 'Utilities & Facilities', 
      items: AMENITY_LIST.filter((a: any) => ['Laundry Area', 'Water Dispenser', 'Kitchen Access'].includes(a.value)) 
    },
    { 
      name: 'Lifestyle & Convenience', 
      items: AMENITY_LIST.filter((a: any) => ['Parking', 'Common TV', 'Store Nearby'].includes(a.value)) 
    }
  ];

  return (
    <PropertyFormSection 
      id="amenities" 
      title="Shared Amenities" 
      icon={Wifi} 
      description="Essential utilities & perks available to all tenants" 
      setActiveSection={setActiveSection}
    >
      <div className="space-y-16">
        {AMENITY_GROUPS.map((group, groupIdx) => (
          <motion.div 
            key={group.name}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: groupIdx * 0.1 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
                <div className="w-8 h-[2px] bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                {group.name}
              </h4>
              <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-full border border-primary/20">Active Category</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {group.items.map((amenity: any, i: number) => {
                const Icon = amenity.icon;
                const isSelected = formData.amenities.includes(amenity.value);
                
                return (
                  <motion.button
                    key={amenity.value}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity.value)}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className={cn(
                      "group flex items-center gap-4 px-6 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 border-2",
                      isSelected
                        ? "bg-primary text-white border-primary shadow-2xl shadow-primary/20"
                        : "bg-white dark:bg-gray-900 text-gray-500 border-gray-50 dark:border-gray-800 hover:border-primary/20"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                      isSelected ? "bg-white/20 rotate-6 shadow-lg shadow-white/10" : "bg-gray-50 dark:bg-gray-800 group-hover:bg-primary/10 group-hover:rotate-6 group-hover:text-primary"
                    )}>
                      <Icon size={18} className="transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <span className="truncate">{amenity.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Custom Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-t border-gray-100 dark:border-gray-800 pt-12 space-y-8"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-600 flex items-center gap-3">
              <div className="w-8 h-[2px] bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              Custom Additions
            </h4>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">Bespoke Perks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {formData.customAmenities?.map((ca: string, i: number) => {
                const [label, iconName] = ca.includes('|') ? ca.split('|') : [ca, 'HelpCircle'];
                const Icon = (LucideIcons as any)[iconName] || HelpCircle;
                const isSelected = formData.customAmenities.includes(ca);
                
                return (
                  <motion.button
                    layout
                    key={ca}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="button"
                    onClick={() => handleCustomToggle(ca)}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "group flex items-center gap-4 px-6 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 border-2",
                      isSelected
                        ? "bg-amber-500 text-white border-amber-500 shadow-2xl shadow-amber-500/20"
                        : "bg-white dark:bg-gray-900 text-gray-500 border-gray-50 dark:border-gray-800 hover:border-amber-500/20"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                      isSelected ? "bg-white/20 rotate-6 shadow-lg shadow-white/10" : "bg-gray-50 dark:bg-gray-800 group-hover:bg-amber-500/10 group-hover:rotate-6 group-hover:text-amber-500"
                    )}>
                      <Icon size={18} />
                    </div>
                    <span className="truncate">{label}</span>
                  </motion.button>
                );
              })}

              <motion.button
                layout
                key="add-new-btn"
                type="button"
                onClick={onAddCustom}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 px-6 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border-2 border-dashed border-gray-100 dark:border-gray-800 text-gray-400 hover:border-primary/50 hover:text-primary hover:bg-primary/5 group shadow-sm"
              >
                <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:rotate-90 transition-all duration-500">
                  <Plus size={20} />
                </div>
                <span>New Perk</span>
              </motion.button>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </PropertyFormSection>
  );
}
