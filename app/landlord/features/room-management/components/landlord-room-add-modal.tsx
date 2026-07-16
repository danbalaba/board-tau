import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as LucideIcons from 'lucide-react';
import Modal from '@/components/modals/Modal';
import CustomRoomAmenityModal from './CustomRoomAmenityModal';
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
  ArrowLeft,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/utils/helper';
import SafeImage from '@/components/common/SafeImage';
import Button from '@/components/common/Button';
import ModernSelect from '@/components/common/ModernSelect';
import RoomAddModernSelect from './RoomAddModernSelect';
import { 
  BATHROOM_ARRANGEMENTS, 
  roomAmenities, 
  bedTypeOptions as CENTRAL_BED_TYPES 
} from '@/data/roomAmenities';
import { ROOM_TYPES } from '@/data/roomTypes';
import { toast } from 'sonner';
import { useEdgeStore } from '@/lib/edgestore';
import { useAddRoomModal } from '../hooks/use-add-room-modal';

interface LandlordRoomAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  uniqueProperties: { id: string; title: string }[];
  initialData?: any;
  initialListingId?: string;
}

const STEPS = [
  { id: 1, title: 'Identity', icon: Building2 },
  { id: 2, title: 'Details', icon: DollarSign },
  { id: 3, title: 'Photos', icon: ImageIcon },
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
    submitted
  } = useAddRoomModal({ initialListingId, initialData, onSuccess, onClose });

  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [showCustomAmenityModal, setShowCustomAmenityModal] = useState(false);

  const allImages = useMemo(() => {
    const existing = formData.images || [];
    const newOnes = files.map(f => URL.createObjectURL(f));
    return [...existing, ...newOnes];
  }, [formData.images, files]);

  const handleNextPreview = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (previewIndex === null) return;
    setPreviewIndex((previewIndex + 1) % allImages.length);
  };

  const handlePrevPreview = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (previewIndex === null) return;
    setPreviewIndex((previewIndex - 1 + allImages.length) % allImages.length);
  };

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
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6">
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
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#111827] rounded-[2.5rem] shadow-2xl flex flex-col border border-gray-100 dark:border-white/5 overflow-hidden"
      >
        {/* Sticky Header — Fixed Geometry */}
        <div className="absolute top-0 left-0 right-0 h-[100px] bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 z-50 flex items-center justify-between px-12 rounded-t-[2.5rem]">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner border border-primary/20">
                 <DoorOpen size={28} />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight uppercase">
                    {initialData ? 'Sync Details' : 'Add New Unit'}
                 </h2>
                 <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.3em] mt-1">STEP {currentStep} OF 3: {STEPS[currentStep - 1].title}</p>
              </div>
           </div>
           <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all border border-gray-100 dark:border-white/5">
              <X size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto px-12 pt-[130px] pb-6 custom-scrollbar space-y-10 relative">
          <div className="flex gap-2 h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-12">
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

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-10"
              >
                <motion.div 
                  id="field-listingId"
                  variants={itemVariants} 
                  className="space-y-4"
                  animate={errors.listingId ? { x: [-4, 4, -4, 4, shakeKey * 0.0001] } : {}}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Parent Boarding House</label>
                  <div className={cn("rounded-[2rem] transition-all", errors.listingId && "ring-4 ring-rose-500/20")}>
                    <RoomAddModernSelect
                      options={uniqueProperties.map(p => ({
                        value: p.id,
                        label: p.title,
                        icon: <Building2 size={16} />
                      }))}
                      value={formData.listingId}
                      onChange={(val) => setFormData(prev => ({ ...prev, listingId: val }))}
                      placeholder="SEARCH OR SELECT A BUILDING..."
                      className="w-full"
                      instanceId="property-selector"
                    />
                  </div>
                  {errors.listingId && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.listingId}</p>}
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div 
                    id="field-name"
                    variants={itemVariants} 
                    className="space-y-3"
                    animate={errors.name ? { x: [-4, 4, -4, 4, shakeKey * 0.0001] } : {}}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Room Name / Number</label>
                    <div className="relative group">
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Unit 101"
                        className={cn(
                          "w-full bg-gray-50/50 dark:bg-gray-800 border rounded-3xl px-6 p-5 text-sm font-bold outline-none transition-all",
                          errors.name ? "border-rose-500 ring-4 ring-rose-500/10" : "border-gray-100 dark:border-gray-700 focus:ring-4 focus:ring-primary/10"
                        )}
                      />
                    </div>
                    {errors.name && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.name}</p>}
                  </motion.div>
                  <motion.div 
                    id="field-roomType"
                    variants={itemVariants} 
                    className="space-y-3"
                    animate={errors.roomType ? { x: [-4, 4, -4, 4, shakeKey * 0.0001] } : {}}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Room Type</label>
                    <div className="grid grid-cols-2 gap-3">
                       {[
                         { id: ROOM_TYPES.SOLO, label: 'Solo', icon: ShieldCheck },
                         { id: ROOM_TYPES.BEDSPACE, label: 'Bedspace', icon: Users },
                       ].map(t => (
                         <button
                          key={t.id}
                          type="button"
                          onClick={() => handleCategoryToggle(t.id)}
                          className={cn(
                            "flex items-center justify-center gap-3 p-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all",
                            formData.roomType === t.id ? "border-primary bg-primary/5 text-primary" : cn("border-gray-100 dark:border-gray-800 text-gray-400", errors.roomType && "border-rose-500/50 bg-rose-500/5")
                          )}
                         >
                            <t.icon size={16} /> {t.label}
                         </button>
                       ))}
                    </div>
                    {errors.roomType && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.roomType}</p>}
                  </motion.div>
                </div>

                <motion.div 
                  variants={itemVariants} 
                  className="space-y-4"
                  animate={errors.bathroomArrangement ? { x: [-2, 2, -2, 2, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <label className={cn(
                    "text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2",
                    errors.bathroomArrangement ? "text-rose-500" : "text-gray-400"
                  )}>
                    Bathroom Setup
                    {errors.bathroomArrangement && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { id: 'PRIVATE_CR', label: 'Own Private CR', desc: 'Dedicated bathroom inside the room unit', icon: ShowerHead },
                      { id: 'COMMON_CR', label: 'Common Bathroom', desc: "Uses the building's main shared CR", icon: Bath },
                    ].map(opt => {
                      const isSelected = formData.bathroomArrangement === opt.id;
                      
                      // Smart Disable Logic
                      const isPropertySelected = !!formData.listingId;
                      const selectedPropertyData = uniqueProperties.find(p => p.id === formData.listingId);
                      const commonBathroomCount = (selectedPropertyData as any)?.bathroomCount || 0;
                      
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
                            "flex flex-col items-start p-6 rounded-[2.5rem] border-2 transition-all text-left group relative overflow-hidden",
                            isSelected 
                              ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                              : errors.bathroomArrangement 
                                ? "border-rose-500 bg-rose-500/5 hover:border-rose-400"
                                : "border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 hover:border-primary/20",
                            isDisabled && "opacity-40 cursor-not-allowed border-dashed grayscale"
                          )}
                        >
                           <div className={cn(
                             "p-4 rounded-2xl mb-4 transition-all",
                             isSelected ? "bg-primary text-white scale-110" : "bg-white dark:bg-gray-800 text-gray-400 group-hover:scale-110"
                           )}>
                              <opt.icon size={24} />
                           </div>
                           <span className={cn("text-[11px] font-black uppercase tracking-[0.2em]", isSelected ? "text-primary" : "text-gray-900 dark:text-white")}>{opt.label}</span>
                           <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-2 leading-relaxed">
                             {isDisabled ? <span className="text-amber-600 font-black">{disabledMessage}</span> : opt.desc}
                           </span>
                           
                           {isSelected && (
                              <div className="absolute top-6 right-6 text-primary">
                                 <CheckCircle2 size={16} />
                              </div>
                           )}
                        </button>
                      );
                    })}
                  </div>
                  {errors.bathroomArrangement && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest ml-1 mt-4 flex items-center gap-1"><AlertCircle size={10} /> {errors.bathroomArrangement}</p>}
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
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-10 bg-gray-50/50 dark:bg-gray-800/30 rounded-[3rem] border border-gray-100 dark:border-gray-800">
                   <motion.div 
                     id="field-price"
                     variants={itemVariants} 
                     className="space-y-2"
                     animate={errors.price ? { x: [-4, 4, -4, 4, shakeKey * 0.0001] } : {}}
                     transition={{ duration: 0.4, delay: 0.2 }}
                   >
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Monthly Price</label>
                      <div className="relative group">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₱</div>
                         <input 
                           type="number" 
                           name="price" 
                           value={formData.price} 
                           onChange={handleChange} 
                           placeholder="0.00"
                           className={cn(
                             "w-full bg-white dark:bg-gray-900 border rounded-2xl p-4 pl-8 text-sm font-black outline-none transition-all",
                             errors.price ? "border-rose-500 ring-4 ring-rose-500/10" : "border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-primary/10"
                           )} 
                         />
                      </div>
                      {errors.price && <p className="text-[8px] font-bold text-rose-500 uppercase tracking-widest ml-1">{errors.price}</p>}
                   </motion.div>

                   <motion.div 
                     id="field-bedType"
                     variants={itemVariants} 
                     className="space-y-2"
                     animate={errors.bedType ? { x: [-4, 4, -4, 4, shakeKey * 0.0001] } : {}}
                     transition={{ duration: 0.4, delay: 0.2 }}
                   >
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Bed Type</label>
                      <div className={cn("rounded-2xl transition-all", errors.bedType && "ring-4 ring-rose-500/20")}>
                        <ModernSelect
                           options={CENTRAL_BED_TYPES.filter(opt => {
                             if (formData.roomType === 'SOLO') return opt.value !== 'BUNK';
                             if (formData.roomType === 'BEDSPACE') return opt.value === 'BUNK' || opt.value === 'SINGLE';
                             return true;
                           })}
                           value={formData.bedType}
                           onChange={(val) => {
                             const e = { target: { name: 'bedType', value: val } } as any;
                             handleChange(e);
                           }}
                           placeholder="SELECT BED TYPE..."
                           className="w-full"
                           instanceId="bed-type-select"
                        />
                      </div>
                      {errors.bedType && <p className="text-[8px] font-bold text-rose-500 uppercase tracking-widest ml-1">{errors.bedType}</p>}
                   </motion.div>

                   <motion.div 
                     id="field-bedCount"
                     variants={itemVariants} 
                     className="space-y-2"
                     animate={errors.bedCount ? { x: [-4, 4, -4, 4, shakeKey * 0.0001] } : {}}
                     transition={{ duration: 0.4, delay: 0.2 }}
                   >
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Bed Count</label>
                      <div className="relative group">
                        <input 
                          type="number" 
                          name="bedCount" 
                          value={formData.bedCount} 
                          onChange={handleChange} 
                          placeholder="e.g. 1"
                          className={cn(
                            "w-full bg-white dark:bg-gray-900 border rounded-2xl p-4 text-sm font-black outline-none transition-all focus:ring-4 focus:ring-primary/10",
                            errors.bedCount ? "border-rose-500 ring-4 ring-rose-500/10" : "border-gray-200 dark:border-gray-700"
                          )} 
                        />
                      </div>
                      {errors.bedCount && <p className="text-[8px] font-bold text-rose-500 uppercase tracking-widest ml-1">{errors.bedCount}</p>}
                   </motion.div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Total Guests Allowed</label>
                       <div className="relative group">
                         <div className={cn(
                           "w-full rounded-2xl p-4 text-sm font-black transition-all border",
                           errors.capacity || errors.bedCount
                             ? "bg-rose-500/5 border-rose-500/20 text-rose-500 shadow-sm shadow-rose-500/5"
                             : formData.capacity
                               ? "bg-primary/5 border-primary/20 text-primary shadow-sm shadow-primary/5" 
                               : "bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-gray-400"
                         )}>
                           {errors.capacity || errors.bedCount ? '-- Guests' : formData.capacity ? `${formData.capacity} Guests` : '--- Guests'}
                         </div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <Users size={16} className={cn("transition-colors", errors.capacity ? "text-rose-500" : Number(formData.capacity) > 0 ? "text-primary" : "text-gray-300")} />
                        </div>
                      </div>
                      {errors.capacity ? (
                         <p className="text-[8px] font-bold text-rose-500 uppercase tracking-widest ml-1">{errors.capacity}</p>
                      ) : (
                         <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest ml-1">Auto-calculated based on beds</p>
                      )}
                   </div>

                   <motion.div 
                     id="field-size"
                     variants={itemVariants} 
                     className="space-y-2"
                     animate={errors.size ? { x: [-4, 4, -4, 4, shakeKey * 0.0001] } : {}}
                     transition={{ duration: 0.4, delay: 0.2 }}
                   >
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Room Size (Sq. Meters)</label>
                      <div className="relative group">
                        <input 
                          type="number" 
                          name="size" 
                          value={formData.size} 
                          onChange={handleChange} 
                          placeholder="e.g. 12"
                          className={cn(
                            "w-full bg-white dark:bg-gray-900 border rounded-2xl p-4 text-sm font-black outline-none transition-all focus:ring-4 focus:ring-primary/10",
                            errors.size ? "border-rose-500 ring-4 ring-rose-500/10" : "border-gray-200 dark:border-gray-700"
                          )} 
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">SQM</div>
                      </div>
                      {errors.size && <p className="text-[8px] font-bold text-rose-500 uppercase tracking-widest ml-1">{errors.size}</p>}
                   </motion.div>

                   <motion.div 
                     id="field-reservationFee"
                     variants={itemVariants} 
                     className="space-y-2"
                     animate={errors.reservationFee ? { x: [-4, 4, -4, 4, shakeKey * 0.0001] } : {}}
                     transition={{ duration: 0.4, delay: 0.2 }}
                   >
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Reservation Fee</label>
                      <div className="relative group">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₱</div>
                         <input 
                           type="number" 
                           name="reservationFee" 
                           value={formData.reservationFee} 
                           onChange={handleChange}
                           placeholder="0.00"
                           className={cn(
                             "w-full bg-white dark:bg-gray-900 border rounded-2xl p-4 pl-8 text-sm font-black outline-none transition-all focus:ring-4 focus:ring-primary/10",
                             errors.reservationFee ? "border-rose-500 ring-4 ring-rose-500/10" : "border-gray-200 dark:border-gray-700"
                           )} 
                         />
                      </div>
                      {errors.reservationFee && <p className="text-[8px] font-bold text-rose-500 uppercase tracking-widest ml-1">{errors.reservationFee}</p>}
                   </motion.div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-6">
                   <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                      <Sparkles size={14} className="text-amber-500" /> Room Amenities
                   </label>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {roomAmenities
                        .filter(a => !formData.roomType || a.applicableTo?.includes(formData.roomType as any))
                        .map(amenity => {
                          const isSelected = formData.amenities.includes(amenity.value);
                          return (
                            <button
                              key={amenity.value}
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                amenities: isSelected ? prev.amenities.filter(a => a !== amenity.value) : [...prev.amenities, amenity.value]
                              }))}
                              className={cn(
                                "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all group",
                                isSelected 
                                  ? "border-amber-500 bg-amber-500/5 text-amber-600" 
                                  : "border-gray-100 dark:border-gray-800 text-gray-400 hover:border-amber-200"
                              )}
                            >
                               <div className={cn(
                                 "p-3 rounded-xl transition-all",
                                 isSelected ? "bg-amber-500 text-white" : "bg-gray-100 dark:bg-gray-800/50 group-hover:scale-110"
                               )}>
                                  <amenity.icon size={20} />
                               </div>
                               <span className="text-[9px] font-black uppercase tracking-widest text-center">{amenity.label}</span>
                            </button>
                          );
                      })}
                      
                      {/* Custom Amenities Render */}
                      {formData.amenities
                        .filter(a => {
                          const isStandard = roomAmenities.some(ra => ra.value === a);
                          return !isStandard;
                        })
                        .map(amenity => {
                          let label = amenity;
                          let iconName = null;
                          
                          if (amenity.includes('||')) {
                            [label, iconName] = amenity.split('||').map(s => s.trim());
                          } else if (amenity.includes('|')) {
                            [label, iconName] = amenity.split('|').map(s => s.trim());
                          }

                          const Icon = iconName ? ((LucideIcons as any)[iconName] || 
                                       (LucideIcons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1)] || HelpCircle) : HelpCircle;
                          
                          return (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                amenities: prev.amenities.filter(a => a !== amenity)
                              }))}
                              className="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all group border-amber-500 bg-amber-500/5 text-amber-600"
                              title="Click to remove"
                            >
                               <div className="p-3 rounded-xl transition-all bg-amber-500 text-white group-hover:bg-rose-500 group-hover:scale-110">
                                  <Icon size={20} />
                               </div>
                               <span className="text-[9px] font-black uppercase tracking-widest text-center">{label}</span>
                            </button>
                          );
                      })}

                      {/* Add Custom Amenity Button */}
                      <button
                        type="button"
                        onClick={() => setShowCustomAmenityModal(true)}
                        className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-gray-400 hover:border-primary/40 hover:text-primary transition-all group min-h-[100px]"
                      >
                         <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 group-hover:bg-primary/10 transition-all">
                            <Plus size={20} />
                         </div>
                         <span className="text-[9px] font-black uppercase tracking-widest text-center">Add Custom Feature</span>
                      </button>

                      <Modal isOpen={showCustomAmenityModal} onClose={() => setShowCustomAmenityModal(false)}>
                        <CustomRoomAmenityModal
                          onAddAmenity={(amenity) => {
                            if (!formData.amenities.includes(amenity)) {
                              setFormData(prev => ({ ...prev, amenities: [...prev.amenities, amenity] }));
                            }
                          }}
                          onClose={() => setShowCustomAmenityModal(false)}
                        />
                      </Modal>

                   </div>
                </motion.div>

                <motion.div 
                  id="field-description"
                  variants={itemVariants} 
                  className="space-y-3"
                  animate={errors.description ? { x: [-4, 4, -4, 4, shakeKey * 0.0001] } : {}}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                   <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Room Description</label>
                   <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows={3} 
                    placeholder="Describe the vibe of this specific unit..." 
                    className={cn(
                      "w-full bg-gray-50 dark:bg-gray-800 border rounded-3xl p-5 text-sm font-medium outline-none transition-all resize-none",
                      errors.description ? "border-rose-500 ring-4 ring-rose-500/10" : "border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-primary/10"
                    )}
                  />
                  {errors.description && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.description}</p>}
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
                <motion.label variants={itemVariants} className={cn(
                  "p-10 border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4 group hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden",
                          errors.images ? "border-rose-500 bg-rose-50/10" : "border-gray-100 dark:border-gray-800"
                )}>
                   <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                   <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform", errors.images ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary")}>
                      <Plus size={40} strokeWidth={3} />
                   </div>
                   <div>
                      <h4 className={cn("text-sm font-black uppercase tracking-tight", errors.images ? "text-rose-500" : "text-gray-900 dark:text-white")}>Upload Room Photos</h4>
                      {errors.images && (
                         <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
                            <AlertCircle size={12} /> {errors.images}
                         </p>
                      )}
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">JPG, PNG, WEBP • Max 5 images • Under 5MB each</p>
                   </div>
                </motion.label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                   {allImages.map((src: string, i: number) => (
                     <div key={i} className="relative aspect-square rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 group">
                        <SafeImage src={src} alt="preview" />
                        
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <button 
                            type="button"
                            onClick={() => setPreviewIndex(i)}
                            className="p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white/40 transition-all hover:scale-110"
                           >
                              <Eye size={20} />
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
                            className="p-3 bg-rose-500/20 backdrop-blur-md text-rose-500 rounded-2xl hover:bg-rose-500 transition-all hover:scale-110"
                           >
                              <X size={20} />
                           </button>
                        </div>

                        {i < (formData.images?.length || 0) && (
                           <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                              Saved
                           </div>
                        )}
                     </div>
                   ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- IMAGE PREVIEW MODAL --- */}
        <AnimatePresence>
          {previewIndex !== null && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-10"
              onClick={() => setPreviewIndex(null)}
            >
               <button 
                className="absolute top-8 right-8 p-4 text-white/50 hover:text-white transition-colors"
                onClick={() => setPreviewIndex(null)}
               >
                  <X size={32} />
               </button>

               <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <SafeImage
                      key={previewIndex}
                      src={allImages[previewIndex]}
                      alt="Room Preview"
                      className="max-w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl"
                      onClick={(e: any) => e.stopPropagation()}
                    />
                  </AnimatePresence>

                  {allImages.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevPreview}
                        className="absolute left-0 -translate-x-12 p-5 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10 hidden md:block"
                      >
                        <ArrowLeft size={24} />
                      </button>
                      <button 
                        onClick={handleNextPreview}
                        className="absolute right-0 translate-x-12 p-5 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10 hidden md:block"
                      >
                        <ArrowRight size={24} />
                      </button>
                    </>
                  )}

                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                      Image {previewIndex + 1} of {allImages.length}
                    </p>
                    <div className="flex gap-1.5">
                      {allImages.map((_: any, idx: number) => (
                        <div 
                          key={idx} 
                          className={cn(
                            "h-1 transition-all duration-500 rounded-full",
                            previewIndex === idx ? "w-8 bg-primary" : "w-2 bg-white/10"
                          )}
                        />
                      ))}
                    </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-12 py-8 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
           <button 
            onClick={currentStep === 1 ? onClose : handleBack}
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
           >
              <ChevronLeft size={16} /> {currentStep === 1 ? 'Cancel' : 'Go Back'}
           </button>

           <div className="flex gap-4">
              {currentStep < 3 ? (
                <Button onClick={handleNext} className="px-10 py-5 bg-primary text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center gap-2">
                  Next Step <ChevronRight size={16} />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || uploadingImages}
                  className="px-12 py-5 bg-primary text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {(loading || uploadingImages) ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {initialData ? 'Sync Unit' : 'Publish Unit'}
                </Button>
              )}
           </div>
        </div>
        {/* --- SUCCESS OVERLAY --- */}
        <AnimatePresence>
          {submitted && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/95 dark:bg-[#0B0F1A]/95 flex items-center justify-center z-[200] p-6 backdrop-blur-xl">
              <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-12 text-center max-w-sm w-full shadow-2xl relative overflow-hidden border border-gray-100 dark:border-white/10">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
                
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Check size={48} className="text-primary" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter uppercase">{initialData ? 'Sync Complete' : 'Unit Published'}</h3>
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 mb-8 uppercase tracking-[0.3em]">{initialData ? 'Details synchronized' : 'Room is now live'}</p>
                
                <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-3">
                  <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.2, ease: "easeOut" }} className="h-full bg-primary" />
                </div>
                <span className="text-[9px] font-black text-primary opacity-60 tracking-[0.4em] uppercase animate-pulse">Redirecting...</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>,
    document.body
  );
};
