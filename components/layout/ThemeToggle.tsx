"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BsSun, BsMoon } from "react-icons/bs";
import { springBounce } from "@/utils/motion";

export const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="p-2.5 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors text-current"
        aria-label="Toggle theme"
      >
        <BsSun size={20} className="text-current" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      transition={springBounce}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2.5 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors duration-300 text-current"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <BsSun size={20} className="text-current" />
      ) : (
        <BsMoon size={20} className="text-current" />
      )}
    </motion.button>
  );
};
