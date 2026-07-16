import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { WalkInFormData } from "../../../hooks/use-walk-in-modal";
import { User, Phone, Users } from "lucide-react";
import Input from '@/components/inputs/Input';

interface WalkInGuestStepProps {
  register: UseFormRegister<WalkInFormData>;
  errors: FieldErrors<WalkInFormData>;
}

const WalkInGuestStep: React.FC<WalkInGuestStepProps> = ({ register, errors }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Users className="text-primary" size={20} />
          Step 2: Guest Details
        </h3>
        <p className="text-xs text-gray-500">Enter the primary guest's information and occupancy details.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">
            Primary Guest Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              {...register("guestName")}
              placeholder="e.g. John Doe"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-bold outline-none"
            />
          </div>
          {errors.guestName && <p className="text-xs text-rose-500 mt-2 font-bold">{errors.guestName.message}</p>}
        </div>

        <div>
          <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">
            Contact Number (Optional)
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              {...register("guestContact")}
              placeholder="e.g. 09123456789"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-bold outline-none"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default WalkInGuestStep;
