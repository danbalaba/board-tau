"use client";

import { useCompareStore } from "@/hooks/use-compare-store";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRightLeft } from "lucide-react";
import { useState, useEffect } from "react";
import CompareModal from "./CompareModal";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { cn } from "@/lib/utils";

export default function CompareFloatingBar() {
  const { selectedListingIds, clearListings } = useCompareStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted) return null;
  if (pathname !== "/favorites") return null;

  const count = selectedListingIds.length;
  const isHidden = isMobile && scrollDirection === "down";

  return (
    <>
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            key="compare-floating-bar"
            initial={{ y: 120, opacity: 0, scale: 0.95 }}
            animate={{
              y: isHidden ? 160 : 0,
              opacity: isHidden ? 0 : 1,
              scale: isHidden ? 0.95 : 1
            }}
            exit={{ y: 120, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "fixed bottom-[88px] md:bottom-6 inset-x-0 mx-auto z-[100] w-[92%] max-w-md",
              "bg-white/70 dark:bg-slate-900/75 backdrop-blur-3xl",
              "border border-white/50 dark:border-white/20 ring-1 ring-white/30 dark:ring-white/10",
              "shadow-[0_16px_45px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_55px_rgba(0,0,0,0.65)]",
              "rounded-[28px] p-3 sm:p-3.5 flex items-center justify-between font-sans",
              isHidden && "pointer-events-none"
            )}
          >
            <div className="flex items-center gap-3 pl-1">
              <div className="bg-[#2f7d6d]/15 dark:bg-emerald-500/20 text-[#2f7d6d] dark:text-emerald-400 font-extrabold w-9 h-9 rounded-full border border-[#2f7d6d]/20 dark:border-emerald-400/30 flex items-center justify-center shrink-0 shadow-sm text-sm">
                {count}
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-tight tracking-tight">
                  Listings Selected
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                  {count >= 2 ? "Ready to compare!" : "Select up to 3 to compare"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={clearListings}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full transition-colors"
                title="Clear selection"
              >
                <X size={18} />
              </button>
              <button
                disabled={count < 2}
                onClick={() => setIsModalOpen(true)}
                className="bg-[#2f7d6d] hover:bg-[#256659] text-white px-4 py-2 rounded-full font-extrabold text-xs sm:text-sm shadow-lg shadow-[#2f7d6d]/30 border border-emerald-400/30 transition-all uppercase tracking-wider backdrop-blur-xl flex items-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRightLeft size={15} strokeWidth={2.5} />
                <span>Compare</span>
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
