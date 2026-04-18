"use client";
import React, { useState } from "react";
import Modal from "../../modals/Modal";
import Button from "@/components/common/Button";
import { X, ChevronLeft, ChevronRight, MessageSquare, LogIn, Ban, Info, CheckCircle2, XCircle, Users, Maximize2, Layers, DoorOpen, Clock } from "lucide-react";

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
      <div className="max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Info className="text-primary" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">
              Room Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="text-xl text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {/* Image Slider */}
          <div className="bg-gray-50 dark:bg-gray-900/50">
            <div className="aspect-[16/9] w-full relative overflow-hidden group">
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex]?.url || "/images/placeholder.jpg"}
                  alt={room.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}

              {/* Status Badge Over Image */}
              <div className="absolute top-6 right-6 z-10">
                <div
                  className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-xl flex items-center gap-2 ${
                    room.status === "AVAILABLE"
                      ? "bg-emerald-500/90 text-white"
                      : "bg-rose-500/90 text-white"
                  }`}
                >
                  {room.status === "AVAILABLE" ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {room.status === "AVAILABLE" ? "Available" : "Full"}
                </div>
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-800 text-primary rounded-2xl shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-800 text-primary rounded-2xl shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex gap-3 p-4 overflow-x-auto scrollbar-hide bg-white dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                {images.map((image, index) => (
                  <button
                    key={image.id || index}
                    onClick={() => handleImageClick(index)}
                    className={`flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      currentImageIndex === index
                        ? "border-primary scale-105 shadow-lg shadow-primary/20"
                        : "border-transparent opacity-60 hover:opacity-100"
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
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-[11px] font-black text-primary/60 uppercase tracking-[0.2em] mb-2">Room Entry</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-1 leading-tight">
                  {room.name}
                </h3>
                <p className="text-sm font-bold text-gray-400">
                  Part of {listingName}
                </p>
              </div>
              <div className="text-left md:text-right">
                <div className="flex items-baseline gap-1 md:justify-end">
                  <span className="text-4xl font-black text-gray-900 dark:text-white">
                    ₱{room.price.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">/mo</span>
                </div>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[11px] font-black uppercase tracking-wider border border-emerald-100 dark:border-emerald-800/50">
                   <Clock size={12} />
                   Reservation: ₱{room.reservationFee.toLocaleString()} (One-time)
                </div>
              </div>
            </div>

            {/* Attribute Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <div className="p-5 rounded-[1.5rem] bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm mb-3">
                  <Users className="text-primary" size={20} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Capacity</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{room.capacity} Pax</p>
              </div>

              {room.size && (
                <div className="p-5 rounded-[1.5rem] bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm mb-3">
                    <Maximize2 className="text-primary" size={20} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Room Size</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{room.size} sq.m.</p>
                </div>
              )}

              <div className="p-5 rounded-[1.5rem] bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm mb-3">
                  <Layers className="text-primary" size={20} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Room Type</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {room.roomType === "SOLO" ? "Solo" : "Bedspace"}{room.bedType && ` (${room.bedType})`}
                </p>
              </div>

              <div className="p-5 rounded-[1.5rem] bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm mb-3">
                  <DoorOpen className="text-primary" size={20} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Slots</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{room.availableSlots} of {room.capacity}</p>
              </div>
            </div>

            {/* Description & Amenities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {room.description && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-900 dark:text-gray-100 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Property Narrative
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-medium">
                    {room.description}
                  </p>
                </div>
              )}

              {room.amenities && room.amenities.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-900 dark:text-gray-100 mb-5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Essential Provisions
                  </h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    {room.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30 p-2.5 rounded-xl border border-gray-100/50 dark:border-gray-700/30"
                      >
                        <CheckCircle2 size={14} className="text-primary/70" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4 shrink-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
          <button 
            className="px-8 h-12 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all flex items-center gap-2 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={onClose}
          >
            <X size={16} /> Close
          </button>
          
          {user && room.status === "AVAILABLE" && (
            <button 
              className="px-8 h-12 rounded-2xl text-xs font-black uppercase tracking-widest bg-primary text-white hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]" 
              onClick={onInquire}
            >
              <MessageSquare size={16} /> Send Inquiry
            </button>
          )}
          
          {room.status !== "AVAILABLE" && (
            <button 
              className="px-8 h-12 rounded-2xl text-xs font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed flex items-center gap-2" 
              disabled
            >
              <Ban size={16} /> No Vacancy
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RoomDetailsModal;
