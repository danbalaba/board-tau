"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/helper";
import { springBounce } from "@/utils/motion";
import type { HTMLMotionProps } from "framer-motion";

interface ButtonProps extends HTMLMotionProps<"button"> {
  size?: "small" | "large";
  className?: string;
  children?: ReactNode;
  outline?: boolean;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  size = "small",
  outline = false,
  isLoading = false,
  variant = "primary",
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={springBounce}
      className={cn(
        "disabled:opacity-70 disabled:cursor-not-allowed rounded-input font-medium border w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
        size === "small"
          ? "text-[15px] border py-3 px-4"
          : "text-[16px] font-semibold border-2 py-4 px-5",
        outline
          ? "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-border dark:border-gray-600 text-text-primary dark:text-gray-100 hover:bg-gray-50/90 dark:hover:bg-gray-700/90 focus:ring-primary/50"
          : variant === "danger"
          ? "bg-red-500 dark:bg-red-600 border-red-500 dark:border-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 focus:ring-red-500/50"
          : "bg-primary dark:bg-primary border-primary dark:border-primary text-white hover:bg-primary-hover dark:hover:bg-primary-hover shadow-soft focus:ring-accent/50",
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
