"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion";
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
      setMeasuredWidth(entry.contentRect.width || width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [fullWidth, width]);

  const resolvedWidth = fullWidth ? measuredWidth : width;
  const trackWidth = resolvedWidth - height;
  const thumbSize = height - 8;

  const x = useMotionValue(0);
  const controls = useAnimation();

  const textOpacity = useTransform(x, [0, trackWidth * 0.5], [1, 0]);
  const bgWidth = useTransform(x, [0, trackWidth], [height, resolvedWidth]);
  const hintOpacity = useTransform(x, [0, 30], [1, 0]);

  const handleDragStart = () => setIsDragging(true);

  const handleDragEnd = async () => {
    setIsDragging(false);
    if (state !== "idle" || disabled) return;

    if (x.get() >= trackWidth * 0.9) {
      controls.start({ x: trackWidth, transition: { type: "spring", stiffness: 400, damping: 30 } });
      setState("loading");
      try {
        await onConfirm();
        setState("success");
      } catch {
        setState("idle");
        controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 30 } });
      }
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 30 } });
    }
  };

  const handleReset = () => {
    if (state === "success") {
      setState("idle");
      x.set(0);
      controls.start({ x: 0 });
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
      style={{ minWidth: resolvedWidth, height }}
      onClick={handleReset}
    >
      {/* Background fill */}
      <motion.div
        className="absolute left-0 top-0 h-full rounded-2xl"
        style={{
          width: state === "success" ? resolvedWidth : bgWidth,
          backgroundColor: state === "success" ? "#22c55e" : "var(--primary-color, #2f7d6d)",
          opacity: state === "success" ? 0.1 : 0.05,
        }}
        animate={{ width: state === "success" ? resolvedWidth : undefined }}
        transition={{ duration: 0.3 }}
      />

      {/* Idle text */}
      <motion.span
        className={cn(
          "absolute flex items-center gap-2 font-black tracking-widest uppercase text-xs z-0 pointer-events-none",
          "text-gray-500 dark:text-gray-400"
        )}
        style={{ opacity: state === "idle" ? textOpacity : 0 }}
      >
        {icon && <span className="opacity-70">{icon}</span>}
        {text}
      </motion.span>

      {/* Success text */}
      <motion.span
        className="absolute font-black tracking-widest uppercase text-xs z-0 text-emerald-600 dark:text-emerald-400"
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
          style={{ opacity: hintOpacity, left: height + 8 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ x: [0, 5, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
            >
              <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 -mx-0.5" />
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
          "absolute left-1 z-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-700 shadow-md",
          (state !== "idle" || disabled) ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        )}
        initial={false}
        whileTap={{ scale: state === "idle" ? 0.95 : 1 }}
        animate={state === "success" ? { x: trackWidth, backgroundColor: "#22c55e", color: "white" } : controls}
        style={{ width: thumbSize, height: thumbSize, x }}
      >
        {/* No pulsing ring - clean look */}

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
