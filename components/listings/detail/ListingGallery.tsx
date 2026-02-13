"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose } from "react-icons/md";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

interface ListingImageData {
  url: string;
  caption?: string;
  order?: number;
  roomType?: string;
}

interface ListingGalleryProps {
  title: string;
  images: ListingImageData[];
  listingId: string;
}

interface CategorizedImages {
  [key: string]: ListingImageData[];
}

const ROOM_TYPES = ["Bedroom", "Living Room", "Kitchen", "Bathroom", "Exterior", "Common Area"];

const ListingGallery: React.FC<ListingGalleryProps> = ({
  title,
  images,
  listingId,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<string>("All");
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll thumbnail strip to current image
  useEffect(() => {
    if (thumbnailScrollRef.current) {
      const thumbnail = thumbnailScrollRef.current.querySelector(
        `[data-index="${currentIndex}"]`
      ) as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentIndex]);

  const sortedImages = [...images].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Categorize images by room type
  const categorizedImages = useMemo(() => {
    const categories: CategorizedImages = {
      All: sortedImages,
    };

    ROOM_TYPES.forEach((room) => {
      categories[room] = sortedImages.filter(
        (img) => img.roomType === room || img.caption?.includes(room)
      );
    });

    return categories;
  }, [sortedImages]);

  // Get images for selected room
  const currentRoomImages = categorizedImages[selectedRoom] || sortedImages;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % currentRoomImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? currentRoomImages.length - 1 : prev - 1
    );
  };

  if (!sortedImages || sortedImages.length === 0) {
    return <div className="w-full h-96 bg-gray-200 dark:bg-gray-800" />;
  }

  return (
    <>
      {/* Main Gallery Grid */}
      <div className="relative w-full bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 p-4 md:p-6 max-w-7xl mx-auto">
          {/* Main Image */}
          <div className="col-span-2 md:col-span-2 row-span-2 rounded-card overflow-hidden h-96 md:h-full">
            <img
              src={sortedImages[0].url}
              alt={sortedImages[0].caption || title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Thumbnail Images */}
          {sortedImages.slice(1, 5).map((image, idx) => (
            <div
              key={idx}
              className="rounded-card overflow-hidden h-32 md:h-auto"
            >
              <img
                src={image.url}
                alt={image.caption || title}
                loading="lazy"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
              />
            </div>
          ))}
        </div>

        {/* Show All Photos Button */}
        <button
          onClick={() => {
            setShowModal(true);
            setSelectedRoom("All");
            setCurrentIndex(0);
          }}
          className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-white dark:bg-gray-800 text-black dark:text-white rounded-input px-4 py-2 font-semibold text-sm md:text-base shadow-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm-1 4h1v2H4v-2z" clipRule="evenodd" />
          </svg>
          Show all photos
        </button>
      </div>

      {/* Fullscreen Modal with Room Categories */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full max-w-5xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Room Type Selector - Horizontal Scrollable */}
              <div className="mb-4 overflow-x-auto pb-2 flex gap-2">
                {["All", ...ROOM_TYPES].map((room) => {
                  const roomImages = categorizedImages[room] || [];
                  if (room !== "All" && roomImages.length === 0) return null;

                  return (
                    <button
                      key={room}
                      onClick={() => {
                        setSelectedRoom(room);
                        setCurrentIndex(0);
                      }}
                      className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold transition-all text-sm ${
                        selectedRoom === room
                          ? "bg-primary text-white"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {room} ({roomImages.length})
                    </button>
                  );
                })}
              </div>

              {/* Image Display */}
              <div className="relative flex-1 flex items-center justify-center mb-4 min-h-96">
                <img
                  src={currentRoomImages[currentIndex].url}
                  alt={currentRoomImages[currentIndex].caption || title}
                  className="max-w-full max-h-full object-contain rounded-card"
                />
              </div>

              {/* Image Caption */}
              {currentRoomImages[currentIndex].caption && (
                <p className="text-center text-white/80 text-sm mb-3">
                  {currentRoomImages[currentIndex].caption}
                </p>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between gap-4 text-white">
                {/* Previous Button */}
                <button
                  onClick={prevImage}
                  disabled={currentRoomImages.length <= 1}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                >
                  <BsChevronLeft size={24} />
                </button>

                {/* Image Counter & Thumbnails */}
                <div className="flex-1">
                  <p className="text-center mb-3 text-sm">
                    {currentIndex + 1} / {currentRoomImages.length}
                  </p>
                  <div
                    ref={thumbnailScrollRef}
                    className="flex gap-2 justify-center overflow-x-auto pb-2 max-h-20 scroll-smooth"
                  >
                    {currentRoomImages.map((image, idx) => (
                      <button
                        key={idx}
                        data-index={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`flex-shrink-0 w-12 h-12 rounded-sm overflow-hidden border-2 transition-colors ${
                          idx === currentIndex
                            ? "border-white"
                            : "border-gray-600 hover:border-white"
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.caption || title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next Button */}
                <button
                  onClick={nextImage}
                  disabled={currentRoomImages.length <= 1}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                >
                  <BsChevronRight size={24} />
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <MdClose size={28} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ListingGallery;
