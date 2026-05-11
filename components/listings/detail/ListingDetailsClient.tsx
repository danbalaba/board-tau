"use client";
import React, { useState, useMemo, useEffect, useTransition } from "react";
import { User } from "next-auth";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

import Avatar from "@/components/common/Avatar";
import { AiOutlineCheck } from "react-icons/ai";
import { MdClose } from "react-icons/md";
import { 
  DoorOpen, Bath, BedDouble, Bed, ShieldCheck, MapPin, CheckCircle2, X, Wifi, Car, Waves, 
  Dumbbell, Wind, WashingMachine, Utensils, Refrigerator, Microwave, Droplets, Zap, Clock, 
  Users, Flame, PawPrint, Camera, BookOpen, Square, Blinds, Lightbulb, Bell, Ban, Brush, Info,
  HelpCircle, Sparkles, Star, Heart, Share, Trash2, Edit, Save, Plus, ArrowRight, ArrowLeft,
  Search, Shield, Key, Lock, Fingerprint, Activity, Smartphone
} from "lucide-react";
import * as LucideIcons from 'lucide-react';
import ListingReviews from "./ListingReviews";
import Modal from "@/components/modals/Modal";
import Button from "@/components/common/Button";
import AvailableRoomsSection from "./AvailableRoomsSection";
import ListingCategory from "./ListingCategory";
import { categories } from "@/utils/constants";
import SafeImage from "@/components/common/SafeImage";

const Map = dynamic(() => import("@/components/common/Map"), {
  ssr: false,
});

interface ListingImageData {
  url: string;
  caption?: string;
  order?: number;
}

interface ListingDetailsClientProps {
  id: string;
  price: number;
  reservations?: {
    startDate: Date;
    endDate: Date;
  }[];
  user: (User & { id: string }) | undefined;
  title: string;
  owner: {
    id: string;
    image: string | null;
    name: string | null;
  };
  category: { label: string; description?: string; value: string } | null;
  description: string;
  roomCount: number;
  bathroomCount: number;
  latlng: number[];
  amenities: string[] | {
    wifi?: boolean;
    parking?: boolean;
    pool?: boolean;
    gym?: boolean;
    airConditioning?: boolean;
    laundry?: boolean;
  } | null;
  bedType?: string | null;
  rating?: number;
  reviewCount?: number;
  images?: ListingImageData[];
  reviews?: any[];
  rooms: any[];
  rules?: {
    femaleOnly: boolean;
    maleOnly: boolean;
    visitorsAllowed: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
    noCurfew: boolean;
    customRules: string[];
  } | null;
  features?: {
    security24h: boolean;
    cctv: boolean;
    fireSafety: boolean;
    nearTransport: boolean;
    studyFriendly: boolean;
    quietEnvironment: boolean;
    flexibleLease: boolean;
    floodFree: boolean;
    backupPower: boolean;
    customFeatures: string[];
  } | null;
  region?: string | null;
  country?: string | null;
}

const EXPANDED_AMENITIES = [
  "WiFi",
  "Dedicated workspace",
  "Air conditioning",
  "Shared kitchen",
  "Refrigerator",
  "Microwave",
  "Laundry area",
  "Parking",
  "Water supply (24/7)",
  "Electricity included",
  "Curfew policy",
  "Visitors allowed",
  "Cooking allowed",
  "Pets allowed",
  "CCTV",
  "Security guard",
  "Study desk",
  "Closet",
  "Balcony",
  "Smoke alarm",
  "Fire extinguisher",
];

