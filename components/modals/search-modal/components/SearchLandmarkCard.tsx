"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, MapPin } from "lucide-react";

interface SearchLandmarkCardProps {
  landmark: {
    id: string;
    name: string;
    coords: [number, number];
    logo?: string;
  } | null;
  onClose: () => void;
}

export default function SearchLandmarkCard({ landmark, onClose }: SearchLandmarkCardProps) {
  return (
    <AnimatePresence>
      {landmark && (
        <motion.div
          key={landmark.id}
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="pointer-events-auto"
        >
          <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden flex items-center p-3 gap-3 pr-8">
            {/* Left accent border */}
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: "var(--primary-color)" }} />
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={14} />
            </button>

            {/* Logo */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm border flex items-center justify-center overflow-hidden" style={{ borderColor: "var(--primary-color)" }}>
              {landmark.logo ? (
                <Image
                  src={landmark.logo}
                  alt={landmark.name}
                  width={40}
                  height={40}
                  className="object-contain p-1"
                />
              ) : (
                <MapPin size={20} style={{ color: "var(--primary-color)" }} />
              )}
            </div>

            {/* Text Content */}
            <div className="flex flex-col min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-[13px] leading-tight truncate w-full">
                {landmark.name}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate w-full flex items-center gap-1">
                <MapPin size={10} style={{ color: "var(--primary-color)" }} />
                Selected College
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
