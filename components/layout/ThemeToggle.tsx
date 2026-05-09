"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
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
        <Sun size={20} className="text-current" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = (e: React.MouseEvent) => {
    const newTheme = isDark ? "light" : "dark";

    // Fallback for browsers that don't support View Transitions
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    // Set the coordinates for the CSS ripple effect
    const root = document.documentElement;
    root.style.setProperty("--x", `${e.clientX}px`);
    root.style.setProperty("--y", `${e.clientY}px`);

    // Trigger the transition
    document.startViewTransition(() => {
      setTheme(newTheme);
    });
  };

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      transition={springBounce}
      onClick={toggleTheme}
      className="p-2.5 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors duration-300 text-current"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <Sun size={20} className="text-current" />
      ) : (
        <Moon size={20} className="text-current" />
      )}
    </motion.button>
  );
};
