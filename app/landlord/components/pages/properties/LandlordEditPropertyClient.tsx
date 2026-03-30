'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaBuilding, FaUpload, FaMapMarkerAlt, FaBed, FaBath, FaUsers, FaMoneyBill, FaSave, FaArrowLeft } from 'react-icons/fa';
import { useEdgeStore } from '@/lib/edgestore';
import { Check, Type, FileText, MapPin, Bed, Bath, Users, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import Input from '@/components/inputs/Input';
import Textarea from '@/components/inputs/Textarea';
import Button from '@/components/common/Button';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

const LocalCheckbox = ({
  id,
  label,
  checked,
  onChange
}: {
  id: string,
  label: string,
  checked: boolean,
  onChange: () => void
}) => {
  return (
    <label
      htmlFor={id}
      className="flex items-center space-x-3 cursor-pointer group select-none"
    >
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />

        <motion.div
          className={cn(
            "w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center",
            checked
              ? "bg-primary border-primary shadow-sm"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 group-hover:border-primary/50"
          )}
          initial={false}
          animate={{
            scale: checked ? 1 : 0.95,
          }}
          whileTap={{ scale: 0.85 }}
        >
          <AnimatePresence>
            {checked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.15 }}
              >
                <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <span
        className={cn(
          "text-[14px] font-medium transition-colors duration-200",
          checked ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
        )}
      >
        {label}
      </span>
    </label>
  );
};

interface LandlordEditPropertyClientProps {
  initialData: any;
}

