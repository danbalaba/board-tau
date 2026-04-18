"use client";
import React from "react";
import { motion } from "framer-motion";
import { Eye, Calendar, Home, Trash2, MapPin, User, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  rejectionReason?: string;
  listing: InquiryListing;
  room: InquiryRoom;
}

interface InquiryCardProps {
  inquiry: Inquiry;
  onViewDetails: () => void;
  onCancel?: () => void;
  hasNotification?: boolean;
}

const InquiryCard: React.FC<InquiryCardProps> = ({
  inquiry,
  onViewDetails,
  onCancel,
  hasNotification,
}) => {
  const router = useRouter();
  const [isReservationClicked, setIsReservationClicked] = useState(false);

  // Load seen state from localStorage
  React.useEffect(() => {
    const seen = localStorage.getItem(`inquiry_seen_${inquiry.id}`);
    if (seen === "true") {
      setIsReservationClicked(true);
    }
  }, [inquiry.id]);
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
        <div className="absolute top-3 left-3 z-20">
          {hasNotification && (
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: ["0 0 0px rgba(16, 185, 129, 0)", "0 0 15px rgba(16, 185, 129, 0.5)", "0 0 0px rgba(16, 185, 129, 0)"]
              }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg border border-white/20 flex items-center justify-center"
            >
              NEW UPDATE
            </motion.div>
          )}
        </div>

        <div className="absolute top-3 right-3 z-20">
          <span
            className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black shadow-sm backdrop-blur-md flex items-center gap-1.5 ${getStatusColor(
              inquiry.status
            )}`}
          >
            {inquiry.status === "APPROVED" && <ArrowRight size={10} className="text-green-600 dark:text-green-400" />}
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
          {inquiry.status === "REJECTED" && inquiry.rejectionReason && (
            <div className="mt-2 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-1.5 rounded-lg border border-rose-100 dark:border-rose-800/50 italic line-clamp-1">
              Feedback: {inquiry.rejectionReason}
            </div>
          )}
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

          {inquiry.status === "APPROVED" && !isReservationClicked ? (
             <button
                onClick={(e) => {
                  e.stopPropagation();
                  localStorage.setItem(`inquiry_seen_${inquiry.id}`, "true");
                  setIsReservationClicked(true);
                  router.push("/reservations");
                }}
                className="flex-[1.5] py-2.5 px-2 sm:px-4 font-black text-[9px] sm:text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-1.5 sm:gap-2 group/res"
             >
                <ArrowRight size={14} className="group-hover/res:translate-x-1 transition-transform" />
                View Reservation
             </button>
          ) : onCancel && (
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
