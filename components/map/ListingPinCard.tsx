"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, DoorOpen, Star, ArrowRight, Home } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import { formatPrice, calculateAverageRating } from "@/utils/helper";
import { getDynamicIcon } from "@/lib/iconResolver";

interface ListingPinCardProps {
  listing: any | null;
  onClose: () => void;
  onViewDetails: () => void;
}

export default function ListingPinCard({ listing, onClose, onViewDetails }: ListingPinCardProps) {
  if (!listing) return null;

  // Resolve best display image safely using helper function
  const displayImage = (() => {
    const getImageUrl = (img: any) => {
      if (!img) return null;
      if (typeof img === "string") return img;
      if (typeof img.url === "string") return img.url;
      if (typeof img.imageUrl === "string") return img.imageUrl;
      if (typeof img.imageSrc === "string") return img.imageSrc;
      if (typeof img.src === "string") return img.src;
      return null;
    };

    if (listing.imageSrc) return getImageUrl(listing.imageSrc);
    if (Array.isArray(listing.images) && listing.images.length > 0) return getImageUrl(listing.images[0]);
    if (Array.isArray(listing.rooms) && listing.rooms.length > 0 && listing.rooms[0].images?.length > 0) {
      return getImageUrl(listing.rooms[0].images[0]);
    }
    return null;
  })();

  // Resolve dynamic Property Type from refactored DB relation
  const propType = listing.propertyType;
  const PropertyIcon = getDynamicIcon(propType?.icon, Home);
  const propTypeName = propType?.name 
    || (Array.isArray(listing.categories) && listing.categories[0]?.category?.name)
    || (Array.isArray(listing.category) && listing.category[0])
    || "Boarding House";

  // Ratings calculation
  const reviewsArray: any[] = listing.reviews || [];
  const reviewCount = reviewsArray.length || listing.reviewCount || 0;
  const rawRating = listing.rating;
  const rating = reviewCount > 0 ? calculateAverageRating(reviewsArray, rawRating) : null;
  const hasRating = reviewCount > 0 && rating != null && rating > 0;

  // Room availability computation
  const rooms: any[] = listing.rooms || [];
  const availableRooms = rooms.filter(
    (r) => r.status === "AVAILABLE" && (r.availableSlots === undefined || r.availableSlots > 0)
  ).length;

  const shortDesc = listing.description
    ? listing.description.slice(0, 90) + (listing.description.length > 90 ? "…" : "")
    : null;

  return (
    <AnimatePresence>
      {listing && (
        <motion.div
          key={listing.id}
          initial={{ opacity: 0, y: 28, scale: 0.94, x: "-50%" }}
          animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
          exit={{ opacity: 0, y: 20, scale: 0.94, x: "-50%" }}
          transition={{ type: "spring", damping: 24, stiffness: 320 }}
          className="absolute bottom-6 left-1/2 z-[250] w-[92%] max-w-[360px] pointer-events-auto"
        >
          <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden border border-white/60 dark:border-gray-700/60 flex flex-col">

            {/* Hero Image Container */}
            <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-800 overflow-hidden group">
              <SafeImage
                src={displayImage}
                alt={listing.title}
                priority={true}
              />
              
              {/* Image Gradient Overlay for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-3 right-3 z-30 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-md"
                title="Close listing preview"
              >
                <X size={14} />
              </button>

              {/* Top Left Property Type Badge */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20 text-white shadow-sm">
                <PropertyIcon size={12} className="text-emerald-400 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {propTypeName}
                </span>
              </div>

              {/* Bottom Left Price Badge */}
              <div className="absolute bottom-2.5 left-3 z-20 flex items-center gap-1 bg-primary/95 text-white px-3 py-1 rounded-xl shadow-lg border border-white/20 backdrop-blur-md">
                <span className="text-[9px] font-bold uppercase tracking-tight opacity-90">From</span>
                <span className="text-sm font-black">₱{formatPrice(listing.price)}</span>
                <span className="text-[9px] font-medium opacity-80">/mo</span>
              </div>

              {/* Bottom Right Rating Pill */}
              {hasRating ? (
                <div className="absolute bottom-2.5 right-3 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10 text-white shadow-sm">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  <span className="text-xs font-black">{Number(rating).toFixed(1)}</span>
                </div>
              ) : (
                <div className="absolute bottom-2.5 right-3 z-20 flex items-center gap-1 bg-amber-500/90 text-white backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20 text-[9px] font-black uppercase tracking-wider shadow-sm">
                  <Star size={9} className="fill-white" />
                  <span>NEW</span>
                </div>
              )}
            </div>

            {/* Info Body */}
            <div className="p-4 flex flex-col gap-2.5">
              {/* Title */}
              <h3 className="font-extrabold text-gray-900 dark:text-white text-base leading-snug line-clamp-1">
                {listing.title}
              </h3>

              {/* Short Description */}
              {shortDesc && (
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium line-clamp-2">
                  {shortDesc}
                </p>
              )}

              {/* Location & Availability Meta Badges */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/60 p-2 rounded-xl border border-gray-100 dark:border-gray-700/60 text-xs">
                  <MapPin size={12} className="text-primary shrink-0" />
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate">
                    {listing.region || "Tarlac"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/60 p-2 rounded-xl border border-gray-100 dark:border-gray-700/60 text-xs">
                  <DoorOpen size={12} className={availableRooms > 0 ? "text-primary shrink-0" : "text-gray-400 shrink-0"} />
                  <span className={`text-[11px] font-black truncate ${availableRooms > 0 ? "text-primary dark:text-primary-light" : "text-gray-400"}`}>
                    {availableRooms > 0 ? `${availableRooms} Units Available` : "Fully Booked"}
                  </span>
                </div>
              </div>

              {/* CTA View Details Button */}
              <button
                type="button"
                onClick={() => { onViewDetails(); onClose(); }}
                className="w-full mt-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-xs uppercase tracking-wider text-white bg-primary hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 active:scale-95 cursor-pointer"
              >
                <span>View Full Details</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
