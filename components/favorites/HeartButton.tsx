"use client";
import React, { useState, useCallback, useRef } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import debounce from "lodash.debounce";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/utils/helper";
import { updateFavorite } from "@/services/favorite";

interface HeartButtonProps {
  listingId: string;
  hasFavorited: boolean;
}

const HeartButton: React.FC<HeartButtonProps> = ({
  listingId,
  hasFavorited: initialValue,
}) => {
  const { status } = useSession();
  const [hasFavorited, setHasFavorited] = useState(initialValue);
  const hasFavoritedRef = useRef(initialValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const { mutate } = useMutation({
    mutationFn: updateFavorite,
    onError: () => {
      hasFavoritedRef.current = !hasFavoritedRef.current;
      setHasFavorited(hasFavoritedRef.current);
      toast.error("Failed to favorite");
    }
  });

  const debouncedUpdateFavorite = debounce(() => {
    mutate({
      listingId,
      favorite: hasFavoritedRef.current,
    });
  }, 300);

  const handleUpdate = useCallback(() => {
    debouncedUpdateFavorite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (status !== "authenticated") {
      toast.error("Please sign in to favorite the listing!");
      return;
    }

    if (isAnimating) {
      return;
    }

    setIsAnimating(true);
    handleUpdate();
    setHasFavorited((prev) => !prev);
    hasFavoritedRef.current = !hasFavoritedRef.current;

    setTimeout(() => {
      setIsAnimating(false);
    }, 450);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isAnimating}
      className="relative hover:opacity-80 transition cursor-pointer z-[5] disabled:cursor-not-allowed"
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
            ease: [0.34, 1.56, 0.64, 1], // Natural spring feel
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
