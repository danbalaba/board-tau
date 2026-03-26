"use client";
import React, { useState } from "react";
import Modal from "../modals/Modal";
import Button from "@/components/common/Button";
import { X, Calendar, User, Mail, Phone, Home, Info, Clock, Trash2, MapPin, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InquiryListing {
  id: string;
  title: string;
  imageSrc: string;
  location: any;
  region?: string;
  country?: string;
}

interface InquiryRoom {
  id: string;
  name: string;
  price: number;
  roomType: string;
  images: Array<{
    id: string;
    url: string;
  }>;
}

interface Inquiry {
  id: string;
  listingId: string;
  roomId: string;
  userId: string;
  moveInDate: string;
  checkOutDate: string;
  occupantsCount: number;
  role: string;
  contactMethod: string;
  message: string;
  status: string;
  paymentStatus: string;
  reservationFee: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  listing: InquiryListing;
  room: InquiryRoom;
}

interface InquiryDetailsModalProps {
  inquiry: Inquiry;
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
}

const InquiryDetailsModal: React.FC<InquiryDetailsModalProps> = ({
  inquiry,
  isOpen,
  onClose,
  onCancel,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = inquiry.room.images || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100/50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-200/50 dark:border-amber-800/50";
      case "APPROVED":
        return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light border border-primary/20 dark:border-primary-light/20";
      case "REJECTED":
        return "bg-red-100/50 text-red-800 dark:bg-red-900/40 dark:text-red-200 border border-red-200/50 dark:border-red-800/50";
      case "CANCELLED":
      case "EXPIRED":
        return "bg-gray-100/50 text-gray-800 dark:bg-gray-700/40 dark:text-gray-200 border border-gray-200/50 dark:border-gray-600/50";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const displayLocation = [
    inquiry.listing.region,
    inquiry.listing.country
  ].filter(Boolean).join(", ");

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="xl">
      <div className="flex flex-col max-h-[90vh]">
        {/* Header Section - hero image from the main listing */}
        <div className="relative h-64 w-full bg-gray-200 dark:bg-gray-800 shrink-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={inquiry.listing.imageSrc || "/images/placeholder.jpg"}
              alt={inquiry.room.name}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Status Overlay */}
          <div className="absolute top-4 left-4">
             <span
               className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black shadow-lg backdrop-blur-md ${getStatusColor(
                 inquiry.status
               )}`}
             >
               {inquiry.status}
             </span>
          </div>

          <div className="absolute bottom-6 left-8 right-8 text-white">
            <h2 className="text-3xl font-black mb-1 drop-shadow-lg tracking-tight">
              Inquiry for {inquiry.room.name}
            </h2>
            <div className="flex items-center gap-2 text-white/90 font-medium">
              <MapPin size={16} className="text-primary-light" />
              <span className="text-sm font-bold">
                {displayLocation || "Location not specified"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all z-20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30 dark:bg-[#0f1419]/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Core Stats */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
                <h3 className="text-xs font-black text-primary/80 dark:text-primary-light/80 uppercase tracking-widest mb-6">Pricing Summary</h3>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-black text-gray-900 dark:text-white">₱ {inquiry.room.price.toLocaleString()}</span>
                  <span className="text-sm font-medium text-gray-400 mb-1.5 uppercase tracking-wide">/ month</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10">
                  <Tag size={18} className="text-primary dark:text-primary-light" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-primary dark:text-primary-light uppercase tracking-widest">Reservation Fee</span>
                    <span className="text-base font-bold text-gray-900 dark:text-white">₱ {inquiry.reservationFee.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
                <h3 className="text-xs font-black text-primary/80 dark:text-primary-light/80 uppercase tracking-widest mb-6">Schedule Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <Calendar size={18} className="text-emerald-500 mb-2" />
                    <span className="text-[10px] block font-black text-gray-400 uppercase tracking-widest mb-1">Move In</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(inquiry.moveInDate)}</span>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <Clock size={18} className="text-amber-500 mb-2" />
                    <span className="text-[10px] block font-black text-gray-400 uppercase tracking-widest mb-1">Check Out</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(inquiry.checkOutDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Occupant info & Message */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
                 <h3 className="text-xs font-black text-primary/80 dark:text-primary-light/80 uppercase tracking-widest mb-6">Occupant Information</h3>
                 <div className="space-y-4">
                    <div className="flex flex-col gap-1 mb-2">
                       <span className="text-[10px] block font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Inquiring for Listing</span>
                       <div className="flex items-center gap-2 text-primary font-black text-sm">
                          <Home size={14} />
                          {inquiry.listing.title}
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                        <User size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] block font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Occupancy Type</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{inquiry.room.roomType === "SOLO" ? "Solo Occupant" : "Shared Bedspace"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                        <Clock size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] block font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Member Count</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{inquiry.occupantsCount} {inquiry.occupantsCount === 1 ? "Person" : "People"}</span>
                      </div>
                    </div>
                 </div>
              </div>

              {inquiry.message && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
                  <h3 className="text-xs font-black text-primary/80 dark:text-primary-light/80 uppercase tracking-widest mb-4">Message to Host</h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-l-4 border-primary italic text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    "{inquiry.message}"
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 opacity-50">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Clock size={10} /> Submitted on {formatDateTime(inquiry.createdAt)}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Clock size={10} /> Last activity {formatDateTime(inquiry.updatedAt)}
              </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 shrink-0">
          <Button 
            variant="secondary" 
            outline 
            className="flex-1 h-12 rounded-2xl font-bold" 
            onClick={onClose}
          >
            Close
          </Button>
          {onCancel && inquiry.status === "PENDING" && (
            <Button 
              className="flex-[2] h-12 rounded-2xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-xl shadow-rose-500/20 px-6 py-2.5 flex items-center justify-center gap-2 group/cancel" 
              onClick={onCancel}
            >
              <Trash2 size={16} className="group-hover/cancel:rotate-12 transition-transform" /> 
              Cancel Inquiry
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default InquiryDetailsModal;
