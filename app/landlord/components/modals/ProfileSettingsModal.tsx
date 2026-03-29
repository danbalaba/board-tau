'use client';

import React, { useState } from 'react';
import { Modal } from '@/app/admin/components/ui/modal';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Label } from '@/app/admin/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/admin/components/ui/avatar';
import { 
  IconUser, 
  IconMail, 
  IconPhone, 
  IconMapPin, 
  IconCamera,
  IconAt,
  IconId,
  IconSearch
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { Switch } from '@/app/admin/components/ui/switch';
import dynamic from 'next/dynamic';
import { geocodeAddress, reverseGeocode } from '@/services/geocoding';
import { validateName, validatePhoneNumber } from '@/lib/validators';
import { useEdgeStore } from '@/lib/edgestore';
import { Loader2 } from 'lucide-react';

const Map = dynamic(() => import('@/components/common/Map'), { ssr: false });

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
}

const profileSchema = z.object({
  name: z.string().refine((val) => {
    const error = validateName(val);
    return !error;
  }, {
    message: "Invalid name format"
  }),
  phone: z.string().refine((val) => {
    if (!val) return true;
    const error = validatePhoneNumber(val);
    return !error;
  }, {
    message: "Please enter a valid Philippine mobile number"
  }),
  address: z.string().min(1, 'Address is required'),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileSettingsModal({ isOpen, onClose, user }: ProfileSettingsModalProps) {
  const { success, error: toastError, loading } = useResponsiveToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentImageUrl, setCurrentImageUrl] = useState(user.image);
  const [mapCenter, setMapCenter] = useState<[number, number]>([15.635189, 120.415343]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const { edgestore } = useEdgeStore();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      phone: '',
      address: '',
      bio: '',
    },
  });

  const addressValue = watch('address');

  // Handle map click for address selection
  const handleMapClick = async (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    setIsSearching(true);
    try {
      const addressInfo = await reverseGeocode(lat, lng);
      if (addressInfo) {
        setValue('address', addressInfo.address, { shouldValidate: true });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      toastError('Failed to fetch address for the selected location');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchAddress = async (silent: boolean = false) => {
    if (!addressValue || addressValue.length < 2) {
      if (!silent) toastError('Please enter a more specific address to search');
      return;
    }

    setIsSearching(true);
    try {
      const addressInfo = await geocodeAddress(addressValue);
      if (addressInfo) {
        setMapCenter(addressInfo.coordinates);
        // Important: setValue with shouldValidate: true but without triggering the watch again uncontrollably
        setValue('address', addressInfo.address, { shouldValidate: true });
        if (!silent) success('Location found on map!');
      } else {
        if (!silent) toastError('Address not found. Please try a more specific search.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      if (!silent) toastError('Failed to locate address on map');
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search effect
  React.useEffect(() => {
    // Search automatically if manual mode is enabled
    if (isManualMode && addressValue && addressValue.length >= 2) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        handleSearchAddress(true); // Search silently in manual mode
      }, 1000); // 1s debounce
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [addressValue, isManualMode]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toastError('Image must be less than 2MB');
        return;
      }

      setIsUploading(true);
      try {
        const res = await edgestore.publicFiles.upload({
          file,
          onProgressChange: (progress) => {
            setUploadProgress(progress);
          },
        });
        setCurrentImageUrl(res.url);
        success('Profile picture uploaded!');
      } catch (err) {
        console.error('Upload error:', err);
        toastError('Failed to upload image');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    loading('Synchronizing profile details...');
    try {
      // Simulate API call with the updated image URL
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Profile Data:', { ...data, image: currentImageUrl });
      
      success('Profile updated successfully!');
      onClose();
    } catch (error) {
      toastError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Profile Details"
      description="Update your personal information"
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-1 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
        <div className="space-y-6">
          {/* Profile Picture Section - More compact */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6 bg-gray-50/50 dark:bg-gray-800/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-purple-500 p-1 shadow-lg transition-transform duration-500">
                <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[18px] overflow-hidden relative">
                  <Avatar className="w-full h-full rounded-none">
                    {currentImageUrl && (
                      <AvatarImage src={currentImageUrl} alt={user.name || 'User'} className="object-cover" />
                    )}
                    <AvatarFallback className="bg-transparent text-primary text-xl font-black">
                      {user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-20 backdrop-blur-[2px]">
                      <Loader2 className="w-8 h-8 animate-spin text-white mb-1" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">{Math.round(uploadProgress)}%</span>
                    </div>
                  )}
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <button 
                type="button" 
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 text-primary hover:bg-primary hover:text-white transition-all transform group-hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <IconCamera size={14} />}
              </button>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-0.5">
                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  {user.name || 'Landlord'}
                </h3>
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
                {user.role} • Visible across listings
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <button 
                  type="button" 
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 rounded-xl px-4 text-[11px] font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 transition-all"
                >
                  {isUploading ? "Uploading..." : "Update Photo"}
                </button>
                <button 
                  type="button" 
                  className="h-8 rounded-xl px-4 text-[11px] font-bold text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                  onClick={() => {
                    setCurrentImageUrl('');
                    success('Profile picture removed');
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          {/* Input Fields Grid - More compact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</Label>
              <div className="relative group">
                <IconId className={cn("absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors", errors.name ? "text-red-500" : "text-gray-400")} />
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Full name"
                  className={cn(
                    "pl-11 h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:ring-4 transition-all font-medium text-sm",
                    errors.name ? "border-red-500/50 focus:ring-red-500/10" : "focus:ring-primary/5"
                  )}
                />
              </div>
              {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</Label>
              <div className="relative group">
                <IconAt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 opacity-50" />
                <Input
                  id="email"
                  type="email"
                  defaultValue={user.email || ''}
                  className="pl-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-900 border-transparent text-gray-500 cursor-not-allowed font-medium text-sm"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</Label>
              <div className="relative group">
                <IconPhone className={cn("absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors", errors.phone ? "text-red-500" : "text-gray-400")} />
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+63 9xx xxx xxxx"
                  className={cn(
                    "pl-11 h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:ring-4 transition-all font-medium text-sm",
                    errors.phone ? "border-red-500/50 focus:ring-red-500/10" : "focus:ring-primary/5"
                  )}
                />
              </div>
              {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.phone.message}</p>}
            </div>

            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Location Details</Label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Manual Search</span>
                  <Switch 
                    checked={isManualMode}
                    onCheckedChange={setIsManualMode}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="relative group flex-1">
                  <IconMapPin className={cn("absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors", errors.address ? "text-red-500" : "text-gray-400")} />
                  <Input
                    id="address"
                    {...register('address')}
                    placeholder="Enter your business address"
                    className={cn(
                      "pl-11 h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:ring-4 transition-all font-medium text-sm",
                      errors.address ? "border-red-500/50 focus:ring-red-500/10" : "focus:ring-primary/5"
                    )}
                  />
                </div>
                {isManualMode ? (
                  <div className="flex items-center space-x-2 h-11 px-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl">
                    <div className={cn("w-2 h-2 rounded-full", isSearching ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">
                      {isSearching ? "Finding..." : "Live"}
                    </span>
                  </div>
                ) : (
                  <Button 
                    type="button" 
                    onClick={() => handleSearchAddress(false)}
                    disabled={isSearching}
                    className="h-11 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white transition-all shadow-none"
                  >
                    {isSearching ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div> : <IconSearch size={18} />}
                  </Button>
                )}
              </div>
              {errors.address && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.address.message}</p>}

              {/* Map View */}
              <div className="h-48 w-full rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 mt-2 relative group">
                <Map
                  center={mapCenter}
                  onLocationSelect={(lat, lng) => !isManualMode && handleMapClick(lat, lng)}
                />
                {!isManualMode && (
                  <div className="absolute inset-0 bg-black/0 pointer-events-none group-hover:bg-black/5 transition-colors flex items-center justify-center">
                    <p className="text-[10px] font-black text-white p-2 bg-primary/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest translate-y-2 group-hover:translate-y-0 duration-300">Click map to select location</p>
                  </div>
                )}
                {isManualMode && (
                  <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center p-4 text-center">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest max-w-[200px]">Manual mode enabled. Map selection disabled.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Professional Bio</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                placeholder="Introduce yourself to tenants..."
                className={cn(
                  "min-h-[100px] p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:ring-4 transition-all font-medium resize-none text-sm",
                  errors.bio ? "border-red-500/50 focus:ring-red-500/10" : "focus:ring-primary/5"
                )}
              />
              <div className="flex justify-between mt-1 px-1">
                {errors.bio ? <p className="text-[10px] text-red-500 font-bold">{errors.bio.message}</p> : <span></span>}
                <span className="text-[10px] text-gray-400 font-medium">Max 500 characters</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button - More compact */}
        <div className="pt-6 sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-4 py-2">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 transition-all font-black uppercase tracking-[0.1em] text-xs"
          >
            {isLoading ? "Synchronizing..." : "Save Profile Details"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
