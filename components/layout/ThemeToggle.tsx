"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { springBounce } from "@/utils/motion";

export const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button 
        suppressHydrationWarning
        className="group relative size-10 overflow-hidden rounded-full flex items-center justify-center opacity-50 cursor-default"
        aria-label="Toggle theme"
      >
        <IconSun className="h-5 w-5 text-amber-500" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleThemeToggle = (e: React.MouseEvent) => {
    const newTheme = isDark ? "light" : "dark";

    const applyTheme = () => {
      setTheme(newTheme);
    };

    if (!document.startViewTransition) {
      applyTheme();
      return;
    }

    const root = document.documentElement;
    root.style.setProperty("--x", `${e.clientX}px`);
    root.style.setProperty("--y", `${e.clientY}px`);

    document.startViewTransition(applyTheme);
  };

  return (
    <motion.button
      suppressHydrationWarning
      whileTap={{ scale: 0.92 }}
      transition={springBounce}
      onClick={handleThemeToggle}
      className="group relative size-10 overflow-hidden rounded-full flex items-center justify-center hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors duration-300"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <AnimatePresence mode='wait' initial={false}>
        {isDark ? (
          <motion.div
            key='moon'
            initial={{ y: 20, rotate: 45, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -20, rotate: -45, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className='flex items-center justify-center'
          >
            <IconMoon className='h-5 w-5 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' />
          </motion.div>
        ) : (
          <motion.div
            key='sun'
            initial={{ y: 20, rotate: -45, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -20, rotate: 45, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className='flex items-center justify-center'
          >
            <IconSun className='h-5 w-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' />
          </motion.div>
        )}
      </AnimatePresence>
      <span className='sr-only'>Toggle theme</span>
      
      {/* Subtle hover ring for admin-like feel */}
      <span className='absolute inset-0 rounded-full border border-primary/0 transition-colors group-hover:border-primary/10 pointer-events-none' />
    </motion.button>
  );
};
