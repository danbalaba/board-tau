"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Logo from "./Logo";
import UserMenu from "./UserMenu";
import { ThemeToggle } from "../layout/ThemeToggle";
import Search from "./Search";
import MobileSearch from "./MobileSearch";
import { User } from "next-auth";
import { glassFadeIn, floatIn } from "@/utils/motion";
import { usePathname } from "next/navigation";

interface NavbarClientProps {
  user?: (User & { id: string; role?: string });
}

const NavbarClient: React.FC<NavbarClientProps> = ({ user }) => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isHomePage = pathname === "/";

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
      className={`fixed top-0 left-0 w-full z-50 border-b transition-all duration-300 ease-apple ${
        isScrolled
          ? "bg-white/72 dark:bg-gray-900/72 backdrop-blur-xl border-gray-200/60 dark:border-white/10 shadow-[0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[0_1px_0_rgba(255,255,255,0.06)]"
          : "bg-transparent border-transparent"
      }`}
    >
      <nav
        className={`transition-all duration-300 ease-apple flex items-center ${
          isScrolled ? "h-[80px] md:py-5" : "h-[96px] md:py-7"
        }`}
      >
        <div className="flex main-container flex-row items-center justify-between gap-3 md:gap-0 w-full">
          {/* Desktop: Logo left */}
          <motion.div
            key={mounted ? "logo" : "logo-placeholder"}
            variants={glassFadeIn}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.4 }}
            className={`${isHomePage ? "hidden md:flex" : "flex"} items-center`}
          >
            <Logo />
          </motion.div>

          {/* Search bar - mobile: full width, desktop: absolute center */}
          {isHomePage && (
            <div className="flex-1 px-4 md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:px-8">
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
                className="flex flex-row items-center justify-center w-full mx-auto"
                style={{
                  maxWidth: isScrolled && mounted && typeof window !== 'undefined' && !window.matchMedia('(max-width: 768px)').matches ? '600px' : '100%'
                }}
              >
                {/* Desktop search */}
                <div className="hidden md:flex flex-row justify-center w-full">
                  <Search compact={true} />
                </div>

                {/* Mobile search - full width */}
                <div className="md:hidden w-full">
                  <MobileSearch />
                </div>
              </motion.div>
            </div>
          )}

          {/* Desktop: Theme toggle + User menu right */}
          <div className={`${isHomePage ? "hidden md:flex" : "flex"} items-center gap-1`}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <ThemeToggle />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
