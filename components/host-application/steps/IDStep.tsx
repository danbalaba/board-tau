"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaIdCard, FaCamera, FaImage, FaTimes, FaCheckCircle, FaShieldAlt } from "react-icons/fa";
import { Loader2, AlertCircle, Info, ChevronLeft, X, Check, User, ShieldCheck, CreditCard } from "lucide-react";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import SafeImage from "@/components/common/SafeImage";
import { cn } from "@/utils/helper";

interface IDStepProps {
  capturedID: string | null;
  setCapturedID: (val: string | null) => void;
  isProcessing: boolean;
  handleCaptureID: (file: File) => void;
  selfieRetakeNeeded?: boolean;
  handleRetakeSelfie?: () => void;
  hideHeader?: boolean;
  // Backward compatibility props
  webcamRef?: any;
  facingMode?: any;
  isIDAligned?: any;
  setIsIDAligned?: any;
  isPhoneDetected?: any;
  setIsPhoneDetected?: any;
  toggleCamera?: any;
}

/**
 * Validates that a URL uses the blob: protocol before passing it to an img src.
 */
const sanitizeImgUrl = (url: string | null): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  try {
    const { protocol } = new URL(url);
    return (protocol === 'blob:' || protocol === 'data:' || protocol === 'http:' || protocol === 'https:') ? url : undefined;
  } catch {
    return undefined;
  }
};

/** Animated corner bracket */
const CornerBracket = ({ position }: { position: "tl" | "tr" | "bl" | "br" }) => {
  const base = "absolute w-6 h-6 border-blue-400/80";
  const corners: Record<string, string> = {
    tl: "top-0 left-0 border-t-2 border-l-2 rounded-tl-md",
    tr: "top-0 right-0 border-t-2 border-r-2 rounded-tr-md",
    bl: "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-md",
    br: "bottom-0 right-0 border-b-2 border-r-2 rounded-br-md",
  };
  return <div className={`${base} ${corners[position]}`} />;
};

