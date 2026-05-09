"use client";

import React, { useState } from 'react';
import { MapPin, Search, Navigation, Camera, Building2, ShieldCheck, Map as MapIcon, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { geocodeAddress, reverseGeocode } from "@/services/geocoding";
import { toast } from "react-hot-toast";
import { TAU_COORDINATES } from "@/utils/constants";
import Input from '../../inputs/Input';
import { cn } from '@/utils/helper';

const Map = dynamic(() => import("@/components/common/Map"), { ssr: false });
import Modal from '../../modals/Modal';
import SafeImage from '../../common/SafeImage';

interface PropertyEvidenceStepProps {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  facadeFile: File | null;
  setFacadeFile: (file: File | null) => void;
}

const PropertyEvidenceStep: React.FC<PropertyEvidenceStepProps> = ({
  register,
  errors,
  watch,
  setValue,
  facadeFile,
  setFacadeFile,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const address = watch("propertyEvidence.address");
  const latlng = watch("propertyEvidence.latlng") || TAU_COORDINATES;

  const handleMapClick = async (lat: number, lng: number) => {
    setValue("propertyEvidence.latlng", [lat, lng]);
    setIsSearching(true);
    try {
      const addressInfo = await reverseGeocode(lat, lng);
      if (addressInfo) {
        setValue("propertyEvidence.address", addressInfo.address);
        toast.dismiss();
        toast.success('Location synced!');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddressSearch = async () => {
    if (address && address.length > 5) {
      setIsSearching(true);
      try {
        const addressInfo = await geocodeAddress(address);
        if (addressInfo) {
          setValue("propertyEvidence.latlng", [addressInfo.coordinates[0], addressInfo.coordinates[1]]);
          setValue("propertyEvidence.address", addressInfo.address);
          toast.success('Location pinned!');
        } else {
          toast.error('Address not found');
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        toast.error('Search failed');
      } finally {
        setIsSearching(false);
      }
    } else {
      toast.error('Enter a valid address');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">Property Verification</h3>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">Step 3: Location & Appearance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          {/* Address Search */}
          <div className="space-y-2">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  id="propertyEvidence.address"
                  label="Establishment Address"
                  icon={MapPin as any}
                  register={register}
                  errors={errors}
                  watch={watch}
                  required={true}
                />
              </div>
              <button
                type="button"
                onClick={handleAddressSearch}
                disabled={isSearching}
                className="h-[52px] w-[52px] bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 mb-[2px] shrink-0"
              >
                {isSearching ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Search size={20} />}
              </button>
            </div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 px-1 uppercase tracking-tighter italic">
              Search by address or click the map to sync coordinates
            </p>
          </div>

          {/* Facade Upload */}
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">
              Property Facade Photo
            </label>
            <div 
              onClick={() => document.getElementById('facade-input')?.click()}
              className={cn(
                "group relative aspect-video rounded-[2rem] border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center justify-center",
                facadeFile ? "border-emerald-500 bg-emerald-50/10" : "border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5"
              )}
            >
              <input 
                id="facade-input" 
                type="file" 
                className="hidden" 
                onChange={(e) => setFacadeFile(e.target.files?.[0] || null)}
                accept="image/*"
              />
              
              {facadeFile ? (
                <>
                  <SafeImage 
                    src={URL.createObjectURL(facadeFile)} 
                    alt="Facade Preview"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center gap-2">
                       <Camera className="text-white" size={32} />
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">Click to Preview</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-primary">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                    <Building2 size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black uppercase tracking-widest">Upload Main Entrance</p>
                    <p className="text-[9px] font-bold opacity-60">Must clearly show establishment name</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Integration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="w-6 h-1 bg-primary rounded-full" />
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Location Pin</h4>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest">
              <Navigation size={12} className="animate-pulse" />
              <span>Real-time Sync</span>
            </div>
          </div>
          
          <div className="h-[300px] md:h-[400px] rounded-[2.5rem] overflow-hidden border-2 border-gray-100 dark:border-gray-800 shadow-xl relative group">
            <Map
              center={latlng}
              onLocationSelect={handleMapClick}
            />
            {isSearching && (
              <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Pinning...</span>
              </div>
            )}
            
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-lg flex items-center gap-4 z-10 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
               <div className="p-2 bg-primary/10 rounded-xl text-primary"><MapIcon size={18} /></div>
               <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Current Coordinates</p>
                  <p className="text-[11px] font-bold text-gray-900 dark:text-white tabular-nums">{latlng[0].toFixed(6)}, {latlng[1].toFixed(6)}</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <Modal 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)}
        width="lg"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
             <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Facade Preview</h4>
             <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                <X size={20} />
             </button>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-50">
            {facadeFile && <SafeImage src={URL.createObjectURL(facadeFile)} alt="Facade Preview" priority={true} />}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PropertyEvidenceStep;
