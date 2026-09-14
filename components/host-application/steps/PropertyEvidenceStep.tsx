"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Search, Navigation, Camera, Building2, ShieldCheck, Map as MapIcon, X, AlertCircle, Eye, Maximize2, Check, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import { geocodeAddress, reverseGeocode } from "@/services/geocoding";
import { toast } from "react-hot-toast";
import { TAU_COORDINATES } from "@/utils/constants";
import Input from '../../inputs/Input';
import { cn } from '@/utils/helper';
import { motion, AnimatePresence } from 'framer-motion';

const Map = dynamic(() => import("@/components/common/Map"), { ssr: false });
import { validateImageUpload } from '../HostApplicationUtils';
import MediaPreviewOverlay from '@/components/common/MediaPreviewOverlay';
import SafeImage from '../../common/SafeImage';

interface PropertyEvidenceStepProps {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  facadeFile: File | null;
  setFacadeFile: (file: File | null) => void;
  mode?: 'location' | 'facade' | 'all';
}

const PropertyEvidenceStep: React.FC<PropertyEvidenceStepProps> = ({
  register,
  errors,
  watch,
  setValue,
  facadeFile,
  setFacadeFile,
  mode = 'all',
}) => {
  const [mounted, setMounted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreenMapOpen, setIsFullscreenMapOpen] = useState(false);

  const address = watch("propertyEvidence.address");
  const latlng = watch("propertyEvidence.latlng") || TAU_COORDINATES;
  const businessName = watch("businessInfo.businessName");

  const facadePreviewUrl = useMemo(() => {
    if (!facadeFile) return null;
    return URL.createObjectURL(facadeFile);
  }, [facadeFile]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFacadeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const valResult = validateImageUpload(file, {
      maxSizeMB: 5,
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
    });

    if (valResult !== true) {
      toast.error(valResult);
      e.target.value = '';
      return;
    }

    setFacadeFile(file);
    toast.success('Facade photo uploaded successfully!');
  };

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

  const renderFacadeUpload = () => (
    <div className="space-y-3 w-full">
      <label className={cn(
        "block text-[11px] font-black uppercase tracking-widest px-1 text-left transition-colors",
        errors?.propertyEvidence?.facadePhotoUrl ? "text-red-500" : "text-gray-500 dark:text-gray-400"
      )}>
        Property Facade Photo <span className="text-red-500">*</span>
      </label>
      <div 
        onClick={() => {
          if (facadeFile) {
            setShowPreview(true);
          } else {
            document.getElementById('facade-input')?.click();
          }
        }}
        className={cn(
          "group relative aspect-video rounded-[2rem] border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center justify-center min-h-[220px]",
          facadeFile 
            ? "border-primary bg-primary/10 shadow-md" 
            : errors?.propertyEvidence?.facadePhotoUrl
            ? "border-red-500 dark:border-red-500 bg-red-50/30 dark:bg-red-950/30 ring-4 ring-red-500/20"
            : "border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5"
        )}
      >
        <input 
          id="facade-input" 
          type="file" 
          className="hidden" 
          onChange={handleFacadeFileChange}
          accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
        />
        
        {facadeFile && facadePreviewUrl ? (
          <div className="relative w-full h-full group">
            <SafeImage 
              src={facadePreviewUrl} 
              alt="Facade Preview"
              className="w-full h-full object-cover rounded-[1.8rem]"
            />
            
            {/* Action Controls on Hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 p-4 z-20">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPreview(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-widest border border-white/30 flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Eye size={16} />
                <span>View Fullscreen</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('facade-input')?.click();
                }}
                className="px-4 py-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-widest border border-white/20 flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Camera size={16} />
                <span>Change Photo</span>
              </button>
            </div>

            {/* Top Right Quick Preview Badge */}
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPreview(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md text-white border border-white/20 shadow-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-primary-hover transition-colors cursor-pointer"
              >
                <Eye size={12} className="text-primary-light" />
                <span>Tap to Preview</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-primary">
            <div className={cn(
              "p-4 rounded-2xl border shadow-sm transition-all",
              errors?.propertyEvidence?.facadePhotoUrl
                ? "bg-red-100/50 dark:bg-red-950/30 border-red-200 text-red-500"
                : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 group-hover:bg-primary/10 group-hover:border-primary/20"
            )}>
              <Building2 size={32} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-black uppercase tracking-widest">Upload Main Entrance</p>
              <p className="text-[9px] font-bold opacity-60">Must clearly show establishment name</p>
              <div className="pt-1 flex items-center justify-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-tight">1 Image Max</span>
                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-tight">JPG, PNG, WEBP</span>
                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-tight">Max 5MB</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {errors?.propertyEvidence?.facadePhotoUrl && (
        <div className="flex items-center gap-1.5 text-red-500 font-extrabold text-xs pt-1 px-1 text-left">
          <AlertCircle size={14} className="shrink-0 text-red-500" />
          <span className="uppercase tracking-wide text-[11px]">
            {errors.propertyEvidence.facadePhotoUrl.message || "Facade photo of main entrance is required"}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {mode === 'all' && (
        <div className="text-center">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">Property Verification</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">Step 3: Location & Appearance</p>
        </div>
      )}

      {mode === 'facade' ? (
        renderFacadeUpload()
      ) : (
        /* Location / Address + Map Search (All Mode) */
        <div className={cn("grid gap-6 items-start", mode === 'all' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
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
                    useStaticLabel={true}
                    placeholder="e.g. San Jose, Camiling, Tarlac (Near TAU Gate 1)"
                    validationRules={{
                      required: "Establishment address is required",
                    }}
                    onChange={(e) => {
                      setValue("propertyEvidence.address", e.target.value, { shouldValidate: true });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddressSearch();
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  disabled={isSearching}
                  className="h-[52px] w-[52px] bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 mb-[2px] shrink-0 cursor-pointer"
                >
                  {isSearching ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Search size={20} />}
                </button>
              </div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 px-1 uppercase tracking-tighter italic">
                Search by address or click the map to sync coordinates
              </p>
            </div>

            {/* Facade Upload */}
            {mode === 'all' && renderFacadeUpload()}
          </div>

          {/* Map Integration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <div className="w-6 h-1 bg-primary rounded-full" />
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Location Pin</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreenMapOpen(true)}
                className="flex items-center gap-1.5 text-[9px] font-black text-primary hover:underline uppercase tracking-widest transition-colors cursor-pointer"
              >
                <Sparkles size={12} />
                <span>Fullscreen View</span>
              </button>
            </div>
            
            <div className="h-[260px] sm:h-[300px] md:h-[400px] rounded-[2.5rem] overflow-hidden border-2 border-gray-100 dark:border-gray-800 shadow-xl relative group">
              <Map
                center={latlng}
                onLocationSelect={handleMapClick}
                title={businessName || "Property Location"}
                imageSrc={facadePreviewUrl || undefined}
              />

              {/* ⤢ Top Right Expand Icon Button */}
              <button
                type="button"
                onClick={() => setIsFullscreenMapOpen(true)}
                title="Expand Map"
                className="absolute top-3 right-3 z-[400] p-2.5 bg-white/90 dark:bg-gray-900/90 hover:bg-primary hover:text-white dark:hover:bg-primary backdrop-blur-md text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer"
              >
                <Maximize2 size={16} />
              </button>

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
      )}

      {/* 🌐 PRECISION MAP LOCATION MODAL (Portaled directly to document.body) */}
      {mounted && createPortal(
        <AnimatePresence>
          {isFullscreenMapOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] bg-slate-950/70 dark:bg-black/80 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 md:p-8"
              onClick={() => setIsFullscreenMapOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-5xl h-full sm:h-[85vh] min-h-screen sm:min-h-[550px] bg-white dark:bg-gray-900 border-0 sm:border border-gray-200 dark:border-gray-800 rounded-none sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
              >
                {/* 1. Header */}
                <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl sm:rounded-2xl text-primary shadow-inner shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        Precision Map Location Pinning
                      </h3>
                      <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 mt-0.5">
                        Click anywhere or drag pin to set coordinates
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFullscreenMapOpen(false)}
                    className="p-2 sm:p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shrink-0 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* 2. Map Canvas */}
                <div className="flex-1 w-full relative bg-gray-100 dark:bg-gray-950 overflow-hidden">
                  <Map
                    center={latlng}
                    onLocationSelect={(lat, lng) => handleMapClick(lat, lng)}
                    onClick={(lat, lng) => handleMapClick(lat, lng)}
                    title={businessName || 'Property Location'}
                    imageSrc={facadePreviewUrl || undefined}
                  />

                  {/* Coordinates Badge */}
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-[400] max-w-[calc(100%-40px)] truncate bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl text-[10px] sm:text-xs font-black text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                    <span className="truncate">Lat: {latlng[0].toFixed(6)}, Lng: {latlng[1].toFixed(6)}</span>
                  </div>
                </div>

                {/* 3. Footer */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/80 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="w-full md:w-auto px-3.5 py-1.5 sm:px-4 sm:py-2 bg-primary/10 border border-primary/20 rounded-xl sm:rounded-2xl text-primary text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2">
                    <Check size={14} />
                    <span>Selected: {latlng[0].toFixed(6)}, {latlng[1].toFixed(6)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFullscreenMapOpen(false);
                      toast.success('Location pin confirmed!');
                    }}
                    className="w-full md:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-primary hover:bg-primary/90 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Confirm Pin Location</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Image Preview Overlay */}
      <MediaPreviewOverlay 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)}
        images={facadePreviewUrl ? [facadePreviewUrl] : []}
        currentIndex={0}
        title="Property Facade Preview"
      />
    </div>
  );
};

export default PropertyEvidenceStep;