export default function LandlordEditPropertyClient({ initialData }: LandlordEditPropertyClientProps) {
  const router = useRouter();
  const { edgestore } = useEdgeStore();

  // Initialize form with initial data
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    price: initialData.price?.toString() || '',
    roomCount: initialData.roomCount?.toString() || '',
    bathroomCount: initialData.bathroomCount?.toString() || '',
    guestCount: '2', // Default placeholder as it's not in schema
    location: initialData.country || initialData.region || '',
    image: null as File | null,
    existingImageSrc: initialData.imageSrc || '',
    amenities: [] as string[],
  });

  const { success: toastSuccess, error: toastError } = useResponsiveToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<any>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle preview URL cleanup
  useEffect(() => {
    if (formData.image) {
      const url = URL.createObjectURL(formData.image);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [formData.image]);

  const amenitiesList = [
    'Wifi',
    'Air Conditioning',
    'Parking',
    'Kitchen',
    'Laundry',
    'Gym',
    'Swimming Pool',
    '24/7 Security',
    'Elevator',
  ];

  // Set initial amenities from data
  useEffect(() => {
    if (initialData.amenities) {
      const activeAmenities: string[] = [];
      if (initialData.amenities.wifi) activeAmenities.push('Wifi');
      if (initialData.amenities.parking) activeAmenities.push('Parking');
      if (initialData.amenities.pool) activeAmenities.push('Swimming Pool');
      if (initialData.amenities.gym) activeAmenities.push('Gym');
      if (initialData.amenities.airConditioning) activeAmenities.push('Air Conditioning');
      if (initialData.amenities.laundry) activeAmenities.push('Laundry');

      // Also check features for security
      if (initialData.features?.security24h) activeAmenities.push('24/7 Security');

      setFormData(prev => ({ ...prev, amenities: activeAmenities }));
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        image: e.target.files![0],
      }));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSelectAllAmenities = () => {
    const allSelected = formData.amenities.length === amenitiesList.length;
    setFormData((prev) => ({
      ...prev,
      amenities: allSelected ? [] : [...amenitiesList],
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Property title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Property description is required';
    }

    if (!formData.price || parseInt(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.roomCount || parseInt(formData.roomCount) <= 0) {
      newErrors.roomCount = 'Valid number of rooms is required';
    }

    if (!formData.bathroomCount || parseInt(formData.bathroomCount) <= 0) {
      newErrors.bathroomCount = 'Valid number of bathrooms is required';
    }

    if (!formData.image && !formData.existingImageSrc) {
      newErrors.image = 'Property image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toastError('Please check the form for errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let imageUrl = formData.existingImageSrc;

      // Upload new image if selected
      if (formData.image) {
        const res = await edgestore.publicFiles.upload({
          file: formData.image,
          onProgressChange: (progress) => {
            setUploadProgress(progress);
          },
        });
        imageUrl = res.url;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price),
        roomCount: parseInt(formData.roomCount),
        bathroomCount: parseInt(formData.bathroomCount),
        guestCount: parseInt(formData.guestCount),
        location: formData.location,
        latlng: [120.9842, 14.5995],
        country: "Philippines",
        region: "Metro Manila",
        images: [imageUrl],
        amenities: formData.amenities,
        category: ["Apartment"],
        roomType: "SOLO",
        femaleOnly: initialData.rules?.femaleOnly || false,
        maleOnly: initialData.rules?.maleOnly || false,
        visitorsAllowed: initialData.rules?.visitorsAllowed ?? true,
        petsAllowed: initialData.rules?.petsAllowed || false,
        smokingAllowed: initialData.rules?.smokingAllowed || false,
        security24h: formData.amenities.includes('24/7 Security'),
        cctv: initialData.features?.cctv || false,
        fireSafety: initialData.features?.fireSafety || false,
        nearTransport: initialData.features?.nearTransport ?? true,
        studyFriendly: initialData.features?.studyFriendly ?? true,
        quietEnvironment: initialData.features?.quietEnvironment || false,
        flexibleLease: initialData.features?.flexibleLease ?? true,
      };

      const response = await fetch(`/api/landlord/properties?id=${initialData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toastSuccess('Property configuration has been successfully updated.');
        router.push('/landlord/properties');
        router.refresh();
      } else {
        toastError(`Update failed: ${result.error || 'Server rejected changes'}`);
      }
} catch (error) {
       toastError('An unexpected architectural error occurred during synchronization.');
     } finally {
       setIsSubmitting(false);
       setUploadProgress(0);
     }
   }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 pt-10 pb-20">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10"
      >
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all text-gray-400 hover:text-primary"
          >
            <FaArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              Edit Property
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mt-0.5">
              Updating: <span className="text-primary font-bold">{initialData.title}</span>
            </p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* Property Basic Info */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
            <Type size={100} />
          </div>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Type size={18} />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
              Essential Info
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Input
              id="title"
              label="Property Title"
              placeholder="e.g. Modern Studio near University"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              errors={errors as any}
              icon={Type}
              useStaticLabel
            />

            <Input
              id="location"
              label="Location / Neighborhood"
              placeholder="Enter full address"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              errors={errors as any}
              icon={MapPin}
              useStaticLabel
            />
          </div>

          <div className="mt-10">
            <Textarea
              id="description"
              label="Detailed Description"
              placeholder="Describe your property, nearby landmarks, and specific features..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              errors={errors as any}
              rows={6}
              required
            />
          </div>
        </section>

        {/* Property Details */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
            <DollarSign size={100} />
          </div>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <FileText size={18} />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
              Pricing & Stats
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <Input
              id="price"
              label="Monthly Rent"
              type="number"
              placeholder="₱"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              errors={errors as any}
              icon={DollarSign}
              useStaticLabel
            />

            <Input
              id="roomCount"
              label="Bedrooms"
              type="number"
              value={formData.roomCount}
              onChange={(e) => setFormData(prev => ({ ...prev, roomCount: e.target.value }))}
              errors={errors as any}
              icon={Bed}
              useStaticLabel
            />

            <Input
              id="bathroomCount"
              label="Bathrooms"
              type="number"
              value={formData.bathroomCount}
              onChange={(e) => setFormData(prev => ({ ...prev, bathroomCount: e.target.value }))}
              errors={errors as any}
              icon={Bath}
              useStaticLabel
            />

            <Input
              id="guestCount"
              label="Pax Capacity"
              type="number"
              value={formData.guestCount}
              onChange={(e) => setFormData(prev => ({ ...prev, guestCount: e.target.value }))}
              errors={errors as any}
              icon={Users}
              useStaticLabel
            />
          </div>
        </section>

        {/* Amenities */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
            <Check size={100} />
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Check size={18} />
              </div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                Amenities
              </h2>
            </div>

            <button
              type="button"
              onClick={handleSelectAllAmenities}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-primary/10 hover:text-primary transition-all group border border-gray-100 dark:border-gray-700"
            >
              <div className={cn(
                "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                formData.amenities.length === amenitiesList.length
                  ? "bg-primary border-primary"
                  : "border-gray-300 dark:border-gray-600 group-hover:border-primary/50"
              )}>
                {formData.amenities.length === amenitiesList.length && (
                  <Check className="w-3 h-3 text-white stroke-[4px]" />
                )}
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest">
                {formData.amenities.length === amenitiesList.length ? 'Deselect All' : 'Select All'}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6 bg-gray-50/50 dark:bg-gray-800/20 p-6 rounded-2xl">
            {amenitiesList.map((amenity) => (
              <LocalCheckbox
                key={amenity}
                id={`amenity-${amenity}`}
                label={amenity}
                checked={formData.amenities.includes(amenity)}
                onChange={() => handleAmenityToggle(amenity)}
              />
            ))}
          </div>
        </section>

        {/* Property Image */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
            <FaUpload size={80} />
          </div>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <FaUpload size={18} />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
              Update Photo
            </h2>
          </div>

          <div className={cn(
            "relative border-[3px] border-dashed rounded-[2.5rem] p-12 transition-all duration-500",
            (formData.image || formData.existingImageSrc)
              ? "border-primary/30 bg-primary/5"
              : "border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          )}>
            {(formData.image || formData.existingImageSrc) ? (
              <div className="flex flex-col items-center">
                <div className="relative group overflow-hidden rounded-[2rem] shadow-2xl border-4 border-white dark:border-gray-800 max-w-xl w-full">
                  <motion.img
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={previewUrl || formData.existingImageSrc}
                    alt="Property preview"
                    className="aspect-video w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <label
                      htmlFor="image-upload"
                      className="bg-white text-gray-900 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all cursor-pointer shadow-xl"
                    >
                      Replace Photo
                    </label>
                  </div>
                  {formData.image && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">New Upload</div>
                  )}
                </div>
                <div className="mt-8 text-center">
                  <p className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs">Current Property Image</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-gray-300">
                  <FaUpload size={40} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Update Photo</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-10 font-medium line-relaxed">
                  Upload a high-resolution image to represent your property.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-12 py-5 bg-primary text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-primary-hover transition-all cursor-pointer shadow-2xl shadow-primary/30 hover:-translate-y-1 active:scale-95"
                >
                  <FaUpload size={18} className="mr-4" />
                  Select Image
                </label>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
          </div>
          {errors.image && (
            <p className="text-red-500 text-xs font-black mt-6 ml-6 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              {errors.image}
            </p>
          )}
        </section>

        {/* Form Actions (Centralized) */}
        <motion.div
          layout
          className="flex flex-col items-center justify-center gap-6 p-6 md:p-8 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm text-center"
        >
          <div className="max-w-md mx-auto">
            <h4 className="text-base font-black text-gray-900 dark:text-white mb-0.5 uppercase tracking-tight">Unsaved Changes</h4>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Modifications will be live immediately after saving your profile.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              outline
              onClick={() => router.back()}
              className="w-full sm:w-auto min-w-[120px] px-6 py-2.5 rounded-xl border-gray-200 dark:border-gray-700 text-[11px] font-black uppercase tracking-widest"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full sm:w-auto min-w-[200px] px-8 py-3 rounded-xl shadow-lg shadow-primary/20 relative overflow-hidden"
            >
              {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
                <motion.div 
                  className="absolute bottom-0 left-0 h-1 bg-white/30"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                />
              )}
              <span className="flex items-center justify-center gap-2">
                {isSubmitting && uploadProgress > 0 && uploadProgress < 100 ? (
                   <span className="text-[10px] font-black uppercase tracking-widest">{uploadProgress}% Uploading</span>
                ) : (
                  <>
                    <FaSave size={14} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Authorize Updates</span>
                  </>
                )}
              </span>
            </Button>
          </div>
        </motion.div>
      </form>
    </div>
  );
}
