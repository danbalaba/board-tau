'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, LayoutGrid, Settings, Shield, Image as ImageIcon, Bed, Save, ChevronRight, AlertCircle, MapPin, Search, Globe, Navigation, Search as SearchIcon, Sparkles } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { usePropertyEditorLogic } from './hooks/use-property-editor-logic';
import { LandlordPropertyBasicsForm } from './components/editor/landlord-property-basics-form';
import { LandlordPropertyLocationForm } from './components/editor/landlord-property-location-form';
import { LandlordPropertyRulesConfig } from './components/editor/landlord-property-rules-config';
import { LandlordPropertyAmenitiesSelector } from './components/editor/landlord-property-amenities-selector';
import { LandlordPropertyMediaUploader } from './components/editor/landlord-property-media-uploader';
import { LandlordPropertyRoomsEditor } from './components/editor/landlord-property-rooms-editor';
import { PropertyFormSkeleton } from './components/editor/shared-ui';
import { cn } from '@/utils/helper';
import ReactSelect from 'react-select';

// Modals from Creator
import Modal from '@/components/modals/Modal';
import CustomRuleModal from './components/creator/CustomRuleModal';
import CustomFeatureModal from './components/creator/CustomFeatureModal';
import CustomSharedAmenityModal from './components/creator/CustomSharedAmenityModal';
import CustomAmenityModal from './components/creator/CustomAmenityModal';
import BulkConfigureModal from './components/creator/BulkConfigureModal';

interface LandlordPropertyEditorProps {
  initialData?: any;
}

const SECTIONS = [
  { id: 'basics', label: 'Basics', icon: Settings, desc: 'Title, Category, Narrative' },
  { id: 'location', label: 'Location', icon: Globe, desc: 'Map pinning & address' },
  { id: 'amenities', label: 'Amenities', icon: LayoutGrid, desc: 'Shared property features' },
  { id: 'config', label: 'Rules', icon: Shield, desc: 'Security & house rules' },
  { id: 'rooms', label: 'Room Setup', icon: Bed, desc: 'Units & pricing management' },
  { id: 'media', label: 'Gallery', icon: ImageIcon, desc: 'Visual property showcase' },
];

