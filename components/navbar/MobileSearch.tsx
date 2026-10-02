"use client";

import React, { useState, useEffect, useContext } from "react";
import dynamic from "next/dynamic";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchSummary } from "@/hooks/useSearchSummary";
import Modal, { ModalContext } from "../modals/Modal";

const SearchModal = dynamic(() => import("@/components/modals/SearchModal"), {
  ssr: false,
});

interface MobileSearchProps {
  layoutId?: string;
}

const MobileSearch: React.FC<MobileSearchProps> = ({ layoutId = "mobile-search-bar" }) => {
  const [mounted, setMounted] = useState(false);
  const { open } = useContext(ModalContext);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { locationLabel, priceLabel, roomTypeLabel } = useSearchSummary();

  const handleSearchClose = () => {};

  return (
    <Modal>
      <motion.div
        layoutId={layoutId}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Modal.Trigger name="search">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            whileHover={{
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
              y: -4,
              scale: 1.02
            }}
            className="w-full group"
            style={{
              width: '100%',
              background: 'rgba(var(--surface-rgb), 0.95)',
              borderRadius: '9999px',
              padding: '8px 14px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(2xl)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
            }}
          >
              <div className="flex items-center w-full gap-2.5">
                  
                  {/* Vibrant Search Icon Container */}
                  <motion.div 
                    className="flex items-center justify-center w-[38px] h-[38px] rounded-full bg-gradient-to-r from-primary to-orange-500 shadow-md shadow-orange-500/20 shrink-0"
                    whileHover={{ scale: 1.05, rotate: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                     <SearchIcon className="text-white w-4 h-4 drop-shadow-sm" />
                  </motion.div>

                  {/* Text Content */}
                  <div className="flex flex-col items-start min-w-0 flex-1 overflow-hidden">
                     <span className="font-bold text-[14px] leading-tight text-gray-900 dark:text-white truncate block w-full text-left tracking-tight">
                        {locationLabel === "Any / Not sure" ? "Where to?" : locationLabel}
                     </span>
                     <span className="text-[12px] leading-tight text-gray-500 dark:text-gray-400 truncate block w-full text-left font-medium">
                        {priceLabel === "Any price" && roomTypeLabel === "Any room" 
                           ? "Anywhere • Any week • Add guests" 
                           : <><span className="text-orange-600 dark:text-orange-400">{priceLabel}</span> <span className="mx-1 opacity-40">•</span> {roomTypeLabel}</>}
                     </span>
                  </div>
                  
                  {/* Premium Filter Icon */}
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="p-2 border border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 rounded-full shrink-0 text-gray-700 dark:text-gray-300 shadow-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                     <SlidersHorizontal className="w-3.5 h-3.5" />
                  </motion.div>
                </div>
          </motion.button>
        </Modal.Trigger>
      </motion.div>

      <Modal.Window name="search" size="full" hasFixedFooter noPadding>
        <SearchModal initialShowWizard={false} onCloseModal={handleSearchClose} />
      </Modal.Window>
    </Modal>
  );
};

export default MobileSearch;
