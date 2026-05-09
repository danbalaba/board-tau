"use client";
import React, { useState } from "react";
import Modal from "../modals/Modal";
import { CreditCard, Smartphone, Wallet, X, Lock, Info, Loader2 } from "lucide-react";

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
  icon: React.ElementType; // Use ElementType to allow dynamic styling
  enabled: boolean;
  comingSoon?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  reservation,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const defaultMethod = reservation.preferredPaymentMethod
    ? reservation.preferredPaymentMethod.toUpperCase()
    : "STRIPE";

  const [selectedMethod, setSelectedMethod] = useState<string>(defaultMethod);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "STRIPE",
      name: "Credit/Debit Card",
      icon: CreditCard,
      enabled: true,
    },
    {
      id: "GCASH",
      name: "GCash",
      icon: Smartphone,
      enabled: true,
    },
    {
      id: "MAYA",
      name: "Maya",
      icon: Wallet,
      enabled: true,
    },
  ];

  const handlePayment = async () => {
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
          errorMsg = `Server error (${response.status}). Please check your connection or contact support.`;
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="md" hasFixedFooter={true}>
      <div className="flex flex-col min-h-[85vh] max-h-[85vh] sm:min-h-0 sm:h-auto sm:max-h-[70vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 ml-4 tracking-tight">
            Complete Payment
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors group"
          >
            <X className="text-xl text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-gray-50/50 dark:bg-gray-900/50 custom-scrollbar">
          {/* Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
              Reservation Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Room</span>
                <span className="text-sm font-black text-gray-900 dark:text-white">
                  {reservation.room.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Listing</span>
                <span className="text-sm font-black text-gray-900 dark:text-white">
                  {reservation.listing.title}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Duration</span>
                <span className="text-sm font-black text-gray-900 dark:text-white">
                  {reservation.durationInDays} days
                </span>
              </div>
              
              <div className="pt-6 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-primary/5 dark:bg-primary/10 p-5 rounded-[28px] border border-primary/10">
                  <div className="flex flex-col mb-2 sm:mb-0">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Reservation Fee</span>
                    <span className="text-xs font-bold text-gray-500">
                      {reservation.occupantsCount || 1} {(reservation.occupantsCount === 1 ? 'Person' : 'People')} × ₱{(reservation.room.reservationFee || (reservation.totalPrice / (reservation.occupantsCount || 1))).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-3xl font-black text-primary">
                    ₱{reservation.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
              Select Payment Method
            </h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                
                return (
                  <label
                    key={method.id}
                    className={`flex items-center justify-between p-5 rounded-[24px] border-2 cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "border-primary bg-primary/5 dark:bg-primary/10 ring-4 ring-primary/5 shadow-lg shadow-primary/5"
                        : "border-gray-50 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={isSelected}
                          onChange={() => setSelectedMethod(method.id)}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                          isSelected 
                            ? "border-primary bg-primary shadow-lg shadow-primary/20 scale-110" 
                            : "border-gray-300 dark:border-gray-600 bg-transparent"
                        }`}>
                          {isSelected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm animate-in zoom-in duration-300" />
                          )}
                        </div>
                      </div>
                      <div className={`p-3 rounded-2xl ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-gray-800 text-primary'} shadow-sm transition-all duration-300`}>
                          <Icon size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                          {method.name}
                        </p>
                        {reservation.preferredPaymentMethod?.toUpperCase() === method.id && (
                          <span className={`mt-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border block w-fit ${
                            isSelected ? 'bg-white/20 text-white border-white/30' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          }`}>
                             Preferred By You
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="p-5 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-[24px] flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
               <Info size={16} strokeWidth={3} />
            </div>
            <p className="text-xs text-primary-dark dark:text-primary-light font-bold leading-relaxed">
              Your payment is a <span className="font-black underline decoration-primary/30">one-time reservation fee</span> to secure this slot.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 sm:p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-700 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-8 py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          disabled={isProcessing}
        >
          Go Back
        </button>
        
        <button
          onClick={handlePayment}
          disabled={isProcessing || !selectedMethod}
          className="w-full sm:w-auto px-10 py-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-white bg-primary rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 group/pay disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Lock size={14} strokeWidth={3} className="group-hover/pay:translate-y-[-1px] transition-transform" />
              <span>Pay ₱{reservation.totalPrice.toLocaleString()}</span>
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};

export default PaymentModal;
