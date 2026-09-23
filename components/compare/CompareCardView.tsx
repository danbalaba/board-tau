"use client";

import React from "react";
import { motion } from "framer-motion";
import { CompareListingCard } from "./CompareListingCard";

interface CompareCardViewProps {
  listings: any[];
  attributes: any[];
  resolveAmenityName: (attrId: string) => string;
  getItemIcon: (name: string, attrId?: string, explicitIcon?: string) => any;
  setAmenitiesModalConfig: (config: any) => void;
  onClose: () => void;
  clearListings: () => void;
}

export const CompareCardView: React.FC<CompareCardViewProps> = ({
  listings,
  attributes,
  resolveAmenityName,
  getItemIcon,
  setAmenitiesModalConfig,
  onClose,
  clearListings
}) => {
  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.15 } }
      }}
      className="flex gap-4 md:gap-6 items-stretch overflow-x-auto pb-2 custom-scrollbar h-full"
    >
      {listings.map((listing) => (
        <CompareListingCard
          key={listing.id}
          listing={listing}
          listings={listings}
          attributes={attributes}
          resolveAmenityName={resolveAmenityName}
          getItemIcon={getItemIcon}
          setAmenitiesModalConfig={setAmenitiesModalConfig}
          onClose={onClose}
          clearListings={clearListings}
        />
      ))}
    </motion.div>
  );
};
