"use client";

import React, { useState } from "react";
import { X, Upload, Camera, Check, Loader2, Image as ImageIcon } from "lucide-react";
import Modal from "./Modal";
import Button from "@/components/common/Button";
import { useEdgeStore } from "@/lib/edgestore";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import Avatar from "@/components/common/Avatar";
import { motion, AnimatePresence } from "framer-motion";

interface ChangeProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage: string | null;
  onUpdate: (url: string) => Promise<void>;
}

const ChangeProfileImageModal: React.FC<ChangeProfileImageModalProps> = ({
  isOpen,
  onClose,
  currentImage,
  onUpdate,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { edgestore } = useEdgeStore();
  const { success, error } = useResponsiveToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 1. Check file size (2MB)
      if (selectedFile.size > 2 * 1024 * 1024) {
        error({
          title: "File Too Large",
          description: "Image must be less than 2MB. Please compress and try again."
        });
        e.target.value = ''; // Reset input
        return;
      }

      // 2. Check file type (Images only)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        error({
          title: "Invalid File Type",
          description: `PDF and other document types are not allowed. Please upload a JPG, PNG, or WebP image.`
        });
        e.target.value = ''; // Reset input
        return;
      }

      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress) => {
          setProgress(progress);
        },
      });

      await onUpdate(res.url);
      success("Profile picture updated successfully");
      handleClose();
    } catch (err: any) {
      console.error("Upload error:", err);
      error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewUrl(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} width="sm" title="Change Avatar">
      <div className="p-1">
        <div className="flex flex-col items-center justify-center space-y-8 py-4">

          {/* Avatar Preview Section */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full ring-4 ring-primary/20 dark:ring-primary/40 overflow-hidden bg-gray-100 dark:bg-gray-800 relative shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={previewUrl || currentImage || 'placeholder'}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  <Avatar
                    src={previewUrl || currentImage}
                    className="w-full h-full"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Modern Liquid Fill Upload Overlay */}
              <AnimatePresence>
                {isUploading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 overflow-hidden"
                  >
                    {/* Background Blur */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
                    
                    {/* Rising Liquid Overlay */}
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 bg-primary/40 backdrop-blur-none border-t border-white/20"
                      initial={{ height: "0%" }}
                      animate={{ height: `${progress}%` }}
                      transition={{ type: "spring", damping: 20, stiffness: 60 }}
                    >
                       {/* Subtle Wave Effect */}
                       <motion.div 
                        animate={{ 
                          x: [-20, 0, -20],
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 2, 
                          ease: "easeInOut" 
                        }}
                        className="absolute -top-4 left-0 w-[200%] h-8 bg-primary/30 blur-sm rounded-[100%]"
                       />
                    </motion.div>

                    {/* Accurate Center Progress */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                         <svg className="w-full h-full -rotate-90">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="transparent"
                              className="text-white/10"
                            />
                            <motion.circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="transparent"
                              strokeDasharray="175.929"
                              initial={{ strokeDashoffset: 175.929 }}
                              animate={{ strokeDashoffset: 175.929 - (175.929 * progress) / 100 }}
                              className="text-primary"
                            />
                         </svg>
                         <span className="absolute text-xs font-black tracking-tighter">
                            {Math.round(progress)}%
                         </span>
                      </div>
                      <p className="text-[8px] font-black uppercase tracking-widest mt-2 opacity-80">Uploading...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <label className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all hover:scale-110 active:scale-95 z-30 ring-4 ring-white dark:ring-gray-900">
              <Camera size={18} />
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,image/gif,image/jpg"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>

          <div className="text-center space-y-2">
            <h3 className="font-bold text-gray-900 dark:text-white">Profile Picture</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] mx-auto leading-relaxed">
              Upload a clear photo of yourself. JPG, PNG, WebP or GIF. Max 2MB.
            </p>
          </div>

          {/* Upload Progress Bar (Visible only when uploading) */}
          {isUploading && (
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 w-full">
             {!previewUrl ? (
                <Button
                   outline
                   className="w-full h-12 rounded-2xl font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                   onClick={handleClose}
                >
                   Cancel
                </Button>
             ) : (
                <>
                  <Button
                    variant="secondary"
                    outline
                    className="flex-1 h-12 rounded-2xl font-medium border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => { setFile(null); setPreviewUrl(null); }}
                    disabled={isUploading}
                  >
                    Reset
                  </Button>
                  <Button
                    className="flex-[2] h-12 rounded-2xl font-medium shadow-xl shadow-primary/20 bg-primary dark:bg-primary text-white hover:opacity-90 active:scale-[0.98] transition-all"
                    onClick={handleUpload}
                    disabled={isUploading || !file}
                    isLoading={isUploading}
                  >
                    Set New Avatar
                  </Button>
                </>
             )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ChangeProfileImageModal;
