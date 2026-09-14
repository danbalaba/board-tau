"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";

interface EmptyProps {
  title?: string;
  subtitle?: string;
  showReset?: boolean;
}

const EmptyState: React.FC<EmptyProps> = ({
  title = "No exact matches",
  subtitle = "Try changing or removing some of your filters.",
  showReset,
}) => {
  return (
    <div className="h-[60vh] flex flex-col justify-center items-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative flex flex-col items-center text-center"
      >
        {/* Glow Background */}
        <div className="absolute inset-0 bg-primary/20 dark:bg-primary/10 blur-[80px] rounded-full w-48 h-48 -z-10 mt-10" />

        <motion.div
          initial={{ y: 10 }}
          animate={{ y: 0 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className="mb-6 p-5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-full border border-gray-100 dark:border-gray-700 shadow-xl shadow-primary/5"
        >
          <SearchX className="w-12 h-12 text-primary" strokeWidth={1.5} />
        </motion.div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
          {title}
        </h2>
        
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-lg leading-relaxed mb-8">
          {subtitle}
        </p>

        {showReset && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-primary hover:bg-primary/90 transition-all rounded-full shadow-lg shadow-primary/30"
            >
              Clear all filters
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default EmptyState;
