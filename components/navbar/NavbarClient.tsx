"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Logo from "./Logo";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";
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
    let ignoreScrollUntil = 0;
    let timeoutId: NodeJS.Timeout;

    const checkScroll = () => {
      const body = document.body;
      const isLocked = body.classList.contains("fixed") || body.style.position === 'fixed' || document.documentElement.style.overflow === 'hidden';
      
      let scrollTop = window.scrollY;
      
      if (isLocked && body.style.top) {
        scrollTop = Math.abs(parseFloat(body.style.top)) || 0;
      }

      setIsScrolled(scrollTop > 80);
      return isLocked;
    };

    let wasLocked = checkScroll();

    const handleScrollEvent = () => {
      if (Date.now() < ignoreScrollUntil) return;
      checkScroll();
    };

    const handleMutation = () => {
      const body = document.body;
      const isCurrentlyLocked = body.classList.contains("fixed") || body.style.position === 'fixed' || document.documentElement.style.overflow === 'hidden';
      
      if (wasLocked && !isCurrentlyLocked) {
        // Modal just unlocked!
        // 1. Ignore native scroll events for 200ms to avoid reading 0px during restoration
        ignoreScrollUntil = Date.now() + 200;
        
        // 2. Check scroll state after DOM settles (50ms)
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          checkScroll();
        }, 50);
      } else if (!wasLocked && isCurrentlyLocked) {
        // Modal just locked! Check scroll immediately.
        checkScroll();
      }

      wasLocked = isCurrentlyLocked;
    };

    window.addEventListener("scroll", handleScrollEvent, { passive: true });
    
    const observer = new MutationObserver(handleMutation);
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ["class", "style"] 
    });

    return () => {
      window.removeEventListener("scroll", handleScrollEvent);
      clearTimeout(timeoutId);
      observer.disconnect();
    };
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
          {/* Desktop: Logo left, Mobile: hidden on home page so search takes full width */}
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
            <div className="flex-1 px-4 md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:px-8 md:w-max w-full">
              {/* Desktop Search (Only shows on scroll) */}
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
                className="hidden md:flex flex-row items-center justify-center w-max mx-auto"
                style={{
                  maxWidth: isScrolled && mounted && typeof window !== 'undefined' && !window.matchMedia('(max-width: 768px)').matches ? '600px' : '100%'
                }}
              >
                {isScrolled && <Search compact={true} />}
              </motion.div>

              {/* Mobile Search (Always visible on Home Page) */}
              <div className="md:hidden w-full flex flex-row items-center justify-center">
                <MobileSearch />
              </div>
            </div>
          )}

          {/* Desktop: Theme toggle + User menu right, Mobile: completely hidden on home page */}
          <div className={`${isHomePage ? "hidden md:flex" : "flex"} items-center gap-1`}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="hidden md:block"
            >
              <NotificationBell user={user} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="hidden md:block"
            >
              <ThemeToggle />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="hidden md:block"
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
