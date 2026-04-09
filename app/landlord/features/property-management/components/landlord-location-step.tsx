import React, { useState, useRef } from 'react';
import Input from '@/components/inputs/Input';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { geocodeAddress, reverseGeocode } from '@/services/geocoding';
import { toast } from 'react-hot-toast';
import Switch from '@/components/inputs/Switch';

const Map = dynamic(() => import('@/components/common/Map'), { ssr: false });

interface LandlordLocationStepProps {
  register: any;
  errors: any;
  watch: any;
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
  const [isSearching, setIsSearching] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle map click for reverse geocoding
  const handleMapClick = async (lat: number, lng: number) => {
    // First, update the map center with the new location
    onLocationSelect(lat, lng);
    
    // Only auto-fill address fields if not in manual mode
    if (!isManualMode) {
      setIsSearching(true);
      try {
        // Show immediate feedback with coordinates while fetching address
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
        // Fallback to simple address with coordinates
        if (onAddressAutoFill) {
          onAddressAutoFill({
            address: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            city: 'Tarlac City',
            province: 'Tarlac',
            zipCode: '2300'
          });
        }
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Handle address input change - DISABLED auto-search for Landlord Dashboard
  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // We do nothing here except let the Input component handle its own value
    // This stops the broad "searching every time I type" behavior the user reported
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl p-6 border border-primary/20 dark:border-primary/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-primary/10">
            <MapPin className="w-6 h-6 text-primary dark:text-primary" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider">Property Location</h3>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest opacity-70">
              Pin your property's exact location on the map
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-700/50 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white flex items-center space-x-2">
                <Search className="w-5 h-5 text-gray-400" />
                <span>Location Details</span>
              </h4>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-800">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Manual Mode</span>
                <Switch 
                  checked={isManualMode}
                  onChange={setIsManualMode}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-start space-x-3">
                  <div className="flex-1 min-w-0">
                    <Input
                      label="Complete Address"
                      id="location.address"
                      type="text"
                      register={register}
                      errors={errors}
                      watch={watch}
                      required
                      placeholder="e.g. 123 Rizal St, Tarlac City"
                      useStaticLabel={true}
                      onChange={handleAddressChange}
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
                      className="mt-6 h-[56px] px-6 bg-primary dark:bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 min-w-[120px]"
                    >
                      {isSearching ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <><Search className="w-4 h-4" /><span>Search</span></>}
                    </button>
                  )}
                </div>
                {isSearching && !isManualMode && (
                  <div className="flex items-center space-x-2 mt-3 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-xl text-[10px] font-bold text-primary uppercase tracking-widest">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                    <span>Locating property...</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="City"
                  id="location.city"
                  type="text"
                  register={register}
                  errors={errors}
                  watch={watch}
                  required
                  placeholder="e.g. Tarlac City"
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
                  placeholder="e.g. Tarlac"
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
                placeholder="2300"
                useStaticLabel={true}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm h-full flex flex-col">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white flex items-center space-x-2 mb-6">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>Interactive Map</span>
            </h4>

            <div className="flex-1 min-h-[350px] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-inner">
              <Map
                center={mapCenter}
                onLocationSelect={onLocationSelect}
                onClick={handleMapClick}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-[0.05em] text-gray-400">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Click map to auto-fill
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Drag marker to adjust
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LandlordLocationStep;
