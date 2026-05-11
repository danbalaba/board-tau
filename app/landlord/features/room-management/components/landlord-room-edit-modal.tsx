'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Save, Image as ImageIcon, UploadCloud, Trash2, Bed, Users, 
  Banknote, Maximize, Bath, LayoutGrid, Info, Check, Plus, 
  ChevronDown, Sparkles, AlertCircle, Building2, Tag, Calendar,
  RotateCcw, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditRoom } from '../hooks/use-edit-room';
import { ROOM_TYPE_LABELS, ROOM_TYPES } from '@/data/roomTypes';
import { roomAmenities, BATHROOM_ARRANGEMENT_LABELS, bedTypeOptions } from '@/data/roomAmenities';
import { cn } from '@/utils/helper';
import SafeImage from '@/components/common/SafeImage';
import { FaSpinner, FaCheck } from 'react-icons/fa';
import * as LucideIcons from 'lucide-react';
import RoomManagementCustomAmenity from './RoomManagementCustomAmenity';

interface LandlordRoomEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: any;
  onSuccess: () => void;
}

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const backdropVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 30 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 28 } },
  exit: { opacity: 0, scale: 0.97, y: 20, transition: { duration: 0.2 } },
};

const staggerContainer = {
  show: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariant = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } }
};

// --- MODERN SELECT COMPONENT ---
const ModernSelect = ({ label, icon: Icon, options, value, onChange, name, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const selectedLabel = options[value] || placeholder || "Select Option";
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="space-y-2 relative">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-primary/70" />}
        {label}
      </label>
      <button
        ref={anchorRef}
        type="button"
        name={name}
        onClick={handleToggle}
        className={cn(
          "w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold flex items-center justify-between transition-all outline-none group",
          isOpen ? "ring-4 ring-primary/10 border-primary" : "hover:border-primary/40"
        )}
      >
        <span className={cn(value ? "text-gray-900 dark:text-white" : "text-gray-400")}>{selectedLabel}</span>
        <ChevronDown size={18} className={cn("text-gray-400 transition-transform duration-300", isOpen && "rotate-180 text-primary")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div 
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl z-[101] overflow-hidden p-2"
            style={{ minWidth: '200px' }}
          >
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
              {Object.entries(options).map(([val, lbl]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    onChange({ target: { name, value: val } });
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm font-bold rounded-xl transition-all flex items-center justify-between group",
                    value === val ? "bg-primary text-white" : "text-gray-600 dark:text-gray-300 hover:bg-primary/5 hover:text-primary"
                  )}
                >
                  {lbl as string}
                  {value === val && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const LandlordRoomEditModal: React.FC<LandlordRoomEditModalProps> = ({ isOpen, onClose, initialData, onSuccess }) => {
  const [mounted, setMounted] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showCustomAmenity, setShowCustomAmenity] = useState(false);

  const {
    loading, uploadingImages, errors, formData, handleChange, handleAmenityToggle, 
    files, setFiles, deletedImages, setDeletedImages, handleSubmit, submitted,
    isDirty, canUndo, handleUndo, handleReset, saveHistory
  } = useEditRoom(initialData, onSuccess, onClose);

  // Filtered Bed Options
  const filteredBedOptions = useMemo(() => {
    return bedTypeOptions
      .filter(opt => {
        if (formData.roomType === 'SOLO') return opt.value !== 'BUNK';
        if (formData.roomType === 'BEDSPACE') return opt.value === 'BUNK' || opt.value === 'SINGLE';
        return true;
      })
      .reduce((acc: any, opt) => {
        acc[opt.value] = opt.label;
        return acc;
      }, {});
  }, [formData.roomType]);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsInitialLoading(false), 800);
      return () => clearTimeout(timer);
    } else {
      setIsInitialLoading(true);
    }
  }, [isOpen]);

  // Keyboard Shortcuts for Undo
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, isOpen]);

  useEffect(() => { 
    document.body.style.overflow = isOpen ? 'hidden' : ''; 
    return () => { document.body.style.overflow = ''; } 
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="edit-modal-backdrop"
          variants={backdropVariants}
          initial="hidden" animate="show" exit="exit"
          className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-8 bg-gray-900/40 dark:bg-gray-950/80 backdrop-blur-sm"
        >
          <motion.div
            variants={panelVariants}
            className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#0B0F1A] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-white/5"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#0B0F1A] z-20">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <Building2 size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">Edit Room Details</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Management Terminal</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 rounded-2xl transition-all group">
                <X size={20} className="group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative max-h-[calc(92vh-180px)]">
              <AnimatePresence mode="wait">
                {isInitialLoading ? (
                  <motion.div 
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-12 py-4"
                  >
                    <div className="space-y-4">
                      <div className="h-4 w-32 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
                      <div className="grid grid-cols-2 gap-6">
                        <div className="h-14 bg-gray-50 dark:bg-white/5 rounded-2xl animate-pulse" />
                        <div className="h-14 bg-gray-50 dark:bg-white/5 rounded-2xl animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 w-40 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
                      <div className="grid grid-cols-4 gap-4">
                        <div className="h-14 bg-gray-50 dark:bg-white/5 rounded-2xl animate-pulse" />
                        <div className="h-14 bg-gray-50 dark:bg-white/5 rounded-2xl animate-pulse" />
                        <div className="h-14 bg-gray-50 dark:bg-white/5 rounded-2xl animate-pulse" />
                        <div className="h-14 bg-gray-50 dark:bg-white/5 rounded-2xl animate-pulse" />
                      </div>
                    </div>
                    <div className="h-[200px] bg-gray-50 dark:bg-white/5 rounded-3xl animate-pulse" />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="content"
                    variants={staggerContainer}
                    initial="hidden" animate="show"
                    className="space-y-12 pb-10"
                  >
                    
                    {/* Basic Info */}
                    <motion.section variants={itemVariant} className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Info size={16} strokeWidth={2.5} /></div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">General Info</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-1.5">
                            <Tag size={12} className="text-primary/70" />
                            Room Name / Number
                          </label>
                          <input 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            placeholder="Unit ID or Number"
                            className={cn(
                              "w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/40 border rounded-2xl text-sm font-bold focus:ring-4 transition-all outline-none dark:text-white",
                              errors.name ? "border-rose-500 focus:ring-rose-500/10" : "border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-primary/10"
                            )} 
                          />
                          {errors.name && <p className="text-[10px] font-bold text-rose-500 ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-1.5">
                            <LayoutGrid size={12} className="text-primary/70" />
                            Room Type
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { id: ROOM_TYPES.SOLO, label: 'Solo', icon: ShieldCheck },
                              { id: ROOM_TYPES.BEDSPACE, label: 'Bedspace', icon: Users },
                            ].map(t => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => handleChange({ target: { name: 'roomType', value: t.id } })}
                                className={cn(
                                  "flex items-center justify-center gap-3 p-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all",
                                  formData.roomType === t.id 
                                    ? "border-primary bg-primary/5 text-primary" 
                                    : "border-gray-100 dark:border-gray-800 text-gray-400 hover:border-primary/20"
                                )}
                              >
                                <t.icon size={16} /> {t.label}
                              </button>
                            ))}
                          </div>
                          {errors.roomType && <p className="text-[10px] font-bold text-rose-500 ml-1 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.roomType}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-1.5">
                            <Banknote size={12} className="text-emerald-500/70" />
                            Monthly Rate (₱)
                          </label>
                          <input 
                            type="number" 
                            name="price" 
                            value={formData.price} 
                            onChange={handleChange} 
                            className={cn(
                              "w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/40 border rounded-2xl text-sm font-bold focus:ring-4 transition-all outline-none dark:text-white",
                              errors.price ? "border-rose-500 focus:ring-rose-500/10" : "border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-primary/10"
                            )} 
                          />
                          {errors.price && <p className="text-[10px] font-bold text-rose-500 ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.price}</p>}
                        </div>
                         <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-1.5">
                            <Calendar size={12} className="text-amber-500/70" />
                            Reservation Fee (₱)
                          </label>
                          <input 
                            type="number" 
                            name="reservationFee" 
                            value={formData.reservationFee} 
                            onChange={handleChange} 
                            placeholder="Optional" 
                            className={cn(
                              "w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/40 border rounded-2xl text-sm font-bold focus:ring-4 transition-all outline-none dark:text-white",
                              errors.reservationFee ? "border-rose-500 focus:ring-rose-500/10" : "border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-primary/10"
                            )} 
                          />
                          {errors.reservationFee && <p className="text-[10px] font-bold text-rose-500 ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.reservationFee}</p>}
                        </div>
                      </div>
                    </motion.section>

                    {/* Specifications */}
                    <motion.section variants={itemVariant} className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Maximize size={16} strokeWidth={2.5} /></div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Room Layout</h3>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <ModernSelect 
                            label="Bed Type"
                            icon={Bed}
                            name="bedType"
                            value={formData.bedType}
                            options={filteredBedOptions}
                            onChange={handleChange}
                            placeholder="Configuration"
                          />
                          {errors.bedType && <p className="text-[10px] font-bold text-rose-500 ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.bedType}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-1.5">Bed Count</label>
                          <input 
                            type="number" 
                            name="bedCount" 
                            value={formData.bedCount} 
                            onChange={handleChange} 
                            className={cn(
                              "w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/40 border rounded-2xl text-sm font-bold focus:ring-4 transition-all outline-none dark:text-white",
                              errors.bedCount ? "border-rose-500 focus:ring-rose-500/10" : "border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-primary/10"
                            )} 
                          />
                          {errors.bedCount && <p className="text-[10px] font-bold text-rose-500 ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.bedCount}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-1.5">Total Guests Allowed</label>
                          <div className={cn(
                            "w-full px-5 py-4 bg-gray-100 dark:bg-white/5 border border-dashed rounded-2xl text-sm font-black text-primary flex items-center gap-2",
                            errors.capacity ? "border-rose-500 text-rose-500" : "border-gray-200 dark:border-white/10"
                          )}>
                            <Users size={16} />
                            {formData.capacity} 
                          </div>
                          {errors.capacity && <p className="text-[10px] font-bold text-rose-500 ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.capacity}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-1.5">Room Size (Sq. Meters)</label>
                          <input 
                            type="number" 
                            name="size" 
                            value={formData.size} 
                            onChange={handleChange} 
                            className={cn(
                              "w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/40 border rounded-2xl text-sm font-bold focus:ring-4 transition-all outline-none dark:text-white",
                              errors.size ? "border-rose-500 focus:ring-rose-500/10" : "border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-primary/10"
                            )} 
                          />
                          {errors.size && <p className="text-[10px] font-bold text-rose-500 ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.size}</p>}
                        </div>
                      </div>
                    </motion.section>

                    {/* Details */}
                    <motion.section variants={itemVariant} className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500"><Bath size={16} strokeWidth={2.5} /></div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Room Setup</h3>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-5 space-y-2">
                          <ModernSelect 
                            label="Bathroom Setup"
                            icon={Bath}
                            name="bathroomArrangement"
                            value={formData.bathroomArrangement}
                            options={BATHROOM_ARRANGEMENT_LABELS}
                            onChange={handleChange}
                            placeholder="Select setup"
                          />
                          {errors.bathroomArrangement && <p className="text-[10px] font-bold text-rose-500 ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.bathroomArrangement}</p>}
                        </div>
                        <div className="lg:col-span-7 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-1.5">Room Description</label>
                          <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            rows={4} 
                            placeholder="Describe the unit unique features..."
                            className={cn(
                              "w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/40 border rounded-2xl text-sm font-bold focus:ring-4 transition-all outline-none custom-scrollbar dark:text-white resize-none",
                              errors.description ? "border-rose-500 focus:ring-rose-500/10" : "border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-primary/10"
                            )} 
                          />
                          {errors.description && <p className="text-[10px] font-bold text-rose-500 ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.description}</p>}
                        </div>
                      </div>
                    </motion.section>

                    {/* Amenities */}
                    <motion.section variants={itemVariant} className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Sparkles size={16} strokeWidth={2.5} /></div>
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Amenities</h3>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setShowCustomAmenity(true)}
                          className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5 hover:scale-105 transition-transform"
                        >
                          <Plus size={14} /> Add Custom Feature
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {roomAmenities
                          .filter(am => !formData.roomType || am.applicableTo?.includes(formData.roomType))
                          .map((am) => {
                          const isSelected = formData.amenities.includes(am.value);
                          return (
                            <button
                              key={am.value}
                              type="button"
                              onClick={() => handleAmenityToggle(am.value)}
                              className={cn(
                                "flex items-center gap-2.5 px-5 py-3 border rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 group relative overflow-hidden",
                                isSelected
                                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                  : "bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-white/5 hover:border-primary/50 hover:text-primary"
                              )}
                            >
                              <am.icon size={14} className={cn("transition-colors duration-500", isSelected ? "text-white" : "text-primary")} />
                              {am.label}
                              {isSelected && <motion.div layoutId="amenity-check" className="ml-1"><Check size={12} /></motion.div>}
                            </button>
                          );
                        })}
                        {/* CUSTOM AMENITIES */}
                        {formData.amenities
                          .filter((a: string) => {
                            // Find anything that isn't a standard amenity value
                            const isStandard = roomAmenities.some(ra => ra.value === a);
                            return !isStandard;
                          })
                          .map((custom: string) => {
                            let label = custom;
                            let iconName = null;
                            
                            if (custom.includes('||')) {
                              [label, iconName] = custom.split('||').map(s => s.trim());
                            } else if (custom.includes('|')) {
                              [label, iconName] = custom.split('|').map(s => s.trim());
                            }

                            const Icon = iconName ? ((LucideIcons as any)[iconName] || 
                                         (LucideIcons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1)] || Tag) : Tag;
                            
                            return (
                              <button
                                key={custom}
                                type="button"
                                onClick={() => handleAmenityToggle(custom)}
                                className="flex items-center gap-2.5 px-5 py-3 bg-white dark:bg-white/5 text-primary border border-primary/20 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-rose-500 hover:text-rose-500 transition-all group"
                              >
                                <Icon size={14} />
                                {label}
                                <X size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                              </button>
                            );
                          })}
                      </div>
                    </motion.section>

                    {/* Photos */}
                    <motion.section variants={itemVariant} className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500"><ImageIcon size={16} strokeWidth={2.5} /></div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Room Photos</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {formData.images.map((img: string, idx: number) => {
                          const isDeleted = deletedImages.includes(img);
                          if (isDeleted) return null;
                          return (
                            <motion.div layout key={img} className="relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-gray-100 dark:border-white/10 group shadow-sm">
                              <SafeImage src={img} alt="room" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    saveHistory();
                                    setDeletedImages(prev => [...prev, img]);
                                  }} 
                                  className="p-3 bg-rose-500 text-white rounded-2xl hover:scale-110 transition-transform shadow-xl"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                        {files.map((f, idx) => (
                          <motion.div layout key={`new-${idx}`} className="relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-primary shadow-lg">
                            <SafeImage src={URL.createObjectURL(f)} alt="new room" />
                            <div className="absolute inset-x-0 bottom-0 bg-primary/90 py-1 text-center text-[8px] font-black text-white uppercase tracking-widest">New Asset</div>
                            <button 
                              type="button" 
                              onClick={() => {
                                saveHistory();
                                setFiles(prev => prev.filter((_, i) => i !== idx));
                              }} 
                              className="absolute top-2 right-2 p-1.5 bg-black/40 text-white rounded-lg hover:bg-rose-500 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </motion.div>
                        ))}

                        <label className="aspect-square rounded-[1.5rem] border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-primary flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-primary/5 group relative overflow-hidden">
                          <div className="flex flex-col items-center gap-2 group-hover:-translate-y-1 transition-transform">
                             <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                               <UploadCloud size={24} />
                             </div>
                             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-primary">Add Photos</span>
                          </div>
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => { 
                              if(e.target.files) {
                                saveHistory();
                                const newFiles = Array.from(e.target.files);
                                setFiles(prev => [...prev, ...newFiles]);
                              }
                            }} 
                          />
                        </label>
                      </div>
                    </motion.section>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Action */}
            <div className="px-10 py-8 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#111827] flex items-center justify-between gap-6 z-20">
              <div className="hidden md:flex flex-col">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Action Required</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  All metadata will be synchronized immediately.
                </span>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <button 
                  type="button"
                  onClick={onClose} 
                  className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-all border border-gray-100 dark:border-white/10"
                >
                  Cancel
                </button>

                <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className={cn(
                      "p-3 rounded-xl transition-all",
                      canUndo ? "text-amber-500 hover:bg-amber-500/10" : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    )}
                    title="Undo (Ctrl+Z)"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700 mx-1.5" />
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={!isDirty}
                    className={cn(
                      "p-3 rounded-xl transition-all",
                      isDirty ? "text-rose-500 hover:bg-rose-500/10" : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    )}
                    title="Discard all changes"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <button 
                  onClick={handleSubmit} 
                  disabled={loading || uploadingImages || isInitialLoading || !isDirty} 
                  className={cn(
                    "px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl",
                    isDirty 
                      ? "bg-primary text-white shadow-primary/20" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {loading || uploadingImages ? <FaSpinner className="animate-spin" /> : <Save size={18} />}
                  {uploadingImages ? 'Uploading...' : loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Custom Amenity Modal Overlay */}
            <AnimatePresence>
              {showCustomAmenity && (
                <div className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-gray-950/40 backdrop-blur-sm" onClick={() => setShowCustomAmenity(false)}>
                  <RoomManagementCustomAmenity 
                    onAddAmenity={handleAmenityToggle} 
                    onClose={() => setShowCustomAmenity(false)} 
                  />
                </div>
              )}
            </AnimatePresence>

            {/* Full Screen Success Overlay */}
            <AnimatePresence>
              {submitted && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/95 dark:bg-[#0B0F1A]/95 flex items-center justify-center z-[100] p-6 backdrop-blur-xl">
                  <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-12 text-center max-w-sm w-full shadow-2xl relative overflow-hidden border border-gray-100 dark:border-white/10">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
                    
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                      <Check size={48} className="text-primary" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter uppercase">Changes Saved</h3>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 mb-8 uppercase tracking-[0.3em]">Room updated successfully</p>
                    
                    <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-3">
                      <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.2, ease: "easeOut" }} className="h-full bg-primary" />
                    </div>
                    <span className="text-[9px] font-black text-primary opacity-60 tracking-[0.4em] uppercase animate-pulse">Redirecting...</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default LandlordRoomEditModal;
