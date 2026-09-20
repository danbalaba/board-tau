import React, { useState } from "react";
import { FaCheck, FaUser, FaIdCard, FaTimes } from "react-icons/fa";
import { ShieldCheck, Search, Eye, FileText, Info } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import SafeImage from "../../../common/SafeImage";
import SignaturePad from "../../../common/SignaturePad";
import { generateLeaseContractPDF, previewPdfBlob } from "@/utils/contractPdfGenerator";

import { createPortal } from "react-dom";

interface ReviewStepProps {
  watchedValues: any[];
  capturedSelfie: string | null;
  capturedID: string | null;
  room: any;
  leaseContract?: any;
  tenantSignature?: string;
  setTenantSignature?: (v: string) => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  watchedValues, capturedSelfie, capturedID, room, leaseContract, tenantSignature, setTenantSignature
}) => {
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [isPreviewingPdf, setIsPreviewingPdf] = useState(false);

  const customPdfUrl =
    leaseContract?.pdfUrl ||
    room?.listing?.businessInfo?.customPdfUrl ||
    room?.listing?.businessInfo?.documents?.customContract ||
    room?.listing?.leaseContracts?.[0]?.pdfUrl;

  const contractMode =
    room?.listing?.businessInfo?.contractMode ||
    room?.listing?.propertyConfig?.contractMode ||
    (customPdfUrl ? "CUSTOM_PDF" : "AUTO_GEN");

  const isCustomPdf = contractMode === "CUSTOM_PDF" || Boolean(customPdfUrl);

  const handlePreviewContract = async () => {
    try {
      setIsPreviewingPdf(true);

      if (isCustomPdf && customPdfUrl) {
        const success = await previewPdfBlob(customPdfUrl, "Custom Lease Contract Preview");
        if (success) return;
        console.warn("Custom PDF URL could not be rendered, falling back to smart contract preview.");
      }

      const landlordName = room?.listing?.user?.name || room?.listing?.user?.businessName || "Landlord / Property Owner";
      const propName = room?.listing?.title || "Boarding House Property";
      const roomName = room?.name || "Selected Room / Unit";
      const propAddress = room?.listing?.location?.address || room?.listing?.region || "Camiling, Tarlac";
      const deposit = Number(leaseContract?.depositAmount) || 0;
      const noticeDays = Number(leaseContract?.moveOutNoticeDays) || 30;
      const clauses = room?.listing?.customClauses || leaseContract?.terms || [];
      const landlordSig = leaseContract?.signatures?.find((s: any) => s.signerType === "LANDLORD")?.signatureUrl || "";

      const pdfBlob = await generateLeaseContractPDF(
        "Smart_Lease_Contract_Preview.pdf",
        {
          contractHash: `PREVIEW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          landlordName,
          tenantName: "[APPLICANT TENANT]",
          propertyName: propName,
          roomName,
          propertyAddress: propAddress,
          moveInDate: watchedValues[1] ? format(new Date(watchedValues[1]), "MMMM dd, yyyy") : "Per Check-In Date",
          checkOutDate: "Per Lease Duration",
          depositAmount: deposit,
          rentAmount: room?.price || 0,
          moveOutNoticeDays: noticeDays,
          customClauses: clauses,
          landlordSignatureBase64: landlordSig,
          tenantSignatureBase64: "",
        },
        true
      );

      if (pdfBlob) {
        await previewPdfBlob(pdfBlob as Blob, "Smart Lease Contract Preview");
      }
    } catch (err) {
      console.error("Failed to generate lease PDF preview:", err);
    } finally {
      setIsPreviewingPdf(false);
    }
  };

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
        Final Summary & Review
      </h3>
      
      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-5">
        <div className="grid grid-cols-2 gap-6 text-xs">
          <div>
             <p className="text-gray-400 uppercase font-black tracking-widest mb-1">Check In</p>
             <p className="font-bold">{watchedValues[1] ? format(new Date(watchedValues[1]), 'MMM dd, yyyy') : '-'}</p>
          </div>
          <div>
             <p className="text-gray-400 uppercase font-black tracking-widest mb-1">Payment</p>
             <p className="font-bold capitalize">{watchedValues[0] || '-'}</p>
          </div>
        </div>

        <div className="flex gap-4">
           {/* Selfie Preview */}
           <div className="flex-1 space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Your Selfie</p>
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
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Valid ID</p>
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
                ₱ {(room.reservationFee * (watchedValues[8] ? room.capacity : (Number(watchedValues[7]) || 1))).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={12} className="text-primary/60" />
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider italic">
                Calculated as ₱ {room.reservationFee.toLocaleString()} × {watchedValues[8] ? `${room.capacity} (Full Room Buyout)` : `${watchedValues[7] || 1} occupants`}
              </p>
            </div>
          </div>
        </div>

        {(leaseContract || room?.listing) && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-teal-600 dark:text-teal-400" size={18} />
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Lease Terms & Contract Preview</h4>
              </div>

              {(isCustomPdf && customPdfUrl) || !isCustomPdf ? (
                <button
                  type="button"
                  onClick={handlePreviewContract}
                  disabled={isPreviewingPdf}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Eye size={13} />
                  <span>{isPreviewingPdf ? "Generating PDF..." : isCustomPdf ? "Preview Custom PDF" : "Preview Smart Lease PDF"}</span>
                </button>
              ) : null}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {isCustomPdf ? (
                <>
                  <div className="p-3 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-800 dark:text-teal-200 min-w-0">
                      <FileText size={16} className="text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="truncate">Custom Landlord Lease Contract PDF</span>
                    </div>
                    {customPdfUrl && (
                      <button
                        type="button"
                        onClick={handlePreviewContract}
                        className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 shadow-sm cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>View PDF</span>
                      </button>
                    )}
                  </div>
                  <p><strong>Move-Out Notice Period:</strong> {leaseContract?.moveOutNoticeDays || 30} days</p>
                  <p>
                    <strong>Security Deposit:</strong>{" "}
                    {leaseContract?.depositAmount && leaseContract.depositAmount > 0
                      ? `₱ ${leaseContract.depositAmount.toLocaleString()}`
                      : "Refer to Custom PDF Lease Document"}
                  </p>
                </>
              ) : (
                <>
                  <p><strong>Move-Out Notice Period:</strong> {leaseContract?.moveOutNoticeDays || 30} days</p>
                  <p>
                    <strong>Security Deposit:</strong>{" "}
                    {leaseContract?.depositAmount && leaseContract.depositAmount > 0
                      ? `₱ ${leaseContract.depositAmount.toLocaleString()}`
                      : "None Required (₱ 0)"}
                  </p>
                  {((room?.listing?.customClauses && room.listing.customClauses.length > 0) || (leaseContract?.terms && leaseContract.terms.length > 0)) && (
                    <>
                      <p className="font-bold mt-2 text-gray-800 dark:text-gray-200">Custom House Rules & Clauses:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {(room?.listing?.customClauses || leaseContract?.terms || []).map((term: string, idx: number) => (
                          <li key={idx}>{term}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              )}
            </div>
            
            <div className="p-4 bg-teal-50/80 dark:bg-teal-900/20 rounded-2xl border border-teal-100 dark:border-teal-800/50 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-teal-800 dark:text-teal-300 leading-relaxed">
                <strong>Legal Booking Lifecycle Notice</strong>: Submitting this inquiry sends your application to the landlord for approval. You will sign the official digital lease contract during reservation checkout after the landlord approves your application!
              </p>
            </div>
          </div>
        )}
      </div>

      {renderPreviewPortal()}
    </div>
  );
};

export default ReviewStep;

