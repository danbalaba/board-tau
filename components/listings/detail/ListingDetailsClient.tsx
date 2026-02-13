"use client";
import React, { useState, useMemo, useEffect, useTransition } from "react";
import { User } from "next-auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

import Avatar from "@/components/common/Avatar";
import { AiOutlineCheck } from "react-icons/ai";
import { MdClose } from "react-icons/md";
import ListingReviews from "./ListingReviews";
import InquiryModal from "@/components/modals/InquiryModal";
import Modal from "@/components/modals/Modal";
import Button from "@/components/common/Button";

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
  guestCount: number;
  bathroomCount: number;
  latlng: number[];
  amenities: string[];
  roomType: string;
  bedType?: string | null;
  rating?: number;
  reviewCount?: number;
  images?: ListingImageData[];
  reviews?: any[];
  rooms: any[];
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
  guestCount,
  bathroomCount,
  latlng,
  amenities,
  roomType,
  bedType,
  rating = 4.8,
  reviewCount = 0,
  images = [],
  reviews = [],
  rooms,
}) => {
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();

  // Modal states
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  const handleInquiry = async (data: any) => {
    if (!user) {
      toast.error("Please log in to send an inquiry.");
      return;
    }

    startTransition(async () => {
      try {
        const inquiryData = {
          ...data,
          listingId: id,
          userId: user.id,
        };

        const response = await fetch("/api/inquiries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inquiryData),
        });

        if (!response.ok) {
          throw new Error("Failed to create inquiry");
        }

        toast.success("Inquiry sent! Waiting for owner approval.");
      } catch (error: any) {
        console.error('Inquiry error:', error);
        toast.error(error?.message || 'Failed to send inquiry');
      }
    });
  };

  const bedroomImage = images?.[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 py-8">
      {/* Main Content - Left Side */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        {/* Host Info */}
        <section className="pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <Avatar src={owner?.image} />
            <div>
              <p className="font-semibold text-text-primary">Hosted by {owner?.name}</p>
              <p className="text-sm text-text-secondary">Joined recently</p>
            </div>
          </div>
        </section>

        {/* Room Details */}
        <section className="pb-6 border-b border-border">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-sm text-text-secondary">Guests</p>
              <p className="text-lg font-semibold text-text-primary">{guestCount}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Rooms</p>
              <p className="text-lg font-semibold text-text-primary">{roomCount}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Bathrooms</p>
              <p className="text-lg font-semibold text-text-primary">{bathroomCount}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Room Type</p>
              <p className="text-lg font-semibold text-text-primary">{roomType}</p>
            </div>
          </div>
        </section>

        {/* Where You'll Sleep */}
        {bedroomImage && (
          <section className="pb-6 border-b border-border">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Where you&apos;ll sleep</h2>
            <div className="flex gap-4">
              <div className="w-32 h-32 rounded-card overflow-hidden flex-shrink-0">
                <img
                  src={bedroomImage.url}
                  alt="Bedroom"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-semibold text-text-primary text-lg">Bedroom</p>
                <p className="text-sm text-text-secondary mt-1">{bedType || "Single/Double bed"}</p>
                <p className="text-sm text-text-secondary">{roomType}</p>
              </div>
            </div>
          </section>
        )}

        {/* Description */}
        <section className="pb-6 border-b border-border">
          <h2 className="text-2xl font-bold text-text-primary mb-3">About this place</h2>
          <p className="text-text-secondary line-clamp-4 mb-4">{description}</p>
          <button
            onClick={() => setShowDescriptionModal(true)}
            className="text-primary hover:underline font-medium text-sm"
          >
            Show more
          </button>
        </section>

        {/* Reviews Section */}
        <section id="reviews-section" className="pb-6 border-b border-border">
          <ListingReviews
            reviews={reviews}
            listingRating={rating}
            listingReviewCount={reviewCount}
          />
        </section>

        {/* Amenities */}
        <section className="pb-6 border-b border-border">
          <h2 className="text-2xl font-bold text-text-primary mb-4">What this place offers</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {amenities.slice(0, 7).map((amenity) => (
              <div key={amenity} className="flex items-center gap-3">
                <AiOutlineCheck size={20} className="text-primary flex-shrink-0" />
                <span className="text-text-secondary text-sm">{amenity}</span>
              </div>
            ))}
          </div>
          {amenities.length > 7 && (
            <button
              onClick={() => setShowAmenitiesModal(true)}
              className="mt-6 text-primary hover:underline font-medium text-sm"
            >
              Show all {amenities.length} amenities
            </button>
          )}
        </section>

        {/* Map */}
        <section className="pb-6">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Location</h2>
          <div className="rounded-card overflow-hidden h-96 shadow-soft">
            <Map center={latlng} />
          </div>
          <p className="text-sm text-text-secondary mt-3">
              <span className="inline-block mr-2">
                <svg className="w-4 h-4 text-primary dark:text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </span>
              Approximately near your selected college location
            </p>
        </section>
      </div>

      {/* Inquiry Card - Right Side */}
      <div className="lg:col-span-1">
        <div className="sticky top-32 bg-white dark:bg-gray-800 rounded-card border border-border dark:border-gray-700 p-6 shadow-soft transition-colors duration-300">
          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-text-primary">₱{price.toLocaleString()}</span>
              <span className="text-text-secondary">/ month</span>
            </div>
          </div>

          <Modal>
            <Modal.Trigger name="inquiry">
              <Button
                disabled={isLoading}
                className="flex flex-row items-center justify-center h-[42px] w-full"
                size="large"
              >
                Inquire Now
              </Button>
            </Modal.Trigger>

            <InquiryModal
              listingName={title}
              rooms={rooms}
              onSubmit={handleInquiry}
              isLoading={isLoading}
            />
          </Modal>
        </div>
      </div>

      {/* Description Modal */}
      <AnimatePresence>
        {showDescriptionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDescriptionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-card max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 transition-colors duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-text-primary dark:text-gray-100">About this boarding house</h2>
                <button
                  onClick={() => setShowDescriptionModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MdClose size={24} />
                </button>
              </div>
              <p className="text-text-secondary whitespace-pre-wrap">{description}</p>
              {category && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-semibold text-text-primary mb-2">{category.label}</h3>
                  <p className="text-text-secondary">{category.description}</p>
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
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAmenitiesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-card max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 transition-colors duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-text-primary dark:text-gray-100">All amenities</h2>
                <button
                  onClick={() => setShowAmenitiesModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MdClose size={24} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3">
                    <AiOutlineCheck size={20} className="text-primary" />
                    <span className="text-text-primary">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListingDetailsClient;
