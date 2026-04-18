"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Sparkles, Share, X, Copy, Mail, MessageCircle } from "lucide-react";
import { LuBadgeCheck } from "react-icons/lu";
import { FaFacebook, FaTwitter } from "react-icons/fa";
import HeartButton from "@/components/favorites/HeartButton";

interface ListingHeaderProps {
  title: string;
  region: string | null;
  country: string | null;
  rating: number;
  reviewCount: number;
  listingId: string;
  hasFavorited: boolean;
}

const SHARE_BUTTONS: { label: string; icon: React.ElementType; action: string }[] = [
  { label: "Copy Link", icon: Copy, action: "copy" },
  { label: "Email", icon: Mail, action: "email" },
  { label: "Messages", icon: MessageCircle, action: "messages" },
  { label: "WhatsApp", icon: MessageCircle, action: "whatsapp" },
  { label: "Facebook", icon: FaFacebook, action: "facebook" },
  { label: "Twitter / X", icon: FaTwitter, action: "twitter" },
];

const ListingHeader: React.FC<ListingHeaderProps> = ({
  title,
  region,
  country,
  rating,
  reviewCount,
  listingId,
  hasFavorited,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReviewClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const reviewsSection = document.getElementById("reviews-section");
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Simulate share buttons loading when modal opens
  useEffect(() => {
    if (showShareModal) {
      setShareLoading(true);
      const t = setTimeout(() => setShareLoading(false), 1200);
      return () => clearTimeout(t);
    }
  }, [showShareModal]);

  // Lock body scroll when share modal is open
  useEffect(() => {
    if (showShareModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showShareModal]);

  const pageUrl = typeof window !== "undefined"
    ? `${window.location.origin}/listings/${listingId}`
    : `/listings/${listingId}`;

  const handleShareAction = async (action: string) => {
    switch (action) {
      case "copy":
        await navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      case "email":
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(pageUrl)}`);
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`${title} — ${pageUrl}`)}`);
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`);
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(pageUrl)}`);
        break;
      case "messages":
        window.open(`sms:?&body=${encodeURIComponent(`${title} — ${pageUrl}`)}`);
        break;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="pb-8"
      >
        <div className="flex flex-col gap-4">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest shadow-sm"
            >
              <LuBadgeCheck size={14} className="text-emerald-500" />
              Verified Property
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleReviewClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-widest hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors cursor-pointer shadow-sm"
            >
              <Star size={14} className="fill-amber-500 text-amber-500" />
              {rating.toFixed(1)} <span className="opacity-60">({reviewCount} Reviews)</span>
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest shadow-sm"
            >
              <Sparkles size={14} />
              BoardTAU Choice
            </motion.div>
          </div>

          {/* Title, Location & Action Buttons Row */}
          <div className="mt-2 flex items-start justify-between gap-4">
            {/* Left: Title + Location */}
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight tracking-tight mb-5">
                {title}
              </h1>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-gray-700 dark:text-gray-300 font-bold text-sm w-fit">
                <MapPin size={16} className="text-primary" />
                <span>{region}, {country}</span>
              </div>
            </div>

            {/* Right: Share + Favorite Buttons */}
            <div className="hidden md:flex items-center gap-2 shrink-0 mt-1">
              {/* Share Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold shadow-sm hover:shadow-md transition-all hover:border-gray-300 dark:hover:border-gray-600"
              >
                <Share size={16} />
                <span className="hidden sm:block">Share</span>
              </motion.button>

              <HeartButton listingId={listingId} hasFavorited={hasFavorited} showLabel />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-gray-100 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Share this place</h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={18} className="text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {/* Share Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {shareLoading
                  ? // Skeleton loading animation
                    Array.from({ length: 6 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.08 }}
                        className="h-[60px] rounded-2xl bg-gray-100 dark:bg-gray-800"
                      />
                    ))
                  : // Actual share buttons
                    SHARE_BUTTONS.map((btn, i) => {
                      const Icon = btn.icon;
                      const isCopied = btn.action === "copy" && copied;
                      return (
                        <motion.button
                          key={btn.action}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleShareAction(btn.action)}
                          className="flex items-center gap-3 px-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-sm transition-all shadow-sm hover:shadow-md"
                        >
                          <Icon size={20} className={isCopied ? "text-emerald-500" : "text-gray-700 dark:text-gray-300"} />
                          <span>{isCopied ? "Copied!" : btn.label}</span>
                        </motion.button>
                      );
                    })
                }
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ListingHeader;
