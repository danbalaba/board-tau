"use client";
import React from "react";
import { motion } from "framer-motion";
import { Eye, Calendar, Home, Trash2, MapPin, User, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import SafeImage from "@/components/common/SafeImage";

interface InquiryListing {
  id: string;
  title: string;
  imageSrc: string;
  images?: Array<{ url: string }>;
  location: any;
  region?: string;
  country?: string;
}

interface InquiryRoom {
  id: string;
  name: string;
  price: number;
  roomType: string;
  images?: Array<{ url: string }>;
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
  reservations?: Array<{ id: string; status: string; paymentStatus?: string }>;
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

  const reservationStatus = (inquiry as any).reservations?.[0]?.status;

  const getDisplayBadge = () => {
    if (reservationStatus === "COMPLETED") {
      return { label: "COMPLETED", color: "bg-purple-600 text-white border-white/30 shadow-md" };
    }
    if (reservationStatus === "CHECKED_IN") {
      return { label: "CHECKED IN", color: "bg-emerald-600 text-white border-white/30 shadow-md" };
    }
    if (reservationStatus === "CANCELLED") {
      return { label: "CANCELLED", color: "bg-gray-600 text-white border-white/30 shadow-md" };
    }

    switch (inquiry.status) {
      case "PENDING":
        return { label: "PENDING", color: "bg-amber-500 text-white border-white/30 shadow-md" };
      case "APPROVED":
        return { label: "APPROVED", color: "bg-[#2f7d6d] text-white border-white/30 shadow-md" };
      case "REJECTED":
        return { label: "REJECTED", color: "bg-rose-600 text-white border-white/30 shadow-md" };
      default:
        return { label: inquiry.status, color: "bg-gray-600 text-white border-white/30 shadow-md" };
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
    inquiry.listing?.region,
    inquiry.listing?.country
  ].filter(Boolean).join(", ");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={hasNotification ? { 
        opacity: 1, 
        y: 0,
        scale: [1, 1.02, 1],
        boxShadow: [
          "0 0 0 rgba(47, 125, 109, 0)",
          "0 12px 30px rgba(47, 125, 109, 0.25)",
          "0 0 0 rgba(47, 125, 109, 0)"
        ]
      } : { 
        opacity: 1, 
        y: 0,
        scale: 1,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" 
      }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ 
        opacity: { duration: 0.3 },
        y: { duration: 0.2, ease: "easeOut" },
        scale: { 
          duration: 2, 
          repeat: hasNotification ? Infinity : 0, 
          ease: "easeInOut",
          repeatDelay: 1
        }
      }}
      onClick={onViewDetails}
      className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-md hover:shadow-xl border border-gray-200/80 dark:border-gray-700/60 relative group flex flex-col h-full overflow-hidden transition-all duration-300 cursor-pointer"
    >
      {/* Subtle Hover Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />
      
      {/* Room Image */}
      <div className="h-44 w-full bg-gray-100 dark:bg-gray-700 relative overflow-hidden shrink-0">
        <SafeImage
          src={(inquiry.room?.images && inquiry.room.images.length > 0) 
            ? inquiry.room.images[0].url 
            : (inquiry.listing?.images && inquiry.listing.images.length > 0)
              ? inquiry.listing.images[0].url
              : inquiry.listing?.imageSrc || "/images/placeholder.jpg"
          }
          alt={inquiry.room.name}
          unoptimized={true}
        />
        
        {hasNotification && (
          <div className="absolute top-3 left-3 z-20">
            <span className="bg-primary text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md border border-white/20 flex items-center justify-center">
              New Update
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 z-20">
          <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black shadow-lg backdrop-blur-md border flex items-center gap-1.5 ${getDisplayBadge().color}`}>
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {getDisplayBadge().label}
          </span>
        </div>
      </div>

      {/* Inquiry Content */}
      <div className="p-5 flex-1 flex flex-col z-10 relative">
        <div className="mb-3">
          <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 truncate tracking-tight mb-1">
            {inquiry.room.name}
          </h3>
          <p className="text-xs text-primary font-extrabold flex items-center gap-1.5 mb-1.5 truncate">
            <Home size={13} className="shrink-0" />
            <span className="truncate">{inquiry.listing.title}</span>
          </p>
          <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
            <MapPin size={11} className="text-rose-500 shrink-0" />
            <span className="truncate">{displayLocation || "Location Not Specified"}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-2xl font-black text-primary dark:text-primary-light inline-flex items-baseline gap-1">
            ₱{Number(inquiry.room.price || 0).toLocaleString()}
            <span className="text-xs font-bold text-gray-400 dark:text-gray-400">/mo</span>
          </p>
        </div>

        {/* Details Card */}
        <div className="space-y-2 mb-5 flex-1 bg-gray-50 dark:bg-gray-900/60 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
            <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Calendar size={12} />
            </div>
            <span className="font-semibold text-[11px]">
              Check-in: <span className="text-gray-900 dark:text-white font-bold">{formatDate(inquiry.moveInDate)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
            <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <User size={12} />
            </div>
            <span className="font-semibold text-[11px]">
              <span className="text-gray-900 dark:text-white font-bold">{inquiry.room.roomType === "SOLO" ? "Solo Room" : "Bedspace"}</span> • {inquiry.occupantsCount} {inquiry.occupantsCount === 1 ? "person" : "people"}
            </span>
          </div>
          {inquiry.status === "REJECTED" && inquiry.rejectionReason && (
            <div className="mt-2 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900/50 italic line-clamp-2">
              Note: {inquiry.rejectionReason}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-auto pt-1 w-full">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="flex-1 py-2.5 px-2.5 sm:px-3 font-bold text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1.5 transition-all shadow-sm min-w-0"
          >
            <Eye size={14} className="text-primary shrink-0" />
            <span className="truncate">Details</span>
          </button>

          {inquiry.status === "APPROVED" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push("/reservations");
              }}
              className="flex-[1.4] py-2.5 px-2.5 sm:px-3 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md bg-primary text-white hover:bg-primary-dark flex items-center justify-center gap-1.5 min-w-0"
            >
              <ArrowRight size={14} className="shrink-0" />
              <span className="truncate">View Reservation</span>
            </button>
          ) : (inquiry.status === "PENDING" && onCancel) ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              className="flex-1 py-2.5 px-2.5 sm:px-3 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 flex items-center justify-center gap-1.5 transition-all shadow-sm min-w-0"
            >
              <Trash2 size={14} className="shrink-0" />
              <span className="truncate">Cancel</span>
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
};

export default InquiryCard;
