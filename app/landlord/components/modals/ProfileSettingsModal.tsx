'use client';

import React, { useState } from 'react';
import ModalGlobal from '@/components/modals/Modal';
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
import { ScrollArea } from '@/app/admin/components/ui/scroll-area';

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
  phoneNumber: z.string().refine((val) => {
    if (!val) return true;
    const error = validatePhoneNumber(val);
    return !error;
  }, {
    message: "Please enter a valid Philippine mobile number"
  }),
  address: z.string().min(1, 'Address is required'),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  city: z.string().optional(),
  region: z.string().optional(),
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
      phoneNumber: (user as any).phoneNumber || '',
      address: '',
      bio: (user as any).bio || '',
      city: (user as any).city || '',
      region: (user as any).region || '',
    },
  });

  const addressValue = watch('address');

  // Handle map click for address selection
  const handleMapClick = async (lat: number, lng: number) => {
    setMapCenter([lat, lng]);

    // Only auto-fill if not in manual mode
    if (!isManualMode) {
      setIsSearching(true);

      // Provide immediate visual feedback just like in LocationStep
      setValue('address', `Locating... (${lat.toFixed(6)}, ${lng.toFixed(6)})`, { shouldValidate: false });

      try {
        const addressInfo = await reverseGeocode(lat, lng);
        if (addressInfo) {
          setValue('address', addressInfo.address, { shouldValidate: true });
          setValue('city', addressInfo.city, { shouldValidate: true });
          setValue('region', addressInfo.province, { shouldValidate: true });
          success("Address synchronized from map");
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        setValue('address', `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`, { shouldValidate: true });
        toastError("Using coordinates as fallback address");
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleSearchAddress = async (silent: boolean = false) => {
    if (!addressValue) return;

    setIsSearching(true);
    try {
      const result = await geocodeAddress(addressValue);
      if (result) {
        setMapCenter(result.coordinates);
        setValue('city', result.city, { shouldValidate: true });
        setValue('region', result.province, { shouldValidate: true });
        if (!silent) {
          success("Location found on map");
        }
      } else if (!silent) {
        toastError("Location not found");
      }
    } catch (error) {
      if (!silent) {
        toastError("Error finding location");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const onImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const res = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress) => {
          setUploadProgress(progress);
        },
      });
      setCurrentImageUrl(res.url);
      success("Profile picture uploaded successfully");
    } catch (err) {
      toastError("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const onSave = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      // Use the profile service correctly
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phoneNumber: data.phoneNumber,
          bio: data.bio,
          city: data.city,
          region: data.region,
          image: currentImageUrl,
        }),
      });

      success("Profile updated successfully");
      onClose();
      // Force refresh to update all header/profile images
      window.location.reload();
    } catch (err: any) {
      toastError(err.message || "Error updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalGlobal
      title="Store Profile Details"
      isOpen={isOpen}
      onClose={onClose}
      width="md"
      hasFixedFooter={true}
    >
      <form onSubmit={handleSubmit(onSave)}>
        <ScrollArea className="h-[600px] pr-4 -mr-4">
          <div className="space-y-8 pb-4">
            {/* Identity Header */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-20 h-20 rounded-[1.8rem] bg-gray-50 dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-2xl overflow-hidden ring-4 ring-primary/5 transition-all">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={currentImageUrl || ''} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-black text-2xl">
                      {user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2">
                      <div className="w-full bg-white/20 rounded-full h-1 mb-1">
                        <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-white">{uploadProgress}%</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all ring-4 ring-white dark:ring-gray-900"
                >
                  <IconCamera size={16} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onImageUpload} />
              </div>
              <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Update Identity Picture</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Identity Name</Label>
                <div className="relative group">
                  <IconId className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors z-10", errors.name ? "text-red-500" : "text-gray-400")} />
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
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Account Email</Label>
                <div className="relative group">
                  <IconAt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 opacity-50 z-10" />
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user.email || ''}
                    className="pl-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-900 border-transparent text-gray-500 cursor-not-allowed font-medium text-sm"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="phoneNumber" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Mobile Contact Identity</Label>
                <div className="relative group">
                  <IconPhone className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors z-10", errors.phoneNumber ? "text-red-500" : "text-gray-400")} />
                  <Input
                    id="phoneNumber"
                    {...register('phoneNumber')}
                    placeholder="+63 9xx xxx xxxx"
                    className={cn(
                      "pl-11 h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:ring-4 transition-all font-medium text-sm",
                      errors.phoneNumber ? "border-red-500/50 focus:ring-red-500/10" : "focus:ring-primary/5"
                    )}
                  />
                </div>
              </div>

              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center justify-between px-1">
                  <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-gray-400">Location Base Details</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Live Auto-Lookup</span>
                    <Switch checked={isManualMode} onCheckedChange={setIsManualMode} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="relative group flex-1">
                    <IconMapPin className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors z-10", errors.address ? "text-red-500" : "text-gray-400")} />
                    <Input
                      id="address"
                      {...register('address')}
                      placeholder="Enter legal address"
                      className={cn(
                        "pl-11 h-11 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:ring-4 transition-all font-medium text-sm",
                        errors.address ? "border-red-500/50 focus:ring-red-500/10" : "focus:ring-primary/5"
                      )}
                    />
                  </div>
                  {!isManualMode && (
                    <Button
                      type="button"
                      onClick={() => handleSearchAddress(false)}
                      disabled={isSearching}
                      className="h-11 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-primary hover:text-white transition-all shadow-none"
                    >
                      {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <IconSearch size={18} />}
                    </Button>
                  )}
                </div>

                <div className="h-48 w-full rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative group shadow-sm">
                  <Map
                    center={mapCenter}
                    // @ts-ignore
                    onLocationSelect={(lat, lng) => !isManualMode && handleMapClick(lat, lng)}
                  />
                  {!isManualMode && (
                    <div className="absolute inset-0 bg-black/0 pointer-events-none group-hover:bg-black/5 transition-colors flex items-center justify-center">
                      <p className="text-[10px] font-black text-white p-2 bg-primary/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest translate-y-2 group-hover:translate-y-0 transition-all">Click map for precision pin</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Professional Identity bio</Label>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-800">500 Max</span>
                </div>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  placeholder="Tell us about yourself..."
                  className={cn(
                    "min-h-[100px] p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 focus:ring-4 transition-all font-medium resize-none text-sm",
                    errors.bio ? "border-red-500/50 focus:ring-red-500/10" : "focus:ring-primary/5"
                  )}
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/95 text-white shadow-xl shadow-primary/20 transition-all font-black uppercase tracking-[0.1em] text-[10px]"
              >
                {isLoading ? "Synchronizing..." : "Store Profile Details"}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </form>
    </ModalGlobal>
  );
}
