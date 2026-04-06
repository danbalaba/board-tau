'use client';

import React from 'react';
import { FaImages, FaInfoCircle } from 'react-icons/fa';
import { Trash2, Plus } from 'lucide-react';
import { PropertyFormSection } from './shared-ui';

interface LandlordPropertyMediaUploaderProps {
  formData: any;
  setFormData: (data: any) => void;
  setActiveSection: (id: string) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  deleteExistingImage: (url: string) => void;
  getSafeImageSrc: (url: string) => string | undefined;
}

export function LandlordPropertyMediaUploader({
  formData,
  setFormData,
  setActiveSection,
  handleImageChange,
  deleteExistingImage,
  getSafeImageSrc
}: LandlordPropertyMediaUploaderProps) {
  return (
    <PropertyFormSection 
      id="showcase" 
      title="Visual Evidence" 
      icon={FaImages} 
      description="High-fidelity gallery management" 
      setActiveSection={setActiveSection}
    >
      <div className="space-y-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {formData.existingImages.map((url: string, i: number) => (
            <div key={i} className="relative aspect-video rounded-2xl overflow-hidden group/img shadow-md">
              <img src={getSafeImageSrc(url)} alt="" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <button type="button" onClick={() => deleteExistingImage(url)} className="p-2 bg-red-500 text-white rounded-lg shadow-xl hover:scale-110 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {formData.propertyFiles.map((file: any, i: number) => (
            <div key={i} className="relative aspect-video rounded-2xl overflow-hidden border-2 border-primary/30 shadow-md">
              <img src={getSafeImageSrc(URL.createObjectURL(file))} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-full">New</div>
            </div>
          ))}
          <label className="aspect-video rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/40 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group/add">
            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover/add:bg-primary group-hover/add:text-white transition-colors">
              <Plus size={20} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover/add:text-primary">Add More Photos</span>
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg, image/webp" 
              multiple 
              className="hidden" 
              onChange={handleImageChange} 
            />
          </label>
        </div>
        
        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex items-start gap-4">
          <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" size={16} />
          <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-relaxed">
            Uploading 4+ high-resolution photos increases booking conversion by 45%. Make sure to include bathroom and common area shots.
          </p>
        </div>
      </div>
    </PropertyFormSection>
  );
}
