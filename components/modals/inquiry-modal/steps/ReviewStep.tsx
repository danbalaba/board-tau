import React, { useState } from "react";
import { FaCheck, FaUser, FaIdCard, FaTimes } from "react-icons/fa";
import { ShieldCheck, Search, Eye, FileText, Info, Camera, IdCard, CheckCircle2 } from "lucide-react";
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

      const ruleLinks = (room?.listing?.listingLinks || [])
        .filter((link: any) => link?.attribute?.type === "RULE")
        .map((link: any) => link?.attribute?.name)
        .filter(Boolean);

      const houseRules = Array.from(new Set([
        ...ruleLinks,
        ...(Array.isArray(room?.listing?.rules) ? room.listing.rules : []),
        ...(Array.isArray(room?.listing?.propertyConfig?.rules) ? room.listing.propertyConfig.rules : []),
        ...(Array.isArray(room?.listing?.businessInfo?.rules) ? room.listing.businessInfo.rules : [])
      ])).filter(Boolean);

      const pdfBlob = await generateLeaseContractPDF(
        "Smart_Lease_Contract_Preview.pdf",
        {
          contractHash: `PREVIEW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          landlordName,
          tenantName: watchedValues[3] || "Prospective Tenant",
          propertyName: propName,
          roomName,
          propertyAddress: propAddress,
          moveInDate: watchedValues[1] ? format(new Date(watchedValues[1]), "MMMM dd, yyyy") : "Effective Upon Signing",
          checkOutDate: watchedValues[2] ? format(new Date(watchedValues[2]), "MMMM dd, yyyy") : "Per Lease Duration",
          depositAmount: deposit,
          rentAmount: room?.price || 0,
          moveOutNoticeDays: noticeDays,
          customClauses: clauses,
          houseRules,
          landlordSignatureBase64: landlordSig,
          tenantSignatureBase64: "",
          isAccepted: false,
          isDraft: true,
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
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <ShieldCheck size={18} />
          </div>
          <span>Step 8: Final Summary & Review</span>
        </h3>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full whitespace-nowrap shrink-0">
          <FaCheck size={10} className="shrink-0" /> Verified Application
        </span>
      </div>

      <div className="bg-white dark:bg-gray-900/60 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-5 shadow-sm">
        {/* Key Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/50">
             <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-0.5">Check-In Date</p>
             <p className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
               {watchedValues[1] ? format(new Date(watchedValues[1]), 'MMM dd, yyyy') : '-'}
             </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/50">
             <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-0.5">Check-Out Date</p>
             <p className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
               {watchedValues[2] ? format(new Date(watchedValues[2]), 'MMM dd, yyyy') : '-'}
             </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/50">
             <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-0.5">Payment</p>
             <p className="font-extrabold text-xs text-gray-900 dark:text-white capitalize truncate">
               {watchedValues[0] || '-'}
             </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/50">
             <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-0.5">Occupants</p>
             <p className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
               {watchedValues[8] ? `Full Room (${room.capacity})` : `${watchedValues[7] || 1} Person`}
             </p>
          </div>
        </div>

        {/* Verification Media Horizontal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
           {/* Selfie Verification Card */}
           <div 
             onClick={() => capturedSelfie && setSelectedPreview(capturedSelfie)}
             className={`p-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:border-primary/50 transition-all flex items-center gap-3.5 group select-none ${capturedSelfie ? 'cursor-pointer' : ''}`}
           >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-900 border border-gray-200 dark:border-gray-700 shrink-0 relative shadow-inner flex items-center justify-center">
                 {capturedSelfie ? (
                    <>
                      <SafeImage src={capturedSelfie} alt="Review Selfie" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                         <Search size={14} />
                      </div>
                    </>
                 ) : (
                    <FaUser className="text-gray-400 text-lg" />
                 )}
              </div>
              <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-1.5">
                   <span className="text-xs font-extrabold text-gray-900 dark:text-white truncate">Live Biometric Selfie</span>
                   {capturedSelfie ? (
                     <CheckCircle2 size={13} className="text-primary shrink-0" />
                   ) : (
                     <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded shrink-0">Pending</span>
                   )}
                 </div>
                 <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">Liveness Facial Scan</p>
                 {capturedSelfie && (
                   <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary mt-1 group-hover:underline">
                      <Eye size={11} /> View Full Photo
                   </span>
                 )}
              </div>
           </div>

           {/* ID Verification Card */}
           <div 
             onClick={() => capturedID && setSelectedPreview(capturedID)}
             className={`p-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:border-primary/50 transition-all flex items-center gap-3.5 group select-none ${capturedID ? 'cursor-pointer' : ''}`}
           >
              <div className="w-16 h-12 rounded-xl overflow-hidden bg-gray-900 border border-gray-200 dark:border-gray-700 shrink-0 relative shadow-inner flex items-center justify-center">
                 {capturedID ? (
                    <>
                      <SafeImage src={capturedID} alt="Review ID" className="w-full h-full object-contain p-0.5" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                         <Search size={14} />
                      </div>
                    </>
                 ) : (
                    <FaIdCard className="text-gray-400 text-lg" />
                 )}
              </div>
              <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-1.5">
                   <span className="text-xs font-extrabold text-gray-900 dark:text-white truncate">Valid Physical ID</span>
                   {capturedID ? (
                     <CheckCircle2 size={13} className="text-primary shrink-0" />
                   ) : (
                     <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">Pending</span>
                   )}
                 </div>
                 <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">Government / Student ID</p>
                 {capturedID && (
                   <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary mt-1 group-hover:underline">
                      <Eye size={11} /> View Document
                   </span>
                 )}
              </div>
           </div>
        </div>

        {/* Total Fee Calculation Container */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl border border-primary/20">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">Total Reservation Fee</span>
              <span className="text-2xl font-black text-primary">
                ₱ {(room.reservationFee * (watchedValues[8] ? room.capacity : (Number(watchedValues[7]) || 1))).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary/70 shrink-0" />
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-wider italic">
                Calculated as ₱ {room.reservationFee.toLocaleString()} × {watchedValues[8] ? `${room.capacity} beds (Full Room Buyout)` : `${watchedValues[7] || 1} occupant(s)`}
              </p>
            </div>
          </div>
        </div>

        {/* Lease Contract Preview Section */}
        {(leaseContract || room?.listing) && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary font-bold" size={18} />
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">Lease Terms & Contract Preview</h4>
              </div>

              {(isCustomPdf && customPdfUrl) || !isCustomPdf ? (
                <button
                  type="button"
                  onClick={handlePreviewContract}
                  disabled={isPreviewingPdf}
                  className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
                >
                  <Eye size={13} />
                  <span>{isPreviewingPdf ? "Generating PDF..." : isCustomPdf ? "Preview Custom PDF" : "Preview Smart Lease PDF"}</span>
                </button>
              ) : null}
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/80 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {isCustomPdf ? (
                <>
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary dark:text-gray-100 min-w-0">
                      <FileText size={16} className="text-primary shrink-0" />
                      <span className="truncate">Custom Landlord Lease Contract PDF</span>
                    </div>
                    {customPdfUrl && (
                      <button
                        type="button"
                        onClick={handlePreviewContract}
                        className="px-2.5 py-1 bg-primary hover:bg-primary/90 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 shadow-sm cursor-pointer"
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
            
            <div className="p-3.5 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>Legal Booking Lifecycle Notice</strong>: Submitting this inquiry sends your application to the landlord for approval. You will review and digitally accept the official lease contract terms via checkbox during reservation checkout after the landlord approves your application!
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

