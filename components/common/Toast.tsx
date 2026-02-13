"use client";

import React from "react";
import { Toast as ToastType, Toaster as HotToaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  AiFillCheckCircle,
  AiFillInfoCircle,
  AiFillWarning,
  AiFillCloseCircle,
} from "react-icons/ai";

// Toast variants configuration
const toastVariants = {
  success: {
    icon: AiFillCheckCircle,
    borderColor: "border-green-500/20",
    iconColor: "text-green-500",
    bgGradient: "from-green-500/5 to-emerald-500/5",
    glow: "shadow-glow-green",
  },
  error: {
    icon: AiFillCloseCircle,
    borderColor: "border-red-500/20",
    iconColor: "text-red-500",
    bgGradient: "from-red-500/5 to-rose-500/5",
    glow: "shadow-glow-red",
  },
  warning: {
    icon: AiFillWarning,
    borderColor: "border-amber-500/20",
    iconColor: "text-amber-500",
    bgGradient: "from-amber-500/5 to-orange-500/5",
    glow: "shadow-glow-amber",
  },
  info: {
    icon: AiFillInfoCircle,
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-500",
    bgGradient: "from-blue-500/5 to-indigo-500/5",
    glow: "shadow-glow-blue",
  },
};

// Premium glassmorphism toast component
const GlassToast = ({ toast }: { toast: ToastType }) => {
  const variant = toastVariants[toast.type as keyof typeof toastVariants] || toastVariants.info;
  const IconComponent = variant.icon;

  return (
    <AnimatePresence mode="wait">
      {toast.visible && (
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.96,
            rotateX: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
          }}
          exit={{
            opacity: 0,
            y: 10,
            scale: 0.98,
            rotateX: -10,
          }}
          transition={{
            type: "spring",
            damping: 22,
            stiffness: 400,
            mass: 0.9,
          }}
          className={`
            relative w-full max-w-sm overflow-hidden
            bg-white/80 dark:bg-gray-900/80
            backdrop-blur-glass dark:backdrop-blur-glass
            border ${variant.borderColor}
            rounded-2xl shadow-glass dark:shadow-glass-dark ${variant.glow}
            p-4 mb-3
            transition-all duration-300
          `}
        >
          {/* Subtle gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-r ${variant.bgGradient} opacity-50`} />

          {/* Content container */}
          <div className="relative flex items-start space-x-4">
            {/* Icon with animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                damping: 12,
                stiffness: 400,
                delay: 0.1,
              }}
              className={`
                flex-shrink-0 mt-0.5
                ${variant.iconColor}
                drop-shadow-sm
              `}
            >
              <IconComponent size={24} />
            </motion.div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed"
              >
                {typeof toast.message === "string" ? toast.message : " "}
              </motion.p>
            </div>

            {/* Close button */}
            {toast.type !== "loading" && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => {
                  // @ts-ignore - dismiss functionality exists in react-hot-toast
                }}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
                         transition-colors duration-200 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
              >
                <AiFillCloseCircle size={16} />
              </motion.button>
            )}
          </div>

          {/* Progress indicator (for auto-dismiss) */}
          {toast.duration && (
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{
                duration: toast.duration / 1000,
                ease: "linear",
              }}
              className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30"
              style={{ color: getComputedStyle(document.documentElement).getPropertyValue(variant.iconColor.split('text-')[1]) }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Custom toaster container
export const Toaster = () => {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          display: "none", // Hide default styles
        },
        success: {
          duration: 3500,
        },
        error: {
          duration: 5000,
        },
        // @ts-ignore - warning is a valid type but not in type definitions
        warning: {
          duration: 4500,
        },
        // @ts-ignore - info is a valid type but not in type definitions
        info: {
          duration: 4000,
        },
      }}
      containerStyle={{
        top: '80px', // Position below navbar
        right: '20px',
        zIndex: 60, // Higher than modal (z-50) to appear above
      }}
    >
      {(t) => <GlassToast toast={t} />}
    </HotToaster>
  );
};
