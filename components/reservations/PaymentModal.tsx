"use client";
import React, { useState } from "react";
import Modal from "../modals/Modal";
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  X, 
  Lock, 
  Info, 
  AlertCircle,
  Home,
  Calendar,
  User,
  Tag,
  FileText,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight
} from "lucide-react";
import { SlideToConfirm } from "../ui/slide-to-confirm";
import { cn } from "@/utils/helper";
import { generateLeaseContractPDF, previewPdfBlob } from "@/utils/contractPdfGenerator";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import SafeImage from "@/components/common/SafeImage";

interface ReservationListing {
  id: string;
  title: string;
  imageSrc: string;
}

interface ReservationRoom {
  id: string;
  name: string;
  reservationFee: number;
}

interface Reservation {
  id: string;
  totalPrice: number;
  durationInDays: number;
  occupantsCount?: number;
  status: string;
  preferredPaymentMethod?: string;
  listingId?: string;
  userId?: string;
  roomId?: string;
  listing: ReservationListing;
  room: ReservationRoom;
}

interface PaymentModalProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ElementType;
  enabled: boolean;
  description?: string;
  badge?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  reservation,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const responsiveToast = useResponsiveToast();
  const defaultMethod = reservation.preferredPaymentMethod
    ? reservation.preferredPaymentMethod.toUpperCase()
    : "STRIPE";

  const [selectedMethod, setSelectedMethod] = useState<string>(defaultMethod);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isContractAgreed, setIsContractAgreed] = useState(false);
  const [isPreviewingContract, setIsPreviewingContract] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "STRIPE",
      name: "Credit / Debit Card",
      description: "Visa, Mastercard, JCB, or American Express",
      icon: CreditCard,
      enabled: true,
      badge: "Instant",
    },
    {
      id: "GCASH",
      name: "GCash E-Wallet",
      description: "Direct instant transfer via GCash App",
      icon: Smartphone,
      enabled: true,
      badge: "Popular in PH",
    },
    {
      id: "MAYA",
      name: "Maya Wallet",
      description: "Pay with Maya wallet balance or card",
      icon: Wallet,
      enabled: true,
      badge: "Instant",
    },
  ];

  const handlePreviewContract = async () => {
    setIsPreviewingContract(true);
    const toastId = responsiveToast.loading("Loading lease contract...");
    try {
      const listingId = reservation.listingId || reservation.listing?.id;
      const roomId = reservation.roomId || reservation.room?.id;
      const userId = reservation.userId || "";

      const res = await fetch(`/api/contracts/generate?listingId=${listingId}&userId=${userId}&roomId=${roomId}`);
      if (!res.ok) throw new Error("Failed to fetch contract data");
      const data = await res.json();

      if ((data.contractMode === 'CUSTOM_PDF' || data.customPdfUrl) && data.customPdfUrl) {
        const success = await previewPdfBlob(data.customPdfUrl, "Custom Lease Contract Preview");
        if (success) {
          responsiveToast.success("Custom lease contract loaded!", { id: toastId });
          return;
        }
      }

      const pdfBlob = await generateLeaseContractPDF(
        `Lease_Contract_${listingId}`,
        data,
        true
      );

      if (pdfBlob) {
        await previewPdfBlob(pdfBlob as Blob, "Lease Contract Preview");
        responsiveToast.success("Lease contract loaded!", { id: toastId });
      }
    } catch (err: any) {
      console.error("Failed to preview lease contract:", err);
      responsiveToast.error("Could not load lease contract preview.", { id: toastId });
    } finally {
      setIsPreviewingContract(false);
    }
  };

  const handlePayment = async () => {
    if (!isContractAgreed) {
      setError("Please review and agree to the Lease Contract terms before proceeding.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/reservations/${reservation.id}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: selectedMethod,
        }),
      });

      if (!response.ok) {
        let errorMsg = "Payment session creation failed.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (jsonErr) {
          errorMsg = `Server error (${response.status}). Please check your connection or try again.`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        onPaymentSuccess?.();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const occupants = reservation.occupantsCount || 1;
  const roomFee = reservation.room?.reservationFee || (reservation.totalPrice / occupants);

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="2xl" hasFixedFooter={true} fullOnMobile={true}>
      <div className="flex flex-col h-full sm:h-auto max-h-full sm:max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 sm:px-8 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center shrink-0 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-primary/10 text-primary rounded-2xl shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Secure Reservation Checkout</span>
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Holding deposit for <span className="font-bold text-primary">{reservation.room.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm bg-amber-50 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-800 whitespace-nowrap">
              Payment Pending
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Body - 2-Column Responsive Layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-50/70 dark:bg-gray-950 custom-scrollbar overscroll-contain">
          
          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-start gap-3 shadow-sm text-rose-900 dark:text-rose-100 animate-fadeIn">
              <div className="p-1.5 bg-rose-600 text-white rounded-lg shrink-0 mt-0.5">
                <AlertCircle size={16} />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <h4 className="text-xs font-black uppercase tracking-wider">Payment Error</h4>
                <p className="text-xs font-medium leading-relaxed">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-1 text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* 👈 LEFT COLUMN: Summary & Lease Agreement (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Reservation Summary Card */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Building2 size={15} className="text-primary" />
                    <span>Reservation Summary</span>
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-primary/10 text-primary rounded-lg">
                    Approved
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  {reservation.listing?.imageSrc && (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden relative shrink-0 border border-gray-200 dark:border-gray-700 shadow-inner">
                      <SafeImage 
                        src={reservation.listing.imageSrc} 
                        alt={reservation.listing.title} 
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h4 className="text-sm sm:text-base font-black text-gray-900 dark:text-white truncate">
                      {reservation.listing.title}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold">
                        {reservation.room.name}
                      </span>
                      {reservation.durationInDays > 0 && (
                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg text-xs font-bold flex items-center gap-1">
                          <Clock size={12} />
                          <span>{reservation.durationInDays} Nights</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] font-semibold text-gray-400 pt-1">
                      Holding deposit guarantees your spot until check-in.
                    </p>
                  </div>
                </div>

                {/* Total Fee Highlight */}
                <div className="pt-2">
                  <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Tag size={12} />
                        <span>Holding Fee Total</span>
                      </span>
                      <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        {occupants} {occupants === 1 ? 'Guest' : 'Guests'} × ₱{Number(roomFee).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                      ₱{Number(reservation.totalPrice || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* 📜 Lease Agreement & House Rules Box */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 border border-primary/20 dark:border-primary/30 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-primary shrink-0" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                      Lease Contract & House Rules
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handlePreviewContract}
                    disabled={isPreviewingContract}
                    className="px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary dark:bg-primary/20 dark:hover:bg-primary/30 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
                  >
                    <Eye size={13} />
                    <span>{isPreviewingContract ? "Loading..." : "Read PDF"}</span>
                  </button>
                </div>

                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 leading-relaxed">
                  Before completing payment, please review the landlord&apos;s lease terms, move-out notice period, and house rules.
                </p>

                <label className={cn(
                  "flex items-start gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                  isContractAgreed 
                    ? "border-primary bg-primary/10 dark:bg-primary/15 ring-2 ring-primary/20" 
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40"
                )}>
                  <input
                    type="checkbox"
                    checked={isContractAgreed}
                    onChange={(e) => {
                      setIsContractAgreed(e.target.checked);
                      if (e.target.checked) setError(null);
                    }}
                    className="mt-0.5 w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary cursor-pointer shrink-0"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-gray-900 dark:text-white leading-snug block">
                      I have read and agree to the <strong>Boarding House Lease Agreement</strong> and house rules.
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400 block">
                      Checking this box confirms your legal consent prior to payment.
                    </span>
                  </div>
                </label>
              </div>

            </div>

            {/* 👉 RIGHT COLUMN: Payment Method Selection & Slide Checkout (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <CreditCard size={15} className="text-primary" />
                  <span>Select Payment Method</span>
                </h3>

                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = selectedMethod === method.id;
                    
                    return (
                      <label
                        key={method.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200",
                          isSelected
                            ? "border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                            : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40"
                        )}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={isSelected}
                            onChange={() => setSelectedMethod(method.id)}
                            className="sr-only"
                          />
                          
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 transition-all shrink-0 flex items-center justify-center",
                            isSelected 
                              ? "border-primary bg-primary" 
                              : "border-gray-300 dark:border-gray-600 bg-transparent"
                          )}>
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                            )}
                          </div>

                          <div className={cn(
                            "p-2.5 rounded-xl shrink-0 transition-colors",
                            isSelected 
                              ? "bg-primary text-white shadow-md shadow-primary/20" 
                              : "bg-white dark:bg-gray-800 text-primary border border-gray-200 dark:border-gray-700"
                          )}>
                            <Icon size={18} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-black text-gray-900 dark:text-white tracking-tight truncate">
                                {method.name}
                              </p>
                            </div>
                            {method.description && (
                              <p className="text-[10px] font-semibold text-gray-400 truncate mt-0.5">
                                {method.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Security Guarantee */}
                <div className="p-3.5 bg-slate-100/70 dark:bg-gray-800/50 rounded-2xl flex items-center gap-3">
                  <Lock size={16} className="text-primary shrink-0" />
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 leading-tight">
                    Encrypted 256-bit SSL transaction via PayMongo / Stripe.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Footer Actions Bar */}
        <div className="px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-lg">
          
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors text-center"
            disabled={isProcessing}
          >
            Cancel & Go Back
          </button>

          {/* Slide to Confirm Action */}
          <div className="w-full sm:w-auto flex flex-col items-center sm:items-end">
            <SlideToConfirm
              text={`PAY ₱${Number(reservation.totalPrice || 0).toLocaleString()}`}
              successText="REDIRECTING..."
              onConfirm={handlePayment}
              width={290}
              disabled={isProcessing || !selectedMethod || !isContractAgreed}
              icon={<Lock size={14} strokeWidth={2.5} />}
              fullWidth={false}
              className="w-full sm:w-[290px]"
            />
            {!isContractAgreed && (
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1.5 animate-pulse text-center sm:text-right">
                ⚠️ Check contract agreement box to unlock payment
              </span>
            )}
          </div>

        </div>

      </div>
    </Modal>
  );
};

export default PaymentModal;
