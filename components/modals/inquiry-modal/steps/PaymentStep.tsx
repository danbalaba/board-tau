import React from "react";
import { FaCreditCard } from "react-icons/fa";
import { UseFormRegister, FieldErrors, UseFormGetValues } from "react-hook-form";
import { FormData } from "../useInquiryLogic";

interface PaymentStepProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  getValues: UseFormGetValues<FormData>;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ register, errors, getValues }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100">
        <FaCreditCard className="inline mr-2" />
        1. Select Payment Method
        <span className="text-red-500 ml-1">*</span>
      </h3>
      <div className="grid grid-cols-1 gap-3">
        <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${getValues('paymentMethod') === 'stripe' ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
          <input
            type="radio"
            value="stripe"
            {...register('paymentMethod', { required: "Payment method is required" })}
            className="accent-primary"
          />
          <div className="flex-1">
            <p className="font-medium">Credit/Debit Card (Stripe)</p>
            <p className="text-sm text-text-secondary dark:text-gray-400">Pay with Visa, Mastercard, or AMEX</p>
          </div>
        </label>
        <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${getValues('paymentMethod') === 'gcash' ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
          <input
            type="radio"
            value="gcash"
            {...register('paymentMethod', { required: "Payment method is required" })}
            className="accent-primary"
          />
          <div className="flex-1">
            <p className="font-medium">GCash</p>
            <p className="text-sm text-text-secondary dark:text-gray-400">Mobile wallet payment</p>
          </div>
        </label>
        <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${getValues('paymentMethod') === 'maya' ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
          <input
            type="radio"
            value="maya"
            {...register('paymentMethod', { required: "Payment method is required" })}
            className="accent-primary"
          />
          <div className="flex-1">
            <p className="font-medium">Maya</p>
            <p className="text-sm text-text-secondary dark:text-gray-400">Mobile wallet payment</p>
          </div>
        </label>
      </div>
      {errors.paymentMethod && (
        <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
      )}
      <p className="text-xs text-text-secondary dark:text-gray-400">
        Note: Payment won't be processed until your inquiry is approved by the host.
      </p>
    </div>
  );
};

export default PaymentStep;
