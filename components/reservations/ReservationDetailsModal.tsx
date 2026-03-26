"use client";
import React from "react";
import Modal from "../modals/Modal";
import { X, Calendar, CreditCard, Info, Clock, Home, MapPin } from "lucide-react";

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
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentReference?: string;
  createdAt: string;
  listing: ReservationListing;
  room: ReservationRoom;
}

interface ReservationDetailsModalProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
  onPayNow?: () => void;
  onCancel?: () => void;
}

const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
  reservation,
  isOpen,
  onClose,
  onPayNow,
  onCancel,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
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
        return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light";
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

        <div className="overflow-y-auto flex-1 p-6">
          {/* Room Image */}
          <div className="mb-6">
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
              <img
                src={
                  images.length > 0
                    ? images[currentImageIndex]?.url
                    : reservation.listing.imageSrc || "/images/placeholder.jpg"
                }
                alt={reservation.room.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex gap-3 mb-4">
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                reservation.status
              )}`}
            >
              {reservation.status === "PENDING_PAYMENT"
                ? "Pending Payment"
                : reservation.status.charAt(0) + reservation.status.slice(1).toLowerCase()}
            </span>
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getPaymentStatusColor(
                reservation.paymentStatus
              )}`}
            >
              Payment: {reservation.paymentStatus.charAt(0) + reservation.paymentStatus.slice(1).toLowerCase()}
            </span>
          </div>

          {/* Room & Listing Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-text-primary dark:text-gray-100 mb-2">
                {reservation.room.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-bold mb-1 flex items-center gap-1.5">
                <Home className="text-primary" size={16} />
                {reservation.listing.title}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-bold flex items-center gap-1.5">
                <MapPin className="text-primary" size={14} />
                {displayLocation || "Location Not Specified"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary dark:text-primary-light">
                ₱ {reservation.totalPrice.toLocaleString()}
              </p>
              <p className="text-xs font-semibold text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded w-fit mb-2">
                One-time Reservation Fee
              </p>
              <p className="text-gray-600 dark:text-gray-300 italic text-sm">
                Monthly Rent: ₱ {reservation.room.price.toLocaleString()}/mo
              </p>
            </div>
          </div>

          {/* Reservation Information */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-text-primary dark:text-gray-100 mb-4">
              Reservation Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="text-gray-400" size={18} />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Check-in Date</p>
                  <p className="font-semibold text-text-primary dark:text-gray-100">
                    {formatDate(reservation.startDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="text-gray-400" size={18} />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Check-out Date</p>
                  <p className="font-semibold text-text-primary dark:text-gray-100">
                    {formatDate(reservation.endDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-gray-400" size={18} />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="font-semibold text-text-primary dark:text-gray-100">
                    {reservation.durationInDays} days
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="text-gray-400" size={18} />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reservation Fee</p>
                  <p className="font-semibold text-text-primary dark:text-gray-100">
                    ₱{reservation.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {reservation.paymentMethod && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                <CreditCard className="text-gray-400" size={18} />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                    <p className="font-semibold text-text-primary dark:text-gray-100">
                      {reservation.paymentMethod}
                    </p>
                  </div>
                </div>
                {reservation.paymentReference && (
                  <div className="mt-2 text-primary font-bold">
                    <p className="text-sm">
                      Reference: {reservation.paymentReference}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Timestamps */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Reserved On: {formatDateTime(reservation.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4 shrink-0 bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
          >
            Close
          </button>
          {canCancel && onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-2.5 text-sm font-bold text-white bg-rose-500 rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <X size={16} /> Cancel Reservation
            </button>
          )}
          {canPay && onPayNow && (
            <button
              onClick={onPayNow}
              className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <CreditCard size={16} /> Pay Now
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReservationDetailsModal;
