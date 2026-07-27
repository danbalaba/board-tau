import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaIdCard, FaCamera, FaImage, FaTimes, FaCheckCircle, FaShieldAlt } from "react-icons/fa";
import { Loader2, ScanLine, AlertCircle } from "lucide-react";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";

interface IDStepProps {
  capturedID: string | null;
  setCapturedID: (val: string | null) => void;
  isProcessing: boolean;
  handleCaptureID: (file: File) => void;
  selfieRetakeNeeded?: boolean;
  handleRetakeSelfie?: () => void;
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
 * Validates that a URL uses a safe protocol (blob: or data:) before
 * passing it to an img src. CodeQL recognizes this as a safe whitelist.
 */
const sanitizeImgUrl = (url: string | null): string | undefined => {
  if (!url) return undefined;
  try {
    const { protocol } = new URL(url);
    return (protocol === 'blob:' || protocol === 'data:') ? url : undefined;
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
  capturedID, setCapturedID,
  isProcessing, handleCaptureID,
  selfieRetakeNeeded, handleRetakeSelfie
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const responsiveToast = useResponsiveToast();

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const processFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      responsiveToast.error("Please upload a valid image file (JPEG, PNG, or WEBP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      responsiveToast.error("File size is too large. Please upload an image under 10MB.");
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

  const confirmUpload = () => { if (selectedFile) handleCaptureID(selectedFile); };

  const cancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 shrink-0">
          <FaIdCard className="text-blue-400" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Step 2: Upload Your ID Card
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Take a clear photo of your <span className="text-blue-400 font-medium">physical government-issued ID</span> — both portrait and landscape are accepted. <br/>
            <span className="text-amber-500 dark:text-amber-400 font-medium italic">* Please ensure the face photo on the ID is clearly visible for verification.</span>
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── STATE 1: Captured & Verified ─── */}
        {capturedID ? (
          <motion.div
            key="verified"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-black flex items-center justify-center"
            style={{ minHeight: 280 }}
          >
            <img src={capturedID} alt="Captured ID" className="absolute inset-0 w-full h-full object-contain p-4" />

            {/* Green success overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/90 to-transparent" />

            {/* Corner brackets — verified green */}
            {(["tl","tr","bl","br"] as const).map(pos => (
              <div key={pos} className={`absolute w-7 h-7 border-emerald-400/80 ${
                pos === "tl" ? "top-2 left-2 border-t-2 border-l-2 rounded-tl-md" :
                pos === "tr" ? "top-2 right-2 border-t-2 border-r-2 rounded-tr-md" :
                pos === "bl" ? "bottom-2 left-2 border-b-2 border-l-2 rounded-bl-md" :
                               "bottom-2 right-2 border-b-2 border-r-2 rounded-br-md"
              }`} />
            ))}

            {/* Retake button */}
            <button
              type="button"
              onClick={() => { setCapturedID(null); cancelUpload(); }}
              className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-red-500/80 transition-all z-10 border border-white/10"
            >
              <FaTimes size={12} />
            </button>

            {/* Verified badge */}
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="absolute bottom-4 left-0 right-0 flex justify-center z-10"
            >
              <span className="flex items-center gap-2 bg-emerald-600/90 backdrop-blur-sm text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl border border-emerald-400/30">
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
            {/* Preview card */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-gray-50 dark:bg-black shadow-2xl border border-gray-200 dark:border-white/10 flex items-center justify-center" style={{ minHeight: 250 }}>
              <img 
                src={sanitizeImgUrl(previewUrl)}
                alt="ID Preview" 
                className="absolute inset-0 w-full h-full object-contain p-4" 
              />

              {/* Corner brackets */}
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
                    {/* Scan line animation */}
                    <div className="relative w-full h-0.5 overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                        animate={{ x: ["-100%", "400%"] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                      />
                    </div>

                    {/* Rings + spinner */}
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

                    {/* Scan line at bottom */}
                    <div className="relative w-full h-0.5 overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                        animate={{ x: ["400%", "-100%"] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* File info bar */}
            {selectedFile && !isProcessing && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-white/5 text-xs text-gray-500 dark:text-gray-400">
                <FaIdCard size={11} className="text-blue-500 dark:text-blue-400 shrink-0" />
                <span className="truncate flex-1 font-mono text-gray-700 dark:text-gray-300">{selectedFile.name}</span>
                <span className="shrink-0 text-gray-400 dark:text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</span>
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
                  className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-lg transition-colors"
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
                className="flex-1 py-3.5 rounded-xl font-semibold text-sm border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 transition-all"
              >
                ↩ Retake
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={confirmUpload}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
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
            {/* Big drop zone */}
            <div 
              className={`relative w-full rounded-2xl bg-gradient-to-b border-2 border-dashed transition-colors overflow-hidden group ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 from-blue-50/50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-900/20' 
                  : 'from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-gray-300 dark:border-gray-700 hover:border-blue-500/50'
              }`}
              style={{ minHeight: 220 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >

              {/* Background card illustration */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
                <FaIdCard size={160} className="text-blue-300" />
              </div>

              {/* Corner brackets */}
              <div className="absolute inset-4 pointer-events-none">
                {(["tl","tr","bl","br"] as const).map(pos => <CornerBracket key={pos} position={pos} />)}
              </div>

              {/* Centre content */}
              <div className="relative flex flex-col items-center justify-center h-full gap-3 py-12 px-6">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"
                >
                  <FaIdCard className="text-blue-400" size={28} />
                </motion.div>
                <div className="text-center space-y-1">
                  <p className="text-gray-900 dark:text-white font-semibold text-sm">Position your ID card here</p>
                  <p className="text-gray-500 text-xs">Accepted: JPEG, PNG, WEBP, HEIC · Max 10MB</p>
                </div>
              </div>
            </div>

            {/* Upload buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold flex flex-col items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <FaCamera size={22} />
                <span className="text-[11px] uppercase tracking-widest">Take Photo</span>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white py-4 rounded-2xl font-bold flex flex-col items-center gap-2 transition-all active:scale-95"
              >
                <FaImage size={22} />
                <span className="text-[11px] uppercase tracking-widest">Gallery</span>
              </button>
            </div>

            {/* Tips */}
            <div className="flex gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertCircle size={14} className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300/70 leading-relaxed">
                Ensure the <strong className="text-amber-800 dark:text-amber-300">entire ID card</strong> is visible, well-lit, and free from glare or blur.
              </p>
            </div>

            {/* Hidden inputs */}
            <input type="file" ref={fileInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
            <input type="file" ref={galleryInputRef} accept="image/*" className="hidden" onChange={handleFileSelect} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IDStep;
