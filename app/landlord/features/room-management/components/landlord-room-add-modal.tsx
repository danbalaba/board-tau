import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as LucideIcons from 'lucide-react';
import Modal from '@/components/modals/Modal';
import { 
  X, 
  Plus, 
  Bed, 
  Bath, 
  Users, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  ShowerHead, 
  Info,
  ChevronRight,
  Sparkles,
  Zap,
  Loader2,
  Maximize2,
  DoorOpen,
  DollarSign,
  ChevronLeft,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Eye,
  HelpCircle,
  Wind,
  Sofa,
  Utensils,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/utils/helper';
import SafeImage from '@/components/common/SafeImage';
import Button from '@/components/common/Button';
import RoomAddModernSelect from './RoomAddModernSelect';
import MediaPreviewOverlay from '@/components/common/MediaPreviewOverlay';
import { RoomSubmissionLoaderModal } from './RoomSubmissionLoaderModal';
import { 
  BATHROOM_ARRANGEMENTS, 
  bedTypeOptions as CENTRAL_BED_TYPES
} from '@/utils/constants';
import { toast } from 'sonner';
import { useEdgeStore } from '@/lib/edgestore';
import { useAddRoomModal } from '../hooks/use-add-room-modal';
import { 
  getCachedAttributes, 
  getSyncAttributes, 
  getCachedSubGroups,
  getSyncSubGroups,
  getCachedRoomTypes, 
  getSyncRoomTypes 
} from '@/lib/landlordTaxonomyCache';
import { getDynamicIcon } from '@/lib/iconResolver';

function AutoSaveBadge({ 
  saveStatus, 
  lastSavedTimestamp, 
  lastSavedTime 
}: { 
  saveStatus: 'idle' | 'saving' | 'saved'; 
  lastSavedTimestamp: number | null; 
  lastSavedTime: string; 
}) {
  const [relativeText, setRelativeText] = useState('');

  useEffect(() => {
    const updateText = () => {
      if (saveStatus === 'saving') {
        setRelativeText('Saving...');
        return;
      }
      if (!lastSavedTimestamp) {
        setRelativeText(lastSavedTime ? `Saved at ${lastSavedTime}` : 'Draft Auto-Saved');
        return;
      }
      const diffSec = Math.floor((Date.now() - lastSavedTimestamp) / 1000);
      if (diffSec < 10) {
        setRelativeText('Saved just now ✓');
      } else if (diffSec < 60) {
        setRelativeText(`Saved ${diffSec}s ago`);
      } else {
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) {
          setRelativeText(`Saved ${diffMin}m ago`);
        } else {
          setRelativeText(`Saved at ${lastSavedTime}`);
        }
      }
    };

    updateText();
    const interval = setInterval(updateText, 4000);
    return () => clearInterval(interval);
  }, [saveStatus, lastSavedTimestamp, lastSavedTime]);

  if (saveStatus === 'idle' && !lastSavedTimestamp && !lastSavedTime) return null;

  const isSaving = saveStatus === 'saving';

  return (
    <div 
      className={cn(
        "relative w-[135px] h-7 px-2.5 rounded-full border transition-all duration-300 flex items-center justify-center shrink-0 overflow-hidden select-none",
        isSaving 
          ? "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20" 
          : "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isSaving ? (
          <motion.div
            key="saving"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap w-full"
          >
            <div className="animate-spin w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full shrink-0" />
            <span className="truncate">Saving...</span>
          </motion.div>
        ) : (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap w-full"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="truncate">{relativeText}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface LandlordRoomAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  uniqueProperties: { id: string; title: string; propertyTypeId?: string | null; bathroomCount?: number }[];
  initialData?: any;
  initialListingId?: string;
}

const STEPS = [
  { id: 1, title: 'Unit Identity', icon: Building2 },
  { id: 2, title: 'Rates & Setup', icon: DollarSign },
  { id: 3, title: 'Photos & Description', icon: ImageIcon },
];

export const LandlordRoomAddModal: React.FC<LandlordRoomAddModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  uniqueProperties,
  initialData,
  initialListingId
}) => {
  const {
    currentStep,
    loading,
    uploadingImages,
    errors,
    files,
    formData,
    setFormData,
    handleChange,
    handleCategoryToggle,
    handleFileChange,
    removeFile,
    handleNext,
    handleBack,
    handleSubmit,
    shakeKey,
    submitted,
    restoredDraft,
    discardDraft,
    saveStatus,
    lastSavedTime,
    lastSavedTimestamp,
    showDraftModal,
    setShowDraftModal,
    savedDraftData,
    applyDraft,
    isCheckingDraft,
    activeAmenityCategory,
    setActiveAmenityCategory
  } = useAddRoomModal({ initialListingId, initialData, onSuccess, onClose });

  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // Dynamic Taxonomy State
  const [roomTypeOptions, setRoomTypeOptions] = useState<any[]>([]);
  const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(false);
  const [dynamicAttributes, setDynamicAttributes] = useState<any[]>([]);

  // Selected Listing Property Details
  const selectedProperty = useMemo(() => {
    return uniqueProperties.find(p => p.id === formData.listingId) || null;
  }, [uniqueProperties, formData.listingId]);

  // Load Room Types dynamically based on Parent Listing Property Type ID
  useEffect(() => {
    if (!selectedProperty) {
      setRoomTypeOptions([]);
      setIsLoadingRoomTypes(false);
      return;
    }

    const propTypeId = (selectedProperty as any)?.propertyTypeId || 
                       (selectedProperty as any)?.propertyType?.id || 
                       (selectedProperty as any)?.businessInfo?.businessType ||
                       (selectedProperty as any)?.propertyType?.name ||
                       (selectedProperty as any)?.businessInfo?.propertyType ||
                       (selectedProperty as any)?.category || null;

    if (propTypeId) {
      const syncTypes = getSyncRoomTypes(propTypeId);
      if (syncTypes && syncTypes.length > 0) {
        setRoomTypeOptions(syncTypes);
        setIsLoadingRoomTypes(false);
      } else {
        setIsLoadingRoomTypes(true);
        getCachedRoomTypes(propTypeId)
          .then(res => setRoomTypeOptions(res || []))
          .finally(() => setIsLoadingRoomTypes(false));
      }
    } else {
      setRoomTypeOptions([]);
      setIsLoadingRoomTypes(false);
    }
  }, [selectedProperty]);

  // Compute if parent listing is a Flat-Rate property (Apartment, Studio, Suite, etc.)
  const isFlatRateProperty = useMemo(() => {
    if (!selectedProperty) return false;
    if (roomTypeOptions && roomTypeOptions.length > 0) {
      const hasFlat = roomTypeOptions.some(rt => rt.isFlatRate === true);
      if (hasFlat) return true;
    }
    const title = (selectedProperty.title || '').toLowerCase();
    const propTypeId = String((selectedProperty as any).propertyTypeId || '').toLowerCase();
    const combined = `${title} ${propTypeId}`;
    return (
      combined.includes('apartment') ||
      combined.includes('flat') ||
      combined.includes('studio') ||
      combined.includes('transient') ||
      combined.includes('hostel') ||
      combined.includes('suite') ||
      combined.includes('unit') ||
      combined.includes('whole house')
    );
  }, [selectedProperty, roomTypeOptions]);

  // Dynamic UI labels based on property pricing structure (Apartment vs Boarding House)
  const dynamicLabels = useMemo(() => {
    if (isFlatRateProperty) {
      return {
        unitCategoryHeader: 'Unit Layout',
        priceLabel: 'Monthly Unit Price',
        sizeLabel: 'Unit Area (Sq. Meters)',
        capacityLabel: 'Total Unit Capacity',
        amenitiesHeader: 'Unit Amenities & Features',
        availableBadge: `Available for ${selectedProperty?.title || 'Building'}`
      };
    }
    return {
      unitCategoryHeader: 'Room Category',
      priceLabel: 'Monthly Rate per Head',
      sizeLabel: 'Room Size (Sq. Meters)',
      capacityLabel: 'Total Bedspace Capacity',
      amenitiesHeader: 'Room Amenities & Features',
      availableBadge: `Available for ${selectedProperty?.title || 'Building'}`
    };
  }, [isFlatRateProperty, selectedProperty]);

  // Smart auto-preselect Kitchen Setup & Bathroom Arrangement based on property & room type
  useEffect(() => {
    if (!selectedProperty) return;

    const isFlat = isFlatRateProperty;
    const selectedRoomTypeObj = roomTypeOptions.find(o => o.value === formData.roomType || o.id === formData.roomType);
    const roomTypeIsFlat = selectedRoomTypeObj?.isFlatRate === true;

    setFormData(prev => {
      let updatedKitchen = prev.kitchenSetup;
      let updatedBathroom = prev.bathroomArrangement;

      if (isFlat || roomTypeIsFlat) {
        if (!updatedKitchen || updatedKitchen === '') {
          updatedKitchen = 'IN_UNIT';
        }
        if (!updatedBathroom || updatedBathroom === '') {
          updatedBathroom = 'PRIVATE_CR';
        }
      } else {
        const propKitchen = (selectedProperty as any)?.businessInfo?.kitchenSetup || (selectedProperty as any)?.kitchenSetup || (selectedProperty as any)?.kitchenFacility || (selectedProperty as any)?.propertyConfig?.kitchenSetup;
        if (propKitchen && (!updatedKitchen || updatedKitchen === '')) {
          updatedKitchen = propKitchen;
        } else if (!updatedKitchen || updatedKitchen === '') {
          updatedKitchen = 'SHARED';
        }

        if (selectedProperty.bathroomCount === 0 && (!updatedBathroom || updatedBathroom === '')) {
          updatedBathroom = 'PRIVATE_CR';
        } else if (!updatedBathroom || updatedBathroom === '') {
          updatedBathroom = 'SHARED';
        }
      }

      if (updatedKitchen !== prev.kitchenSetup || updatedBathroom !== prev.bathroomArrangement) {
        return {
          ...prev,
          kitchenSetup: updatedKitchen,
          bathroomArrangement: updatedBathroom
        };
      }
      return prev;
    });
  }, [selectedProperty, isFlatRateProperty, formData.roomType, roomTypeOptions]);

  // Load Dynamic Attributes & Sub-Groups from Database
  const [dbSubGroups, setDbSubGroups] = useState<any[]>(() => getSyncSubGroups() || []);

  useEffect(() => {
    const syncSgs = getSyncSubGroups();
    if (syncSgs && syncSgs.length > 0) {
      setDbSubGroups(syncSgs);
    } else {
      getCachedSubGroups().then((sgs: any[]) => {
        setDbSubGroups(sgs || []);
      });
    }
  }, []);

  useEffect(() => {
    const syncAttrs = getSyncAttributes();
    if (syncAttrs && syncAttrs.length > 0) {
      setDynamicAttributes(syncAttrs.filter((a: any) => a.type === 'ROOM_AMENITY'));
    } else {
      getCachedAttributes().then((attrs: any[]) => {
        setDynamicAttributes((attrs || []).filter((a: any) => a.type === 'ROOM_AMENITY'));
      });
    }
  }, []);


  // Categorize Room Amenities into Sub-Groups from Database Records
  const amenityCategories = useMemo(() => {
    const isPrivateCR = formData.bathroomArrangement === 'PRIVATE_CR' || formData.bathroomArrangement === 'PRIVATE';
    const isInUnitKitchen = formData.kitchenSetup === 'IN_UNIT';

    const SUB_GROUP_META: Record<string, { label: string; iconName: string }> = {
      COOLING: { label: 'Cooling & AC', iconName: 'Wind' },
      FURNITURE: { label: 'Furniture', iconName: 'Sofa' },
      BATHROOM_FIX: { label: 'CR Features', iconName: 'ShowerHead' },
      KITCHEN_APP: { label: 'Kitchen & Dining', iconName: 'Utensils' },
      ROOM_ENTERTAINMENT_SMART_TV: { label: 'Entertainment & TV', iconName: 'Tv' },
    };

    const grouped: Record<string, { label: string; icon: any; items: any[] }> = {};

    // Build tabs dynamically from database AttributeSubGroup records
    dbSubGroups.forEach(sg => {
      if (sg.type !== 'ROOM_AMENITY') return;
      if (sg.key === 'BATHROOM_FIX' && !isPrivateCR) return;
      if (sg.key === 'KITCHEN_APP' && !isInUnitKitchen) return;

      const meta = SUB_GROUP_META[sg.key] || { label: sg.tabLabel || sg.title || sg.key, iconName: sg.icon || 'Sparkles' };
      const iconName = sg.icon || meta.iconName;
      const IconComp = getDynamicIcon(iconName, Sparkles);

      grouped[sg.key] = {
        label: meta.label,
        icon: IconComp,
        items: []
      };
    });

    // Default fallbacks while taxonomy cache loads
    if (!grouped['COOLING']) grouped['COOLING'] = { label: 'Cooling & AC', icon: getDynamicIcon('Wind'), items: [] };
    if (!grouped['FURNITURE']) grouped['FURNITURE'] = { label: 'Furniture', icon: getDynamicIcon('Sofa'), items: [] };
    if (isPrivateCR && !grouped['BATHROOM_FIX']) grouped['BATHROOM_FIX'] = { label: 'CR Features', icon: getDynamicIcon('ShowerHead'), items: [] };
    if (isInUnitKitchen && !grouped['KITCHEN_APP']) grouped['KITCHEN_APP'] = { label: 'Kitchen & Dining', icon: getDynamicIcon('Utensils'), items: [] };

    const selectedPropTypeId = (selectedProperty as any)?.propertyTypeId || 
                       (selectedProperty as any)?.propertyType?.id || 
                       (selectedProperty as any)?.businessInfo?.businessType || null;

    dynamicAttributes.forEach(attr => {
      const groupKey = attr.subGroupKey || attr.group || 'COMFORT';

      // 1. Strict setupContext filtering
      if (groupKey === 'KITCHEN_APP') {
        const targetContext = isInUnitKitchen ? 'IN_UNIT' : 'SHARED';
        if (attr.setupContext && attr.setupContext !== targetContext) return;
      }

      if (groupKey === 'BATHROOM_FIX') {
        const targetContext = isPrivateCR ? 'PRIVATE' : 'COMMON_CR';
        if (attr.setupContext && attr.setupContext !== targetContext) return;
      }

      // 2. Property Type filtering
      if (selectedPropTypeId && !attr.isUniversal && Array.isArray(attr.propertyTypeIds) && attr.propertyTypeIds.length > 0) {
        if (!attr.propertyTypeIds.includes(selectedPropTypeId)) return;
      }

      if (!grouped[groupKey]) {
        const meta = SUB_GROUP_META[groupKey] || { label: groupKey, iconName: 'Sparkles' };
        grouped[groupKey] = {
          label: meta.label,
          icon: getDynamicIcon(meta.iconName),
          items: []
        };
      }

      grouped[groupKey].items.push(attr);
    });

    // Filter out empty sub-groups that have no matching attributes for this property type
    const filtered: Record<string, { label: string; icon: any; items: any[] }> = {};
    Object.entries(grouped).forEach(([key, val]) => {
      if (val.items.length > 0) {
        filtered[key] = val;
      }
    });

    return filtered;
  }, [dynamicAttributes, dbSubGroups, formData.bathroomArrangement, formData.kitchenSetup, selectedProperty]);

  // Track setup context to auto-switch tab to 1st visible tab when setup choices change
  const setupKey = `${formData.bathroomArrangement}_${formData.kitchenSetup}`;
  const prevSetupKeyRef = React.useRef(setupKey);

  // Keep activeAmenityCategory in sync with available tabs (always default to 1st visible tab if unset, invalid, or when setup changes)
  useEffect(() => {
    const validKeys = Object.keys(amenityCategories);
    if (validKeys.length > 0) {
      const setupChanged = prevSetupKeyRef.current !== setupKey;
      prevSetupKeyRef.current = setupKey;

      if (setupChanged || !activeAmenityCategory || !amenityCategories[activeAmenityCategory]) {
        setActiveAmenityCategory(validKeys[0]);
      }
    }
  }, [amenityCategories, activeAmenityCategory, setupKey]);

  const allImages = useMemo(() => {
    const existing = formData.images || [];
    const newOnes = files.map(f => URL.createObjectURL(f));
    return [...existing, ...newOnes];
  }, [formData.images, files]);

  // Motion Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {isCheckingDraft ? (
        <div key="checking-draft" className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 dark:bg-gray-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10 p-6 bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 flex items-center gap-3 text-primary"
          >
            <Loader2 size={20} className="animate-spin text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Checking Saved Draft...</span>
          </motion.div>
        </div>
      ) : showDraftModal && !initialData ? (
        <div key="draft-prompt" className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/60 dark:bg-gray-950/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-[2.5rem] p-8 shadow-2xl z-10 border border-gray-100 dark:border-white/10 space-y-6"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/20">
                  <DoorOpen size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight">
                    Continue Where You Left Off?
                  </h3>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">
                    Unsaved Room Draft Detected
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all border border-gray-100 dark:border-white/5 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/80 space-y-1">
              <h4 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-wider truncate">
                {savedDraftData?.formData?.name || 'Untitled Unit / Room'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold flex items-center gap-2">
                <span>Saved Draft</span>
                <span>•</span>
                <span className="text-primary font-black uppercase tracking-wider">
                  Step {savedDraftData?.currentStep || 1} of 3: {STEPS[(savedDraftData?.currentStep || 1) - 1]?.title}
                </span>
              </p>
            </div>

            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
              We saved your unsaved room progress so you won't lose anything! Would you like to resume this room draft or start fresh with a blank unit?
            </p>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
              <Button
                outline
                type="button"
                onClick={() => discardDraft()}
                className="w-full sm:w-auto h-11 px-6 text-xs font-bold hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all cursor-pointer"
              >
                Start Fresh Unit
              </Button>
              <Button
                type="button"
                onClick={() => applyDraft()}
                className="w-full sm:w-auto h-11 px-6 text-xs font-bold shadow-md shadow-primary/20 cursor-pointer"
              >
                Resume Saved Draft
              </Button>
            </div>
          </motion.div>
        </div>
      ) : (
        <div key="main-modal" className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 bg-gray-900/40 dark:bg-gray-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="relative w-full max-w-5xl h-[88vh] min-h-[620px] max-h-[820px] bg-white dark:bg-[#111827] rounded-[2.5rem] shadow-2xl flex flex-col border border-gray-100 dark:border-white/5 overflow-hidden my-auto"
          >
            {/* Sticky Header — Compact Geometry */}
            <div className="absolute top-0 left-0 right-0 h-[80px] bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 z-50 flex items-center justify-between px-6 sm:px-8 rounded-t-[2.5rem]">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner border border-primary/20">
                     <DoorOpen size={22} />
                  </div>
                  <div>
                     <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-tight uppercase">
                        {initialData ? 'Sync Unit Details' : 'Add New Unit'}
                     </h2>
                      <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.25em] mt-0.5">STEP {currentStep || 1} OF 3: {(STEPS[(currentStep || 1) - 1] || STEPS[0])?.title}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  {!initialData && (
                    <AutoSaveBadge 
                      saveStatus={saveStatus} 
                      lastSavedTimestamp={lastSavedTimestamp} 
                      lastSavedTime={lastSavedTime} 
                    />
                  )}

                  {(restoredDraft || saveStatus === 'saved' || lastSavedTimestamp) && !initialData && (
                    <button
                      type="button"
                      onClick={discardDraft}
                      className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-rose-200 dark:border-rose-800/60 cursor-pointer flex items-center gap-1.5 shadow-sm"
                      title="Discard Draft"
                    >
                      <Trash2 size={13} />
                      <span className="hidden sm:inline">Discard Draft</span>
                    </button>
                  )}

                  <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all border border-gray-100 dark:border-white/5">
                     <X size={18} />
                  </button>
               </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 pt-[95px] pb-5 space-y-6 relative [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-2 h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-6">
                 {STEPS.map((step) => (
                   <div 
                    key={step.id} 
                    className={cn(
                      "flex-1 transition-all duration-700",
                      currentStep >= step.id ? "bg-primary" : "bg-transparent"
                    )}
                   />
                 ))}
              </div>

              {/* Draft Restored Banner */}
              {restoredDraft && (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3.5 sm:p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 rounded-2xl flex items-center justify-between gap-3 text-teal-700 dark:text-teal-300 shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Sparkles size={16} className="text-teal-500 animate-pulse shrink-0" />
                    <p className="text-xs font-bold truncate">
                      <span className="font-black uppercase tracking-wider">Draft Restored:</span> Unsaved room progress loaded from browser storage.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={discardDraft}
                    className="px-3 py-1 bg-teal-100 hover:bg-rose-500 hover:text-white dark:bg-teal-900/80 dark:hover:bg-rose-600 text-teal-800 dark:text-teal-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0"
                  >
                    Discard Draft
                  </button>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="space-y-6"
                  >
                    <motion.div 
                      variants={itemVariants} 
                      className="p-5 sm:p-7 bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-6 sm:space-y-8"
                    >
                      {/* Select Property / Building */}
                      <div 
                        id="field-listingId"
                        className="space-y-2"
                      >
                        <label className={cn(
                          "text-[10px] sm:text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2",
                          errors.listingId ? "text-rose-500" : "text-gray-800 dark:text-gray-200"
                        )}>
                          Select Property / Building <span className="text-rose-500">*</span>
                          {errors.listingId && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                        </label>
                        <RoomAddModernSelect
                          options={uniqueProperties.map(p => ({
                            value: p.id,
                            label: p.title,
                            icon: <Building2 size={16} />
                          }))}
                          value={formData.listingId}
                          onChange={(val) => setFormData(prev => ({ ...prev, listingId: val, roomType: '' }))}
                          placeholder="SEARCH OR SELECT A BUILDING..."
                          className="w-full"
                          instanceId="property-selector"
                          hasError={!!errors.listingId}
                        />
                        {errors.listingId && (
                          <p className="text-[10px] sm:text-[11px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 ml-1 mt-1">
                            <AlertCircle size={12} strokeWidth={2.5} /> {errors.listingId}
                          </p>
                        )}
                      </div>

                      {/* ROW 1: Unit Name & Room Category (Side by Side) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
                        {/* Unit Name or Number */}
                        <div 
                          id="field-name"
                          className="space-y-2"
                        >
                          <label className={cn(
                            "text-[10px] sm:text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2",
                            errors.name ? "text-rose-500" : "text-gray-800 dark:text-gray-200"
                          )}>
                            Unit Name or Number <span className="text-rose-500">*</span>
                            {errors.name && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                          </label>
                          <div className="relative group">
                            <input
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="e.g. Unit 101"
                              className={cn(
                                "w-full bg-white dark:bg-gray-900 border-2 rounded-2xl p-4 text-sm font-bold outline-none transition-all",
                                errors.name 
                                  ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5 text-rose-900 dark:text-rose-200 placeholder-rose-400" 
                                  : "border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-primary/10"
                              )}
                            />
                          </div>
                          {errors.name && (
                            <p className="text-[10px] sm:text-[11px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 ml-1 mt-1">
                              <AlertCircle size={12} strokeWidth={2.5} /> {errors.name}
                            </p>
                          )}
                        </div>

                        {/* Unit Layout / Category Grid */}
                        <div 
                          id="field-roomType"
                          className="space-y-2"
                        >
                          <label className={cn(
                            "text-[10px] sm:text-[11px] font-black uppercase tracking-widest ml-1 flex items-center justify-between",
                            errors.roomType ? "text-rose-500" : "text-gray-800 dark:text-gray-200"
                          )}>
                            <span className="flex items-center gap-2">
                              {dynamicLabels.unitCategoryHeader} <span className="text-rose-500">*</span>
                              {errors.roomType && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                            </span>
                            {selectedProperty && <span className="text-[9px] text-primary font-black uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">{dynamicLabels.availableBadge}</span>}
                          </label>
                          <div className={cn(
                            "grid grid-cols-2 gap-3 transition-all duration-300",
                            errors.roomType ? "p-2 rounded-3xl border-2 border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5" : ""
                          )}>
                             {isLoadingRoomTypes ? (
                               <div className="col-span-2 py-4 flex flex-col items-center justify-center gap-2 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-primary/20 text-primary animate-pulse">
                                 <Loader2 size={18} className="animate-spin text-primary" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-primary">Fetching Categories...</span>
                               </div>
                             ) : roomTypeOptions.length > 0 ? (
                               roomTypeOptions.map(t => {
                                 const Icon = getDynamicIcon(t.icon);
                                 const isSelected = formData.roomType === t.value || formData.roomType === t.id || formData.roomType === t.code;
                                 return (
                                   <button
                                    key={t.value || t.id}
                                    type="button"
                                    onClick={() => handleCategoryToggle(t.value || t.id)}
                                    className={cn(
                                      "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left group relative overflow-hidden cursor-pointer",
                                      isSelected 
                                        ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" 
                                        : errors.roomType 
                                          ? "border-rose-500/60 bg-rose-500/5 hover:border-rose-400"
                                          : "border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-900 hover:border-primary/30"
                                    )}
                                   >
                                      <div className={cn(
                                        "p-2.5 rounded-xl transition-all shrink-0",
                                        isSelected ? "bg-primary text-white scale-105" : "bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:scale-105"
                                      )}>
                                         <Icon size={18} />
                                      </div>
                                      <div className="flex-1 min-w-0 pr-4">
                                        <span className={cn("text-xs font-black uppercase tracking-wider block line-clamp-1 leading-tight", isSelected ? "text-primary" : "text-gray-900 dark:text-white")}>
                                          {t.label || t.name}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block truncate mt-0.5">
                                          {t.description || (t.isFlatRate ? 'Flat-rate unit' : 'Per head room')}
                                        </span>
                                      </div>
                                      
                                      {isSelected && (
                                         <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary">
                                            <CheckCircle2 size={16} />
                                         </div>
                                      )}
                                   </button>
                                 );
                               })
                             ) : (
                               <div className="col-span-2 p-4 text-center text-xs text-gray-400 font-bold border border-dashed rounded-2xl">
                                  Please select a property building first
                               </div>
                             )}
                          </div>
                          {errors.roomType && (
                            <p className="text-[10px] sm:text-[11px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 ml-1 mt-1">
                              <AlertCircle size={12} strokeWidth={2.5} /> {errors.roomType}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ROW 2: Bathroom Setup & Kitchen Setup (Perfectly Aligned Baseline) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start pt-2 border-t border-gray-100 dark:border-gray-800/60">
                        {/* Bathroom Setup Section */}
                        <div 
                          id="field-bathroomArrangement"
                          className="space-y-2.5"
                        >
                          <label className={cn(
                            "text-[10px] sm:text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2",
                            errors.bathroomArrangement ? "text-rose-500" : "text-gray-800 dark:text-gray-200"
                          )}>
                            Bathroom Setup <span className="text-rose-500">*</span>
                            {errors.bathroomArrangement && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                          </label>
                          <div className={cn(
                            "grid grid-cols-1 gap-3 transition-all duration-300",
                            errors.bathroomArrangement ? "p-2 rounded-3xl border-2 border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5" : ""
                          )}>
                            {[
                              { id: 'PRIVATE_CR', label: 'Private Bathroom', desc: 'Dedicated CR inside this unit', iconName: 'ShowerHead' },
                              { id: 'COMMON_CR', label: 'Shared Common CR', desc: "Uses building's main shared CR", iconName: 'Bath' },
                            ].map(opt => {
                              const isSelected = formData.bathroomArrangement === opt.id;
                              const isPropertySelected = !!formData.listingId;
                              const commonBathroomCount = selectedProperty?.bathroomCount || 0;
                              const OptIcon = getDynamicIcon(opt.iconName);
                              
                              let isDisabled = !isPropertySelected;
                              let disabledMessage = "Select a building first";

                              if (isPropertySelected && opt.id === 'COMMON_CR' && commonBathroomCount === 0) {
                                isDisabled = true;
                                disabledMessage = "Building has no common CR";
                              }

                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => setFormData(prev => ({ 
                                    ...prev, 
                                    bathroomArrangement: prev.bathroomArrangement === opt.id ? '' : opt.id 
                                  }))}
                                  className={cn(
                                    "flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border-2 transition-all text-left group relative overflow-hidden cursor-pointer",
                                    isSelected 
                                      ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" 
                                      : errors.bathroomArrangement 
                                        ? "border-rose-500/60 bg-rose-500/5 hover:border-rose-400"
                                        : "border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-900 hover:border-primary/30",
                                    isDisabled && "opacity-40 cursor-not-allowed border-dashed grayscale"
                                  )}
                                >
                                   <div className={cn(
                                     "p-2.5 rounded-xl transition-all shrink-0",
                                     isSelected ? "bg-primary text-white scale-105" : "bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:scale-105"
                                   )}>
                                      <OptIcon size={18} />
                                   </div>
                                   <div className="flex-1 min-w-0 pr-6">
                                     <span className={cn("text-xs font-black uppercase tracking-wider block truncate", isSelected ? "text-primary" : "text-gray-900 dark:text-white")}>{opt.label}</span>
                                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block truncate mt-0.5">
                                       {isDisabled ? <span className="text-amber-600 font-extrabold">{disabledMessage}</span> : opt.desc}
                                     </span>
                                   </div>
                                   
                                   {isSelected && (
                                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary">
                                         <CheckCircle2 size={16} />
                                      </div>
                                   )}
                                </button>
                              );
                            })}
                          </div>
                          {errors.bathroomArrangement && (
                            <p className="text-[10px] sm:text-[11px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 ml-1 mt-1">
                              <AlertCircle size={12} strokeWidth={2.5} /> {errors.bathroomArrangement}
                            </p>
                          )}
                        </div>

                        {/* Kitchen Setup Section */}
                        <div 
                          id="field-kitchenSetup"
                          className="space-y-2.5"
                        >
                          <label className={cn(
                            "text-[10px] sm:text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2",
                            errors.kitchenSetup ? "text-rose-500" : "text-gray-800 dark:text-gray-200"
                          )}>
                            Kitchen Setup <span className="text-rose-500">*</span>
                            {errors.kitchenSetup && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                          </label>
                          <div className={cn(
                            "grid grid-cols-1 gap-3 transition-all duration-300",
                            errors.kitchenSetup ? "p-2 rounded-3xl border-2 border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5" : ""
                          )}>
                            {[
                              { id: 'IN_UNIT', label: 'Private In-Unit Kitchen', desc: 'Dedicated kitchenette inside unit', iconName: 'Utensils' },
                              { id: 'SHARED', label: 'Shared Compound Kitchen', desc: "Uses main ground floor kitchen", iconName: 'UtensilsCrossed' },
                            ].map(opt => {
                              const isSelected = formData.kitchenSetup === opt.id;
                              const isPropertySelected = !!formData.listingId;
                              const parentKitchenSetup = (selectedProperty as any)?.businessInfo?.kitchenSetup || (selectedProperty as any)?.kitchenSetup || (selectedProperty as any)?.kitchenFacility || (selectedProperty as any)?.propertyConfig?.kitchenSetup;
                              
                              let isDisabled = !isPropertySelected;
                              let disabledMessage = "Select a building first";

                              if (isPropertySelected && opt.id === 'SHARED' && (isFlatRateProperty || parentKitchenSetup === 'IN_UNIT')) {
                                isDisabled = true;
                                disabledMessage = "Building has no shared kitchen";
                              }

                              const OptIcon = getDynamicIcon(opt.iconName);

                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => setFormData(prev => ({ 
                                    ...prev, 
                                    kitchenSetup: prev.kitchenSetup === opt.id ? '' : opt.id 
                                  }))}
                                  className={cn(
                                    "flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border-2 transition-all text-left group relative overflow-hidden cursor-pointer",
                                    isSelected 
                                      ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" 
                                      : errors.kitchenSetup 
                                        ? "border-rose-500/60 bg-rose-500/5 hover:border-rose-400"
                                        : "border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-900 hover:border-primary/30",
                                    isDisabled && "opacity-40 cursor-not-allowed border-dashed grayscale"
                                  )}
                                >
                                   <div className={cn(
                                     "p-2.5 rounded-xl transition-all shrink-0",
                                     isSelected ? "bg-primary text-white scale-105" : "bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:scale-105"
                                   )}>
                                      <OptIcon size={18} />
                                   </div>
                                   <div className="flex-1 min-w-0 pr-6">
                                     <span className={cn("text-xs font-black uppercase tracking-wider block truncate", isSelected ? "text-primary" : "text-gray-900 dark:text-white")}>{opt.label}</span>
                                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block truncate mt-0.5">
                                       {isDisabled ? <span className="text-amber-600 font-extrabold">{disabledMessage}</span> : opt.desc}
                                     </span>
                                   </div>
                                   
                                   {isSelected && (
                                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary">
                                         <CheckCircle2 size={16} />
                                      </div>
                                   )}
                                </button>
                              );
                            })}
                          </div>
                          {errors.kitchenSetup && (
                            <p className="text-[10px] sm:text-[11px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 ml-1 mt-1">
                              <AlertCircle size={12} strokeWidth={2.5} /> {errors.kitchenSetup}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="space-y-10"
                  >
                    <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 p-5 sm:p-7 bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800">
                       <motion.div 
                         id="field-price"
                         variants={itemVariants} 
                         className="space-y-2"
                         animate={errors.price ? { x: [-4, 4, -4, 4, shakeKey * 0.0001] } : {}}
                         transition={{ duration: 0.4, delay: 0.2 }}
                       >
                          <label className={cn(
                            "text-[10px] sm:text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2",
                            errors.price ? "text-rose-500" : "text-gray-800 dark:text-gray-200"
                          )}>
                            {dynamicLabels.priceLabel} <span className="text-rose-500">*</span>
                            {errors.price && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                          </label>
                          <div className="relative group">
                             <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 font-bold", errors.price ? "text-rose-500" : "text-gray-400")}>₱</div>
                             <input 
                               type="number" 
                               name="price" 
                               value={formData.price} 
                               onChange={handleChange} 
                               placeholder="0.00"
                               className={cn(
                                 "w-full bg-white dark:bg-gray-900 border-2 rounded-2xl p-4 pl-8 text-sm font-black outline-none transition-all",
                                 errors.price 
                                   ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5 text-rose-900 dark:text-rose-200 placeholder-rose-400" 
                                   : "border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-primary/10"
                               )} 
                             />
                          </div>
                          {errors.price && (
                            <p className="text-[10px] sm:text-[11px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 ml-1 mt-1">
                              <AlertCircle size={12} strokeWidth={2.5} /> {errors.price}
                            </p>
                          )}
                       </motion.div>

                       <motion.div 
                         id="field-bedType"
                         variants={itemVariants} 
                         className="space-y-2"
                         animate={errors.bedType ? { x: [-4, 4, -4, 4, shakeKey * 0.0001] } : {}}
                         transition={{ duration: 0.4, delay: 0.2 }}
                       >
                          <label className={cn(
                            "text-[10px] sm:text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2",
                            errors.bedType ? "text-rose-500" : "text-gray-800 dark:text-gray-200"
                          )}>
                            Bed Type <span className="text-rose-500">*</span>
                            {errors.bedType && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                          </label>
                          <RoomAddModernSelect
                            options={(() => {
                              const selType = roomTypeOptions.find(o => o.value === formData.roomType || o.id === formData.roomType);
                              if (selType && Array.isArray(selType.bedSetups) && selType.bedSetups.length > 0) {
                                return selType.bedSetups.map((bs: any) => ({ 
                                  value: bs.code, 
                                  label: bs.name,
                                  icon: <Bed size={16} />
                                }));
                              }
                              return CENTRAL_BED_TYPES.map((bt: any) => ({
                                ...bt,
                                icon: <Bed size={16} />
                              }));
                            })()}
                            value={formData.bedType}
                            onChange={(val) => {
                              const e = { target: { name: 'bedType', value: val } } as any;
                              handleChange(e);
                            }}
                            placeholder="SELECT BED TYPE..."
                            icon={<Bed size={18} />}
                            className="w-full"
                            instanceId="bed-type-select"
                            hasError={!!errors.bedType}
                          />
                          {errors.bedType && (
                            <p className="text-[10px] sm:text-[11px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 ml-1 mt-1">
                              <AlertCircle size={12} strokeWidth={2.5} /> {errors.bedType}
                            </p>
                          )}
                       </motion.div>

                       <motion.div 
                         id="field-bedCount"
                         variants={itemVariants} 
                         className="space-y-2"
                         animate={errors.bedCount ? { x: [-4, 4, -4, 4, shakeKey * 0.0001] } : {}}
                         transition={{ duration: 0.4, delay: 0.2 }}
                       >
                          <label className={cn(
                            "text-[10px] sm:text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2",
                            errors.bedCount ? "text-rose-500" : "text-gray-800 dark:text-gray-200"
                          )}>
                            Bed Count <span className="text-rose-500">*</span>
                            {errors.bedCount && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                          </label>
                          <div className="relative group">
                            <input 
                              type="number" 
                              name="bedCount" 
                              value={formData.bedCount} 
                              onChange={handleChange} 
                              placeholder="e.g. 1"
                              className={cn(
                                "w-full bg-white dark:bg-gray-900 border-2 rounded-2xl p-4 text-sm font-black outline-none transition-all focus:ring-4 focus:ring-primary/10",
                                errors.bedCount 
                                  ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5 text-rose-900 dark:text-rose-200 placeholder-rose-400" 
                                  : "border-gray-200 dark:border-gray-700"
                              )} 
                            />
                          </div>
                          {errors.bedCount && (
                            <p className="text-[10px] sm:text-[11px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 ml-1 mt-1">
                              <AlertCircle size={12} strokeWidth={2.5} /> {errors.bedCount}
                            </p>
                          )}
                       </motion.div>

                        <div className="space-y-2">
                           <label className={cn(
                             "text-[10px] sm:text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2",
                             errors.capacity ? "text-rose-500" : "text-gray-800 dark:text-gray-200"
                           )}>
                             {dynamicLabels.capacityLabel}
                             {errors.capacity && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                           </label>
                           <div className="relative group">
                             <div className={cn(
                               "w-full rounded-2xl p-4 text-sm font-black transition-all border-2",
                               errors.capacity || errors.bedCount
                                 ? "bg-rose-500/5 border-rose-500 ring-4 ring-rose-500/10 text-rose-500 shadow-sm shadow-rose-500/5"
                                 : formData.capacity
                                   ? "bg-primary/5 border-primary/20 text-primary shadow-sm shadow-primary/5" 
                                   : "bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-gray-400"
                             )}>
                               {errors.capacity || errors.bedCount || !formData.capacity || Number(formData.capacity) <= 0
                                 ? '-- Guests'
                                 : `${formData.capacity} Guests`}
                             </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <Users size={16} className={cn("transition-colors", errors.capacity ? "text-rose-500" : Number(formData.capacity) > 0 ? "text-primary" : "text-gray-300")} />
                            </div>
                          </div>
                          {errors.capacity ? (
                             <p className="text-[10px] sm:text-[11px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 ml-1 mt-1">
                               <AlertCircle size={12} strokeWidth={2.5} /> {errors.capacity}
                             </p>
                          ) : (
                             <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest ml-1 mt-1">Auto-calculated based on beds</p>
                          )}
                       </div>

                       <motion.div 
                         id="field-size"
                         variants={itemVariants} 
                         className="space-y-2"
                         animate={errors.size ? { x: [-4, 4, -4, 4, shakeKey * 0.0001] } : {}}
                         transition={{ duration: 0.4, delay: 0.2 }}
                       >
                          <label className={cn(
                            "text-[10px] sm:text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2",
                            errors.size ? "text-rose-500" : "text-gray-800 dark:text-gray-200"
                          )}>
                            {dynamicLabels.sizeLabel} <span className="text-rose-500">*</span>
                            {errors.size && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                          </label>
                          <div className="relative group">
                            <input 
                              type="number" 
                              name="size" 
                              value={formData.size} 
                              onChange={handleChange} 
                              placeholder="e.g. 12"
                              className={cn(
                                "w-full bg-white dark:bg-gray-900 border-2 rounded-2xl p-4 text-sm font-black outline-none transition-all focus:ring-4 focus:ring-primary/10",
                                errors.size 
                                  ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5 text-rose-900 dark:text-rose-200 placeholder-rose-400" 
                                  : "border-gray-200 dark:border-gray-700"
                              )} 
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">SQM</div>
                          </div>
                          {errors.size && (
                            <p className="text-[10px] sm:text-[11px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 ml-1 mt-1">
                              <AlertCircle size={12} strokeWidth={2.5} /> {errors.size}
                            </p>
                          )}
                       </motion.div>

                       <motion.div 
                         id="field-reservationFee"
                         variants={itemVariants} 
                         className="space-y-2"
                         animate={errors.reservationFee ? { x: [-4, 4, -4, 4, shakeKey * 0.0001] } : {}}
                         transition={{ duration: 0.4, delay: 0.2 }}
                       >
                          <label className={cn(
                            "text-[10px] sm:text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2",
                            errors.reservationFee ? "text-rose-500" : "text-gray-800 dark:text-gray-200"
                          )}>
                            Reservation Fee <span className="text-rose-500">*</span>
                            {errors.reservationFee && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                          </label>
                          <div className="relative group">
                             <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 font-bold", errors.reservationFee ? "text-rose-500" : "text-gray-400")}>₱</div>
                             <input 
                               type="number" 
                               name="reservationFee" 
                               value={formData.reservationFee} 
                               onChange={handleChange}
                               placeholder="0.00"
                               className={cn(
                                 "w-full bg-white dark:bg-gray-900 border-2 rounded-2xl p-4 pl-8 text-sm font-black outline-none transition-all focus:ring-4 focus:ring-primary/10",
                                 errors.reservationFee 
                                   ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5 text-rose-900 dark:text-rose-200 placeholder-rose-400" 
                                   : "border-gray-200 dark:border-gray-700"
                               )} 
                             />
                          </div>
                          {errors.reservationFee && (
                            <p className="text-[10px] sm:text-[11px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 ml-1 mt-1">
                              <AlertCircle size={12} strokeWidth={2.5} /> {errors.reservationFee}
                            </p>
                          )}
                       </motion.div>
                    </motion.div>

                    {/* Categorized Sub-group Amenity Tabs Section */}
                    <motion.div variants={itemVariants} className="space-y-6">
                       <div className="flex items-center justify-between">
                         <label className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-gray-300 ml-1 flex items-center gap-2">
                            <Sparkles size={14} className="text-primary" /> {dynamicLabels.amenitiesHeader}
                         </label>
                       </div>

                       {/* Amenity Category Tabs */}
                       <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                         {Object.entries(amenityCategories).map(([key, cat]) => {
                           const CatIcon = cat.icon;
                           const isActive = activeAmenityCategory === key;
                           const selectedCount = cat.items.filter(a => formData.amenities.includes(a.id) || formData.amenities.includes(a.name)).length;
                           
                           return (
                             <button
                               key={key}
                               type="button"
                               onClick={() => setActiveAmenityCategory(key)}
                               className={cn(
                                 "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border shrink-0",
                                 isActive 
                                   ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]" 
                                   : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:border-primary/40"
                               )}
                             >
                                <CatIcon size={14} />
                                <span>{cat.label}</span>
                                {selectedCount > 0 && (
                                  <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-black ml-1 transition-all",
                                    isActive 
                                      ? "bg-white dark:bg-gray-900 text-primary dark:text-emerald-400 border border-transparent dark:border-primary/30 shadow-sm" 
                                      : "bg-primary/10 dark:bg-primary/20 text-primary dark:text-emerald-400 border border-primary/20 dark:border-primary/30"
                                  )}>
                                    {selectedCount}
                                  </span>
                                )}
                             </button>
                           );
                         })}
                       </div>

                       {/* Active Category Items Grid - Compact Horizontal Chips */}
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800">
                          {(amenityCategories[activeAmenityCategory]?.items || []).map(amenity => {
                              const Icon = getDynamicIcon(amenity.icon);
                              const targetKey = amenity.id || amenity.name;
                              const isSelected = formData.amenities.includes(targetKey);
                              
                              return (
                                <button
                                  key={targetKey}
                                  type="button"
                                  onClick={() => setFormData(prev => {
                                    const exists = prev.amenities.includes(targetKey);
                                    return {
                                      ...prev,
                                      amenities: exists ? prev.amenities.filter(a => a !== targetKey) : [...prev.amenities, targetKey]
                                    };
                                  })}
                                  className={cn(
                                    "flex items-center gap-2.5 p-3 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer select-none text-left min-h-[52px] group",
                                    isSelected 
                                      ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" 
                                      : "border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-primary/30"
                                  )}
                                >
                                   <div className={cn(
                                     "w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-md border-2 transition-all flex items-center justify-center shrink-0",
                                     isSelected ? "bg-primary border-primary text-white shadow-sm" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                                   )}>
                                     {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" />}
                                   </div>
                                   <Icon size={16} className={cn("shrink-0 transition-colors", isSelected ? "text-primary" : "text-gray-400 group-hover:text-primary")} />
                                   <span className={cn("text-xs font-bold flex-1 transition-colors leading-snug line-clamp-2 uppercase tracking-wide", isSelected ? "text-primary dark:text-white font-extrabold" : "text-gray-700 dark:text-gray-300")}>
                                     {amenity.name}
                                   </span>
                                </button>
                              );
                          })}
                       </div>
                    </motion.div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="space-y-8"
                  >
                    <motion.div 
                      id="field-description"
                      variants={itemVariants} 
                      className="space-y-3"
                      animate={errors.description ? { x: [-4, 4, -4, 4, shakeKey * 0.0001] } : {}}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <div className="flex items-center justify-between ml-1">
                        <label className={cn(
                          "text-[10px] sm:text-[11px] font-black uppercase tracking-widest flex items-center gap-2",
                          errors.description ? "text-rose-500" : "text-gray-400"
                        )}>
                          <Sparkles size={14} className="text-amber-500" /> Room Description <span className="text-rose-500">*</span>
                          {errors.description && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                        </label>
                        <span className={cn(
                          "text-[10px] font-extrabold uppercase tracking-widest",
                          formData.description.length > 450 ? "text-amber-500" : "text-gray-400"
                        )}>
                          {formData.description.length} / 500
                        </span>
                      </div>

                      {/* Preset Tags Bar */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 shrink-0 flex items-center gap-1">
                          <Zap size={11} className="text-primary" /> Suggestions:
                        </span>
                        {[
                          { label: '✨ Spacious & Bright', text: 'Spacious and well-ventilated unit with ample natural lighting.' },
                          { label: '📚 Quiet Study Vibe', text: 'Quiet environment optimized for studying and focus.' },
                          { label: '❄️ Air-Conditioned', text: 'Equipped with efficient cooling for year-round comfort.' },
                          { label: '🪑 Fully Furnished', text: 'Fully furnished with comfortable bed and dedicated study desk.' },
                          { label: '🌟 Newly Renovated', text: 'Newly renovated room with modern fixtures and clean finish.' }
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const existing = formData.description.trim();
                              const addition = preset.text;
                              const nextText = existing ? `${existing} ${addition}` : addition;
                              if (nextText.length <= 500) {
                                handleChange({ target: { name: 'description', value: nextText } });
                              }
                            }}
                            className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border transition-all whitespace-nowrap shrink-0 bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/80 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary hover:scale-[1.02] cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      <div className="relative group">
                        <textarea 
                          name="description" 
                          value={formData.description} 
                          onChange={handleChange} 
                          maxLength={500}
                          rows={3} 
                          placeholder="Describe the vibe of this specific unit (e.g. quiet study environment, newly painted, includes study desk)..." 
                          className={cn(
                            "w-full bg-gray-50/70 dark:bg-gray-800/60 border-2 rounded-3xl p-5 text-sm font-medium outline-none transition-all resize-none",
                            errors.description 
                              ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5 text-rose-900 dark:text-rose-200 placeholder-rose-400" 
                              : "border-gray-200 dark:border-gray-700/80 focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 focus:border-primary focus:bg-white dark:focus:bg-gray-900"
                          )}
                        />
                      </div>
                      {errors.description && (
                        <p className="text-[10px] sm:text-[11px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 ml-1 mt-1">
                          <AlertCircle size={12} strokeWidth={2.5} /> {errors.description}
                        </p>
                      )}
                    </motion.div>

                    {/* --- COMPACT INTEGRATED PHOTO UPLOAD GRID --- */}
                    <motion.div variants={itemVariants} className="space-y-3">
                      <div className="flex items-center justify-between ml-1">
                        <label className={cn(
                          "text-[10px] sm:text-[11px] font-black uppercase tracking-widest flex items-center gap-2",
                          errors.images ? "text-rose-500" : "text-gray-400"
                        )}>
                          Room Photos <span className="text-rose-500">*</span>
                          {errors.images && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                        </label>
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                          {allImages.length} / 5 Uploaded
                        </span>
                      </div>

                      <div className={cn(
                        "p-4 sm:p-5 bg-gray-50/50 dark:bg-gray-800/40 border-2 rounded-3xl transition-all space-y-4",
                        errors.images 
                          ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5" 
                          : "border-gray-200 dark:border-gray-700/80"
                      )}>
                        {errors.images && (
                          <p className="text-[10px] sm:text-[11px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertCircle size={14} strokeWidth={2.5} /> {errors.images}
                          </p>
                        )}

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
                          {/* Dropzone Add Button */}
                          {allImages.length < 5 && (
                            <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary bg-white dark:bg-gray-800 flex flex-col items-center justify-center p-3 text-center cursor-pointer group transition-all hover:bg-primary/5 hover:scale-[1.02]">
                              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus size={22} strokeWidth={3} />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-tight text-gray-700 dark:text-gray-300 mt-2 group-hover:text-primary transition-colors">
                                Add Photo
                              </span>
                            </label>
                          )}

                          {/* Uploaded Image Cards */}
                          {allImages.map((src: string, i: number) => (
                            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700/80 bg-gray-100 dark:bg-gray-800 group shadow-sm">
                              <SafeImage src={src} alt={`Room photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 backdrop-blur-[1px]">
                                <button 
                                  type="button"
                                  onClick={() => setPreviewIndex(i)}
                                  className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-xl transition-all hover:scale-110 cursor-pointer"
                                  title="Preview photo"
                                >
                                  <Eye size={16} />
                                </button>
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (i < (formData.images?.length || 0)) {
                                      setFormData(prev => ({
                                        ...prev,
                                        images: prev.images.filter((_, idx) => idx !== i)
                                      }));
                                    } else {
                                      removeFile(i - (formData.images?.length || 0));
                                    }
                                  }} 
                                  className="p-2 bg-rose-500/80 hover:bg-rose-600 backdrop-blur-md text-white rounded-xl transition-all hover:scale-110 cursor-pointer"
                                  title="Delete photo"
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              {i < (formData.images?.length || 0) && (
                                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider rounded-md shadow-sm">
                                  Saved
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center pt-1">
                          JPG, PNG, WEBP • Max 5 images • Under 5MB each
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- MEDIA PREVIEW OVERLAY --- */}
            <MediaPreviewOverlay
              isOpen={previewIndex !== null}
              onClose={() => setPreviewIndex(null)}
              images={allImages}
              currentIndex={previewIndex ?? 0}
              onNavigate={(newIdx) => setPreviewIndex(newIdx)}
              title="Room Photo Preview"
            />

            <div className="px-6 sm:px-8 py-4 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
               <button 
                onClick={currentStep === 1 ? onClose : handleBack}
                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
               >
                  <ChevronLeft size={16} /> {currentStep === 1 ? 'Cancel' : 'Go Back'}
               </button>

               <div className="flex gap-4">
                  {currentStep < 3 ? (
                    <Button onClick={handleNext} className="px-8 py-3.5 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center gap-2">
                      Next Step <ChevronRight size={16} />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit} 
                      disabled={loading || uploadingImages}
                      className="px-10 py-3.5 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      {(loading || uploadingImages) ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      {initialData ? 'Sync Unit' : 'Publish Unit'}
                    </Button>
                  )}
               </div>
            </div>
            {/* --- KERBY ANIMATED SUBMISSION & PUBLISHING LOADER MODAL --- */}
            <RoomSubmissionLoaderModal
              isOpen={submitted || loading || uploadingImages}
              actionType={initialData ? 'edit' : 'create'}
              unitName={formData.name}
              stage={submitted ? 4 : uploadingImages ? 3 : loading ? 2 : 1}
              progress={submitted ? 100 : uploadingImages ? 70 : loading ? 35 : 15}
            />

          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
