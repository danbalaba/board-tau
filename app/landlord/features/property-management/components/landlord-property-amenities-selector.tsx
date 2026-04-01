'use client';

import React from 'react';
import { Wifi } from 'lucide-react';
import { cn } from '@/utils/helper';
import { PropertyFormSection } from './shared-ui';
import { categories as CATEGORY_LIST } from "@/utils/constants";
import { amenities as AMENITY_LIST } from "@/data/amenities";

interface LandlordPropertyAmenitiesSelectorProps {
  formData: any;
  setFormData: (data: any) => void;
  setActiveSection: (id: string) => void;
}

/**
 * LandlordPropertyAmenitiesSelector
 * Synchronized with 'Amenities-Categories-Pref.md' and student search filters.
 * Ensures the landlord can only select amenities that students can search for.
 */
export function LandlordPropertyAmenitiesSelector({
  formData,
  setFormData,
  setActiveSection
}: LandlordPropertyAmenitiesSelectorProps) {
  
  const handleAmenityToggle = (amenityValue: string) => {
    setFormData((prev: any) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityValue)
        ? prev.amenities.filter((a: string) => a !== amenityValue)
        : [...prev.amenities, amenityValue]
    }));
  };

  const handleCategoryToggle = (categoryValue: string) => {
    setFormData((prev: any) => ({
      ...prev,
      categories: prev.categories.includes(categoryValue)
        ? prev.categories.filter((c: string) => c !== categoryValue)
        : [...prev.categories, categoryValue]
    }));
  };

  return (
    <PropertyFormSection 
      id="amenities" 
      title="Standard Amenities" 
      icon={Wifi} 
      description="Essential utilities & perks available to all tenants" 
      setActiveSection={setActiveSection}
    >
      <div className="flex flex-wrap gap-4 bg-gray-50/50 dark:bg-gray-800/10 p-8 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-700">
        {AMENITY_LIST.map((amenity) => {
          const Icon = amenity.icon;
          const isSelected = formData.amenities.includes(amenity.value);
          
          return (
            <button
              key={amenity.value}
              type="button"
              onClick={() => handleAmenityToggle(amenity.value)}
              className={cn(
                "flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 border shadow-sm",
                isSelected
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/30"
                  : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:border-primary/20"
              )}
            >
              <Icon size={14} className={cn(isSelected ? "text-white" : "text-gray-400")} />
              {amenity.label}
            </button>
          );
        })}
      </div>

      <div className="mt-12">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6 ml-2 flex items-center gap-2">
          <span className="w-8 h-[2px] bg-gray-200 dark:bg-gray-800"></span>
          Common Classifications
        </h3>
        <div className="flex flex-wrap gap-3">
          {CATEGORY_LIST.map(cat => {
            const isSelected = formData.categories.includes(cat.value);
            const Icon = cat.icon;
            
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleCategoryToggle(cat.value)}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 border",
                  isSelected
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-xl scale-105"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                <Icon size={14} />
                {cat.label}
              </button>
            );
          })}
        </div>
        <p className="mt-4 ml-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest italic opacity-60">
          Tip: Selecting appropriate categories helps the search algorithm match you with the right students.
        </p>
      </div>
    </PropertyFormSection>
  );
}
