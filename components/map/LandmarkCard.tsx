"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, List, Building2 } from "lucide-react";
import SafeImage from "@/components/common/SafeImage";

interface LandmarkCardProps {
  landmark: {
    id: string;
    name: string;
    coords: [number, number];
    logo?: string;
  } | null;
  nearbyCount?: number;
  onClose: () => void;
  onShowListings: () => void;
}

export default function LandmarkCard({ landmark, nearbyCount, onClose, onShowListings }: LandmarkCardProps) {
  return (
    <AnimatePresence>
      {landmark && (
        <motion.div
          key={landmark.id}
          initial={{ opacity: 0, y: 28, scale: 0.94, x: "-50%" }}
          animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
          exit={{ opacity: 0, y: 20, scale: 0.94, x: "-50%" }}
          transition={{ type: "spring", damping: 24, stiffness: 320 }}
          className="absolute bottom-6 left-1/2 z-[250] w-[90%] max-w-[340px] pointer-events-auto"
        >
          <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-white/60 dark:border-gray-700/60 overflow-hidden">
            
            {/* Top Primary Accent Gradient Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-400" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 cursor-pointer shadow-xs"
              title="Close landmark card"
            >
              <X size={14} />
            </button>

            <div className="p-5 flex flex-col items-center text-center gap-3.5">
              {/* Landmark Avatar / Logo Container */}
              <div className="relative w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border-2 border-primary/30 p-1 flex items-center justify-center overflow-hidden shrink-0">
                {landmark.logo ? (
                  <SafeImage
                    src={landmark.logo}
                    alt={landmark.name}
                    containerClassName="w-full h-full rounded-xl overflow-hidden"
                  />
                ) : (
                  <Building2 size={32} className="text-primary" />
                )}
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className="font-extrabold text-gray-900 dark:text-white text-base leading-tight">
                  {landmark.name}
                </h3>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1.5">
                  <MapPin size={12} className="text-primary shrink-0" />
                  <span>Tarlac Agricultural University</span>
                </p>
              </div>

              {/* Nearby Count Badge */}
              {nearbyCount !== undefined && (
                <div className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 border border-primary/20">
                  {nearbyCount} Listing{nearbyCount !== 1 ? "s" : ""} Nearby
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  onShowListings();
                  onClose();
                }}
                className="w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider text-white bg-primary hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer mt-1"
              >
                <List size={14} />
                <span>View Nearby Listings</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
