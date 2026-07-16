import React, { useState } from "react";
import { UseFormGetValues } from "react-hook-form";
import { WalkInFormData } from "../../../hooks/use-walk-in-modal";
import { FaCheck, FaUser, FaIdCard, FaTimes } from "react-icons/fa";
import { ShieldCheck, Search } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import SafeImage from "@/components/common/SafeImage";
import { createPortal } from "react-dom";

interface WalkInReviewStepProps {
  getValues: UseFormGetValues<WalkInFormData>;
  capturedSelfie: string | null;
  capturedID: string | null;
  listings: any[];
}

const WalkInReviewStep: React.FC<WalkInReviewStepProps> = ({
  getValues,
  capturedSelfie,
  capturedID,
  listings
}) => {
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);

  const selectedListingId = getValues("listingId");
  const selectedRoomId = getValues("roomId");
  
  const listing = listings.find(l => l.id === selectedListingId);
  const room = listing?.rooms?.find((r: any) => r.id === selectedRoomId);
  
  const reservationFee = room?.reservationFee || 0;
  const occupants = getValues("occupantsCount") || 1;
  const moveInDate = getValues("moveInDate");

  const renderPreviewPortal = () => {
    if (typeof document === "undefined") return null;
    
    return createPortal(
      <AnimatePresence>
        {selectedPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPreview(null)}
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8 cursor-zoom-out"
          >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-[90vw] h-[80vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                 <SafeImage 
                    src={selectedPreview} 
                    alt="Full Preview" 
                    priority={true} 
                    className="object-contain"
                 />
               
               <div className="absolute -top-14 left-0 right-0 flex justify-between items-center text-white/70">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                     Verification Quality Check
                  </span>
                  <button 
                      onClick={() => setSelectedPreview(null)}
                      className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all group"
                  >
                      <FaTimes size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                  </button>
               </div>
            </motion.div>
            
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="mt-8 text-white/40 text-[10px] uppercase font-black tracking-widest"
            >
               Click anywhere to close preview
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <FaCheck className="text-primary" />
        Step 6: Final Summary & Review
      </h3>
      
      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-5">
        <div className="grid grid-cols-2 gap-6 text-xs">
          <div>
             <p className="text-gray-400 uppercase font-black tracking-widest mb-1">Check In</p>
             <p className="font-bold">{moveInDate ? format(new Date(moveInDate), 'MMM dd, yyyy') : '-'}</p>
          </div>
          <div>
             <p className="text-gray-400 uppercase font-black tracking-widest mb-1">Payment</p>
             <p className="font-bold capitalize">Cash / Physical (Walk-In)</p>
          </div>
        </div>

        <div className="flex gap-4">
           {/* Selfie Preview */}
           <div className="flex-1 space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Guest Selfie</p>
              <div 
                onClick={() => capturedSelfie && setSelectedPreview(capturedSelfie)}
                className={`aspect-square rounded-2xl border-2 border-primary/20 overflow-hidden bg-gray-200 shadow-inner relative group ${capturedSelfie ? 'cursor-zoom-in' : ''}`}
              >
                 {capturedSelfie ? (
                    <>
                      <SafeImage src={capturedSelfie} alt="Review Selfie" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <Search className="text-white w-6 h-6" />
                      </div>
                    </>
                 ) : (
                    <div className="w-full h-full flex items-center justify-center"><FaUser className="text-gray-300 text-2xl" /></div>
                 )}
              </div>
           </div>

           {/* ID Preview */}
           <div className="flex-1 space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Guest ID</p>
              <div 
                onClick={() => capturedID && setSelectedPreview(capturedID)}
                className={`aspect-square rounded-2xl border-2 border-primary/20 overflow-hidden bg-gray-200 shadow-inner relative group ${capturedID ? 'cursor-zoom-in' : ''}`}
              >
                 {capturedID ? (
                    <>
                      <SafeImage src={capturedID} alt="Review ID" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <Search className="text-white w-6 h-6" />
                      </div>
                    </>
                 ) : (
                    <div className="w-full h-full flex items-center justify-center"><FaIdCard className="text-gray-300 text-2xl" /></div>
                 )}
              </div>
           </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl border border-primary/10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Reservation Fee</span>
              <span className="text-xl font-black text-primary">
                ₱ {(reservationFee * occupants).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={12} className="text-primary/60" />
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider italic">
                Calculated as ₱ {reservationFee.toLocaleString()} × {occupants} occupants
              </p>
            </div>
          </div>
        </div>
      </div>

      {renderPreviewPortal()}
    </div>
  );
};

export default WalkInReviewStep;
