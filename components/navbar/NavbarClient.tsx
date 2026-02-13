"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Logo from "./Logo";
import UserMenu from "./UserMenu";
import { ThemeToggle } from "../layout/ThemeToggle";
import Search from "./Search";
import { User } from "next-auth";
import { glassFadeIn, floatIn } from "@/utils/motion";

interface NavbarClientProps {
  user?: (User & { id: string; role?: string });
}

const NavbarClient: React.FC<NavbarClientProps> = ({ user }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 border-b transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
        isScrolled
          ? "bg-white/72 dark:bg-gray-900/72 backdrop-blur-xl border-gray-200/60 dark:border-white/10 shadow-[0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[0_1px_0_rgba(255,255,255,0.06)]"
          : "bg-transparent border-transparent"
      }`}
    >
      <nav
        className={`transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          isScrolled ? "py-2.5 md:py-2" : "py-4 md:py-4"
        }`}
      >
        <div className="flex main-container flex-row items-center justify-center gap-3 md:gap-0 relative">
          <motion.div
            key={mounted ? "logo" : "logo-placeholder"}
            variants={glassFadeIn}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.4 }}
            className="flex items-center absolute left-4 md:left-8"
          >
            <Logo />
          </motion.div>

            <motion.div
              variants={floatIn("up")}
              initial="hidden"
              animate={{
                opacity: isScrolled ? 0.98 : 0,
                scale: isScrolled ? 1 : 0.85,
                y: isScrolled ? 0 : 20,
                filter: isScrolled ? "blur(0px)" : "blur(2px)"
              }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
                delayChildren: 0.05,
                staggerChildren: 0.03
              }}
              className="hidden md:flex"
              style={{ maxWidth: '672px' }} // Match max-w-3xl (672px) from hero section
            >
              <Search compact={true} />
            </motion.div>

           <div className="flex items-center gap-1 absolute right-4 md:right-8">
             <motion.div
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
               whileHover={{ scale: 1.05, opacity: 0.9 }}
               whileTap={{ scale: 0.95 }}
             >
               <ThemeToggle />
             </motion.div>
             <motion.div
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
               whileHover={{ scale: 1.05, opacity: 0.9 }}
               whileTap={{ scale: 0.95 }}
             >
               <UserMenu user={user} />
             </motion.div>
           </div>
        </div>
      </nav>
    </header>
  );
};

export default NavbarClient;
