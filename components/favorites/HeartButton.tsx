"use client";
import React, { useState, useTransition, useEffect } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/utils/helper";
import { updateFavorite } from "@/services/user/favorites";
import { useLoading } from "@/components/loading/LoadingContext";

interface HeartButtonProps {
  listingId: string;
  hasFavorited: boolean;
}

const HeartButton: React.FC<HeartButtonProps> = ({
  listingId,
  hasFavorited: initialValue,
}) => {
  const router = useRouter();
  const { status } = useSession();
  const { error } = useResponsiveToast();
  const { startLoading, stopLoading } = useLoading();
  const [isPending, startTransition] = useTransition();
  
  // Use the prop as the source of truth
  const [hasFavorited, setHasFavorited] = useState(initialValue);
  
  // Sync state with server prop
  useEffect(() => {
    setHasFavorited(initialValue);
  }, [initialValue]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (isPending) return;

    if (status !== "authenticated") {
      error({
        title: "Please sign in",
        description: "You need to be logged in to favorite listings"
      });
      return;
    }

    // TRIGGER LOADING IMMEDIATELY
    startLoading();

    startTransition(async () => {
      try {
        await updateFavorite({
          listingId,
          favorite: !hasFavorited,
        });
        
        // Refresh the page data
        router.refresh();
      } catch (err) {
        error("Failed to update favorite");
        stopLoading();
      }
      // Note: stopLoading will be called mostly by the GlobalLoadingOverlay 
      // effect since the route will "change" (refresh) or we can call it manually 
      // if it's too fast. But GlobalLoadingOverlay has a 1.5s timer.
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "relative hover:opacity-80 transition cursor-pointer z-[5] disabled:cursor-not-allowed",
        isPending && "opacity-70"
      )}
    >
      <AiOutlineHeart
        size={28}
        className="
          text-gray-50
          absolute
          -top-[2px]
          -right-[2px]
        "
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={hasFavorited ? "favorited" : "not-favorited"}
          initial={{ scale: 1 }}
          animate={{
            scale: hasFavorited ? [1, 1.15, 1] : [1, 0.9, 1],
            filter: hasFavorited ? ["brightness(1)", "brightness(1.2)", "brightness(1)"] : "brightness(1)",
          }}
          transition={{
            duration: 0.45,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          <AiFillHeart
            size={24}
            className={cn(
              hasFavorited
                ? "fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                : "fill-neutral-500/70"
            )}
          />
        </motion.div>
      </AnimatePresence>
    </button>
  );
};

export default HeartButton;