const ListingDetailsClient: React.FC<ListingDetailsClientProps> = ({
  id,
  price,
  reservations = [],
  user,
  title,
  owner,
  category,
  description,
  roomCount,
  bathroomCount,
  latlng,
  amenities,
  bedType,
  rating = 4.8,
  reviewCount = 0,
  images = [],
  reviews = [],
  rooms,
  region,
  country,
  rules,
  features,
}) => {
  const CategoryIcon = category ? categories.find(c => c.value === category.value)?.icon : null;
  // Convert amenities to string array for consistent rendering
  const amenitiesArray = (() => {
    // Filter out items that are actually safety features or rules to avoid duplication
    const safetyKeywords = ['cctv', 'security', 'fire safety', 'transport', 'flexible lease', 'flood', 'backup power'];
    const ruleKeywords = ['female', 'male', 'visitor', 'pet', 'smoking', 'curfew'];

    const baseAmenities = Array.isArray(amenities) ? amenities : [];
    
    // Handle object-based amenities if they exist
    const legacyAmenities: string[] = [];
    if (amenities && typeof amenities === 'object' && !Array.isArray(amenities)) {
      const obj = amenities as any;
      if (obj.wifi) legacyAmenities.push("WiFi");
      if (obj.parking) legacyAmenities.push("Parking");
      if (obj.pool) legacyAmenities.push("Pool");
      if (obj.gym) legacyAmenities.push("Gym");
      if (obj.airConditioning) legacyAmenities.push("Air conditioning");
      if (obj.laundry) legacyAmenities.push("Laundry area");
    }

    const combined = [...baseAmenities, ...legacyAmenities];

    return combined.filter(a => {
      const lower = a.toLowerCase();
      return !safetyKeywords.some(kw => lower.includes(kw)) && 
             !ruleKeywords.some(kw => lower.includes(kw));
    });
  })();
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();
  const { success, error } = useResponsiveToast();
  const [activeStay, setActiveStay] = useState<{ endDate: string; status: string; listing: { title: string } } | null>(null);
  const lastInquiryToastTime = React.useRef<number>(0);

  // Fetch active stay for Flexible Mode overlap checks
  useEffect(() => {
    const fetchActiveStay = async () => {
      if (!user) return;
      try {
        const response = await fetch("/api/reservations/active-stay");
        if (response.ok) {
          const data = await response.json();
          setActiveStay(data);
        }
      } catch (err) {
        console.error("Failed to fetch active stay:", err);
      }
    };
    fetchActiveStay();
  }, [user]);

  // Modal states
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showBedroomPreview, setShowBedroomPreview] = useState(false);

  // Helper for explicit amenity icons
  const getAmenityIcon = (amenityName: string) => {
    const { label, icon } = parseCustomItem(amenityName);
    
    // If it has a custom icon from the landlord creation
    if (icon) {
      return <CustomIcon name={icon} fallback={CheckCircle2} size={20} className="text-primary flex-shrink-0" />;
    }

    const name = label.toLowerCase();
    if (name.includes('wifi')) return <Wifi size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('parking')) return <Car size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('pool')) return <Waves size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('gym')) return <Dumbbell size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('air conditioning')) return <Wind size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('laundry')) return <WashingMachine size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('kitchen') || name.includes('cooking')) return <Utensils size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('refrigerator')) return <Refrigerator size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('microwave')) return <Microwave size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('water')) return <Droplets size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('electricity')) return <Zap size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('curfew')) return <Clock size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('visitors')) return <Users size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('smoke') || name.includes('fire')) return <Flame size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('cctv') || name.includes('security')) return <Camera size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('pets')) return <PawPrint size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('desk') || name.includes('study friendly')) return <BookOpen size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('balcony')) return <Square size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('closet')) return <Blinds size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('quiet')) return <Wind size={20} className="text-primary flex-shrink-0" />;
    return <CheckCircle2 size={20} className="text-primary flex-shrink-0" />;
  };

  // Lock body scroll when target modals are open
  useEffect(() => {
    if (showDescriptionModal || showAmenitiesModal || showBedroomPreview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showDescriptionModal, showAmenitiesModal]);

  const parseCustomItem = (item: string) => {
    if (!item || typeof item !== 'string') return { label: "", icon: null };
    if (item.includes("|")) {
      const [label, icon] = item.split("|");
      return { label: label.trim(), icon: icon.trim() };
    }
    return { label: item, icon: null };
  };

  const CustomIcon = ({ name, fallback: Fallback, className, size = 24 }: { name: string | null, fallback: any, className?: string, size?: number }) => {
    // Try to find the icon in the Lucide library dynamically
    const DynamicIcon = name ? (LucideIcons as any)[name] : null;
    const IconComponent = DynamicIcon || Fallback;
    return <IconComponent className={className} size={size} />;
  };

  const handleInquiry = async (formData: any) => {
    if (!user) {
      const now = Date.now();
      if (now - lastInquiryToastTime.current > 5000) {
        error("Please log in to send an inquiry.");
        lastInquiryToastTime.current = now;
      }
      return;
    }

    try {
      const inquiryData = {
        ...formData,
        listingId: id,
        userId: user.id,
      };

      // Create inquiry instead of reservation
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inquiryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(errorData.error || errorData.message || "Failed to create inquiry");
      }

      success("Inquiry sent! Waiting for landlord approval.");
    } catch (err: any) {
      console.error('Inquiry request error:', err);
      error(err?.message || 'Failed to send inquiry');
      throw err; // Ensure InquiryModal catches the failure!
    }
  };

  // Smart image selection for "Where you'll sleep"
  const getImageUrl = (img: any) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    if (typeof img.url === 'string') return img.url;
    if (typeof img.imageUrl === 'string') return img.imageUrl;
    if (typeof img.getUrl === 'function') return img.getUrl();
    if (typeof img.imageSrc === 'string') return img.imageSrc;
    if (typeof img.src === 'string') return img.src;
    return null;
  };

  const bedroomImage = useMemo(() => {
    // 1. Try to find an image explicitly tagged as bedroom or similar
    const specificBedroom = images?.find((img: any) => {
      const category = (img.roomType || img.category || img.caption || "").toLowerCase();
      return category.includes('bedroom') || 
             category.includes('bed') || 
             category.includes('room') ||
             category.includes('interior');
    });
    if (specificBedroom) return getImageUrl(specificBedroom);

    // 2. Try to get the first image from the first room
    if (rooms?.[0]?.images?.[0]) return getImageUrl(rooms[0].images[0]);
    if (rooms?.[0]?.imageSrc) return getImageUrl(rooms[0].imageSrc);

    // 3. Fallback to the first listing image
    if (images?.[0]) return getImageUrl(images[0]);
    
    return null;
  }, [images, rooms]);

  // Smart bed info summary
  const getBedInfo = () => {
    if (rooms.length === 0) return bedType || "Bed arrangement not specified";
    
    // Get unique bed types from available rooms
    const bedTypes = Array.from(new Set(rooms.map(r => r.bedType).filter(Boolean)));
    if (bedTypes.length === 1) {
      const count = rooms[0].bedCount || 1;
      return `${bedTypes[0]}${count > 1 ? ` x ${count}` : ""} setup`;
    }
    if (bedTypes.length > 1) return "Multiple bed configurations";
    return bedType || "Standard bed setup";
  };

  const bedInfo = getBedInfo();

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 py-4">
      {/* Main Content - Left Side */}
      <div className="lg:col-span-2 flex flex-col gap-12">
        
        {/* Host Info */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between py-4 px-5 bg-gray-50 dark:bg-gray-800/40 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <Avatar src={owner?.image} className="w-12 h-12 shadow-sm" />
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">Hosted by {owner?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                 <ShieldCheck size={12} className="text-emerald-500" />
                 <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Verified Host</span>
              </div>
            </div>
          </div>
        </motion.section>

         {/* Available Rooms Section */}
         <motion.section
            id="available-rooms"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
         >
            <AvailableRoomsSection
             rooms={rooms}
             listingId={id}
             landlordId={owner.id}
             listingName={title}
             onSubmit={handleInquiry}
             isLoading={isLoading}
             user={user}
             activeStay={activeStay}
           />
         </motion.section>

         {/* Room Details Grid */}
         <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
         >
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Property Overview</h2>
           <div className="grid grid-cols-3 gap-4">
             <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow">
               <DoorOpen size={28} className="text-primary/80" />
               <p className="text-xl font-black text-gray-900 dark:text-white">{rooms.length || roomCount}</p>
               <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Total Rooms</p>
             </div>
             <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow">
               <Bath size={28} className="text-primary/80" />
               <p className="text-xl font-black text-gray-900 dark:text-white">{bathroomCount}</p>
               <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Bathrooms</p>
             </div>
             <button 
                onClick={() => document.getElementById('available-rooms')?.scrollIntoView({ behavior: 'smooth' })}
                className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center gap-2 hover:shadow-md hover:border-primary/50 transition-all group"
             >
               <CheckCircle2 size={28} className="text-emerald-500 group-hover:scale-110 transition-transform" />
               <p className="text-xl font-black text-gray-900 dark:text-white">{rooms.filter(r => r.status === "AVAILABLE" && r.availableSlots > 0).length}</p>
               <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Available Units</p>
             </button>
           </div>
         </motion.section>

        {/* Where You'll Sleep */}
        {bedroomImage && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Where you&apos;ll sleep</h2>
            <div 
              onClick={() => setShowBedroomPreview(true)}
              className="group relative overflow-hidden rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer h-80 sm:h-96"
            >
              <SafeImage
                src={bedroomImage}
                alt="Bedroom"
                className="group-hover:scale-[1.03] transition-transform duration-700"
                containerClassName="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-white shadow-xl">
                    <Bed size={20} />
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {category?.value === 'BEDSPACE' ? 'Shared Sleeping Area' : 'Private Bedroom'}
                  </h3>
                </div>
                <p className="text-xs font-black text-white/70 uppercase tracking-[0.2em] ml-1">
                  {bedInfo}
                </p>
              </div>
              <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-md rounded-full p-2">
                 <Camera size={20} className="text-white" />
              </div>
            </div>
          </motion.section>
        )}

        {/* Category & Description */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col gap-10"
        >
          {category && CategoryIcon && (
            <div className="pb-2">
              <ListingCategory
                icon={CategoryIcon}
                label={category.label}
                description={category.description || ""}
              />
            </div>
          )}

          <div className="bg-gray-50/50 dark:bg-gray-800/20 p-8 rounded-3xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About this place</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4 font-medium">{description}</p>
            <button
              onClick={() => setShowDescriptionModal(true)}
              className="mt-4 px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 hover:shadow-md transition-shadow hover:-translate-y-0.5 transform duration-200"
            >
              Read Full Details
            </button>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What this place offers</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
            {amenitiesArray.slice(0, 9).map((amenity) => (
              <div key={amenity} className="flex items-center gap-3">
                {getAmenityIcon(amenity)}
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {amenity.includes('|') ? amenity.split('|')[0] : amenity}
                </span>
              </div>
            ))}
          </div>
            {amenitiesArray.length > 9 && (
              <button
                onClick={() => setShowAmenitiesModal(true)}
                className="mt-8 px-6 py-2.5 w-full md:w-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 hover:shadow-md transition-shadow hover:-translate-y-0.5 transform duration-200"
              >
                Show all {amenitiesArray.length} amenities
            </button>
          )}
        </motion.section>

        {/* Safety & Security Section */}
        {(features?.cctv || features?.security24h || features?.fireSafety || (features?.customFeatures?.length || 0) > 0) && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                  <ShieldCheck size={20} />
                </div>
                Safety & Reassurance
              </h2>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-lg">Verified Secure</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features?.cctv && (
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-emerald-500/10 shadow-sm">
                  <Camera className="text-emerald-500 shrink-0" size={24} />
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">CCTV Monitoring</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">24/7 Active surveillance in common areas</p>
                  </div>
                </div>
              )}
              {features?.security24h && (
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-emerald-500/10 shadow-sm">
                  <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">On-site Security</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Dedicated personnel protecting the premises</p>
                  </div>
                </div>
              )}
              {features?.fireSafety && (
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-emerald-500/10 shadow-sm">
                  <Flame className="text-emerald-500 shrink-0" size={24} />
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Fire Safety Ready</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Equipped with smoke alarms & extinguishers</p>
                  </div>
                </div>
              )}
              {features?.customFeatures?.map((f, i) => {
                const { label, icon } = parseCustomItem(f);
                return (
                  <div key={i} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-emerald-500/10 shadow-sm">
                    <CustomIcon name={icon} fallback={CheckCircle2} className="text-emerald-500 shrink-0" size={24} />
                    <div>
                      <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{label}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Verified Property Feature</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* House Rules & Policies Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-50 dark:bg-gray-800/40 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Policies & Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-primary">
                      {rules?.femaleOnly ? <Users size={24} /> : rules?.maleOnly ? <Users size={24} /> : <Users size={24} />}
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Gender Restriction</p>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {rules?.femaleOnly ? "Strictly Female Only" : rules?.maleOnly ? "Strictly Male Only" : "Co-living Allowed"}
                      </p>
                   </div>
                </div>

                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-primary">
                      <Clock size={24} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Curfew Policy</p>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {rules?.noCurfew ? "No Curfew (24/7 Access)" : "Standard Curfew applies"}
                      </p>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-primary">
                      <Users size={24} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Visitors Policy</p>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {rules?.visitorsAllowed ? "Visitors are welcome" : "No visitors allowed"}
                      </p>
                   </div>
                </div>

                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-primary">
                      <PawPrint size={24} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Pets Policy</p>
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {rules?.petsAllowed ? "Pets are allowed" : "Strictly no pets"}
                      </p>
                   </div>
                </div>
             </div>
          </div>

          {(rules?.customRules?.length || 0) > 0 && (
            <div className="mt-10 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
               <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Additional Landlord Rules</p>
               <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rules?.customRules.map((rule, idx) => {
                    const { label, icon } = parseCustomItem(rule);
                    return (
                      <li key={idx} className="flex items-center gap-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
                         <div className="flex-shrink-0">
                            {icon ? (
                               <CustomIcon name={icon} fallback={() => <div className="w-1.5 h-1.5 bg-primary rounded-full" />} className="text-primary" size={18} />
                            ) : (
                               <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            )}
                         </div>
                         {label}
                      </li>
                    );
                  })}
               </ul>
            </div>
          )}
        </motion.section>

        {/* Reviews Section */}
        <motion.section 
          id="reviews-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <ListingReviews
            reviews={reviews}
            listingRating={rating}
            listingReviewCount={reviewCount}
            ownerName={owner?.name || "Property Owner"}
            currentUser={user}
            listing={{
              title,
              imageSrc: images?.[0]?.url || "",
              region: region || "",
              country: country || ""
            }}
          />
        </motion.section>

        {/* Map */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Location</h2>
          <div className="rounded-3xl overflow-hidden h-96 shadow-lg border border-gray-100 dark:border-gray-700 relative">
            <Map 
              center={latlng} 
              readonly={true}
              scrollWheelZoom={true}
            />
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-gray-800 flex items-start gap-4 z-[1000] pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                 <MapPin size={20} />
              </div>
              <div>
                 <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Exact Area Masked</p>
                 <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">You will see the precise location after your booking is confirmed.</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

       {/* Floating Inquiry Card - Right Side */}
       <div className="lg:col-span-1 hidden lg:block">
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.2 }}
           className="sticky top-32 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 shadow-2xl relative overflow-hidden group"
         >
           <div className="mb-8 relative z-10">
             <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Starting From</p>
             <div className="flex items-baseline gap-2 mb-2">
               <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">₱{price.toLocaleString()}</span>
               <span className="text-sm font-bold text-gray-500">/ month</span>
             </div>
           </div>

           <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-100 dark:border-gray-700 relative z-10">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                Explore the <button 
                  onClick={() => document.getElementById('available-rooms')?.scrollIntoView({ behavior: 'smooth' })}
                  className="font-bold text-gray-900 dark:text-white hover:text-primary underline decoration-primary/30 underline-offset-4 transition-colors"
                >
                  Available Rooms
                </button> section on the left to select a specific unit, view its capacity, and send a reservation inquiry to the landlord.
              </p>
           </div>
           
           <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest relative z-10">
              <ShieldCheck size={14} />
              Secure Booking via BoardTAU
           </div>
         </motion.div>
       </div>

      {/* Description Modal */}
      <AnimatePresence>
        {showDescriptionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowDescriptionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 shadow-2xl border border-gray-100 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-8 sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md py-2 z-10">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">About this listing</h2>
                <button
                  onClick={() => setShowDescriptionModal(false)}
                  className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-900 dark:text-white"/>
                </button>
              </div>
              <div className="prose prose-lg dark:prose-invert">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-loose font-medium">{description}</p>
              </div>
              {category && (
                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">{category.label}</h3>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">{category.description}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Amenities Modal */}
      <AnimatePresence>
        {showAmenitiesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowAmenitiesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 shadow-2xl border border-gray-100 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8 sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md py-4 z-10 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Full Amenities</h2>
                <button
                  onClick={() => setShowAmenitiesModal(false)}
                  className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-900 dark:text-white" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                {amenitiesArray.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                    {getAmenityIcon(amenity)}
                    <span className="text-gray-800 dark:text-gray-200 font-bold text-lg">
                      {amenity.includes('|') ? amenity.split('|')[0] : amenity}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bedroom Fullscreen Preview Modal */}
      <AnimatePresence>
        {showBedroomPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setShowBedroomPreview(false)}
          >
             <button
                onClick={() => setShowBedroomPreview(false)}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-[70]"
              >
                <X size={24} className="text-white"/>
              </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-6xl w-full max-h-[90vh] flex flex-col items-center relative z-[75]"
              onClick={(e) => e.stopPropagation()}
            >
              <SafeImage
                src={bedroomImage}
                alt="Bedroom Full Preview"
                containerClassName="w-full h-[60vh] md:h-[75vh] rounded-3xl"
                className="object-contain"
              />
              <p className="text-white/60 text-sm font-black mt-6 uppercase tracking-widest">
                 {bedInfo || "Standard Unit Preview"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Mobile Sticky Booking Bar */}
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 p-4 pb-8 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-gray-900 dark:text-white">₱{price.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-gray-500 uppercase">/ mo</span>
        </div>
        <button 
          onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="text-[10px] font-bold text-primary underline underline-offset-2 text-left"
        >
          {rating?.toFixed(1)} ★ ({reviewCount} reviews)
        </button>
      </div>

      <button
        onClick={() => document.getElementById('available-rooms')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-8 h-12 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
      >
        Choose Room
      </button>
    </div>
    </>
  );
};

export default ListingDetailsClient;
