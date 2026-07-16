"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, MapPin, List } from "lucide-react";

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
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-[320px] pointer-events-auto"
        >
          <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-white/60 dark:border-gray-700/60 overflow-hidden">
            
            {/* Top accent stripe using primary color */}
            <div className="h-1.5 w-full" style={{ background: "var(--primary-color)" }} />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
            >
              <X size={14} />
            </button>

            <div className="p-5 flex flex-col items-center gap-4">
              {/* Logo */}
              <div className="relative w-24 h-24 rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] border-4 flex items-center justify-center overflow-hidden" style={{ borderColor: "var(--primary-color)" }}>
                {landmark.logo ? (
                  <Image
                    src={landmark.logo}
                    alt={landmark.name}
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <MapPin size={36} style={{ color: "var(--primary-color)" }} />
                )}
              </div>

              {/* Name & subtitle */}
              <div className="text-center">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug">
                  {landmark.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
                  <MapPin size={10} style={{ color: "var(--primary-color)" }} />
                  Tarlac Agricultural University
                </p>
              </div>

              {/* Nearby count badge */}
              {nearbyCount !== undefined && (
                <div className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: "var(--primary-color)" }}>
                  {nearbyCount} listing{nearbyCount !== 1 ? "s" : ""} nearby
                </div>
              )}

              {/* Action button */}
              <button
                onClick={() => {
                  onShowListings();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: "var(--primary-color)" }}
              >
                <List size={15} />
                View Nearby Listings
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
