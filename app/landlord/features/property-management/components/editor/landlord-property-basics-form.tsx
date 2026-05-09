'use client';
import React from 'react';
import ReactSelect from 'react-select';
import { Type, DollarSign, Bed, Bath, Tag, AlertCircle } from 'lucide-react';
import Input from '@/components/inputs/Input';
import Textarea from '@/components/inputs/Textarea';
import { PropertyFormSection } from './shared-ui';
import { categories as CATEGORY_LIST } from "@/utils/constants";
import { cn } from '@/utils/helper';

interface LandlordPropertyBasicsFormProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
  setActiveSection: (id: string) => void;
}

export function LandlordPropertyBasicsForm({
  formData,
  setFormData,
  errors,
  setActiveSection
}: LandlordPropertyBasicsFormProps) {
  return (
    <PropertyFormSection 
      id="basics" 
      title="Property Basics" 
      icon={Type} 
      description="Key listing details" 
      setActiveSection={setActiveSection}
    >
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Input
            id="title"
            label="Property Title"
            placeholder="e.g. Modern Studio near University"
            value={formData.title}
            onChange={(e: any) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
            errors={errors}
            icon={Type}
            useStaticLabel
          />

          <div className="relative group">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 ml-1 flex items-center gap-2">
              <Tag size={14} className="rotate-90 text-primary group-focus-within:rotate-0 transition-transform duration-500" />
              Property Category
            </label>
            <ReactSelect
              options={CATEGORY_LIST.map(c => ({ value: c.value, label: c.label }))}
              value={formData.category ? { value: formData.category, label: CATEGORY_LIST.find(c => c.value === formData.category)?.label || formData.category } : null}
              onChange={(selected: any) => setFormData((prev: any) => ({ ...prev, category: selected ? selected.value : '' }))}
              placeholder="Select primary category"
              classNames={{
                control: (state) => `!bg-white dark:!bg-gray-900 !border-2 ${state.isFocused ? '!border-primary !ring-4 !ring-primary/5 shadow-xl shadow-primary/10' : '!border-gray-50 dark:!border-gray-800'} !rounded-2xl !p-[8px] !shadow-sm transition-all text-sm font-medium`,
                singleValue: () => `!text-gray-900 dark:!text-white font-bold`,
                placeholder: () => `!text-gray-400`,
                menu: () => `!bg-white dark:!bg-gray-800 !border !border-gray-100 dark:!border-gray-800 !shadow-2xl !rounded-2xl !mt-3 z-[60] overflow-hidden`,
                menuList: () => `!p-0 !bg-white dark:!bg-gray-800`,
                option: (state) => `!cursor-pointer ${state.isSelected ? '!bg-primary !text-white font-black' : state.isFocused ? '!bg-primary/10 !text-primary' : '!bg-transparent !text-gray-500 dark:!text-gray-400'} !px-5 !py-4 !text-xs uppercase tracking-widest transition-colors`,
              }}
              styles={{
                input: (base) => ({ ...base, color: 'inherit' }),
                menuPortal: base => ({ ...base, zIndex: 9999 })
              }}
              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
              instanceId="category-select-basics"
            />
            {errors?.category && <p className="mt-2 text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-1.5"><AlertCircle size={12} /> {errors.category}</p>}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center space-x-3">
            <div className="w-8 h-[2px] bg-primary/40 shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
            <span>Property Setup</span>
          </h4>
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-gray-100 dark:border-gray-700">Metrics v1.0</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <Input
            id="totalRooms" 
            label="Total Rooms" 
            type="number"
            value={formData.totalRooms} 
            onChange={(e: any) => setFormData((prev: any) => ({ ...prev, totalRooms: e.target.value }))}
            errors={errors} 
            icon={Bed} 
            useStaticLabel
          />
          <Input
            id="bathroomCount" 
            label="Bathrooms" 
            type="number"
            value={formData.bathroomCount} 
            onChange={(e: any) => setFormData((prev: any) => ({ ...prev, bathroomCount: e.target.value }))}
            errors={errors} 
            icon={Bath} 
            useStaticLabel
          />
          <Input
            id="price" 
            label="Monthly Rent" 
            type="number" 
            placeholder="₱"
            value={formData.price} 
            onChange={(e: any) => setFormData((prev: any) => ({ ...prev, price: e.target.value }))}
            errors={errors} 
            icon={DollarSign} 
            useStaticLabel
          />
        </div>
      </div>

      <div className="mt-16 relative">
        <div className="absolute right-2 top-0 z-10 flex items-center justify-end">
          <div className={cn(
            "text-[9px] font-black uppercase tracking-widest transition-colors duration-500",
            (formData.description?.length || 0) > 200 ? "text-emerald-500" : (formData.description?.length || 0) > 50 ? "text-primary" : "text-gray-400"
          )}>
            {formData.description?.length || 0} / 1000 Characters
          </div>
        </div>
        <Textarea
          id="description"
          label="Listing Description"
          value={formData.description}
          onChange={(e: any) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
          rows={6}
          placeholder="Visibility Tip: Be detailed! Mentioning specific landmarks near TAU or unique features of your compound helps you stand out in search results."
          className="rounded-[2rem] border-2 focus:ring-4 focus:ring-primary/5 transition-all text-[15px] p-6 bg-white dark:bg-gray-900"
        />
      </div>
    </PropertyFormSection>
  );
}