export default function LandlordPropertyEditor({ initialData = {} }: LandlordPropertyEditorProps) {
  const { 
    formData, 
    setFormData, 
    errors, 
    isSubmitting, 
    isMounted,
    isDirty,
    canUndo,
    handleUndo,
    handleReset,
    saveHistory,
    activeSection,
    setActiveSection,
    handleImageChange,
    deleteExistingImage,
    handleSubmitForm,
    addRoom,
    removeRoom,
    updateRoom
  } = usePropertyEditorLogic(initialData);

  const handleBulkApply = (template: any) => {
    saveHistory(); // Save before bulk change
    const updatedRooms = formData.rooms.map((room: any) => {
      const bedCount = parseInt(template.bedCount) || 0;
      const multiplier = template.bedType === 'BUNK' ? 2 : 1;
      const capacity = (bedCount * multiplier).toString();
      return { ...room, ...template, capacity, availableSlots: capacity };
    });
    setFormData((prev: any) => ({ ...prev, rooms: updatedRooms, totalRooms: updatedRooms.length.toString() }));
    setShowBulkModal(false);
  };

  const setFormValue = (name: string, value: any) => {
    saveHistory();
    if (name === 'propertyConfig.rules') {
      setFormData((prev: any) => ({ ...prev, rules: { ...prev.rules, customRules: value } }));
    } else if (name === 'propertyConfig.features') {
      setFormData((prev: any) => ({ ...prev, features: { ...prev.features, customFeatures: value } }));
    } else if (name === 'propertyConfig.amenities') {
      setFormData((prev: any) => ({ ...prev, customAmenities: value }));
    } else if (name.includes('amenities') && name.includes('rooms')) {
      const index = parseInt(name.match(/\[(\d+)\]/)?.[1] || '0');
      const newRooms = [...formData.rooms];
      newRooms[index].amenities = value;
      setFormData((prev: any) => ({ ...prev, rooms: newRooms }));
    }
  };

  const getFormValues = (name: string) => {
    if (name === 'propertyConfig.rules') return formData.rules.customRules;
    if (name === 'propertyConfig.features') return formData.features.customFeatures;
    if (name === 'propertyConfig.amenities') return formData.customAmenities;
    if (name.includes('amenities') && name.includes('rooms')) {
      const index = parseInt(name.match(/\[(\d+)\]/)?.[1] || '0');
      return formData.rooms[index].amenities;
    }
    return [];
  };

  const router = useRouter();

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  // Modal States
  const [showCustomRuleModal, setShowCustomRuleModal] = useState(false);
  const [showCustomFeatureModal, setShowCustomFeatureModal] = useState(false);
  const [showCustomSharedModal, setShowCustomSharedModal] = useState(false);
  const [showCustomUnitModal, setShowCustomUnitModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [activeRoomIndex, setActiveRoomIndex] = useState<number | null>(null);

  // Health Calculation Logic
  const calculateHealth = () => {
    let score = 0;
    if (formData.title) score += 10;
    if (formData.description) score += 10;
    if (formData.category) score += 10;
    if (formData.latlng && formData.latlng.length === 2) score += 20;
    if (formData.amenities.length >= 3) score += 15;
    if (formData.rooms.length >= 1) score += 15;
    if (formData.existingImages.length + formData.propertyFiles.length >= 4) score += 20;
    return Math.min(score, 100);
  };

  if (!isMounted) return <PropertyFormSkeleton />;

  return (
    <div className="w-full min-h-screen bg-gray-50/50 dark:bg-[#0B0F1A] transition-colors duration-500">
      {/* 1. Integrated Action Header */}
      <div className="sticky top-0 z-[50] w-full px-8 py-4 bg-white/60 dark:bg-[#0B0F1A]/60 backdrop-blur-3xl border-b border-gray-100 dark:border-gray-800 transition-all duration-500">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => router.push('/landlord/properties')}
              className="flex items-center gap-3 text-gray-400 hover:text-primary transition-all group"
            >
              <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:bg-primary/10 transition-all">
                <LucideIcons.ChevronLeft size={18} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:block">Properties</span>
            </button>

            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="p-3.5 bg-primary/10 rounded-2xl text-primary border border-primary/20 shadow-inner">
                  <Settings size={22} className="animate-[spin_6s_linear_infinite]" />
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0B0F1A] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Refine Listing</h1>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest rounded-md border border-emerald-500/20">Active Draft</span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  {formData.title || 'Property Master File'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <AnimatePresence>
              {isDirty && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center bg-gray-50 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 mr-2 shadow-inner">
                    <button
                      onClick={handleUndo}
                      disabled={!canUndo}
                      className={cn(
                        "p-2.5 rounded-xl transition-all",
                        canUndo ? "text-amber-500 hover:bg-amber-500/10" : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                      )}
                      title="Undo (Ctrl+Z)"
                    >
                      <LucideIcons.RotateCcw size={16} />
                    </button>
                    <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
                    <button
                      onClick={handleReset}
                      className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      title="Discard all changes"
                    >
                      <LucideIcons.Trash2 size={16} />
                    </button>
                  </div>

                  {Object.keys(errors).length > 0 && (
                    <div className="hidden md:flex items-center gap-2.5 px-5 py-2.5 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20">
                      <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.15em]">{Object.keys(errors).length} Constraints</span>
                    </div>
                  )}

                  <button
                    onClick={handleSubmitForm}
                    disabled={isSubmitting}
                    className={cn(
                      "group relative flex items-center gap-3 px-10 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-500 shadow-2xl shadow-primary/20",
                      isSubmitting 
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed" 
                        : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95"
                    )}
                  >
                    <Save size={16} className={cn("transition-transform duration-500", isSubmitting ? "animate-bounce" : "group-hover:rotate-12")} />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="flex flex-col xl:flex-row gap-16 items-start justify-center">
          
          {/* 2. Slimmer Smart Nav */}
          <div className="w-full xl:w-64 xl:sticky xl:top-32 space-y-4">
             <div className="bg-white/80 dark:bg-gray-900/60 p-3 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm backdrop-blur-xl">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] ml-5 mb-4 mt-2">Navigation</p>
                <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-1 gap-1.5">
                   {SECTIONS.map((step) => {
                     const isActive = activeSection === step.id;
                     return (
                        <button
                          key={step.id}
                          onClick={() => {
                            setActiveSection(step.id);
                            document.getElementById(step.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className={cn(
                            "group flex items-center gap-3.5 p-2.5 rounded-2xl transition-all duration-500",
                            isActive 
                              ? "bg-primary text-white shadow-xl shadow-primary/25 translate-x-2" 
                              : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                          )}
                        >
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500",
                            isActive ? "bg-white/20 rotate-6" : "bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10 group-hover:rotate-6"
                          )}>
                            <step.icon size={16} />
                          </div>
                          <div className="hidden xl:block text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest">{step.label}</p>
                            <p className={cn("text-[7.5px] font-bold uppercase truncate w-28", isActive ? "text-white/60" : "text-gray-400")}>{step.desc}</p>
                          </div>
                        </button>
                     );
                   })}
                </div>
             </div>

             <div className="hidden xl:block p-6 bg-white dark:bg-primary/10 rounded-[2.5rem] border border-gray-100 dark:border-primary/20 text-gray-900 dark:text-white shadow-sm overflow-hidden relative group">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 relative z-10 opacity-70">Listing Health</h4>
                <div className="flex items-center gap-2.5 mb-3 relative z-10">
                   <div className="flex-1 h-1.5 bg-gray-100/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${calculateHealth()}%` }}
                        className={cn(
                          "h-full transition-all duration-1000",
                          calculateHealth() > 80 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        )}
                      />
                   </div>
                   <span className="text-[10px] font-black">{calculateHealth()}%</span>
                </div>
                <div className="text-[8.5px] font-bold uppercase text-gray-400 leading-relaxed">
                  {calculateHealth() === 100 
                    ? <>Listing is <span className='text-emerald-500'>Optimized</span> & ready for reach.</>
                    : <>Complete all specs to reach <span className='text-primary'>100% score</span>.</>
                  }
                </div>
             </div>
          </div>

          {/* 3. Expanded Centered Content */}
          <div className="flex-1 w-full max-w-5xl space-y-20 pb-40">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-16"
            >
              <LandlordPropertyBasicsForm 
                formData={formData} 
                setFormData={setFormData} 
                errors={errors} 
                setActiveSection={setActiveSection}
              />

              <LandlordPropertyLocationForm 
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setActiveSection={setActiveSection}
                saveHistory={saveHistory}
              />

              <LandlordPropertyAmenitiesSelector 
                formData={formData} 
                setFormData={setFormData} 
                setActiveSection={setActiveSection}
                onAddCustom={() => setShowCustomSharedModal(true)}
              />

              <LandlordPropertyRulesConfig 
                formData={formData} 
                setFormData={setFormData} 
                setActiveSection={setActiveSection}
                onAddCustomRule={() => setShowCustomRuleModal(true)}
                onAddCustomFeature={() => setShowCustomFeatureModal(true)}
              />

              <LandlordPropertyRoomsEditor
                formData={formData}
                setFormData={setFormData}
                setActiveSection={setActiveSection}
                onAddCustomUnitAmenity={(idx) => {
                  setActiveRoomIndex(idx);
                  setShowCustomUnitModal(true);
                }}
                onOpenBulkModal={() => setShowBulkModal(true)}
                addRoom={addRoom}
                removeRoom={removeRoom}
                updateRoom={updateRoom}
              />

              <LandlordPropertyMediaUploader 
                formData={formData} 
                setFormData={setFormData} 
                handleImageChange={handleImageChange}
                deleteExistingImage={deleteExistingImage}
                setActiveSection={setActiveSection}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* 4. Modal Overlays */}
      <Modal isOpen={showCustomRuleModal} onClose={() => setShowCustomRuleModal(false)} width="md">
        <CustomRuleModal setValue={setFormValue} getValues={getFormValues} onClose={() => setShowCustomRuleModal(false)} />
      </Modal>

      <Modal isOpen={showCustomFeatureModal} onClose={() => setShowCustomFeatureModal(false)} width="md">
        <CustomFeatureModal setValue={setFormValue} getValues={getFormValues} onClose={() => setShowCustomFeatureModal(false)} />
      </Modal>

      <Modal isOpen={showCustomSharedModal} onClose={() => setShowCustomSharedModal(false)} width="md">
        <CustomSharedAmenityModal setValue={setFormValue} getValues={getFormValues} onClose={() => setShowCustomSharedModal(false)} />
      </Modal>

      <Modal isOpen={showCustomUnitModal} onClose={() => setShowCustomUnitModal(false)} width="md">
        <CustomAmenityModal setValue={setFormValue} getValues={getFormValues} selectedRoomIndex={activeRoomIndex ?? -1} onClose={() => setShowCustomUnitModal(false)} />
      </Modal>

      <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} width="xl">
        <BulkConfigureModal roomCount={formData.rooms.length} commonBathroomCount={parseInt(formData.bathroomCount) || 0} onClose={() => setShowBulkModal(false)} onApply={handleBulkApply} />
      </Modal>
    </div>
  );
}
