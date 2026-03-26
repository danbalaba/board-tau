"use client";
import React, { useState } from "react";
import Modal from "../../modals/Modal";
import Button from "@/components/common/Button";
import { X, ChevronLeft, ChevronRight, User, Maximize, Clock, MessageSquare, LogIn, Ban } from "lucide-react";

interface Room {
  id: string;
  name: string;
  price: number;
  capacity: number;
  availableSlots: number;
  images: {
    id: string;
    url: string;
    caption?: string;
    order?: number;
  }[];
  roomType: string;
  status: string;
  description?: string;
  size?: number;
  bedType?: string;
  amenities?: string[];
  reservationFee: number;
}

interface RoomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  listingName: string;
  onInquire?: () => void;
  user?: any;
}

const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  isOpen,
  onClose,
  room,
  listingName,
  onInquire,
  user,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = room.images || [];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="xl" hasFixedFooter={true}>
      <div className="max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-text-primary dark:text-gray-100">
            Room Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="text-xl text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Image Slider */}
          <div className="relative bg-gray-100 dark:bg-gray-900">
            <div className="aspect-[16/9] w-full relative overflow-hidden">
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex]?.url || "/images/placeholder.jpg"}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={image.id || index}
                    onClick={() => handleImageClick(index)}
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index
                        ? "border-primary"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.caption || `Room image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Room Information */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Room Details */}
              <div>
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                    room.status === "AVAILABLE"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}>
                    {room.status === "AVAILABLE" ? "Available" : "Full"}
                  </span>
                  <h3 className="text-2xl font-bold text-text-primary dark:text-gray-100">
                    {room.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {listingName}
                  </p>
                </div>

                <div className="flex flex-col gap-1 mb-4">
                  <p className="text-3xl font-bold text-primary dark:text-primary-light">
                    ₱ {room.price.toLocaleString()}
                    <span className="text-sm font-medium text-gray-500 ml-1">/month</span>
                  </p>
                  <p className="text-sm font-semibold text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-lg w-fit">
                    Reservation Fee: ₱ {room.reservationFee.toLocaleString()} (One-time)
                  </p>
                </div>

                {/* Room Specifications */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <User className="text-gray-500" size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Capacity</p>
                      <p className="font-semibold text-text-primary dark:text-gray-100">
                        {room.capacity} {room.capacity === 1 ? "person" : "people"}
                      </p>
                    </div>
                  </div>

                  {room.size && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Maximize className="text-gray-500" size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Room Size</p>
                        <p className="font-semibold text-text-primary dark:text-gray-100">
                          {room.size} sq.m.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Clock className="text-gray-500" size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Room Type</p>
                      <p className="font-semibold text-text-primary dark:text-gray-100">
                        {room.roomType === "SOLO" ? "Solo Room" : "Bedspace"}
                        {room.bedType && ` - ${room.bedType}`}
                      </p>
                    </div>
                  </div>

                  {room.roomType === "BEDSPACE" && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 font-bold text-sm">SL</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Available Slots</p>
                        <p className="font-semibold text-text-primary dark:text-gray-100">
                          {room.availableSlots} of {room.capacity} available
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Description & Amenities */}
              <div>
                {/* Description */}
                {room.description && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-text-primary dark:text-gray-100 mb-2">
                      About this room
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {room.description}
                    </p>
                  </div>
                )}

                {/* Amenities */}
                {room.amenities && room.amenities.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-text-primary dark:text-gray-100 mb-3">
                      Amenities
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {room.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 shrink-0">
          <Button 
            className="w-auto px-6 h-11 flex items-center justify-center gap-2" 
            variant="secondary" 
            outline 
            onClick={onClose}
          >
            <X size={16} /> Close
          </Button>
          {user && room.status === "AVAILABLE" && (
            <Button 
              className="w-auto px-6 h-11 flex items-center justify-center gap-2" 
              onClick={onInquire}
            >
              <MessageSquare size={16} /> Inquire About This Room
            </Button>
          )}
          {!user && room.status === "AVAILABLE" && (
            <Button 
              className="w-auto px-6 h-11 flex items-center justify-center gap-2" 
              onClick={onInquire}
            >
              <LogIn size={16} /> Log in to Inquire
            </Button>
          )}
          {room.status !== "AVAILABLE" && (
            <Button 
              className="w-auto px-6 h-11 flex items-center justify-center gap-2" 
              disabled
            >
              <Ban size={16} /> Room Not Available
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RoomDetailsModal;
