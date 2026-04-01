'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { PropertyFormSection, LocalCheckbox } from './shared-ui';

interface LandlordPropertyRulesConfigProps {
  formData: any;
  setFormData: (data: any) => void;
  setActiveSection: (id: string) => void;
}

export function LandlordPropertyRulesConfig({
  formData,
  setFormData,
  setActiveSection
}: LandlordPropertyRulesConfigProps) {
  return (
    <PropertyFormSection 
      id="config" 
      title="Listing Rules" 
      icon={ShieldCheck} 
      description="Security & occupancy conditions" 
      setActiveSection={setActiveSection}
    >
      <div className="space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <LocalCheckbox 
            id="femaleOnly" 
            label="Female Only" 
            checked={formData.rules.femaleOnly} 
            onChange={() => setFormData((prev: any) => ({ ...prev, rules: { ...prev.rules, femaleOnly: !prev.rules.femaleOnly, maleOnly: false } }))}
          />
          <LocalCheckbox 
            id="maleOnly" 
            label="Male Only" 
            checked={formData.rules.maleOnly} 
            onChange={() => setFormData((prev: any) => ({ ...prev, rules: { ...prev.rules, maleOnly: !prev.rules.maleOnly, femaleOnly: false } }))}
          />
          <LocalCheckbox 
            id="visitorsAllowed" 
            label="Visitors Allowed" 
            checked={formData.rules.visitorsAllowed} 
            onChange={() => setFormData((prev: any) => ({ ...prev, rules: { ...prev.rules, visitorsAllowed: !prev.rules.visitorsAllowed } }))}
          />
          <LocalCheckbox 
            id="petsAllowed" 
            label="Pets Allowed" 
            checked={formData.rules.petsAllowed} 
            onChange={() => setFormData((prev: any) => ({ ...prev, rules: { ...prev.rules, petsAllowed: !prev.rules.petsAllowed } }))}
          />
          <LocalCheckbox 
            id="smokingAllowed" 
            label="Smoking Allowed" 
            checked={formData.rules.smokingAllowed} 
            onChange={() => setFormData((prev: any) => ({ ...prev, rules: { ...prev.rules, smokingAllowed: !prev.rules.smokingAllowed } }))}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-800 pt-10">
          <LocalCheckbox 
            id="security24h" 
            label="24/7 Security" 
            checked={formData.features.security24h} 
            onChange={() => setFormData((prev: any) => ({ ...prev, features: { ...prev.features, security24h: !prev.features.security24h } }))}
          />
          <LocalCheckbox 
            id="cctv" 
            label="CCTV Surveillance" 
            checked={formData.features.cctv} 
            onChange={() => setFormData((prev: any) => ({ ...prev, features: { ...prev.features, cctv: !prev.features.cctv } }))}
          />
          <LocalCheckbox 
            id="fireSafety" 
            label="Fire Safety Kit" 
            checked={formData.features.fireSafety} 
            onChange={() => setFormData((prev: any) => ({ ...prev, features: { ...prev.features, fireSafety: !prev.features.fireSafety } }))}
          />
          <LocalCheckbox 
            id="nearTransport" 
            label="Near Public Transport" 
            checked={formData.features.nearTransport} 
            onChange={() => setFormData((prev: any) => ({ ...prev, features: { ...prev.features, nearTransport: !prev.features.nearTransport } }))}
          />
          <LocalCheckbox 
            id="studyFriendly" 
            label="Study Environment" 
            checked={formData.features.studyFriendly} 
            onChange={() => setFormData((prev: any) => ({ ...prev, features: { ...prev.features, studyFriendly: !prev.features.studyFriendly } }))}
          />
          <LocalCheckbox 
            id="quietEnvironment" 
            label="Quiet Zone" 
            checked={formData.features.quietEnvironment} 
            onChange={() => setFormData((prev: any) => ({ ...prev, features: { ...prev.features, quietEnvironment: !prev.features.quietEnvironment } }))}
          />
        </div>
      </div>
    </PropertyFormSection>
  );
}
