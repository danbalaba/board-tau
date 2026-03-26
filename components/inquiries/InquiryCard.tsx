"use client";
import React from "react";
import { motion } from "framer-motion";
import { Eye, Calendar, Home, Trash2, MapPin, User } from "lucide-react";

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

interface InquiryCardProps {
  inquiry: Inquiry;
  onViewDetails: () => void;
  onCancel?: () => void;
}

const InquiryCard: React.FC<InquiryCardProps> = ({
  inquiry,
  onViewDetails,
  onCancel,
}) => {
  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 border border-orange-200/50 dark:border-orange-800/50";
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 border border-green-200/50 dark:border-green-800/50";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 border border-red-200/50 dark:border-red-800/50";
      case "CANCELLED":
      case "EXPIRED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-200 border border-gray-200/50 dark:border-gray-600/50";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const displayLocation = [
    inquiry.listing.region,
    inquiry.listing.country
  ].filter(Boolean).join(", ");

  return (
    <motion.div 
      initial={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 relative group flex flex-col h-full"
    >
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />
      
      {/* Room Image */}
      <div className="h-44 w-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 z-10" />
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
          src={inquiry.listing.imageSrc || "/images/placeholder.jpg"}
          alt={inquiry.room.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 z-20">
          <span
            className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black shadow-sm backdrop-blur-md ${getStatusColor(
              inquiry.status
            )}`}
          >
            {inquiry.status}
          </span>
        </div>
      </div>

      {/* Inquiry Info */}
      <div className="p-5 flex-1 flex flex-col z-10 relative">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate drop-shadow-sm mb-1">
            {inquiry.room.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-bold flex items-center gap-1.5 mb-2 truncate text-primary/80">
            <Home className="text-primary" size={12} />
            {inquiry.listing.title}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase tracking-widest pl-0.5">
            <MapPin size={10} className="text-primary/60" />
            {displayLocation || "Location Not Specified"}
          </div>
        </div>

        <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600 dark:from-primary dark:to-emerald-400 mb-4 inline-block">
          ₱ {inquiry.room.price.toLocaleString()}<span className="text-sm font-medium text-gray-500 dark:text-gray-400">/mo</span>
        </p>

        {/* Details Grid */}
        <div className="space-y-2.5 mb-6 flex-1 bg-gray-50/50 dark:bg-gray-900/30 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-light">
               <Calendar size={12} />
            </div>
            <span className="font-medium text-xs">Check-in: <span className="text-gray-900 dark:text-white font-bold">{formatDate(inquiry.moveInDate)}</span></span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
               <User size={12} />
            </div>
            <span className="font-medium text-xs">
              <span className="text-gray-900 dark:text-white font-bold">{inquiry.room.roomType === "SOLO" ? "Solo Room" : "Bedspace"}</span> •{" "}
              {inquiry.occupantsCount} {inquiry.occupantsCount === 1 ? "person" : "people"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-auto">
          <button
            onClick={onViewDetails}
            className="flex-1 py-2.5 px-4 font-bold text-sm rounded-xl transition-all shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 group/btn"
          >
            <Eye size={14} className="text-primary group-hover/btn:scale-110 transition-transform" />
            Details
          </button>
          {onCancel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              className="flex-1 py-2.5 px-4 font-bold text-sm rounded-xl transition-all shadow-sm border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center gap-2 group/cancel"
            >
              <Trash2 size={14} className="group-hover/cancel:rotate-12 transition-transform" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InquiryCard;
