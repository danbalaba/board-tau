"use client";

import { useCompareStore } from "@/hooks/use-compare-store";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRightLeft } from "lucide-react";
import { useState, useEffect } from "react";
import CompareModal from "./CompareModal";

export default function CompareFloatingBar() {
  const { selectedListingIds, clearListings } = useCompareStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (pathname !== "/favorites") return null;

  const count = selectedListingIds.length;

  return (
    <>
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            key="compare-floating-bar"
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-6 inset-x-0 mx-auto z-[100] w-[90%] max-w-md bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between"
          >
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
              {count}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                Listings Selected
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                {count >= 2 ? "Ready to compare!" : "Select up to 3 to compare"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={clearListings}
              className="p-1.5 sm:p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
              title="Clear selection"
            >
              <X size={18} />
            </button>
            <button
              disabled={count < 2}
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
            >
              <ArrowRightLeft size={14} className="sm:w-4 sm:h-4" />
              Compare
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
      
    {/* The Split Modal */}
    <CompareModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
      listingIds={selectedListingIds} 
    />
  </>
  );
}
