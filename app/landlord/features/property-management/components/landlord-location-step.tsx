'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Input from '@/components/inputs/Input';
import dynamic from 'next/dynamic';
import { MapPin, Search, Maximize2, X, Check, Sparkles, AlertCircle, Compass, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { geocodeAddress, reverseGeocode } from '@/services/geocoding';
import { toast } from 'react-hot-toast';
import Switch from '@/components/inputs/Switch';

const Map = dynamic(() => import('@/components/common/Map'), { ssr: false });

interface LandlordLocationStepProps {
  register: any;
  errors: any;
  watch: any;
  control?: any;
  mapCenter: [number, number];
  onLocationSelect: (lat: number, lng: number) => void;
  onAddressAutoFill?: (address: {
    address: string;
    city: string;
    province: string;
    zipCode: string;
  }) => void;
}

const LandlordLocationStep: React.FC<LandlordLocationStepProps> = ({
  register,
  errors,
  watch,
  mapCenter,
  onLocationSelect,
  onAddressAutoFill
}) => {
  const [mounted, setMounted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [isFullscreenMapOpen, setIsFullscreenMapOpen] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasLocationError = !!(
    errors?.location?.address ||
    errors?.location?.city ||
    errors?.location?.province ||
    errors?.location?.zipCode
  );

  // Handle map click for reverse geocoding
  const handleMapClick = async (lat: number, lng: number) => {
    onLocationSelect(lat, lng);
    
    if (!isManualMode) {
      setIsSearching(true);
      try {
        if (onAddressAutoFill) {
          onAddressAutoFill({
            address: `Locating... (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
            city: '',
            province: '',
            zipCode: ''
          });
        }

        const addressInfo = await reverseGeocode(lat, lng);

        if (addressInfo && onAddressAutoFill) {
          onAddressAutoFill({
            address: addressInfo.address,
            city: addressInfo.city,
            province: addressInfo.province,
            zipCode: addressInfo.zipCode
          });
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        if (onAddressAutoFill) {
          onAddressAutoFill({
            address: `Location near TAU Camiling (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            city: 'Camiling',
            province: 'Tarlac',
            zipCode: '2370'
          });
        }
      } finally {
        setIsSearching(false);
      }
    }
  };

  const currentLat = mapCenter?.[0] || 15.6980;
  const currentLng = mapCenter?.[1] || 120.4285;

  return (
    <div className="space-y-4 sm:space-y-8" id="location.address">
      {/* Banner */}
      <motion.div
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 rounded-none sm:rounded-3xl p-4 sm:p-8 border-x-0 sm:border border-primary/20 shadow-sm"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2.5 sm:p-3.5 bg-primary/10 rounded-xl sm:rounded-2xl text-primary shadow-inner shrink-0">
            <MapPin className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs sm:text-base">
              Step 2: Property Location & Precision Map
            </h3>
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 leading-snug">
              Pin your property's exact coordinates relative to TAU Campus colleges and Camiling landmarks
            </p>
          </div>
        </div>
      </motion.div>

      {/* 2-Column Main Layout */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Left Column: Form Inputs */}
        <div className={`bg-white dark:bg-gray-800 rounded-none sm:rounded-[2.5rem] p-4 sm:p-10 border-x-0 sm:border-2 transition-all space-y-5 sm:space-y-8 ${
          hasLocationError
            ? "border-rose-500 ring-4 ring-rose-500/10 bg-rose-500/5 shadow-rose-500/10"
            : "border-gray-200 dark:border-gray-700 shadow-sm"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-4 sm:pb-5">
            <div className="flex items-center space-x-3">
              <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${hasLocationError ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"}`}>
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className={`text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] ${hasLocationError ? "text-rose-500" : "text-gray-900 dark:text-white"}`}>
                  Location Details {hasLocationError && <span className="text-rose-500 ml-0.5">*</span>}
                </h4>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                  Enter your property's street address, town, and zip code
                </p>
              </div>
            </div>
            
            <div className="self-start sm:self-auto flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-2xl border border-gray-200 dark:border-gray-700">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Manual Mode</span>
              <Switch 
                checked={isManualMode}
                onChange={setIsManualMode}
              />
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <Input
                    label="Complete Address"
                    id="location.address"
                    type="text"
                    register={register}
                    errors={errors}
                    watch={watch}
                    required
                    placeholder="e.g. Maligaya, Camiling, Tarlac (Near TAU Main Gate)"
                    useStaticLabel={true}
                    className="rounded-2xl"
                    validationRules={{
                      required: "Address is required",
                      minLength: { value: 10, message: "Address must be at least 10 characters" }
                    }}
                  />
                </div>
                {isManualMode && (
                  <button
                    type="button"
                    onClick={async () => {
                      const address = watch('location.address');
                      if (address && address.length > 5) {
                        setIsSearching(true);
                        try {
                          const addressInfo = await geocodeAddress(address);
                          if (addressInfo) {
                            onLocationSelect(addressInfo.coordinates[0], addressInfo.coordinates[1]);
                            if (onAddressAutoFill) {
                              onAddressAutoFill({
                                address: addressInfo.address,
                                city: addressInfo.city,
                                province: addressInfo.province,
                                zipCode: addressInfo.zipCode
                              });
                            }
                            toast.success('Location found!');
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
                    }}
                    className="w-full sm:w-auto mt-0 sm:mt-6 h-[50px] sm:h-[56px] px-6 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 min-w-[120px]"
                  >
                    {isSearching ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <><Search className="w-4 h-4" /><span>Search</span></>}
                  </button>
                )}
              </div>
              {isSearching && !isManualMode && (
                <div className="flex items-center space-x-2 mt-3 px-4 py-2 bg-primary/10 rounded-xl text-[10px] font-bold text-primary uppercase tracking-widest">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
                  <span>Locating property on map...</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="City / Municipality"
                id="location.city"
                type="text"
                register={register}
                errors={errors}
                watch={watch}
                required
                placeholder="Camiling"
                useStaticLabel={true}
              />
              <Input
                label="Province"
                id="location.province"
                type="text"
                register={register}
                errors={errors}
                watch={watch}
                required
                placeholder="Tarlac"
                useStaticLabel={true}
              />
            </div>

            <Input
              label="Zip Code"
              id="location.zipCode"
              type="text"
              register={register}
              errors={errors}
              watch={watch}
              required
              placeholder="2370"
              useStaticLabel={true}
            />
          </div>
        </div>

        {/* Right Column: Interactive Map with Top-Right Expand Icon */}
        <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-[2.5rem] p-4 sm:p-10 border-x-0 sm:border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gray-900 dark:text-white flex items-center space-x-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span>Interactive Map & Pin</span>
              </h4>
            </div>

            {/* Map Canvas */}
            <div className="h-[260px] sm:h-[340px] rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner relative group">
              <Map
                center={mapCenter}
                onLocationSelect={onLocationSelect}
                onClick={handleMapClick}
                title={watch('propertyInfo.propertyName') || watch('title') || 'Property Location'}
                imageSrc={typeof watch('images[0]') === 'object' ? watch('images[0]?.url') : watch('images[0]') || watch('imageSrc')}
              />

              {/* ⤢ Top Right Expand Icon Button */}
              <button
                type="button"
                onClick={() => setIsFullscreenMapOpen(true)}
                title="Expand Map"
                className="absolute top-3 right-3 z-[400] p-2.5 bg-white/90 dark:bg-gray-900/90 hover:bg-primary hover:text-white dark:hover:bg-primary backdrop-blur-md text-gray-700 dark:text-gray-200 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg transition-all hover:scale-110 active:scale-95"
              >
                <Maximize2 size={16} />
              </button>

              {/* Bottom Left Coordinates Badge (Clears Leaflet Zoom Controls) */}
              <div className="absolute bottom-3 left-3 z-[400] max-w-[calc(100%-60px)] truncate bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md text-[9px] sm:text-[10px] font-black text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${mapCenter && mapCenter.length === 2 && mapCenter[0] !== 0 ? "bg-primary animate-pulse" : "bg-amber-500"}`} />
                <span className="truncate">
                  {mapCenter && mapCenter.length === 2 && mapCenter[0] !== 0
                    ? `Lat: ${mapCenter[0].toFixed(4)}, Lng: ${mapCenter[1].toFixed(4)}`
                    : "No pin set — click map to select location"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[9px] font-black uppercase tracking-wider text-gray-400">
            <div className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Click map to position pin
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreenMapOpen(true)}
              className="text-primary hover:underline font-extrabold flex items-center gap-1"
            >
              <Sparkles size={12} />
              <span>Fullscreen View</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 🌐 PRECISION MAP LOCATION MODAL (Portaled directly to document.body) */}
      {mounted && createPortal(
        <AnimatePresence>
          {isFullscreenMapOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] bg-slate-900/20 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-8"
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
                {/* 1. Integrated Header */}
                <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl sm:rounded-2xl text-primary shadow-inner shrink-0">
                      <MapPin size={20} className="sm:w-5 sm:h-5" />
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
                    className="p-2 sm:p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* 2. Map Canvas Filling Middle Space */}
                <div className="flex-1 w-full relative bg-gray-100 dark:bg-gray-950 overflow-hidden">
                  <Map
                    center={mapCenter}
                    onLocationSelect={onLocationSelect}
                    onClick={handleMapClick}
                    title={watch('propertyInfo.propertyName') || watch('title') || 'Property Location'}
                    imageSrc={typeof watch('images[0]') === 'object' ? watch('images[0]?.url') : watch('images[0]') || watch('imageSrc')}
                  />

                  {/* Bottom Left Coordinates Badge inside Map */}
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-[400] max-w-[calc(100%-40px)] truncate bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl text-[10px] sm:text-xs font-black text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                    <span className="truncate">Lat: {currentLat.toFixed(6)}, Lng: {currentLng.toFixed(6)}</span>
                  </div>
                </div>

                {/* 3. Integrated Footer */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/80 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="w-full md:w-auto px-3.5 py-1.5 sm:px-4 sm:py-2 bg-primary/10 border border-primary/20 rounded-xl sm:rounded-2xl text-primary text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2">
                    <Check size={14} className="sm:w-4 sm:h-4" />
                    <span>Selected: {currentLat.toFixed(6)}, {currentLng.toFixed(6)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFullscreenMapOpen(false);
                      toast.success('Location pin confirmed!');
                    }}
                    className="w-full md:w-auto px-6 py-2.5 sm:px-8 sm:py-3 bg-primary hover:bg-primary/90 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <Check size={14} className="sm:w-4 sm:h-4" />
                    <span>Confirm Pin Location</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default LandlordLocationStep;
