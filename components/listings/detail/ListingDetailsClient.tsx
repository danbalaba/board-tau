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
import { DoorOpen, Bath, BedDouble, ShieldCheck, MapPin, CheckCircle2, X, Wifi, Car, Waves, Dumbbell, Wind, WashingMachine, Utensils, Refrigerator, Microwave, Droplets, Zap, Clock, Users, Flame, PawPrint, Camera, BookOpen, Square, Blinds, Lightbulb } from "lucide-react";
import ListingReviews from "./ListingReviews";
import Modal from "@/components/modals/Modal";
import Button from "@/components/common/Button";
import AvailableRoomsSection from "./AvailableRoomsSection";

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
    image: string | null;
    name: string | null;
  };
  category: { label: string; description?: string } | null;
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
}) => {
  // Convert amenities to string array for consistent rendering
  const amenitiesArray = (() => {
    if (Array.isArray(amenities)) {
      return amenities;
    } else if (amenities && typeof amenities === 'object') {
      const result = [];
      if (amenities.wifi) result.push("WiFi");
      if (amenities.parking) result.push("Parking");
      if (amenities.pool) result.push("Pool");
      if (amenities.gym) result.push("Gym");
      if (amenities.airConditioning) result.push("Air conditioning");
      if (amenities.laundry) result.push("Laundry area");
      return result;
    }
    return [];
  })();
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();
  const { success, error } = useResponsiveToast();

  // Modal states
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showBedroomPreview, setShowBedroomPreview] = useState(false);

  // Helper for explicit amenity icons
  const getAmenityIcon = (amenityName: string) => {
    const name = amenityName.toLowerCase();
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
    if (name.includes('desk')) return <BookOpen size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('balcony')) return <Square size={20} className="text-primary flex-shrink-0" />;
    if (name.includes('closet')) return <Blinds size={20} className="text-primary flex-shrink-0" />;
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

  const handleInquiry = async (data: any) => {
    if (!user) {
      error("Please log in to send an inquiry.");
      return;
    }

    try {
      const inquiryData = {
        ...data,
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

  const bedroomImage = images?.[0];

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
             listingName={title}
             onSubmit={handleInquiry}
             isLoading={isLoading}
             user={user}
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
              className="group relative overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-90" />
              <img
                src={bedroomImage.url}
                alt="Bedroom"
                className="w-full h-72 object-cover group-hover:scale-[1.03] transition-transform duration-700"
              />
              <div className="absolute bottom-6 left-6 z-20 text-white">
                <BedDouble size={32} className="mb-3" />
                <p className="font-bold text-2xl mb-1">Standard Unit</p>
                <p className="text-sm text-gray-300 font-medium">{bedType || "Single/Double beds"}</p>
              </div>
              <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-md rounded-full p-2">
                 <Camera size={20} className="text-white" />
              </div>
            </div>
          </motion.section>
        )}

        {/* Description */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
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

        {/* Amenities */}
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
                <span className="text-gray-700 dark:text-gray-300 font-medium">{amenity}</span>
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
            <Map center={latlng} />
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
                      {amenity}
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
              className="max-w-6xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={bedroomImage?.url}
                alt="Bedroom Full Preview"
                className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              />
              <p className="text-white/60 text-sm font-medium mt-6 uppercase tracking-widest">
                 {bedType || "Standard Unit Preview"}
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
          {rating} ★ ({reviewCount} reviews)
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
