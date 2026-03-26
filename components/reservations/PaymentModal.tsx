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
}

interface Reservation {
  id: string;
  totalPrice: number;
  durationInDays: number;
  status: string;
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
  icon: React.ReactNode;
  enabled: boolean;
  comingSoon?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  reservation,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>("STRIPE");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "STRIPE",
      name: "Credit/Debit Card (Stripe)",
      icon: <CreditCard className="text-primary" />, // Changed text-blue-500 to text-primary
      enabled: true,
    },
    {
      id: "GCASH",
      name: "GCash",
      icon: <Smartphone className="text-primary" />, // Changed text-blue-600 to text-primary
      enabled: false,
      comingSoon: true,
    },
    {
      id: "MAYA",
      name: "Maya",
      icon: <Wallet className="text-green-500" />,
      enabled: false,
      comingSoon: true,
    },
  ];

  const handlePayment = async () => {
    if (selectedMethod === "GCASH" || selectedMethod === "MAYA") {
      setError("This payment method is coming soon. Please use Stripe.");
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment failed");
      }

      // If we get a URL, redirect to Stripe
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Payment processed successfully
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
      <div className="max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-text-primary dark:text-gray-100">
            Complete Payment
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="text-xl text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Reservation Summary */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100 mb-3">
              Reservation Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Room</span>
                <span className="font-medium text-text-primary dark:text-gray-100">
                  {reservation.room.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Listing</span>
                <span className="font-medium text-text-primary dark:text-gray-100">
                  {reservation.listing.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Duration</span>
                <span className="font-medium text-text-primary dark:text-gray-100">
                  {reservation.durationInDays} days
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
                  <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-light">
                    <CreditCard size={16} />
                  </div>
                  <span className="text-xl font-black text-primary">
                    ₱{reservation.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100 mb-3">
              Payment Methods
            </h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedMethod === method.id
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : method.enabled
                      ? "border-gray-200 dark:border-gray-700 hover:border-gray-300 shadow-sm"
                      : "border-gray-100 dark:border-gray-800 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={() => setSelectedMethod(method.id)}
                      disabled={!method.enabled}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <p className={`font-medium ${
                        method.enabled
                          ? "text-text-primary dark:text-gray-100"
                          : "text-gray-500"
                      }`}>
                        {method.name}
                      </p>
                      {method.comingSoon && (
                        <p className="text-xs text-orange-500 font-medium">
                          Coming Soon
                        </p>
                      )}
                    </div>
                  </div>
                  {!method.enabled && !method.comingSoon && (
                    <span className="text-xs text-gray-400">Unavailable</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="mb-6 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/80 rounded-xl flex items-start gap-3">
            <Info className="text-primary mt-0.5" size={20} />
            <p className="text-sm text-primary-dark dark:text-primary-light font-medium leading-relaxed">
              Your payment is a **one-time reservation fee** to secure this slot. Monthly rent and utilities will be paid directly to the landlord.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing || !selectedMethod}
            className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock size={14} />
                Pay ₱{reservation.totalPrice.toLocaleString()}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
