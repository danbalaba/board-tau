'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaArrowLeft,
  FaSave,
  FaImages,
  FaShieldAlt,
  FaInfoCircle
} from 'react-icons/fa';
import { useEdgeStore } from '@/lib/edgestore';
import { 
  Check, 
  Type, 
  MapPin, 
  Bed, 
  Bath, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  Wifi,
  Trash2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { cn } from '@/utils/helper';
import Input from '@/components/inputs/Input';
import Textarea from '@/components/inputs/Textarea';
import Button from '@/components/common/Button';
import LoadingAnimation from '@/components/common/LoadingAnimation';
import { toast } from 'sonner';

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
      className={cn(
        "flex items-center space-x-3 cursor-pointer group select-none p-3 rounded-xl border transition-all duration-200",
        checked 
          ? "bg-primary/5 border-primary/20" 
          : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-primary/20"
      )}
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
          "text-[13px] font-bold uppercase tracking-wider transition-colors duration-200",
          checked ? "text-primary dark:text-primary" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
        )}
      >
        {label}
      </span>
    </label>
  );
};

const Section = ({ id, children, title, icon: Icon, description, setActiveSection }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    amount: 0.1,
    margin: "-200px 0px -60% 0px" // Only trigger when the top of the section is in the upper focus zone
  });
  
  useEffect(() => {
    if (isInView) setActiveSection(id);
  }, [isInView, id, setActiveSection]);

  return (
    <motion.section 
      id={id}
      ref={ref}
      className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 md:p-12 shadow-sm relative overflow-hidden group mb-12 scroll-mt-24"
    >
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-all duration-500 pointer-events-none group-hover:scale-110">
        <Icon size={120} />
      </div>

      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
          <Icon size={22} />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            {title}
          </h2>
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-1">{description}</p>
        </div>
      </div>

      {children}
    </motion.section>
  );
};

interface LandlordEditPropertyClientProps {
  initialData: any;
}

