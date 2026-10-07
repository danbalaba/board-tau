import React from "react";
import { CreditCard, Smartphone, Wallet, ShieldCheck, Check } from "lucide-react";
import { UseFormRegister, FieldErrors, UseFormGetValues } from "react-hook-form";
import { FormData } from "../useInquiryLogic";

interface PaymentStepProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  getValues: UseFormGetValues<FormData>;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ register, errors, getValues }) => {
  const currentMethod = getValues('paymentMethod');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <CreditCard size={18} />
            </div>
            Step 1: Select Payment Method
            <span className="text-red-500 font-bold ml-0.5">*</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Choose your preferred payment gateway. Payment is only charged after host approval.
          </p>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-medium text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full shrink-0">
          Secure Processing
        </span>
      </div>

      {/* Balanced Medium Option Cards */}
      <div className="grid grid-cols-1 gap-2.5">
        {/* Stripe Credit/Debit Card Option */}
        <label
          className={`group relative flex items-center gap-3.5 p-3.5 sm:p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 select-none ${
            currentMethod === 'stripe'
              ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/40'
          }`}
        >
          <input
            type="radio"
            value="stripe"
            {...register('paymentMethod', { required: "Payment method is required" })}
            className="sr-only"
          />
          
          <div className={`p-2.5 rounded-xl transition-colors shrink-0 ${
            currentMethod === 'stripe'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-primary'
          }`}>
            <CreditCard size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-extrabold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                Credit / Debit Card
              </p>
              <span className="text-[9px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/50 shrink-0">
                Stripe
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
              Instant online payment via Visa, Mastercard, AMEX, or JCB.
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">Visa</span>
              <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">Mastercard</span>
              <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">AMEX</span>
            </div>
          </div>

          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
            currentMethod === 'stripe'
              ? 'border-primary bg-primary text-white'
              : 'border-gray-300 dark:border-gray-600 bg-transparent'
          }`}>
            {currentMethod === 'stripe' && <Check size={12} strokeWidth={3} />}
          </div>
        </label>

        {/* GCash Mobile Wallet Option */}
        <label
          className={`group relative flex items-center gap-3.5 p-3.5 sm:p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 select-none ${
            currentMethod === 'gcash'
              ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/40'
          }`}
        >
          <input
            type="radio"
            value="gcash"
            {...register('paymentMethod', { required: "Payment method is required" })}
            className="sr-only"
          />

          <div className={`p-2.5 rounded-xl transition-colors shrink-0 ${
            currentMethod === 'gcash'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-primary'
          }`}>
            <Smartphone size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-extrabold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                GCash Mobile Wallet
              </p>
              <span className="text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/20 shrink-0">
                E-Wallet
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
              Fast & secure mobile payment using your GCash account.
            </p>
          </div>

          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
            currentMethod === 'gcash'
              ? 'border-primary bg-primary text-white'
              : 'border-gray-300 dark:border-gray-600 bg-transparent'
          }`}>
            {currentMethod === 'gcash' && <Check size={12} strokeWidth={3} />}
          </div>
        </label>

        {/* Maya Mobile Wallet Option */}
        <label
          className={`group relative flex items-center gap-3.5 p-3.5 sm:p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 select-none ${
            currentMethod === 'maya'
              ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/40'
          }`}
        >
          <input
            type="radio"
            value="maya"
            {...register('paymentMethod', { required: "Payment method is required" })}
            className="sr-only"
          />

          <div className={`p-2.5 rounded-xl transition-colors shrink-0 ${
            currentMethod === 'maya'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-primary'
          }`}>
            <Wallet size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-extrabold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                Maya Wallet
              </p>
              <span className="text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20 shrink-0">
                Digital Wallet
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
              Pay via Maya e-wallet app or linked bank card.
            </p>
          </div>

          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
            currentMethod === 'maya'
              ? 'border-primary bg-primary text-white'
              : 'border-gray-300 dark:border-gray-600 bg-transparent'
          }`}>
            {currentMethod === 'maya' && <Check size={12} strokeWidth={3} />}
          </div>
        </label>
      </div>

      {errors.paymentMethod && (
        <p className="text-xs text-red-500 font-bold mt-1 animate-in fade-in">{errors.paymentMethod.message}</p>
      )}

      {/* Security Guarantee Box */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20 flex items-start gap-3 mt-3">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
          <ShieldCheck size={18} />
        </div>
        <div>
          <p className="text-xs font-extrabold text-gray-900 dark:text-white leading-tight">
            Zero Immediate Charge Guarantee
          </p>
          <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
            Your payment authorization is reserved securely. Funds are only processed after the host reviews and approves your reservation request.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;



