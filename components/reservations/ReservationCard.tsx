"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Calendar, CreditCard, Check, ArrowRight, Eye, X, MapPin, Star } from "lucide-react";

interface ReservationListing {
  id: string;
  title: string;
  imageSrc: string;
  location: any;
  region?: string;
  country?: string;
}

interface ReservationRoom {
  id: string;
  name: string;
  price: number;
  roomType: string;
}

interface Reservation {
  id: string;
  listingId: string;
  roomId: string;
  userId: string;
  startDate: string;
  endDate: string;
  durationInDays: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentReference?: string;
  createdAt: string;
  hasReview?: boolean;
  listing: ReservationListing;
  room: ReservationRoom;
}

interface ReservationCardProps {
  reservation: Reservation;
  onViewDetails: () => void;
  onPayNow?: () => void;
  onCancel?: () => void;
  onReview?: () => void;
  hasNotification?: boolean;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onViewDetails,
  onPayNow,
  onCancel,
  onReview,
  hasNotification,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = () => {
    switch (reservation.status) {
      case "PENDING_PAYMENT":
        return (
          <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black shadow-lg backdrop-blur-md bg-amber-100/90 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-200/50 dark:border-amber-800/50">
            Pending Payment
          </span>
        );
      case "RESERVED":
        return (
          <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black shadow-lg backdrop-blur-md bg-emerald-100/90 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 border border-emerald-200/50 dark:border-emerald-800/50">
            Reserved
          </span>
        );
      case "CHECKED_IN":
        return (
          <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black shadow-lg backdrop-blur-md bg-blue-100/90 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border border-blue-200/50 dark:border-blue-800/50">
            Checked In
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black shadow-lg backdrop-blur-md bg-purple-100/90 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 border border-purple-200/50 dark:border-purple-800/50">
            Completed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black shadow-lg backdrop-blur-md bg-rose-100/90 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200 border border-rose-200/50 dark:border-rose-800/50">
            Cancelled
          </span>
        );
      case "EXPIRED":
        return (
          <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black shadow-lg backdrop-blur-md bg-gray-100/90 text-gray-800 dark:bg-gray-700/40 dark:text-gray-200 border border-gray-200/50 dark:border-gray-600/50">
            Expired
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black shadow-lg backdrop-blur-md bg-gray-100 text-gray-800">
            {reservation.status}
          </span>
        );
    }
  };

  const displayLocation = [
    reservation.listing.region,
    reservation.listing.country
  ].filter(Boolean).join(", ");

  const canPay = reservation.status === "PENDING_PAYMENT";
  const canCancel = reservation.status === "PENDING_PAYMENT" || reservation.status === "RESERVED";

  return (
    <motion.div 
      initial={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 relative group flex flex-col h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />

      <div className="relative h-48 overflow-hidden z-10">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 z-10" />
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
          src={reservation.listing.imageSrc || "/images/placeholder.jpg"}
          alt={reservation.room.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          <AnimatePresence>
            {hasNotification && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: [1, 1.05, 1],
                  boxShadow: ["0 0 0px rgba(16, 185, 129, 0)", "0 0 15px rgba(16, 185, 129, 0.4)", "0 0 0px rgba(16, 185, 129, 0)"]
                }}
                transition={{ 
                  opacity: { duration: 0.2 },
                  x: { duration: 0.2 },
                  scale: { repeat: Infinity, duration: 2 },
                  boxShadow: { repeat: Infinity, duration: 2 }
                }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg border border-white/20 flex items-center justify-center"
              >
                STATUS UPDATE
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2">
          {getStatusBadge()}
          {reservation.hasReview && (
             <span className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black shadow-lg backdrop-blur-md bg-purple-100/90 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 border border-purple-200/50 dark:border-purple-800/50">
                Reviewed
             </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col z-10 relative">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate drop-shadow-sm mb-1">
            {reservation.room.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-bold flex items-center gap-1.5 mb-2 truncate text-primary/80">
            <Home className="text-primary" size={12} />
            {reservation.listing.title}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase tracking-widest pl-0.5">
            <MapPin size={10} className="text-primary/60" />
            {displayLocation || "Location Not Specified"}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6 text-xs font-bold bg-gray-50/80 dark:bg-gray-900/40 p-3 rounded-2xl border border-gray-100 dark:border-gray-800/50">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-widest text-gray-400 font-black">Arrive</span>
            <span className="text-gray-900 dark:text-white">{formatDate(reservation.startDate)}</span>
          </div>
          <ArrowRight className="text-primary/40 mx-1" size={14} />
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-widest text-gray-400 font-black">Depart</span>
            <span className="text-gray-900 dark:text-white">{formatDate(reservation.endDate)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8 mt-auto px-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-light border border-primary/10">
              <CreditCard size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest leading-none mb-1">Total Bill</span>
              <span className="text-xl font-black text-primary dark:text-primary-light tracking-tight">
                ₱ {reservation.totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="text-right">
             <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                {reservation.durationInDays} days
             </span>
          </div>
        </div>

        <div className="flex gap-3 mt-auto">
          <button
            onClick={onViewDetails}
            className="flex-1 py-2.5 px-4 font-bold text-sm rounded-xl transition-all shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 group/btn"
          >
            <Eye size={14} className="text-primary group-hover/btn:scale-110 transition-transform" />
            Details
          </button>
          
          {canPay && onPayNow && (
            <button
              onClick={onPayNow}
              className="flex-[1.5] py-2.5 px-4 font-bold text-sm text-white bg-primary rounded-xl hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all flex justify-center items-center gap-2 active:scale-[0.98]"
            >
              <Check size={14}/> Pay Now
            </button>
          )}

          {reservation.status === "COMPLETED" && (
            reservation.hasReview ? (
              <div className="flex-[1.5] py-2.5 px-4 font-bold text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30 flex justify-center items-center gap-2">
                <Check size={14} />
                Experience Rated
              </div>
            ) : (
              onReview && (
                <button
                  onClick={onReview}
                  className="flex-[1.5] py-2.5 px-4 font-bold text-sm text-white bg-purple-600 rounded-xl hover:bg-purple-700 shadow-xl shadow-purple-600/20 transition-all flex justify-center items-center gap-2 active:scale-[0.98] group/rate"
                >
                  <Star size={14} className="fill-white group-hover/rate:rotate-[360deg] transition-transform duration-700" />
                  Rate Experience
                </button>
              )
            )
          )}

          {!canPay && reservation.status !== "COMPLETED" && canCancel && onCancel && (
            <button
              onClick={onCancel}
              className="py-2.5 px-4 font-bold text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors flex justify-center items-center gap-2 border border-rose-100 dark:border-rose-900/30 group/cancel"
            >
              <X size={14} className="group-hover/cancel:rotate-90 transition-transform" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ReservationCard;
