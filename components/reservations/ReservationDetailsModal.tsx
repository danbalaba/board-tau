"use client";
import React from "react";
import Modal from "../modals/Modal";
import { X, Calendar, CreditCard, Info, Clock, Home, MapPin, CheckCircle as IconCircleCheck } from "lucide-react";

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
  reservationFee: number;
  roomType: string;
  images: Array<{
    id: string;
    url: string;
  }>;
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
  occupantsCount?: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentReference?: string;
  createdAt: string;
  hasReview?: boolean;
  listing: ReservationListing;
  room: ReservationRoom;
}

import { markEntityNotificationsAsRead } from "@/services/notification";
import { Notification } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";

interface ReservationDetailsModalProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
  onPayNow?: () => void;
  onCancel?: () => void;
  notification?: Notification;
}

const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
  reservation,
  isOpen,
  onClose,
  onPayNow,
  onCancel,
  notification,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  
  React.useEffect(() => {
    if (isOpen && notification) {
      markEntityNotificationsAsRead("reservation", reservation.id).then(() => {
        window.dispatchEvent(new Event("notification-cleared"));
      });
    }
  }, [isOpen, notification, reservation.id]);
  const images = reservation.room.images || [];

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
      case "PENDING_PAYMENT":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
      case "RESERVED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
      case "CHECKED_IN":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200";
      case "COMPLETED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200";
      case "CANCELLED":
      case "EXPIRED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "PENDING":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const displayLocation = [
    reservation.listing.region,
    reservation.listing.country
  ].filter(Boolean).join(", ");

  if (!isOpen) return null;

  const canPay = reservation.status === "PENDING_PAYMENT";
  const canCancel = reservation.status === "PENDING_PAYMENT" || reservation.status === "RESERVED";

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="xl" hasFixedFooter={true}>
      <div className="max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-text-primary dark:text-gray-100">
            Reservation Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="text-xl text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-8 bg-gray-50/50 dark:bg-gray-900/50">
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-900/50 rounded-3xl flex gap-4 items-start shadow-sm"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                <IconCircleCheck size={20} />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mb-1">{notification.title}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  {notification.description}
                </p>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Room Showcase */}
              <div className="bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="aspect-video w-full relative">
                  <img
                    src={images.length > 0 ? images[currentImageIndex]?.url : reservation.listing.imageSrc || "/images/placeholder.jpg"}
                    alt={reservation.room.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(reservation.status)}`}>
                      {reservation.status.replace('_', ' ')}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getPaymentStatusColor(reservation.paymentStatus)}`}>
                      Payment: {reservation.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{reservation.room.name}</h3>
                  <div className="flex items-center gap-2 text-primary font-bold mb-4">
                    <Home size={16} />
                    <span className="text-sm uppercase tracking-wide">{reservation.listing.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-bold bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                    <MapPin size={14} className="text-rose-500" />
                    {displayLocation || "Global Destination"}
                  </div>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Financial Summary</h3>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-4xl font-black text-gray-900 dark:text-white">₱ {reservation.totalPrice.toLocaleString()}</span>
                  <span className="text-[10px] font-black text-emerald-600 mb-2 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">Paid Deposit</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Fee Breakdown</span>
                      <span className="text-xs font-bold text-gray-500">
                        {reservation.occupantsCount || 1} {(reservation.occupantsCount === 1 ? 'Person' : 'People')} × ₱{( reservation.room.reservationFee || ((reservation.totalPrice || 0) / (reservation.occupantsCount || 1)) ).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-sm font-black text-gray-900 dark:text-white">₱ {reservation.totalPrice.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expected Monthly Rent</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">₱ {reservation.room.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Schedule Details */}
              <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 text-center lg:text-left">Schedule Information</h3>
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-[24px] border border-emerald-100 dark:border-emerald-800/50 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100 mb-3">
                      <Calendar size={20} />
                    </div>
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Check-In</span>
                    <span className="text-sm font-black text-emerald-950 dark:text-emerald-100 line-clamp-1">{formatDate(reservation.startDate)}</span>
                  </div>
                  
                  <div className="bg-rose-50 dark:bg-rose-900/20 p-5 rounded-[24px] border border-rose-100 dark:border-rose-800/50 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-rose-500 shadow-sm border border-rose-100 mb-3">
                      <Calendar size={20} />
                    </div>
                    <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Check-Out</span>
                    <span className="text-sm font-black text-rose-950 dark:text-rose-100 line-clamp-1">{formatDate(reservation.endDate)}</span>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex items-center justify-center gap-2">
                   <Clock size={16} className="text-primary" />
                   <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Total Duration: {reservation.durationInDays} Nights</span>
                </div>
              </div>

              {/* Occupant Information */}
              <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Booking Details</h3>
                <div className="space-y-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Room Categories</span>
                    <div className="flex flex-wrap gap-2 pt-1">
                       <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase tracking-wider">{reservation.room.roomType}</span>
                       <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] font-black rounded-lg uppercase tracking-wider">Verified Listing</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none block mb-3">Group Composition</span>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                          {reservation.occupantsCount || 1}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900 dark:text-white leading-none">Registered Members</span>
                          <span className="text-xs font-bold text-gray-500 mt-1">Multi-occupancy Agreement Active</span>
                       </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700/50">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none block mb-1">Official Reference</span>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">ID: {reservation.id}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Applied on {formatDateTime(reservation.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              {reservation.paymentMethod && (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-[32px] p-6 border-2 border-emerald-100 dark:border-emerald-800/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                      <CreditCard size={14} />
                    </div>
                    <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Payment Verified</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-emerald-950 dark:text-emerald-100 capitalize">{reservation.paymentMethod.toLowerCase()} Transfer</p>
                    {reservation.paymentReference && (
                      <p className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/50 uppercase tracking-widest">Ref: {reservation.paymentReference}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3 shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 text-xs font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all active:scale-95"
          >
            Go Back
          </button>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {canCancel && onCancel && (
              <button
                onClick={onCancel}
                className="w-full sm:w-auto px-8 py-3 text-xs font-black uppercase tracking-widest text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-100 dark:border-rose-800/50 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <X size={14} strokeWidth={3} /> Cancel Reservation
              </button>
            )}
            
            {canPay && onPayNow && (
              <button
                onClick={onPayNow}
                className="w-full sm:w-auto px-10 py-3 text-xs font-black uppercase tracking-widest text-white bg-primary rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 group"
              >
                <CreditCard size={14} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" /> 
                Complete Payment
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReservationDetailsModal;
