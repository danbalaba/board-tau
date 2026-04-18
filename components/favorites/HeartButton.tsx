"use client";
import React, { useState, useTransition, useEffect } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/utils/helper";
import { updateFavorite } from "@/services/user/favorites";

interface HeartButtonProps {
  listingId: string;
  hasFavorited: boolean;
  showLabel?: boolean;
}

const HeartButton: React.FC<HeartButtonProps> = ({
  listingId,
  hasFavorited: initialValue,
  showLabel = false,
}) => {
  const router = useRouter();
  const { status } = useSession();
  const { error } = useResponsiveToast();
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

    // Optimistic update — flip state instantly, don't wait for the server
    const newValue = !hasFavorited;
    setHasFavorited(newValue);

    startTransition(async () => {
      try {
        await updateFavorite({
          listingId,
          favorite: newValue,
        });
        // Silently refresh in background so favorites page stays in sync
        router.refresh();
      } catch (err) {
        // Revert on failure
        setHasFavorited(!newValue);
        error("Failed to update favorite");
      }
    });
  };

  if (showLabel) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer disabled:cursor-not-allowed",
          isPending && "opacity-70"
        )}
      >
        <span className="relative flex items-center">
          <AiOutlineHeart
            size={22}
            className="text-gray-900 dark:text-gray-100 absolute -top-[1px] -right-[1px]"
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={hasFavorited ? "favorited" : "not-favorited"}
              initial={{ scale: 1 }}
              animate={{
                scale: hasFavorited ? [1, 1.15, 1] : [1, 0.9, 1],
              }}
              transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <AiFillHeart
                size={20}
                className={cn(
                  hasFavorited
                    ? "fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                    : "fill-neutral-500/70"
                )}
              />
            </motion.div>
          </AnimatePresence>
        </span>
        <span className="hidden sm:block text-sm font-bold text-gray-700 dark:text-gray-300">
          {hasFavorited ? "Saved" : "Save"}
        </span>
      </button>
    );
  }

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