export default function LandlordEditPropertyClient({ initialData }: LandlordEditPropertyClientProps) {
  const router = useRouter();
  const { edgestore } = useEdgeStore();
  
  // Initialize form
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    price: initialData.price?.toString() || '',
    roomCount: initialData.roomCount?.toString() || '',
    bathroomCount: initialData.bathroomCount?.toString() || '',
    guestCount: '2', 
    province: initialData.region || '',
    address: initialData.address || '',
    city: initialData.city || '',
    zipCode: initialData.zipCode || '',
    latlng: initialData.latlng || [120.9842, 14.5995],
    propertyFiles: [] as File[],
    existingImages: (initialData.images || []).map((img: any) => img.url),
    amenities: [] as string[],
    rules: {
      femaleOnly: initialData.rules?.femaleOnly || false,
      maleOnly: initialData.rules?.maleOnly || false,
      visitorsAllowed: initialData.rules?.visitorsAllowed ?? true,
      petsAllowed: initialData.rules?.petsAllowed || false,
      smokingAllowed: initialData.rules?.smokingAllowed || false,
    },
    features: {
      security24h: initialData.features?.security24h || false,
      cctv: initialData.features?.cctv || false,
      fireSafety: initialData.features?.fireSafety || false,
      nearTransport: initialData.features?.nearTransport ?? true,
      studyFriendly: initialData.features?.studyFriendly ?? true,
      quietEnvironment: initialData.features?.quietEnvironment || false,
      flexibleLease: initialData.features?.flexibleLease ?? true,
    },
    categories: (initialData.categories || []).map((cat: any) => cat.category?.name),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [activeSection, setActiveSection] = useState('basics');
  const [isMounted, setIsMounted] = useState(false);

  // Sync with global loading / settles internal layout
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 600);
    return () => clearTimeout(timer);
  }, []);

  // Robust top-of-page scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 200) {
        setActiveSection('basics');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const amenitiesList = [
    'Wifi', 'Air Conditioning', 'Parking', 'Kitchen', 'Laundry', 
    'Gym', 'Swimming Pool', '24/7 Security', 'Elevator'
  ];

  const categoryList = [
    { value: 'Apartment', label: 'Apartment' },
    { value: 'Dormitory', label: 'Dormitory' },
    { value: 'Boarding House', label: 'Boarding House' },
    { value: 'Studio', label: 'Studio' },
    { value: 'Bed Space', label: 'Bed Space' },
  ];

  useEffect(() => {
    if (initialData.amenities) {
      const activeAmenities: string[] = [];
      const am = initialData.amenities;
      const mapping: Record<string, keyof typeof am> = {
        'Wifi': 'wifi',
        'Air Conditioning': 'airConditioning',
        'Parking': 'parking',
        'Kitchen': 'kitchen',
        'Laundry': 'laundry',
        'Gym': 'gym',
        'Swimming Pool': 'pool',
        'Elevator': 'elevator',
        '24/7 Security': 'security24h'
      };

      Object.entries(mapping).forEach(([label, key]) => {
        if (am[key]) activeAmenities.push(label);
      });

      setFormData(prev => ({ ...prev, amenities: activeAmenities }));
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, propertyFiles: [...prev.propertyFiles, ...filesArray] }));
    }
  };

  const deleteExistingImage = (url: string) => {
    setFormData(prev => ({ ...prev, existingImages: prev.existingImages.filter((img: string) => img !== url) }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c: string) => c !== category)
        : [...prev.categories, category]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.price || parseInt(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (formData.existingImages.length === 0 && formData.propertyFiles.length === 0) {
      newErrors.images = 'At least one property image is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix errors before saving.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Synchronizing updates across all records...');
    
    try {
      const newImageUrls: string[] = [];
      for (const file of formData.propertyFiles) {
        const res = await edgestore.publicFiles.upload({ file });
        newImageUrls.push(res.url);
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price),
        roomCount: parseInt(formData.roomCount),
        bathroomCount: parseInt(formData.bathroomCount),
        region: formData.province,
        latlng: formData.latlng,
        category: formData.categories,
        amenities: formData.amenities,
        images: [...formData.existingImages, ...newImageUrls],
        ...formData.rules,
        ...formData.features,
      };

      const response = await fetch(`/api/landlord/properties?id=${initialData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Property updated successfully!', { id: toastId });
        router.push('/landlord/properties');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update property', { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('An unexpected error occurred.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full relative min-h-screen pb-32 transition-all duration-500">
      <AnimatePresence>
        {!isMounted ? (
          <div key="loader" className="fixed inset-0 z-[200] flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
            <LoadingAnimation text="Synchronizing property editor..." size="large" />
          </div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Page Header Area */}
            <div className="max-w-4xl mx-auto px-4 md:px-8 mt-10">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl mb-12"
              >
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => router.back()}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-sm hover:scale-110 active:scale-95 transition-all text-gray-400 hover:text-primary"
                  >
                    <FaArrowLeft size={18} />
                  </button>
                  <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                      {formData.categories[0] || 'Property'} Editor
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-[10px] mt-1 space-x-2">
                      <span>Managing:</span>
                      <span className="text-primary">{formData.title}</span>
                      <span className="text-gray-300">•</span>
                      <span>ID: {initialData.id.slice(0, 8)}...</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-8">
              <div className="flex flex-col lg:flex-row gap-8 items-start relative">
                
                {/* Truly Fixed Side Tracker - Locked to Top Viewport */}
                <motion.div 
                  initial={{ opacity: 0, x: -40, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: 0.2, // Small stagger from header
                    duration: 0.8
                  }}
                  className="hidden xl:flex flex-col items-center gap-1 fixed top-[160px] left-1/2 -ml-[540px] 2xl:-ml-[580px] z-[100] p-8 bg-white/20 dark:bg-black/20 backdrop-blur-xl rounded-[3rem] border border-white/30 dark:border-white/10 shadow-3xl"
                >
                  {[
                    { id: 'basics', title: 'Basics', icon: Type },
                    { id: 'config', title: 'Config', icon: ShieldCheck },
                    { id: 'amenities', title: 'Extras', icon: Wifi },
                    { id: 'showcase', title: 'Media', icon: FaImages },
                  ].map((step, idx, arr) => {
                    const isActive = activeSection === step.id;
                    return (
                      <React.Fragment key={step.id}>
                        <button
                          type="button"
                          onClick={() => document.getElementById(step.id)?.scrollIntoView({ behavior: 'smooth' })}
                          className="group relative flex flex-col items-center gap-3 shrink-0"
                        >
                          <div
                            className={cn(
                              "w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-500",
                              isActive ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-125" : "text-gray-300 dark:text-gray-700 border-gray-100 dark:border-gray-800 hover:border-primary/50"
                            )}
                          >
                            <step.icon size={16} />
                          </div>
                          
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                            isActive ? "text-primary opacity-100" : "text-gray-400 opacity-0 group-hover:opacity-100"
                          )} style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', minHeight: '52px' }}>
                            {step.title}
                          </span>
                        </button>
                        {idx < arr.length - 1 && (
                          <div className={cn(
                            "w-[2px] h-10 my-1 transition-colors duration-1000 shrink-0",
                            isActive ? "bg-primary" : "bg-gray-100 dark:bg-gray-800"
                          )} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </motion.div>

                {/* Form Content - Focused Width */}
                <div className="flex-1 w-full overflow-hidden">
                  <form onSubmit={handleSubmitForm}>
                    <div className="space-y-0 w-full">
                      <Section id="basics" title="Core Attributes" icon={Type} description="Primary property identifiers" setActiveSection={setActiveSection}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <Input
                            id="title"
                            label="Property Title"
                            placeholder="e.g. Modern Studio near University"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            errors={errors}
                            icon={Type}
                            useStaticLabel
                          />
                          <Input
                            id="locationLabel"
                            label="Region / Province"
                            placeholder="Central Luzon"
                            value={formData.province}
                            onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                            errors={errors}
                            icon={MapPin}
                            useStaticLabel
                          />
                        </div>
                        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                          <Input
                            id="price" label="Monthly Rent" type="number" placeholder="₱"
                            value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            errors={errors} icon={DollarSign} useStaticLabel
                          />
                          <Input
                            id="roomCount" label="Bedrooms" type="number"
                            value={formData.roomCount} onChange={(e) => setFormData(prev => ({ ...prev, roomCount: e.target.value }))}
                            errors={errors} icon={Bed} useStaticLabel
                          />
                          <Input
                            id="bathroomCount" label="Bathrooms" type="number"
                            value={formData.bathroomCount} onChange={(e) => setFormData(prev => ({ ...prev, bathroomCount: e.target.value }))}
                            errors={errors} icon={Bath} useStaticLabel
                          />
                          <Input
                            id="guestCount" label="Pax Capacity" type="number"
                            value={formData.guestCount} onChange={(e) => setFormData(prev => ({ ...prev, guestCount: e.target.value }))}
                            errors={errors} icon={Users} useStaticLabel
                          />
                        </div>
                        <div className="mt-10">
                          <Textarea
                            id="description"
                            label="Property Narrative"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={5}
                            placeholder="Describe the soul of your property..."
                          />
                        </div>
                      </Section>

                      <Section id="config" title="Listing Rules" icon={ShieldCheck} description="Security & occupancy conditions" setActiveSection={setActiveSection}>
                        <div className="space-y-12">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <LocalCheckbox 
                              id="femaleOnly" label="Female Only" checked={formData.rules.femaleOnly} 
                              onChange={() => setFormData(prev => ({ ...prev, rules: { ...prev.rules, femaleOnly: !prev.rules.femaleOnly, maleOnly: false } }))}
                            />
                            <LocalCheckbox 
                              id="maleOnly" label="Male Only" checked={formData.rules.maleOnly} 
                              onChange={() => setFormData(prev => ({ ...prev, rules: { ...prev.rules, maleOnly: !prev.rules.maleOnly, femaleOnly: false } }))}
                            />
                            <LocalCheckbox 
                              id="visitorsAllowed" label="Visitors Allowed" checked={formData.rules.visitorsAllowed} 
                              onChange={() => setFormData(prev => ({ ...prev, rules: { ...prev.rules, visitorsAllowed: !prev.rules.visitorsAllowed } }))}
                            />
                            <LocalCheckbox 
                              id="petsAllowed" label="Pets Allowed" checked={formData.rules.petsAllowed} 
                              onChange={() => setFormData(prev => ({ ...prev, rules: { ...prev.rules, petsAllowed: !prev.rules.petsAllowed } }))}
                            />
                            <LocalCheckbox 
                              id="smokingAllowed" label="Smoking Allowed" checked={formData.rules.smokingAllowed} 
                              onChange={() => setFormData(prev => ({ ...prev, rules: { ...prev.rules, smokingAllowed: !prev.rules.smokingAllowed } }))}
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-800 pt-10">
                            <LocalCheckbox 
                              id="security24h" label="24/7 Security" checked={formData.features.security24h} 
                              onChange={() => setFormData(prev => ({ ...prev, features: { ...prev.features, security24h: !prev.features.security24h } }))}
                            />
                            <LocalCheckbox 
                              id="cctv" label="CCTV Surveillance" checked={formData.features.cctv} 
                              onChange={() => setFormData(prev => ({ ...prev, features: { ...prev.features, cctv: !prev.features.cctv } }))}
                            />
                            <LocalCheckbox 
                              id="fireSafety" label="Fire Safety Kit" checked={formData.features.fireSafety} 
                              onChange={() => setFormData(prev => ({ ...prev, features: { ...prev.features, fireSafety: !prev.features.fireSafety } }))}
                            />
                            <LocalCheckbox 
                              id="nearTransport" label="Near Public Transport" checked={formData.features.nearTransport} 
                              onChange={() => setFormData(prev => ({ ...prev, features: { ...prev.features, nearTransport: !prev.features.nearTransport } }))}
                            />
                            <LocalCheckbox 
                              id="studyFriendly" label="Study Environment" checked={formData.features.studyFriendly} 
                              onChange={() => setFormData(prev => ({ ...prev, features: { ...prev.features, studyFriendly: !prev.features.studyFriendly } }))}
                            />
                            <LocalCheckbox 
                              id="quietEnvironment" label="Quiet Zone" checked={formData.features.quietEnvironment} 
                              onChange={() => setFormData(prev => ({ ...prev, features: { ...prev.features, quietEnvironment: !prev.features.quietEnvironment } }))}
                            />
                          </div>
                        </div>
                      </Section>

                      <Section id="amenities" title="Standard Amenities" icon={Wifi} description="Essential utilities & perks" setActiveSection={setActiveSection}>
                        <div className="flex flex-wrap gap-3 bg-gray-50/50 dark:bg-gray-800/10 p-8 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700">
                          {amenitiesList.map((amenity) => (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => handleAmenityToggle(amenity)}
                              className={cn(
                                "px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 border shadow-sm",
                                formData.amenities.includes(amenity)
                                  ? "bg-primary text-white border-primary shadow-primary/30"
                                  : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:border-primary/20"
                              )}
                            >
                              {amenity}
                            </button>
                          ))}
                        </div>
                        <div className="mt-10">
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6 ml-2">Property Classification</h3>
                          <div className="flex flex-wrap gap-2">
                            {categoryList.map(cat => (
                              <button
                                key={cat.value}
                                type="button"
                                onClick={() => handleCategoryToggle(cat.value)}
                                className={cn(
                                  "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                  formData.categories.includes(cat.value)
                                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200"
                                )}
                              >
                                {cat.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </Section>

                      <Section id="showcase" title="Visual Evidence" icon={FaImages} description="High-fidelity gallery management" setActiveSection={setActiveSection}>
                        <div className="space-y-10">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {formData.existingImages.map((url: string, i: number) => (
                              <div key={i} className="relative aspect-video rounded-2xl overflow-hidden group/img shadow-md">
                                <img src={url} alt="" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                  <button type="button" onClick={() => deleteExistingImage(url)} className="p-2 bg-red-500 text-white rounded-lg shadow-xl hover:scale-110 transition-all">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {formData.propertyFiles.map((file, i) => (
                              <div key={i} className="relative aspect-video rounded-2xl overflow-hidden border-2 border-primary/30 shadow-md">
                                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 px-2 py-0.5 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-full">New</div>
                              </div>
                            ))}
                            <label className="aspect-video rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/40 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group/add">
                              <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover/add:bg-primary group-hover/add:text-white transition-colors">
                                <Plus size={20} />
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover/add:text-primary">Add More Photos</span>
                              <input type="file" multiple className="hidden" onChange={handleImageChange} />
                            </label>
                          </div>
                          
                          <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex items-start gap-4">
                            <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" size={16} />
                            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-relaxed">
                              Uploading 4+ high-resolution photos increases booking conversion by 45%. Make sure to include bathroom and common area shots.
                            </p>
                          </div>
                        </div>
                      </Section>
                    </div>

                    {/* Form Action Footer - Split and Compact */}
                    <div className="mt-12 flex items-center justify-between gap-4 p-6 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl">
                      <Button 
                        outline 
                        className="rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest border-gray-200 w-fit" 
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                      >
                        Discard Updates
                      </Button>
                      <Button 
                        className="rounded-xl px-6 py-3 shadow-lg shadow-primary/20 flex items-center gap-2 group w-fit"
                        onClick={() => handleSubmitForm()}
                        isLoading={isSubmitting}
                      >
                        <FaSave size={13} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Push Changes</span>
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Scroll to Top */}
            <motion.div 
              className="fixed bottom-10 right-10 z-[110]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <button 
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-14 h-14 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 hover:text-primary hover:-translate-y-1 transition-all"
              >
                <FaArrowLeft className="rotate-90" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
