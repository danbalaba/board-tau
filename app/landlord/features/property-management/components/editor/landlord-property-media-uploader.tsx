'use client';

import React from 'react';
import { FaImages, FaInfoCircle } from 'react-icons/fa';
import { Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PropertyFormSection } from './shared-ui';
import { cn } from '@/utils/helper';
import SafeImage from '@/components/common/SafeImage';

interface LandlordPropertyMediaUploaderProps {
  formData: any;
  setFormData: (data: any) => void;
  setActiveSection: (id: string) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  deleteExistingImage: (url: string) => void;
}

export function LandlordPropertyMediaUploader({
  formData,
  setFormData,
  setActiveSection,
  handleImageChange,
  deleteExistingImage
}: LandlordPropertyMediaUploaderProps) {

  const getSafeImageSrc = (img: any) => {
    if (!img) return undefined;
    if (typeof img === 'string') return img;
    return img.url;
  };

  return (
    <PropertyFormSection 
      id="media" 
      title="Visual Gallery" 
      icon={FaImages} 
      description="Curate a stunning high-fidelity property showcase" 
      setActiveSection={setActiveSection}
    >
      <div className="space-y-12">
        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {formData.existingImages.map((img: any, i: number) => (
              <motion.div 
                key={`existing-${img.url}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="relative aspect-[4/3] rounded-[2rem] overflow-hidden group/img shadow-sm hover:shadow-2xl transition-all duration-700"
              >
                <SafeImage 
                  src={getSafeImageSrc(img)} 
                  alt="" 
                  className="group-hover/img:scale-110 transition-transform duration-1000" 
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-xl border border-white/10">
                  {img.category || 'General'}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 flex items-end justify-center p-6">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button" 
                    onClick={() => deleteExistingImage(img.url)} 
                    className="w-full py-3 bg-rose-500 text-white rounded-2xl shadow-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} />
                    Remove
                  </motion.button>
                </div>
              </motion.div>
            ))}

            {formData.propertyFiles.map((file: any, i: number) => (
              <motion.div 
                key={`new-${i}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative aspect-[4/3] rounded-[2rem] overflow-hidden border-2 border-primary/30 shadow-xl"
              >
                <SafeImage src={URL.createObjectURL(file)} alt="" />
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] pointer-events-none" />
                <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 animate-pulse">
                  Uploading...
                </div>
              </motion.div>
            ))}

            <motion.label 
              layout
              key="add-more"
              className="relative aspect-[4/3] rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all duration-500 group/add"
            >
              <div className="w-14 h-14 rounded-3xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover/add:bg-primary group-hover/add:text-white group-hover/add:rotate-90 transition-all duration-500 shadow-sm">
                <Plus size={24} />
              </div>
              <div className="text-center">
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover/add:text-primary transition-colors">Add Photos</span>
                <span className="block text-[8px] font-bold text-gray-300 uppercase tracking-tighter mt-1 group-hover/add:text-primary/60 transition-colors">JPG, PNG or WEBP</span>
              </div>
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/jpg, image/webp" 
                multiple 
                className="hidden" 
                onChange={handleImageChange} 
              />
            </motion.label>
          </AnimatePresence>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="bg-primary/5 dark:bg-primary/10 p-8 rounded-[2.5rem] border border-primary/20 flex items-center gap-6 shadow-inner"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <FaInfoCircle size={20} />
          </div>
          <div>
            <p className="text-[11px] font-black text-primary uppercase tracking-[0.1em] leading-relaxed">
              Conversion Optimization Tip
            </p>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">
              Properties with <span className="text-primary">8+ cinematic shots</span> see a significant lift in quality tenant leads.
            </p>
          </div>
        </motion.div>
      </div>
    </PropertyFormSection>
  );
}
