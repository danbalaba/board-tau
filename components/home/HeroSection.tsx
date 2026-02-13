"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { headlineFadeIn, subtitleFadeIn, searchBarEntrance } from "@/utils/motion";
import SearchManager from "@/components/navbar/SearchManager";

export default function HeroSection() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-[420px] md:min-h-[520px] overflow-hidden">
      {/* Enhanced animated background with slow gradient and vignette */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary-light via-primary to-primary-dark dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 bg-gradient-large"
        style={{ backgroundSize: "200% 200%", animation: "gradient-shift 25s ease infinite" }}
      />

      {/* Vignette effect to pull focus to center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.1)_100%)]" />

      {/* Subtle static overlay */}
      <div className="absolute inset-0 bg-black/5 dark:bg-black/25" />

      {/* Subtle noise texture for depth */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        className="relative main-container h-full min-h-[420px] md:min-h-[520px] flex flex-col items-center justify-center"
        initial="hidden"
        animate="show"
      >
        <motion.div
          className="text-center text-white mb-6 md:mb-8 w-full max-w-3xl"
          animate={{
            opacity: isScrolled ? 0 : 1,
            scale: isScrolled ? 0.95 : 1,
            y: isScrolled ? -20 : 0
          }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-hero font-semibold tracking-tight mb-3 text-white drop-shadow-sm">
            Find your perfect boarding house
          </h1>
          <p className="text-body-lg md:text-xl opacity-95 text-white/95 leading-relaxed">
            Discover comfortable and affordable accommodations near your university
          </p>
        </motion.div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 20, 0],
            y: [0, -10, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -15, 0],
            y: [0, 15, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        <motion.div
          variants={searchBarEntrance as any}
          initial="hidden"
          animate={{
            scale: isScrolled ? 0.85 : 1,
            opacity: isScrolled ? 0.98 : 1,
            y: isScrolled ? -20 : 0,
            filter: isScrolled ? "blur(2px)" : "blur(0px)"
          }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
            delayChildren: 0.05,
            staggerChildren: 0.03
          }}
          className="w-full"
        >
          <div className="w-full max-w-3xl mx-auto">
            <SearchManager isScrolled={isScrolled} />
          </div>
        </motion.div>

        {/* Subtle scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: [0.3, 0.6, 0.3], y: [0, 5, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 10l5 5 5-5" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
