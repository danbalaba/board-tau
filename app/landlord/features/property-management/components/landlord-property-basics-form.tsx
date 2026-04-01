'use client';

import React from 'react';
import { Type, MapPin, DollarSign, Bed, Bath, Users } from 'lucide-react';
import Input from '@/components/inputs/Input';
import Textarea from '@/components/inputs/Textarea';
import { PropertyFormSection } from './shared-ui';

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
      title="Core Attributes" 
      icon={Type} 
      description="Primary property identifiers" 
      setActiveSection={setActiveSection}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Input
          id="title"
          label="Property Title"
          placeholder="e.g. Modern Studio near University"
          value={formData.title}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
          errors={errors}
          icon={Type}
          useStaticLabel
        />
        <Input
          id="locationLabel"
          label="Region / Province"
          placeholder="Central Luzon"
          value={formData.province}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, province: e.target.value }))}
          errors={errors}
          icon={MapPin}
          useStaticLabel
        />
      </div>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <Input
          id="price" 
          label="Monthly Rent" 
          type="number" 
          placeholder="₱"
          value={formData.price} 
          onChange={(e) => setFormData((prev: any) => ({ ...prev, price: e.target.value }))}
          errors={errors} 
          icon={DollarSign} 
          useStaticLabel
        />
        <Input
          id="roomCount" 
          label="Bedrooms" 
          type="number"
          value={formData.roomCount} 
          onChange={(e) => setFormData((prev: any) => ({ ...prev, roomCount: e.target.value }))}
          errors={errors} 
          icon={Bed} 
          useStaticLabel
        />
        <Input
          id="bathroomCount" 
          label="Bathrooms" 
          type="number"
          value={formData.bathroomCount} 
          onChange={(e) => setFormData((prev: any) => ({ ...prev, bathroomCount: e.target.value }))}
          errors={errors} 
          icon={Bath} 
          useStaticLabel
        />
        <Input
          id="guestCount" 
          label="Pax Capacity" 
          type="number"
          value={formData.guestCount} 
          onChange={(e) => setFormData((prev: any) => ({ ...prev, guestCount: e.target.value }))}
          errors={errors} 
          icon={Users} 
          useStaticLabel
        />
      </div>
      <div className="mt-10">
        <Textarea
          id="description"
          label="Property Narrative"
          value={formData.description}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
          rows={5}
          placeholder="Describe the soul of your property..."
        />
      </div>
    </PropertyFormSection>
  );
}
