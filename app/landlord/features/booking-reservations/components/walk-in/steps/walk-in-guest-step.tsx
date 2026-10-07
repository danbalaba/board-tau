import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { WalkInFormData } from "@/app/landlord/features/booking-reservations/hooks/use-walk-in-modal";
import { User, Phone, Users, Mail, FileText, ShieldCheck } from "lucide-react";

interface WalkInGuestStepProps {
  register: UseFormRegister<WalkInFormData>;
  errors: FieldErrors<WalkInFormData>;
}

const WalkInGuestStep: React.FC<WalkInGuestStepProps> = ({ register, errors }) => {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <Users size={18} />
            </div>
            <span>Step 2: Guest Details</span>
            <span className="text-red-500 font-bold ml-0.5">*</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Enter the primary guest's personal details and contact information for walk-in record keeping.
          </p>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full shrink-0">
          In-Person Guest Info
        </span>
      </div>

      <div className="space-y-4">
        {/* Primary Guest Name */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Primary Guest Full Name
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              {...register("guestName", { required: "Guest full name is required" })}
              placeholder="e.g. Juan Dela Cruz"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold text-gray-900 dark:text-white outline-none"
            />
          </div>
          {errors.guestName && <p className="text-xs text-rose-500 mt-1.5 font-bold animate-in fade-in">{errors.guestName.message}</p>}
        </div>

        {/* Contact Phone & Email Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Contact Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                {...register("guestContact")}
                placeholder="e.g. 09123456789"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Email Address (Optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                {...register("guestEmail")}
                placeholder="e.g. guest@email.com"
                type="email"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Internal Landlord Walk-In Notes */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Internal Walk-In Notes (Optional)
          </label>
          <div className="relative">
            <FileText className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
            <textarea
              {...register("notes")}
              rows={3}
              placeholder="e.g. Paid cash deposit onsite at the office. Moving in with 1 luggage."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-xs font-medium text-gray-900 dark:text-white outline-none resize-none"
            />
          </div>
        </div>

        {/* Info Callout */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20 flex items-start gap-3 mt-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-xs font-extrabold text-gray-900 dark:text-white leading-tight">
              In-Person Physical Check-In Record
            </p>
            <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
              This walk-in record is saved directly into your property management portal for automated occupancy and earnings tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkInGuestStep;
