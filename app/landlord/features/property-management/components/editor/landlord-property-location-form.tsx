'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Search, Globe, Navigation, Search as SearchIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { PropertyFormSection } from './shared-ui';
import Input from '@/components/inputs/Input';
import Switch from '@/components/inputs/Switch';
import { reverseGeocode } from '@/services/geocoding';
import { toast } from 'sonner';

const Map = dynamic(() => import('@/components/common/Map'), { ssr: false });

interface LandlordPropertyLocationFormProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
  setActiveSection: (id: string) => void;
  saveHistory: () => void;
}

export function LandlordPropertyLocationForm({
  formData,
  setFormData,
  errors,
  setActiveSection,
  saveHistory
}: LandlordPropertyLocationFormProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);

  const handleMapClick = async (lat: number, lng: number) => {
    saveHistory();
    setFormData((prev: any) => ({ ...prev, latlng: [lng, lat] }));
    
    if (!isManualMode) {
      setIsSearching(true);
      try {
        const addressInfo = await reverseGeocode(lat, lng);
        if (addressInfo) {
          setFormData((prev: any) => ({
            ...prev,
            address: addressInfo.address,
            city: addressInfo.city,
            region: addressInfo.province,
            zipCode: addressInfo.zipCode
          }));
        }
      } catch (error) {
        toast.error('Could not fetch address for this point.');
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Auto-fill address on initial load if we have coordinates but no address
  React.useEffect(() => {
    const triggerAutoFill = async () => {
      if (formData.latlng?.length === 2 && !formData.address && !isSearching) {
        setIsSearching(true);
        try {
          const addressInfo = await reverseGeocode(formData.latlng[1], formData.latlng[0]);
          if (addressInfo) {
            setFormData((prev: any) => ({
              ...prev,
              address: addressInfo.address,
              city: addressInfo.city,
              region: addressInfo.province,
              zipCode: addressInfo.zipCode
            }));
          }
        } catch (error) {
          console.error('Initial geocoding failed');
        } finally {
          setIsSearching(false);
        }
      }
    };
    triggerAutoFill();
  }, [formData.latlng, formData.address, isSearching, setFormData]);

  return (
    <PropertyFormSection 
      id="location" 
      title="Geographical Data" 
      icon={Globe} 
      description="Pinpoint the exact physical coordinate of your property" 
      setActiveSection={setActiveSection}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none"
          >
            <div className="flex items-center justify-between mb-10">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
                <div className="w-8 h-[2px] bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                Address Refinement
              </h4>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Manual Mode</span>
                <Switch 
                  checked={isManualMode}
                  onChange={setIsManualMode}
                />
              </div>
            </div>

            <div className="space-y-8">
              <div className="relative group">
                <Input
                  id="address"
                  label="Precise Address"
                  value={formData.address}
                  onChange={(e: any) => setFormData((prev: any) => ({ ...prev, address: e.target.value }))}
                  errors={errors}
                  placeholder="Building, Street, Barangay"
                  useStaticLabel
                  disabled={isSearching && !isManualMode}
                  className="h-14 bg-gray-50 dark:bg-gray-800/50 border-2"
                />
                {isSearching && !isManualMode && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <Input
                  id="city"
                  label="City / Municipality"
                  value={formData.city}
                  onChange={(e: any) => setFormData((prev: any) => ({ ...prev, city: e.target.value }))}
                  errors={errors}
                  useStaticLabel
                  className="h-14 bg-gray-50 dark:bg-gray-800/50 border-2"
                />
                <Input
                  id="zipCode"
                  label="Zip Code"
                  value={formData.zipCode}
                  onChange={(e: any) => setFormData((prev: any) => ({ ...prev, zipCode: e.target.value }))}
                  errors={errors}
                  useStaticLabel
                  className="h-14 bg-gray-50 dark:bg-gray-800/50 border-2"
                />
              </div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-6 bg-gradient-to-br from-blue-600/5 to-primary/5 rounded-[1.5rem] border border-blue-600/10 flex items-center gap-5"
              >
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center text-blue-600 rotate-3">
                  <Navigation size={20} className="animate-pulse" />
                </div>
                <div>
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">Satellite Coordinates</h5>
                  <p className="text-[12px] font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">
                    {formData.latlng?.[1]?.toFixed(7) || '0.0000000'} N, {formData.latlng?.[0]?.toFixed(7) || '0.0000000'} E
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          <div className="p-10 bg-emerald-500/5 rounded-[2.5rem] border border-emerald-500/10 flex items-start gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:scale-150 transition-transform duration-700">
              <MapPin size={80} />
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 relative z-10">
              <Sparkles size={20} />
            </div>
            <div className="relative z-10">
              <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">Conversion Optimizer</h5>
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 leading-relaxed uppercase tracking-tight">
                Accurate map markers improve inquiry rates by <span className="text-emerald-600">up to 40%</span>. Your pin determines your search ranking in local radius queries.
              </p>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-[600px] lg:h-auto min-h-[600px] relative rounded-[3rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-900/5 dark:shadow-none group"
        >
          <Map 
            center={formData.latlng?.length === 2 ? [formData.latlng[1], formData.latlng[0]] as [number, number] : [15.483, 120.592] as [number, number]}
            onClick={handleMapClick}
          />
          <div className="absolute top-8 right-8 z-10">
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-white/20 dark:border-gray-800 rounded-[1.5rem] shadow-2xl flex items-center gap-4 border border-gray-100 dark:border-gray-700"
            >
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping absolute inset-0" />
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full relative" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Active Precision Sync</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PropertyFormSection>
  );
}
