"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, CreditCard, Check, ArrowRight, Eye, X, MapPin, Star } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import { generateConfirmationSlipPDF } from "@/utils/slipGenerator";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";

interface ReservationListing {
    id: string;
    userId?: string;
    title: string;
    imageSrc: string;
    location: any;
    region?: string;
    country?: string;
    images?: Array<{ url: string }>;
}

interface ReservationRoom {
    id: string;
    name: string;
    price: number;
    roomType: string;
    images?: Array<{ url: string }>;
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
    currentUserName?: string;
    currentUserEmail?: string;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
    reservation,
    onViewDetails,
    onPayNow,
    onCancel,
    onReview,
    hasNotification,
    currentUserName = "Tenant",
    currentUserEmail = "tenant@example.com",
}) => {
    const responsiveToast = useResponsiveToast();

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
                    <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black shadow-sm bg-amber-100/90 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                        Pending Payment
                    </span>
                );
            case "RESERVED":
                return (
                    <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black shadow-sm bg-primary/10 text-primary-dark dark:bg-primary/20 dark:text-primary-light border border-primary/20">
                        Reserved
                    </span>
                );
            case "CHECKED_IN":
                return (
                    <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black shadow-sm bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                        Checked In
                    </span>
                );
            case "COMPLETED":
                return (
                    <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black shadow-sm bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                        Completed
                    </span>
                );
            case "CANCELLED":
                return (
                    <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black shadow-sm bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-200 dark:border-rose-800">
                        Cancelled
                    </span>
                );
            case "EXPIRED":
                return (
                    <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black shadow-sm bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        Expired
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black shadow-sm bg-gray-100 text-gray-800">
                        {reservation.status}
                    </span>
                );
        }
    };

    const displayLocation = [
        reservation.listing?.region,
        reservation.listing?.country
    ].filter(Boolean).join(", ");

    const canPay = reservation.status === "PENDING_PAYMENT";
    const canCancel = reservation.status === "PENDING_PAYMENT" || reservation.status === "RESERVED";

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
            className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-md hover:shadow-xl border border-gray-200/80 dark:border-gray-700/60 relative group flex flex-col h-full overflow-hidden transition-all duration-300"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />

            <div className="relative h-44 overflow-hidden shrink-0 z-10">
                <SafeImage
                    src={(reservation.room?.images && reservation.room.images.length > 0)
                        ? reservation.room.images[0].url
                        : (reservation.listing?.images && reservation.listing.images.length > 0)
                            ? reservation.listing.images[0].url
                            : reservation.listing?.imageSrc || "/images/placeholder.jpg"
                    }
                    alt={reservation.room.name}
                    unoptimized={true}
                />
                <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                    <AnimatePresence>
                        {hasNotification && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="bg-primary text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md border border-white/20 flex items-center justify-center"
                            >
                                Status Update
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
                    {getStatusBadge()}
                    {reservation.hasReview && (
                        <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black shadow-sm bg-purple-100/90 text-purple-900 dark:bg-purple-950/80 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                            Reviewed
                        </span>
                    )}
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col z-10 relative">
                <div className="mb-3">
                    <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 truncate tracking-tight mb-1">
                        {reservation.room.name}
                    </h3>
                    <p className="text-xs text-primary font-extrabold flex items-center gap-1.5 mb-1.5 truncate">
                        <Home size={13} className="shrink-0 text-primary" />
                        <span className="truncate">{reservation.listing.title}</span>
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                        <MapPin size={11} className="text-rose-500 shrink-0" />
                        <span className="truncate">{displayLocation || "Location Not Specified"}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 mb-4 text-xs font-semibold bg-gray-50 dark:bg-gray-900/60 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 font-black">Check-in</span>
                        <span className="text-gray-900 dark:text-white font-bold">{formatDate(reservation.startDate)}</span>
                    </div>
                    <ArrowRight className="text-primary/40 mx-auto shrink-0" size={14} />
                    <div className="flex flex-col gap-0.5 text-right">
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 font-black">Check-out</span>
                        <span className="text-gray-900 dark:text-white font-bold">{formatDate(reservation.endDate)}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-5 mt-auto px-0.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <CreditCard size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none mb-1">Total Bill</span>
                            <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                                ₱{Number(reservation.totalPrice || 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {reservation.durationInDays} {reservation.durationInDays === 1 ? "day" : "days"}
                    </span>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-2.5 mt-auto">
                    <button
                        onClick={onViewDetails}
                        className="flex-1 py-2.5 px-3 font-bold text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                        <Eye size={14} className="text-primary" />
                        <span>Details</span>
                    </button>

                    {(reservation.status === "RESERVED" || reservation.status === "CHECKED_IN" || reservation.status === "COMPLETED") && (
                        <button
                            onClick={() => {
                                responsiveToast.loading("Generating Boarding Pass...");
                                generateConfirmationSlipPDF(reservation, currentUserName, currentUserEmail)
                                    .then(() => responsiveToast.success("Downloaded successfully!"))
                                    .catch(() => responsiveToast.error("Failed to generate."));
                            }}
                            title="Download Confirmation Slip"
                            className="w-10 h-10 shrink-0 font-bold text-xs text-primary bg-primary/10 rounded-xl hover:bg-primary/20 border border-primary/20 transition-all flex justify-center items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        </button>
                    )}

                    {canPay && onPayNow && (
                        <button
                            onClick={onPayNow}
                            className="w-full sm:w-auto sm:flex-[1.4] py-2.5 px-3 font-black text-xs uppercase tracking-wider text-white bg-primary rounded-xl hover:bg-primary-dark shadow-md transition-all flex justify-center items-center gap-1.5"
                        >
                            <Check size={14} /> <span>Pay Now</span>
                        </button>
                    )}

                    {reservation.status === "COMPLETED" && (
                        reservation.hasReview ? (
                            <div className="w-full sm:w-auto sm:flex-[1.4] py-2.5 px-3 font-bold text-xs text-primary bg-primary/10 rounded-xl border border-primary/20 flex justify-center items-center gap-1.5">
                                <Check size={14} />
                                <span>Rated</span>
                            </div>
                        ) : (
                            onReview && (
                                <button
                                    onClick={onReview}
                                    className="w-full sm:w-auto sm:flex-[1.4] py-2.5 px-3 font-bold text-xs text-white bg-purple-600 rounded-xl hover:bg-purple-700 shadow-md transition-all flex justify-center items-center gap-1.5"
                                >
                                    <Star size={14} className="fill-white" />
                                    <span>Rate</span>
                                </button>
                            )
                        )
                    )}

                    {!canPay && reservation.status !== "COMPLETED" && canCancel && onCancel && (
                        <button
                            onClick={onCancel}
                            className="w-full sm:w-auto sm:flex-1 py-2.5 px-3 font-bold text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors flex justify-center items-center gap-1.5 border border-rose-200 dark:border-rose-900/30"
                        >
                            <X size={14} />
                            <span>Cancel</span>
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ReservationCard;
