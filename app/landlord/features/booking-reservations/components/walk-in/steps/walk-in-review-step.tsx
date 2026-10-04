import React from "react";
import { UseFormGetValues } from "react-hook-form";
import { WalkInFormData, WalkInPaymentType } from "@/app/landlord/features/booking-reservations/hooks/use-walk-in-modal";
import { FaCheck } from "react-icons/fa";
import { ShieldCheck, Calendar, Users, FileText, Info, Building2, DoorOpen, DollarSign, Lock } from "lucide-react";
import { format } from "date-fns";

interface WalkInReviewStepProps {
  getValues: UseFormGetValues<WalkInFormData>;
  listings: any[];
}

const WalkInReviewStep: React.FC<WalkInReviewStepProps> = ({
  getValues,
  listings
}) => {
  const selectedListingId = getValues("listingId");
  const selectedRoomId = getValues("roomId");
  
  const listing = listings.find(l => l.id === selectedListingId);
  const room = listing?.rooms?.find((r: any) => r.id === selectedRoomId);
  const leaseContract = listing?.leaseContracts?.[0];
  
  const roomPrice = room?.price || 0;
  const reservationFee = room?.reservationFee || 0;
  const occupants = getValues("occupantsCount") || 1;
  const moveInDate = getValues("moveInDate");
  const checkOutDate = getValues("checkOutDate");
  const isSoloBuyout = getValues("isSoloBuyout");
  const paymentType: WalkInPaymentType = getValues("paymentType") || 'DIRECT_RENT';
  const securityDeposit = Number(getValues("securityDeposit")) || 0;
  const totalPrice = getValues("totalPrice") || 0;

  const isFlatRate = Boolean(room?.roomTypeDefinition?.isFlatRate);

  const customClauses = listing?.customClauses || leaseContract?.terms || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <ShieldCheck size={18} />
            </div>
            <span>Step 4: Final Summary & Review</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Review the complete walk-in registration details before saving the record.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full shrink-0">
          <FaCheck size={10} className="shrink-0" /> Ready to Submit
        </span>
      </div>

      <div className="bg-white dark:bg-gray-900/60 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-5 shadow-sm">
        {/* Selected Property & Room Summary Header */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-gray-900 dark:text-white leading-tight">
                {listing?.title || "Selected Property"}
              </h4>
              <p className="text-xs text-primary font-bold mt-0.5 flex items-center gap-1">
                <DoorOpen size={13} /> {room?.name || "Selected Room"} — ({room?.roomTypeDefinition?.name || room?.roomType})
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-lg border border-primary/20 shrink-0">
            {paymentType === 'DIRECT_RENT' ? 'Immediate Move-In' : 'Future Reservation'}
          </span>
        </div>

        {/* Key Stay Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/50">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-0.5">Check-In Date</p>
            <p className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
              {moveInDate ? format(new Date(moveInDate), 'MMM dd, yyyy') : '-'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/50">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-0.5">Check-Out Date</p>
            <p className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
              {checkOutDate ? format(new Date(checkOutDate), 'MMM dd, yyyy') : '-'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/50">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-0.5">Registration Mode</p>
            <p className="font-extrabold text-xs text-primary capitalize truncate">
              {paymentType === 'DIRECT_RENT' ? '1st Month Rent' : 'Holding Fee'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/50">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-0.5">Primary Guest</p>
            <p className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
              {getValues("guestName") || '-'}
            </p>
          </div>
        </div>

        {/* Total Fee Calculation Container */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl border border-primary/20">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                {paymentType === 'DIRECT_RENT' ? "Total Onsite Payment Collected" : "Total Holding Reservation Fee"}
              </span>
              <span className="text-2xl font-black text-primary">
                ₱ {totalPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary/70 shrink-0" />
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-wider italic">
                {paymentType === 'DIRECT_RENT'
                  ? `Includes 1st Month Rent (${isFlatRate ? 'Flat Rate' : `${occupants} occupant`})` + (securityDeposit > 0 ? ` + ₱${securityDeposit.toLocaleString()} Deposit` : '')
                  : `Includes Holding Reservation Fee (${isFlatRate ? 'Flat Rate' : `${occupants} occupant`})`}
              </p>
            </div>
          </div>
        </div>

        {/* Property Lease Terms & Rules Section */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="text-primary font-bold" size={18} />
            <h4 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">Property Lease Terms Summary</h4>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/80 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
            <p><strong>Move-Out Notice Period:</strong> {leaseContract?.moveOutNoticeDays || 30} days notice</p>
            <p>
              <strong>Default Security Deposit Term:</strong>{" "}
              {leaseContract?.depositAmount && leaseContract.depositAmount > 0
                ? `₱ ${leaseContract.depositAmount.toLocaleString()}`
                : "None Required (₱ 0)"}
            </p>
            {customClauses.length > 0 && (
              <>
                <p className="font-bold mt-2 text-gray-800 dark:text-gray-200">Custom House Rules & Clauses:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {customClauses.map((clause: string, idx: number) => (
                    <li key={idx}>{clause}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkInReviewStep;
