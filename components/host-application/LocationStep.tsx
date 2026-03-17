import React, { useState, useRef } from 'react';
import Input from '../inputs/Input';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { geocodeAddress, reverseGeocode } from '@/services/geocoding';
import { toast } from 'react-hot-toast';

const Map = dynamic(() => import('../common/Map'), { ssr: false });

interface LocationStepProps {
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

const LocationStep: React.FC<LocationStepProps> = ({
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

  // Handle address input change
  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;

    // If in manual mode, just update the address without geocoding
    if (isManualMode) {
      return;
    }

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only search if address is long enough and user has stopped typing
    if (address.length > 5) {
      setIsSearching(true);
      debounceTimerRef.current = setTimeout(async () => {
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
          } else {
            toast.error('Address not found. Please try a different address.');
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          toast.error('Unable to connect to location service. Please try again later.');
        } finally {
          setIsSearching(false);
        }
      }, 800); // Wait 800ms after last keystroke before searching
    } else if (address.length === 0) {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="bg-gradient-to-r from-blue/10 to-blue/5 dark:from-blue/20 dark:to-blue/10 rounded-xl p-6 border border-blue/20 dark:border-blue/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3">
          <MapPin className="w-6 h-6 text-blue dark:text-blue" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Property Location</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Where is your property located?
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
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Address Details</span>
              </h4>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isManualMode}
                  onChange={(e) => setIsManualMode(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Manual Address</span>
              </label>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex space-x-2">
                  <Input
                    label="Complete Address"
                    id="location.address"
                    type="text"
                    register={register}
                    errors={errors}
                    watch={watch}
                    required
                    placeholder="Enter full address including street, barangay, etc."
                    useStaticLabel={true}
                    onChange={handleAddressChange}
                    validationRules={{
                      required: "Address is required",
                      minLength: { value: 10, message: "Address must be at least 10 characters" }
                    }}
                  />
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
                              toast.success('Location found on map!');
                            } else {
                              toast.error('Address not found. Please try a different address.');
                            }
                          } catch (error) {
                            console.error('Geocoding error:', error);
                            toast.error('Unable to connect to location service. Please try again later.');
                          } finally {
                            setIsSearching(false);
                          }
                        } else {
                          toast.error('Please enter a valid address to search');
                        }
                      }}
                      className="mt-8 px-4 py-2 bg-primary dark:bg-primary text-white rounded-lg hover:bg-primary-hover dark:hover:bg-primary-hover transition-colors flex items-center space-x-2"
                    >
                      {isSearching ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Searching...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>Search</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                {isSearching && !isManualMode && (
                  <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span>Searching address...</span>
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
                  placeholder="e.g. Cebu City"
                  useStaticLabel={true}
                  validationRules={{
                    required: "City is required",
                    minLength: { value: 2, message: "City name must be at least 2 characters" }
                  }}
                />
                <Input
                  label="Province"
                  id="location.province"
                  type="text"
                  register={register}
                  errors={errors}
                  watch={watch}
                  required
                  placeholder="e.g. Cebu"
                  useStaticLabel={true}
                  validationRules={{
                    required: "Province is required",
                    minLength: { value: 2, message: "Province name must be at least 2 characters" }
                  }}
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
                placeholder="e.g. 6000"
                useStaticLabel={true}
                validationRules={{
                  required: "Zip code is required",
                  pattern: {
                    value: /^\d{4,5}$/,
                    message: "Please enter a valid 4 or 5-digit zip code"
                  }
                }}
              />
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start space-x-3">
              <Navigation className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Location Accuracy</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Please ensure your address and coordinates are accurate. This helps tenants find your property and improves your search ranking.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Property on Map</span>
            </h4>

            <div className="h-[350px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <Map
                center={mapCenter}
                onLocationSelect={onLocationSelect}
                onClick={handleMapClick}
              />
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>• Drag the marker to adjust the exact location</p>
              <p>• Click on the map to auto-fill address fields</p>
              {!isManualMode && <p>• Type address in input field to search location</p>}
              {isManualMode && <p>• In manual mode, you can edit address fields directly</p>}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Important Location Tips</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Properties near universities, public transportation, and commercial areas tend to attract more tenants. Make sure your location information is accurate and complete.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LocationStep;
