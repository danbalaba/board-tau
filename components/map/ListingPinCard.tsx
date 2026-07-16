"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, MapPin, BedDouble, Tag, ArrowRight } from "lucide-react";

interface ListingPinCardProps {
  listing: any | null;
  onClose: () => void;
  onViewDetails: () => void;
}

export default function ListingPinCard({ listing, onClose, onViewDetails }: ListingPinCardProps) {
  if (!listing) return null;

  const imageSrc =
    (typeof listing.imageSrc === "string" && listing.imageSrc.startsWith("http"))
      ? listing.imageSrc
      : Array.isArray(listing.images) && listing.images[0]?.url
        ? listing.images[0].url
        : "https://res.cloudinary.com/dtg0zavxl/image/upload/v1727878437/BoardTAU/Assets/bnnwtyyvsh42iyn33d5y.jpg";

  const category = listing.categories?.[0]?.category?.name
    || listing.category?.[0]
    || "Boarding House";

  const availableRooms = listing.rooms?.filter((r: any) => r.status === "available")?.length
    ?? listing.rooms?.length
    ?? null;

  const shortDesc = listing.description
    ? listing.description.slice(0, 80) + (listing.description.length > 80 ? "…" : "")
    : null;

  return (
    <AnimatePresence>
      {listing && (
        <motion.div
          key={listing.id}
          initial={{ opacity: 0, y: 28, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[92%] max-w-[360px] pointer-events-auto"
        >
          <div className="relative bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden border border-white/60 dark:border-gray-700/50">

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition-colors text-white"
            >
              <X size={13} />
            </button>

            {/* Hero Image */}
            <div className="relative w-full h-36 bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <Image
                src={imageSrc}
                alt={listing.title}
                fill
                className="object-cover"
              />
              {/* Price badge on image */}
              <div
                className="absolute bottom-2 left-3 px-3 py-1 rounded-full text-white text-sm font-black shadow-md"
                style={{ backgroundColor: "var(--primary-color)" }}
              >
                ₱{listing.price?.toLocaleString()}<span className="font-normal text-xs opacity-80">/mo</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col gap-3">

              {/* Category badge */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "var(--primary-color)" }}
                >
                  <Tag size={9} />
                  {category}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2">
                {listing.title}
              </h3>

              {/* Short description */}
              {shortDesc && (
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {shortDesc}
                </p>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin size={11} style={{ color: "var(--primary-color)" }} />
                  {listing.region || listing.lga || "Tarlac"}
                </span>
                {availableRooms !== null && (
                  <span className="flex items-center gap-1">
                    <BedDouble size={11} style={{ color: "var(--primary-color)" }} />
                    {availableRooms} room{availableRooms !== 1 ? "s" : ""} available
                  </span>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={() => { onViewDetails(); onClose(); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] mt-1"
                style={{ backgroundColor: "var(--primary-color)" }}
              >
                View Full Details
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