const IDStep: React.FC<IDStepProps> = ({
  capturedID,
  setCapturedID,
  isProcessing,
  handleCaptureID,
  selfieRetakeNeeded,
  handleRetakeSelfie,
  hideHeader = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isShowingIDList, setIsShowingIDList] = useState(false);
  const [selectedIDTab, setSelectedIDTab] = useState<"primary" | "secondary">("primary");
  const responsiveToast = useResponsiveToast();

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const processFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      responsiveToast.error("Please upload a valid image file (JPEG, PNG, WEBP, or HEIC)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      responsiveToast.error("File size is too large. Please upload an image under 5MB.");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const confirmUpload = () => {
    if (selectedFile) handleCaptureID(selectedFile);
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  return (
    <div className={cn(
      "space-y-5 animate-in fade-in duration-500 mx-auto w-full",
      hideHeader ? "max-w-md" : "max-w-xl md:max-w-2xl"
    )}>
      <AnimatePresence mode="wait">
        {!isShowingIDList ? (
          <motion.div 
            key="mainUploadView"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-5 text-left"
          >
            {/* Header */}
            {!hideHeader && (
              <div className="flex items-center justify-between text-left">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 shrink-0">
                    <FaIdCard className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Upload Your Government ID
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Take a clear photo of your <span className="text-blue-500 font-semibold">physical Government ID</span> (Driver's License, UMID, Passport, National ID). <br/>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold italic">* Ensure the face photo on the ID card is clear for biometric matching.</span>
                    </p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => setIsShowingIDList(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs"
                >
                  <Info size={14} />
                  <span className="hidden sm:inline">Accepted IDs</span>
                </button>
              </div>
            )}

        {/* ─── STATE 1: Captured & Verified ─── */}
        {capturedID ? (
          <motion.div
            key="verified"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className={cn(
              "relative w-full rounded-2xl overflow-hidden shadow-2xl border border-primary/30 bg-primary/10 dark:bg-black flex items-center justify-center",
              hideHeader ? "min-h-[260px]" : "min-h-[300px] md:min-h-[360px]"
            )}
          >
            <img src={capturedID} alt="Captured ID" className="absolute inset-0 w-full h-full object-contain p-4" />

            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

            {(["tl","tr","bl","br"] as const).map(pos => (
              <div key={pos} className={`absolute w-7 h-7 border-primary/80 ${
                pos === "tl" ? "top-2 left-2 border-t-2 border-l-2 rounded-tl-md" :
                pos === "tr" ? "top-2 right-2 border-t-2 border-r-2 rounded-tr-md" :
                pos === "bl" ? "bottom-2 left-2 border-b-2 border-l-2 rounded-bl-md" :
                               "bottom-2 right-2 border-b-2 border-r-2 rounded-br-md"
              }`} />
            ))}

            <button
              type="button"
              onClick={() => { setCapturedID(null); cancelUpload(); }}
              className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-red-500/80 transition-all z-10 border border-white/10 cursor-pointer"
            >
              <FaTimes size={12} />
            </button>

            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="absolute bottom-4 left-0 right-0 flex justify-center z-10"
            >
              <span className="flex items-center gap-2 bg-primary/90 backdrop-blur-sm text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl border border-primary/30">
                <FaCheckCircle size={12} />
                Verified ID Document
              </span>
            </motion.div>
          </motion.div>

        ) : previewUrl ? (
          /* ─── STATE 2: Preview — awaiting confirmation ─── */
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className={cn(
              "relative w-full rounded-2xl overflow-hidden bg-slate-50 dark:bg-black shadow-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center",
              hideHeader ? "min-h-[250px]" : "min-h-[280px] md:min-h-[340px]"
            )}>
              <img 
                src={sanitizeImgUrl(previewUrl)}
                alt="ID Preview" 
                className="absolute inset-0 w-full h-full object-contain p-4" 
              />

              {!isProcessing && (
                <button
                  type="button"
                  onClick={cancelUpload}
                  className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-red-500/80 transition-all z-10 border border-white/10 cursor-pointer"
                >
                  <FaTimes size={12} />
                </button>
              )}

              <div className="absolute inset-2 pointer-events-none">
                {(["tl","tr","bl","br"] as const).map(pos => <CornerBracket key={pos} position={pos} />)}
              </div>

              {/* Processing overlay */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-5 z-20"
                  >
                    {/* Futuristic Laser Beam Scan Line traversing top to bottom */}
                    <motion.div
                      animate={{ top: ["5%", "90%", "5%"] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_18px_rgba(96,165,250,0.9)] z-30 pointer-events-none"
                    />

                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-20 h-20 rounded-full border-2 border-blue-500/20 animate-ping" />
                      <div className="absolute w-20 h-20 rounded-full border border-blue-400/40 animate-pulse" />
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-400/40 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                      </div>
                    </div>

                    <div className="text-center space-y-1.5 px-8">
                      <p className="text-white font-bold text-sm tracking-wide">Analyzing ID Card</p>
                      <p className="text-blue-300/80 text-xs leading-relaxed">
                        Cross-referencing with your selfie<span className="animate-pulse">...</span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {selectedFile && !isProcessing && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400">
                <FaIdCard size={11} className="text-blue-500 dark:text-blue-400 shrink-0" />
                <span className="truncate flex-1 font-mono text-slate-700 dark:text-slate-300">{selectedFile.name}</span>
                <span className="shrink-0 text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
            )}

            {/* Selfie Retake Error Banner */}
            {selfieRetakeNeeded && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm"
              >
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle size={16} />
                  <span>Your live selfie was too blurry to verify.</span>
                </div>
                <button
                  type="button"
                  onClick={handleRetakeSelfie}
                  className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer"
                >
                  Retake Selfie
                </button>
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                disabled={isProcessing}
                onClick={cancelUpload}
                className="flex-1 py-3.5 rounded-xl font-semibold text-sm border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-40 transition-all cursor-pointer"
              >
                ↩ Retake
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={confirmUpload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                {isProcessing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                  : <><FaShieldAlt size={14} /> Use This Photo</>}
              </button>
            </div>
          </motion.div>

        ) : (
          /* ─── STATE 3: Upload prompt ─── */
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Drop zone */}
            <div 
              className={cn(
                "relative w-full rounded-2xl bg-gradient-to-b border-2 border-dashed transition-colors overflow-hidden group cursor-pointer",
                isDragging 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 from-blue-50/50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-900/20' 
                  : 'from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border-slate-300 dark:border-slate-700 hover:border-blue-500/50',
                hideHeader ? "min-h-[210px]" : "min-h-[260px] md:min-h-[300px]"
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
                <FaIdCard size={180} className="text-blue-300" />
              </div>

              <div className="absolute inset-4 pointer-events-none">
                {(["tl","tr","bl","br"] as const).map(pos => <CornerBracket key={pos} position={pos} />)}
              </div>

              <div className={cn(
                "relative flex flex-col items-center justify-center h-full gap-3 px-6",
                hideHeader ? "py-10" : "py-12 md:py-16"
              )}>
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"
                >
                  <FaIdCard className="text-blue-400" size={28} />
                </motion.div>
                <div className="text-center space-y-1">
                  <p className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">Position your ID card here</p>
                  <p className="text-slate-500 text-xs sm:text-sm">Accepted: JPEG, PNG, WEBP, HEIC · Max 5MB</p>
                </div>
              </div>
            </div>

            {/* Upload buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold flex flex-col items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
              >
                <FaCamera size={22} />
                <span className="text-[11px] uppercase tracking-widest">Take Photo</span>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white py-4 rounded-2xl font-bold flex flex-col items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <FaImage size={22} />
                <span className="text-[11px] uppercase tracking-widest">Gallery</span>
              </button>
            </div>

            {/* Tips */}
            <div className="flex gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left">
              <AlertCircle size={14} className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300/80 leading-relaxed">
                Ensure the <strong className="text-amber-800 dark:text-amber-300">entire ID card</strong> is visible, well-lit, and free from glare or blur.
              </p>
            </div>

            {/* View accepted IDs link button */}
            <div className="pt-1">
              <button 
                type="button"
                onClick={() => setIsShowingIDList(true)}
                className="w-full py-3 px-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Info size={14} />
                <span>View List of Accepted Valid IDs →</span>
              </button>
            </div>

            {/* Hidden inputs */}
            <input type="file" ref={fileInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
            <input type="file" ref={galleryInputRef} accept="image/*" className="hidden" onChange={handleFileSelect} />
          </motion.div>
        )}
      </motion.div>
    ) : (
          /* Sub-View: List of Accepted IDs Modal Grid */
          <motion.div 
            key="idList"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-5 text-left"
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setIsShowingIDList(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Back to ID upload"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">List of Valid IDs</h3>
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acceptable Government and Institutional IDs</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsShowingIDList(false)} 
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                 <X size={20} />
              </button>
            </div>

            {/* Tab Pill Selector: Primary IDs vs Secondary IDs */}
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl max-w-sm mx-auto gap-1 border border-slate-200/80 dark:border-slate-700/60">
              <button 
                type="button"
                onClick={() => setSelectedIDTab("primary")}
                className={cn(
                  "flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer",
                  selectedIDTab === 'primary' 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Primary IDs
              </button>
              <button 
                type="button"
                onClick={() => setSelectedIDTab("secondary")}
                className={cn(
                  "flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer",
                  selectedIDTab === 'secondary' 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Secondary IDs
              </button>
            </div>

            {/* Grid of IDs */}
            <div>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedIDTab}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                >
                  {selectedIDTab === 'primary' ? (
                    <>
                      {[
                        { name: "Driver's License", src: "/images/id-license.png" },
                        { name: "SSS / UMID ID", src: "/images/id-sss.png" },
                        { name: "Passport", src: "/images/id-passport.png" },
                        { name: "National ID", src: "/images/id-national-id.png" },
                        { name: "PRC ID", src: "/images/id-prc.png" },
                        { name: "Voter's ID", src: "/images/id-voters.png" },
                      ].map((id) => (
                        <div key={id.name} className="group p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 hover:border-blue-500 transition-all shadow-xs flex flex-col items-center gap-2.5 text-center">
                          <div className="w-full aspect-[1.586/1] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-inner flex items-center justify-center">
                             <SafeImage src={id.src} alt={id.name} />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 leading-tight">{id.name}</p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {[
                        { name: "Student ID (COR)", icon: <User size={20} />, color: "bg-blue-600 shadow-blue-200", src: "/images/id-secondary-studentID.png" },
                        { name: "Staff ID", icon: <User size={20} />, color: "bg-indigo-600 shadow-indigo-200", src: "/images/id-secondary-staffID.png" },
                        { name: "Faculty ID", icon: <User size={20} />, color: "bg-emerald-600 shadow-emerald-200", src: "/images/id-secondary-facultyID.png" },
                        { name: "Pag-IBIG ID", icon: <Info size={20} />, color: "bg-teal-600", src: "/images/id-secondary-pag-ibig.png" },
                        { name: "Police Clearance", icon: <ShieldCheck size={20} />, color: "bg-blue-50 text-blue-600", src: "/images/id-secondary-police-clearance.png" },
                        { name: "NBI Clearance", icon: <Info size={20} />, color: "bg-green-50 text-green-600", src: "/images/id-secondary-nbi-clearance.png" },
                        { name: "PhilHealth ID", icon: <Info size={20} />, color: "bg-teal-50 text-teal-600", src: "/images/id-secondary-philhealth.png" },
                        { name: "Postal ID", icon: <CreditCard size={20} />, color: "bg-rose-50 text-rose-600", src: "/images/id-secondary-postal-id.png" },
                        { name: "TIN ID", icon: <CreditCard size={20} />, color: "bg-orange-50 text-orange-600", src: "/images/id-secondary-tin-id.png" },
                      ].map((id) => (
                        <div key={id.name} className="group p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 hover:border-blue-500 transition-all shadow-xs flex flex-col items-center gap-2.5 text-center">
                          <div className="w-full aspect-[1.586/1] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-inner flex items-center justify-center">
                             {id.src ? (
                               <SafeImage src={id.src} alt={id.name} />
                             ) : (
                               <div className={`w-full h-full ${id.color} flex flex-col items-center justify-center text-white p-3 gap-1 group-hover:scale-105 transition-transform duration-300`}>
                                 {id.icon}
                                 <span className="text-[8px] font-black uppercase tracking-wider opacity-80">Official Doc</span>
                               </div>
                             )}
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 leading-tight">{id.name}</p>
                        </div>
                      ))}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 rounded-2xl text-left">
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2 uppercase tracking-wider">
                <ShieldCheck size={14} className="shrink-0" />
                Only clear, original documents will be accepted for verification.
              </p>
            </div>

            <div className="flex justify-center pt-1">
              <button 
                type="button"
                onClick={() => setIsShowingIDList(false)}
                className="w-full max-w-sm py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check size={14} className="stroke-[3]" /> Understood, back to upload
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IDStep;
