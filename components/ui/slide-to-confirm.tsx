"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideToConfirmProps {
  /** Text to show before sliding */
  text?: string;
  /** Text to show after confirming */
  successText?: string;
  /** Async callback fired when slide completes */
  onConfirm: () => Promise<void> | void;
  /** Width of the component */
  width?: number;
  /** Height of the component */
  height?: number;
  /** Additional classes for the container */
  className?: string;
  /** Optional icon to show next to text */
  icon?: React.ReactNode;
  /** Whether the slider is disabled */
  disabled?: boolean;
  /** Stretch to fill parent container width */
  fullWidth?: boolean;
}

export function SlideToConfirm({
  text = "Slide to confirm",
  successText = "Confirmed",
  onConfirm,
  width = 300,
  height = 56,
  className,
  icon,
  disabled = false,
  fullWidth = false,
}: SlideToConfirmProps) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [measuredWidth, setMeasuredWidth] = useState(width);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fullWidth || !containerRef.current) return;
    const el = containerRef.current;
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) {
        setMeasuredWidth(w);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [fullWidth, width]);

  const resolvedWidth = fullWidth ? (measuredWidth > 0 ? measuredWidth : width) : width;
  const trackWidth = resolvedWidth - height;
  const thumbSize = height - 8;

  const x = useMotionValue(0);

  const textOpacity = useTransform(x, [0, trackWidth * 0.5], [1, 0]);
  const bgWidth = useTransform(x, [0, trackWidth], [height, resolvedWidth]);
  const hintOpacity = useTransform(x, [0, 30], [1, 0]);

  const handleDragStart = () => setIsDragging(true);

  const handleDragEnd = async () => {
    setIsDragging(false);
    if (state !== "idle" || disabled) return;

    if (x.get() >= trackWidth * 0.9) {
      animate(x, trackWidth, { type: "spring", stiffness: 400, damping: 30 });
      setState("loading");
      try {
        await onConfirm();
        setState("success");
      } catch {
        setState("idle");
        animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
      }
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  };

  const handleReset = () => {
    if (state === "success") {
      setState("idle");
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  };

  const showHint = state === "idle" && !isDragging;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 select-none transition-opacity",
        state === "success" ? "cursor-pointer" : "",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className
      )}
      style={{ width: fullWidth ? "100%" : width, height }}
      onClick={handleReset}
    >
      {/* Background fill */}
      <motion.div
        className="absolute left-0 top-0 h-full rounded-2xl"
        style={{
          width: state === "success" ? resolvedWidth : bgWidth,
          backgroundColor: "var(--primary-color, #2f7d6d)",
          opacity: state === "success" ? 1 : 0.08,
        }}
        animate={{ width: state === "success" ? resolvedWidth : undefined }}
        transition={{ duration: 0.3 }}
      />

      {/* Idle text */}
      <motion.span
        className={cn(
          "absolute flex items-center gap-2 font-black tracking-widest uppercase text-xs z-0 pointer-events-none pl-6",
          "text-gray-600 dark:text-gray-300"
        )}
        style={{ opacity: state === "idle" ? textOpacity : 0 }}
      >
        {icon && <span className="text-primary">{icon}</span>}
        <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent">
          {text}
        </span>
      </motion.span>

      {/* Success text */}
      <motion.span
        className="absolute font-black tracking-widest uppercase text-xs z-10 text-white drop-shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: state === "success" ? 1 : 0, y: state === "success" ? 0 : 10 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {successText}
      </motion.span>

      {/* Animated hint chevrons — ripple right to guide user */}
      {showHint && (
        <motion.div
          className="absolute flex items-center z-0 pointer-events-none"
          style={{ opacity: hintOpacity, left: height + 2 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ x: [0, 6, 0], opacity: [0.3, 0.9, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
            >
              <ChevronRight className="h-4 w-4 text-primary -mx-1 stroke-[2.5]" />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Draggable thumb */}
      <motion.div
        drag={state === "idle" && !disabled ? "x" : false}
        dragConstraints={{ left: 0, right: trackWidth }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={cn(
          "absolute left-1 z-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-700 shadow-lg border border-gray-200/80 dark:border-gray-600",
          (state !== "idle" || disabled) ? "cursor-default" : "cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-transform"
        )}
        initial={false}
        whileTap={{ scale: state === "idle" ? 0.95 : 1 }}
        animate={state === "success" ? { backgroundColor: "var(--primary-dark-color, #1e5146)", color: "white" } : {}}
        style={{ width: thumbSize, height: thumbSize, x }}
      >
        {/* Pulsing ring indicator when idle */}
        {state === "idle" && !disabled && (
          <span className="absolute inset-0 rounded-xl bg-primary/20 animate-ping opacity-75 pointer-events-none" />
        )}
        {/* Arrow icon */}
        <motion.div
          animate={{ scale: state === "idle" ? 1 : 0, opacity: state === "idle" ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-300" />
        </motion.div>

        {/* Loading spinner */}
        <motion.div
          animate={{ scale: state === "loading" ? 1 : 0, opacity: state === "loading" ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute flex h-full w-full items-center justify-center"
        >
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </motion.div>

        {/* Success check */}
        <motion.div
          animate={{ scale: state === "success" ? 1 : 0, opacity: state === "success" ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute text-white"
        >
          <Check className="h-5 w-5" />
        </motion.div>
      </motion.div>
    </div>
  );
}
